#!/usr/bin/env node
/**
 * Fix systematic HTML→JSX conversion issues in landing page TSX files.
 *
 * Issues fixed:
 *  1. <style> tags: wrap CSS content in {`...`} template literals
 *  2. viewbox → viewBox  (SVG)
 *  3. <clippath → <clipPath, </clippath → </clipPath  (SVG element)
 *  4. fetchpriority= → fetchPriority=  (React attr)
 *  5. srcset= → srcSet=  (React attr)
 *  6. Remove text="..." and location="..." on <a> tags (not valid React props)
 *  7. aria-valuemin="N" → aria-valuemin={N}, aria-valuemax="N" → aria-valuemax={N}
 *  8. stroke-width= → strokeWidth=, fill-rule= → fillRule=, clip-rule= → clipRule=
 *  9. stroke-linecap= → strokeLinecap=, stroke-linejoin= → strokeLinejoin=
 * 10. tabindex= → tabIndex=
 * 11. autocomplete= → autoComplete=
 * 12. crossorigin= → crossOrigin=
 * 13. for= → htmlFor= (on label elements)
 * 14. datetime= → dateTime=
 * 15. colspan= → colSpan=, rowspan= → rowSpan=
 * 16. maxlength= → maxLength=
 * 17. cellpadding= → cellPadding=, cellspacing= → cellSpacing=
 * 18. enctype= → encType=
 * 19. novalidate= → noValidate=
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'fs';
import { execSync } from 'child_process';

// Find all TSX files
const files = execSync(
  `find 'src/app/(landing)' -name '*.tsx' -type f`,
  { cwd: '/workspaces/chat', encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

let totalFixed = 0;

for (const relPath of files) {
  const filePath = `/workspaces/chat/${relPath}`;
  let content = readFileSync(filePath, 'utf8');
  const original = content;
  
  // 1. Fix <style> tags — wrap CSS content in {`...`}
  // Pattern: <style>...CSS with { }...</style>
  content = content.replace(/<style>([\s\S]*?)<\/style>/g, (match, cssContent) => {
    // If already wrapped in {` `}, skip
    if (cssContent.trim().startsWith('{`')) return match;
    return `<style>{\`${cssContent}\`}</style>`;
  });

  // 2. viewbox= → viewBox= (SVG attribute)
  content = content.replace(/\bviewbox=/g, 'viewBox=');

  // 3. <clippath → <clipPath, </clippath → </clipPath (SVG element)
  content = content.replace(/<clippath\b/g, '<clipPath');
  content = content.replace(/<\/clippath>/g, '</clipPath>');

  // 4. fetchpriority= → fetchPriority=
  content = content.replace(/\bfetchpriority=/g, 'fetchPriority=');

  // 5. srcset= → srcSet=
  content = content.replace(/\bsrcset=/g, 'srcSet=');

  // 6. Remove text="..." and location="..." from <a> tags
  // These are non-standard HTML attributes that React rejects
  content = content.replace(/ text="[^"]*"/g, '');
  content = content.replace(/ location="[^"]*"/g, '');

  // 7. aria-valuemin="N" → aria-valuemin={N}, aria-valuemax="N" → aria-valuemax={N}
  content = content.replace(/aria-valuemin="(\d+)"/g, 'aria-valuemin={$1}');
  content = content.replace(/aria-valuemax="(\d+)"/g, 'aria-valuemax={$1}');

  // 8. SVG attribute casing
  content = content.replace(/\bstroke-width=/g, 'strokeWidth=');
  content = content.replace(/\bfill-rule=/g, 'fillRule=');
  content = content.replace(/\bclip-rule=/g, 'clipRule=');
  content = content.replace(/\bstroke-linecap=/g, 'strokeLinecap=');
  content = content.replace(/\bstroke-linejoin=/g, 'strokeLinejoin=');
  content = content.replace(/\bstroke-miterlimit=/g, 'strokeMiterlimit=');
  content = content.replace(/\bstroke-dasharray=/g, 'strokeDasharray=');
  content = content.replace(/\bstroke-dashoffset=/g, 'strokeDashoffset=');
  content = content.replace(/\bstroke-opacity=/g, 'strokeOpacity=');
  content = content.replace(/\bfill-opacity=/g, 'fillOpacity=');
  content = content.replace(/\bcolor-interpolation-filters=/g, 'colorInterpolationFilters=');
  content = content.replace(/\bflood-color=/g, 'floodColor=');
  content = content.replace(/\bflood-opacity=/g, 'floodOpacity=');
  content = content.replace(/\bstop-color=/g, 'stopColor=');
  content = content.replace(/\bstop-opacity=/g, 'stopOpacity=');
  content = content.replace(/\bclip-path=/g, 'clipPath=');

  // 9. HTML attribute casing for React
  content = content.replace(/\btabindex=/g, 'tabIndex=');
  content = content.replace(/\bautocomplete=/g, 'autoComplete=');
  content = content.replace(/\bcrossorigin=/g, 'crossOrigin=');
  content = content.replace(/\bdatetime=/g, 'dateTime=');
  content = content.replace(/\bcolspan=/g, 'colSpan=');
  content = content.replace(/\browspan=/g, 'rowSpan=');
  content = content.replace(/\bmaxlength=/g, 'maxLength=');
  content = content.replace(/\bcellpadding=/g, 'cellPadding=');
  content = content.replace(/\bcellspacing=/g, 'cellSpacing=');
  content = content.replace(/\benctype=/g, 'encType=');
  content = content.replace(/\bnovalidate\b/g, 'noValidate');
  
  // 10. Fix <lineargradient → <linearGradient, <radialgradient → <radialGradient
  content = content.replace(/<lineargradient\b/g, '<linearGradient');
  content = content.replace(/<\/lineargradient>/g, '</linearGradient>');
  content = content.replace(/<radialgradient\b/g, '<radialGradient');
  content = content.replace(/<\/radialgradient>/g, '</radialGradient>');
  content = content.replace(/<feblend\b/g, '<feBlend');
  content = content.replace(/<\/feblend>/g, '</feBlend>');
  content = content.replace(/<fegaussianblur\b/g, '<feGaussianBlur');
  content = content.replace(/<\/fegaussianblur>/g, '</feGaussianBlur>');
  content = content.replace(/<fecolormatrix\b/g, '<feColorMatrix');
  content = content.replace(/<\/fecolormatrix>/g, '</feColorMatrix>');
  content = content.replace(/<feoffset\b/g, '<feOffset');
  content = content.replace(/<\/feoffset>/g, '</feOffset>');
  content = content.replace(/<fecomposite\b/g, '<feComposite');
  content = content.replace(/<\/fecomposite>/g, '</feComposite>');
  content = content.replace(/<feflood\b/g, '<feFlood');
  content = content.replace(/<\/feflood>/g, '</feFlood>');
  content = content.replace(/<femerge\b/gi, '<feMerge');
  content = content.replace(/<\/femerge>/gi, '</feMerge>');
  content = content.replace(/<femergenode\b/gi, '<feMergeNode');
  content = content.replace(/<\/femergenode>/gi, '</feMergeNode>');

  if (content !== original) {
    writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    console.log(`  ✓ ${relPath}`);
  }
}

console.log(`\n→ Fixed ${totalFixed} of ${files.length} files`);
