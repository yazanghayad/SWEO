/**
 * Batch fix v5: Escape unescaped } and remaining > in JSX text content
 * Also: handle code blocks (pre/code) with JSON/CSS examples
 */
import fs from 'fs';
import { execSync } from 'child_process';

const LANDING_DIR = 'src/app/(landing)';
const allFiles = execSync(`find '${LANDING_DIR}' -name 'page.tsx'`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

let braceFixed = 0;
let gtFixed = 0;
let totalFixed = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Escape } in text content (between > and <, not inside JSX expressions)
  // Pattern: find text content between tags that contains literal }
  // The } must NOT be part of a JSX expression {}, style={{}}, or comment {/* */}
  content = content.replace(
    /(?<=>)([^<]*?)(})(?=[^<]*<)/g,
    (match, before, brace) => {
      // Only escape if the } doesn't have a matching { in the same text span
      const openBraces = (before.match(/{/g) || []).length;
      const closeBraces = 1; // the current }
      // Count all } in the remaining text too
      if (openBraces > 0) return match; // Has matching {, likely JSX expression
      return before + "{'}'}" ;
    }
  );

  // 2. Escape remaining > in text content that wasn't caught by v4
  // v4 caught " > " (space-separated breadcrumbs), now catch:
  // - "> text" at start of text node  
  // - "text>" at end of text node
  // - "text > text" where the lookbehind wasn't 500 chars
  content = content.replace(
    /(?<=>)([^<]{0,5000}) > (?=[A-Za-z0-9])/g,
    (match, before) => {
      // Skip if it looks like it's already inside a JSX expression
      if (before.includes('{')) return match;
      return '>' + before + ' &gt; ';
    }
  );

  // 3. Handle unescaped < in text content (like <SAML, <30%, etc.)
  // Pattern: text node containing < followed by text (not a tag)
  content = content.replace(
    /(?<=>)([^<]*)<([A-Z]{4,}|[0-9])/g,
    (match, before, after) => {
      // Check if this is actually a tag (starts with lowercase or known tag names)
      // SAML, HTTP, etc. are not valid HTML tags
      const tagLikeNames = ['SAML', 'HTTP', 'API', 'JSON', 'XML', 'CSS', 'HTML', 'URL'];
      if (/^[0-9]/.test(after) || tagLikeNames.some(t => after.startsWith(t))) {
        return '>' + before + '&lt;' + after;
      }
      return match;
    }
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    totalFixed++;
  }
}

console.log('\nBatch Fix v5 Results:');
console.log('====================');
console.log(`Total files modified: ${totalFixed}`);
