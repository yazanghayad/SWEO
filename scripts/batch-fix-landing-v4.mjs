/**
 * Batch fix v4: Escape unescaped > in JSX text content
 * Also handles remaining }> patterns and hidden form JSON
 */
import fs from 'fs';
import { execSync } from 'child_process';

const LANDING_DIR = 'src/app/(landing)';
const allFiles = execSync(`find '${LANDING_DIR}' -name 'page.tsx'`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

let gtFixed = 0;
let formFixed = 0;
let totalFixed = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Escape " > " in text content (breadcrumb path arrows)
  // Pattern: word/space followed by " > " followed by word — this is text content, not JSX
  // Replace with &gt; to be JSX-safe
  content = content.replace(
    /(?<=>[^<]{0,500}) > (?=[A-Za-z])/g,
    ' &gt; '
  );

  // 2. Handle hidden form inputs with JSON-like values
  // Remove entire <form> blocks that contain $ACTION_ inputs (these are SSR artifacts)
  // Pattern: <form... action=""...>...<input type="hidden" name="$ACTION_../>...</form>
  content = content.replace(
    /<form[^>]*>(?:<input[^>]*>)*<\/form>/g,
    (match) => {
      if (match.includes('$ACTION_') || match.includes('$undefined')) {
        return '';
      }
      return match;
    }
  );

  // 3. Remove standalone hidden inputs with $ACTION_ names
  content = content.replace(/<input type="hidden" name="\$[^"]*"[^>]*\/?>/g, '');

  // 4. Fix value attributes containing unescaped JSON objects
  // Pattern: value="{"id":"..."}" — the { } break JSX
  // Replace the entire input
  content = content.replace(
    /<input[^>]*value="\{[^"]*\}"[^>]*\/?>/g,
    ''
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    totalFixed++;
    
    if (original.match(/(?<=>)[^<]* > [A-Za-z]/)) gtFixed++;
    if (original.includes('$ACTION_')) formFixed++;
  }
}

console.log('\nBatch Fix v4 Results:');
console.log('====================');
console.log(`Total files modified: ${totalFixed}`);
console.log(`Files with > escaped: ${gtFixed}`);
console.log(`Files with form SSR removed: ${formFixed}`);
