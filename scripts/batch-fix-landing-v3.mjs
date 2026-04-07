/**
 * Batch fix v3: Fix multiline gradient strings and SSR artifacts
 */
import fs from 'fs';
import { execSync } from 'child_process';

const LANDING_DIR = 'src/app/(landing)';
const allFiles = execSync(`find '${LANDING_DIR}' -name 'page.tsx'`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

let gradientFixed = 0;
let ssrFixed = 0;
let formJsonFixed = 0;
let totalFixed = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Fix multiline gradient strings in style attributes
  // The issue: a long style value string gets split across lines  
  // Look for pattern where line ends mid-string with gradient(
  // and subsequent lines are the continuation
  const lines = content.split('\n');
  let needsCollapse = false;
  
  for (let i = 0; i < lines.length; i++) {
    // Check if this line ends in mid-gradient (unterminated single-quoted string)
    // Heuristic: line ends with "gradient(" or contains gradient( and the NEXT line
    // starts with whitespace and looks like CSS gradient params
    if (i > 10 && lines[i + 1] && 
        /(?:gradient\(|,)\s*$/.test(lines[i]) &&
        /^\s+(0deg|90deg|45deg|transparent|rgba|#[0-9a-f])/i.test(lines[i + 1])) {
      needsCollapse = true;
      break;
    }
  }

  if (needsCollapse) {
    // Collapse linebreaks that are within single-quoted CSS strings
    // The pattern: a line ending mid-string, followed by lines that are CSS continuation
    // Strategy: join everything between the function start line and the closing style '}}'
    
    // Find the content line (usually right after `<>`)
    let contentLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '<>') {
        contentLineIdx = i + 1;
        break;
      }
    }
    
    if (contentLineIdx >= 0) {
      // Find where the multiline gradient starts and ends
      let gradStart = -1;
      let gradEnd = -1;
      
      for (let i = contentLineIdx; i < lines.length; i++) {
        if (gradStart === -1 && /gradient\(\s*$/.test(lines[i])) {
          gradStart = i;
        }
        if (gradStart >= 0 && i > gradStart && /^\s*\)/.test(lines[i])) {
          gradEnd = i;
          break;
        }
      }
      
      // Alternative: just collapse ALL lines between the content start and the closing tags
      // Find the closing fragment line (</>)
      let closingLine = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() === '</>') {
          closingLine = i;
          break;
        }
      }
      
      if (contentLineIdx >= 0 && closingLine > contentLineIdx) {
        // Collapse all content lines into one
        const contentLines = lines.slice(contentLineIdx, closingLine);
        const collapsedContent = contentLines.map(l => l.trim()).join(' ');
        
        const newLines = [
          ...lines.slice(0, contentLineIdx),
          '      ' + collapsedContent,
          ...lines.slice(closingLine),
        ];
        content = newLines.join('\n');
        gradientFixed++;
      }
    }
  }

  // 2. Remove SSR artifacts
  // Remove <template data-dgst="..."></template>
  content = content.replace(/<template[^>]*data-dgst[^>]*><\/template>/g, '');
  
  // Remove <div id="S:0"> but keep its children (remove closing </div> too)
  // This is tricky - for now just remove the opening tag
  content = content.replace(/<div id="S:\d+">/g, '');
  
  // 3. Remove hidden form inputs with $ACTION_* or $undefined values
  content = content.replace(/<input type="hidden"[^>]*name="\$[^"]*"[^>]*\/>/g, '');
  // Also match value="["$undefined"]"
  content = content.replace(/<input type="hidden"[^>]*value="\[&quot;\$undefined&quot;\]"[^>]*\/>/g, '');
  // value="["$undefined"]" pattern
  content = content.replace(/<input type="hidden" name="\$ACTION_REF_\d+"[^/]*\/>/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content);
    totalFixed++;
    if (needsCollapse) console.log('  Collapsed gradient:', file);
  }
}

console.log('\nBatch Fix v3 Results:');
console.log('====================');
console.log(`Total files modified: ${totalFixed}`);
console.log(`Multiline gradients collapsed: ${gradientFixed}`);
