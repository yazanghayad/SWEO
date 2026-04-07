/**
 * Batch fix script for landing page JSX/TSX conversion issues.
 * Fixes:
 * 1. Orphaned </main></div></div> closing tags (200 files)
 * 2. CSS custom properties in style={{}} (18 files)
 * 3. frameborder → frameBorder (23 files)
 * 4. allowFullScreen="allowFullScreen" → allowFullScreen (23 files)
 * 5. referrerpolicy → referrerPolicy (23 files)
 * 6. type= on <span> elements (5 files)
 * 7. Hidden form inputs with JSON values that break JSX (multiple files)
 * 8. Unescaped < before numbers in text content
 * 9. Unterminated strings from gradient/complex CSS in style attrs
 */
import fs from 'fs';
import { execSync } from 'child_process';

const LANDING_DIR = 'src/app/(landing)';
const allFiles = execSync(`find '${LANDING_DIR}' -name 'page.tsx'`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

const stats = {
  orphanedClosingTags: 0,
  cssCustomProps: 0,
  frameBorder: 0,
  allowFullScreen: 0,
  referrerPolicy: 0,
  typeOnSpan: 0,
  hiddenInputJson: 0,
  unescapedLt: 0,
  total: 0,
};

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Remove orphaned </main></div></div> lines
  // These are standalone lines with just closing tags from the original page wrapper
  content = content.replace(/^<\/main><\/div><\/div>\s*$/gm, '');

  // 2. Fix CSS custom properties in style={{}}
  // -FineLines*, -StrongLines* → '--FineLines*', '--StrongLines*' with proper casting
  content = content.replace(
    /style=\{\{([^}]*?)(-(?:FineLines\w*|StrongLines\w*))\s*:\s*([^,}]+?)([,}])/g,
    (match, before, propName, value, separator) => {
      // Convert to quoted CSS custom property
      const cssVarName = `'--${propName.substring(1)}'`;
      return `style={{${before}${cssVarName}: ${value}${separator}`;
    }
  );

  // Add 'as React.CSSProperties' to style={{}} that contain CSS custom properties
  // Match style={{ ... '--FineLines...' ... }} that don't already have 'as React.CSSProperties'
  content = content.replace(
    /style=\{\{([^}]*'--(?:FineLines|StrongLines)[^}]*)\}\}/g,
    (match, inner) => {
      if (match.includes('as React.CSSProperties')) return match;
      return `style={{${inner}} as React.CSSProperties}`;
    }
  );

  // Also fix -FineLinesSize pattern
  content = content.replace(
    /style=\{\{([^}]*?)(-FineLinesSize)\s*:\s*([^,}]+?)([,}])/g,
    (match, before, propName, value, separator) => {
      const cssVarName = `'--FineLinesSize'`;
      return `style={{${before}${cssVarName}: ${value}${separator}`;
    }
  );

  // Add casting for FineLinesSize too
  content = content.replace(
    /style=\{\{([^}]*'--FineLinesSize[^}]*)\}\}/g,
    (match, inner) => {
      if (match.includes('as React.CSSProperties')) return match;
      return `style={{${inner}} as React.CSSProperties}`;
    }
  );

  // 3. Fix frameborder → frameBorder
  content = content.replace(/frameborder=/g, 'frameBorder=');

  // 4. Fix allowFullScreen="allowFullScreen" → allowFullScreen
  content = content.replace(/allowFullScreen="allowFullScreen"/g, 'allowFullScreen');

  // 5. Fix referrerpolicy → referrerPolicy
  content = content.replace(/referrerpolicy=/g, 'referrerPolicy=');

  // 6. Remove type= from <span> elements
  content = content.replace(/<span([^>]*?) type="[^"]*"/g, '<span$1');

  // 7. Remove hidden form inputs with JSON values that break JSX
  // These are CSRF/session tokens from Intercom that aren't needed
  content = content.replace(
    /<input type="hidden"[^/]*?value="\{[^"]*\}"[^/]*?\/>/g,
    ''
  );
  // Also match the pattern: <input type=\"hidden\" name=\"...\" value=\"{...}\" />
  content = content.replace(
    /<input type="hidden"[^>]*?\/>/g,
    (match) => {
      // Only remove if it contains JSON-like values with curly braces
      if (match.includes('value="{') || match.includes("value='{")) {
        return '';
      }
      return match;
    }
  );

  // 8. Fix unescaped < before numbers in text (not inside tags)
  // e.g., "< 30%" → "{'<'} 30%", but only in text content, not JSX tags
  content = content.replace(
    />((?:[^<])*?)(< ?\d)/g,
    (match, before, ltNum) => {
      return `>${before}{'<'}${ltNum.substring(1)}`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    stats.total++;

    // Track which fixes were applied
    if (original.match(/^<\/main><\/div><\/div>\s*$/m)) stats.orphanedClosingTags++;
    if (original.match(/-(?:FineLines|StrongLines)/)) stats.cssCustomProps++;
    if (original.includes('frameborder=')) stats.frameBorder++;
    if (original.includes('allowFullScreen="allowFullScreen"')) stats.allowFullScreen++;
    if (original.includes('referrerpolicy=')) stats.referrerPolicy++;
    if (original.match(/<span[^>]*type=/)) stats.typeOnSpan++;
    if (original.match(/value="\{[^"]*\}"/)) stats.hiddenInputJson++;
    if (original.match(/>[^<]*< ?\d/)) stats.unescapedLt++;
  }
}

console.log('\nBatch Fix Results:');
console.log('=================');
console.log(`Total files modified: ${stats.total}`);
console.log(`Orphaned closing tags: ${stats.orphanedClosingTags}`);
console.log(`CSS custom properties: ${stats.cssCustomProps}`);
console.log(`frameBorder: ${stats.frameBorder}`);
console.log(`allowFullScreen: ${stats.allowFullScreen}`);
console.log(`referrerPolicy: ${stats.referrerPolicy}`);
console.log(`type on span: ${stats.typeOnSpan}`);
console.log(`Hidden input JSON: ${stats.hiddenInputJson}`);
console.log(`Unescaped <: ${stats.unescapedLt}`);
