#!/usr/bin/env node

/**
 * fix-jsx-landing-pages.mjs
 *
 * Fixes common HTML-to-JSX conversion errors across all landing pages:
 *
 * 1. <clippath> → <clipPath>  (SVG element casing)
 * 2. maskunits= → maskUnits=  (SVG attribute casing)
 * 3. Remove invalid `text` prop from <a> tags
 * 4. Remove invalid `location` prop from <a> tags
 * 5. Remove invalid `alt` prop from <svg> elements
 * 6. Escape literal `<` before digits in text content (e.g. <01 → {"<"}01)
 * 7. Remove trailing unclosed <div className="relative"> before </>
 * 8. Escape `>` in text content (e.g. >95% → {">"}95%)
 * 9. Fix SVG attribute casing (preserveaspectratio, patternunits, etc.)
 *
 * Usage:
 *   node scripts/fix-jsx-landing-pages.mjs            # dry-run (report only)
 *   node scripts/fix-jsx-landing-pages.mjs --apply     # apply fixes
 */

import fs from 'fs';
import path from 'path';

const LANDING_DIR = 'src/app/(landing)';
const apply = process.argv.includes('--apply');

function findPages(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findPages(full));
    else if (entry.name === 'page.tsx') results.push(full);
  }
  return results;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  const fixes = [];

  // 1. <clippath> → <clipPath>
  let n = 0;
  content = content.replace(/<clippath\b/g, () => { n++; return '<clipPath'; });
  content = content.replace(/<\/clippath>/g, () => { n++; return '</clipPath>'; });
  if (n) fixes.push(`clippath → clipPath: ${n}`);

  // 2. maskunits → maskUnits (and other SVG attribute casing)
  const svgAttrFixes = [
    ['maskunits', 'maskUnits'],
    ['preserveaspectratio', 'preserveAspectRatio'],
    ['patternunits', 'patternUnits'],
    ['basefrequency', 'baseFrequency'],
    ['numoctaves', 'numOctaves'],
    ['stitchtiles', 'stitchTiles'],
    ['gradientunits', 'gradientUnits'],
    ['gradienttransform', 'gradientTransform'],
    ['filterunits', 'filterUnits'],
    ['primitiveunits', 'primitiveUnits'],
    ['maskcontentunits', 'maskContentUnits'],
    ['patterntransform', 'patternTransform'],
    ['spreadmethod', 'spreadMethod'],
    ['stddeviation', 'stdDeviation'],
    ['tablevalues', 'tableValues'],
    ['specularexponent', 'specularExponent'],
    ['specularconstant', 'specularConstant'],
    ['surfacescale', 'surfaceScale'],
    ['diffuseconstant', 'diffuseConstant'],
    ['startoffset', 'startOffset'],
    ['attributename', 'attributeName'],
    ['repeatcount', 'repeatCount'],
    ['calcmode', 'calcMode'],
    ['textlength', 'textLength'],
    ['lengthadjust', 'lengthAdjust'],
    ['markerwidth', 'markerWidth'],
    ['markerheight', 'markerHeight'],
  ];
  for (const [wrong, right] of svgAttrFixes) {
    n = 0;
    const re = new RegExp(`\\b${wrong}=`, 'g');
    content = content.replace(re, () => { n++; return `${right}=`; });
    if (n) fixes.push(`${wrong} → ${right}: ${n}`);
  }

  // 2b. SVG hyphenated attributes → camelCase
  const svgHyphenFixes = [
    ['fill-opacity', 'fillOpacity'],
    ['fill-rule', 'fillRule'],
    ['clip-rule', 'clipRule'],
    ['stroke-width', 'strokeWidth'],
    ['stroke-linecap', 'strokeLinecap'],
    ['stroke-linejoin', 'strokeLinejoin'],
    ['stroke-dasharray', 'strokeDasharray'],
    ['stroke-dashoffset', 'strokeDashoffset'],
    ['stroke-miterlimit', 'strokeMiterlimit'],
    ['stroke-opacity', 'strokeOpacity'],
    ['flood-color', 'floodColor'],
    ['flood-opacity', 'floodOpacity'],
    ['color-interpolation-filters', 'colorInterpolationFilters'],
    ['lighting-color', 'lightingColor'],
    ['stop-color', 'stopColor'],
    ['stop-opacity', 'stopOpacity'],
    ['text-anchor', 'textAnchor'],
    ['dominant-baseline', 'dominantBaseline'],
    ['alignment-baseline', 'alignmentBaseline'],
    ['baseline-shift', 'baselineShift'],
  ];
  for (const [wrong, right] of svgHyphenFixes) {
    n = 0;
    const re = new RegExp(`\\b${wrong.replace(/-/g, '\\-')}=`, 'g');
    content = content.replace(re, () => { n++; return `${right}=`; });
    if (n) fixes.push(`${wrong} → ${right}: ${n}`);
  }

  // 3. Remove invalid `text` prop from <a> tags
  //    Matches: <a ... text="..." ...>  — only inside anchor tag openings
  n = 0;
  content = content.replace(/ text="[^"]*"/g, () => { n++; return ''; });
  if (n) fixes.push(`removed text prop: ${n}`);

  // 4. Remove invalid `location` prop from <a> tags
  n = 0;
  content = content.replace(/ location="[^"]*"/g, () => { n++; return ''; });
  if (n) fixes.push(`removed location prop: ${n}`);

  // 5. Remove invalid `alt` from <svg> (not valid on SVG elements)
  n = 0;
  content = content.replace(/(<svg\b[^>]*?) alt="[^"]*"/g, (_, before) => { n++; return before; });
  if (n) fixes.push(`removed alt from svg: ${n}`);

  // 6. Escape unescaped < before digits in JSX text content
  //    e.g. <span><01</span> → <span>{"<"}01</span>
  n = 0;
  content = content.replace(/>(<\d)/g, (_, digit) => { n++; return `>{"<"}${digit.slice(1)}`; });
  if (n) fixes.push(`escaped < before digits: ${n}`);

  // 7. Remove trailing unclosed <div className="relative"> before fragment close
  n = 0;
  content = content.replace(/<div className="relative">\s*\n(\s*<\/>)/g, (_, close) => { n++; return close; });
  if (n) fixes.push(`removed unclosed trailing div: ${n}`);

  // 8. Escape > in JSX text content (e.g. >95% → {">"}95%)
  //    Pattern: a tag-closing > immediately followed by > as text content
  n = 0;
  content = content.replace(/>(>[^<{]*<\/)/g, (full, textAndClose) => {
    // textAndClose = ">95%</", we need to escape the leading >
    n++;
    return `>{">"}${textAndClose.slice(1)}`;
  });
  if (n) fixes.push(`escaped > in text content: ${n}`);

  // 9. Fix boolean HTML attributes with ="" → just the attribute name
  const boolAttrs = [
    'open', 'disabled', 'checked', 'selected', 'readonly', 'required',
    'multiple', 'autoplay', 'controls', 'loop', 'muted', 'default',
    'hidden', 'novalidate', 'formnovalidate', 'autofocus', 'allowfullscreen',
    'async', 'defer',
  ];
  for (const attr of boolAttrs) {
    n = 0;
    const re = new RegExp(` ${attr}=""`, 'g');
    content = content.replace(re, () => { n++; return ` ${attr}`; });
    if (n) fixes.push(`${attr}="" → ${attr}: ${n}`);
  }

  if (content !== original) {
    if (apply) {
      fs.writeFileSync(filePath, content);
    }
    return fixes;
  }
  return null;
}

// Run
const pages = findPages(LANDING_DIR);
let totalFixed = 0;
let totalFixes = 0;

console.log(`${apply ? 'APPLYING' : 'DRY RUN'} — scanning ${pages.length} pages...\n`);

for (const page of pages) {
  const fixes = fixFile(page);
  if (fixes) {
    totalFixed++;
    totalFixes += fixes.length;
    const rel = page.replace(/^src\/app\/\(landing\)\//, '');
    console.log(`  ${apply ? '✓' : '!'} ${rel}`);
    fixes.forEach((f) => console.log(`      ${f}`));
  }
}

console.log(`\n${totalFixed} files with ${totalFixes} fix groups${apply ? ' applied' : ' found (run with --apply to fix)'}`);
