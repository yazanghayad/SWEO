#!/usr/bin/env node

/**
 * Rebranding Script — SWEO
 * 
 * Replaces all Fin/Intercom brand references with SWEO across the project.
 * 
 * Usage:
 *   node scripts/rebrand.mjs                  # Dry run (shows changes)
 *   node scripts/rebrand.mjs --apply          # Apply changes
 *   node scripts/rebrand.mjs --apply --brand "MyBrand"   # Custom brand name
 *   node scripts/rebrand.mjs --apply --company "MyCompany" --brand "MyAgent"
 * 
 * What it does:
 *   1. Replaces brand names (Fin → SWEO, Intercom → SWEO)
 *   2. Fixes external OG image URLs (https://fin.ai/... → /fin/img/...)
 *   3. Replaces domain references (fin.ai → sweo.ai)
 *   4. Reports statistics
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// ─── Configuration ───
const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--apply');
const BRAND = getArg('--brand') || 'SWEO';
const COMPANY = getArg('--company') || BRAND;
const DOMAIN = getArg('--domain') || 'sweo.ai';

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

// ─── Replacement rules (order matters — most specific first) ───
const REPLACEMENTS = [
  // Compound brand phrases (most specific first)
  { from: /Intercom's Fin AI Agent/g, to: `${COMPANY}'s ${BRAND} AI Agent` },
  { from: /Intercom's Fin/g, to: `${COMPANY}'s ${BRAND}` },
  { from: /Intercom&#x27;s Fin/g, to: `${COMPANY}&#x27;s ${BRAND}` },
  
  // Product versions
  { from: /\bFin 3\b/g, to: `${BRAND} 3` },
  { from: /\bFin 2\b/g, to: `${BRAND} 2` },
  { from: /\bFin 1\b/g, to: `${BRAND} 1` },

  // Product names
  { from: /\bFin AI Agent\b/g, to: `${BRAND} AI Agent` },
  { from: /\bFin AI agent\b/g, to: `${BRAND} AI agent` },
  { from: /\bFin AI\b/g, to: `${BRAND} AI` },
  { from: /\bFin Agent\b/g, to: `${BRAND} Agent` },
  
  // Standalone "Fin" (careful — only when it's the brand)
  // Use word boundaries to avoid changing words like "finish", "final", "define"
  { from: /\bFin\b(?!\.|\/|ish|al|e |d |ger|ance|ancial|ding)/g, to: BRAND },
  
  // Company name
  { from: /\bIntercom\b/g, to: COMPANY },
  
  // External URLs → local paths
  { from: /https:\/\/fin\.ai\/img\//g, to: '/fin/img/' },
  
  // Domain references
  { from: /\bfin\.ai\b/g, to: DOMAIN },
];

// ─── File targets ───
const TARGET_DIRS = [
  'src/data',
  'src/app/(landing)',
  'src/features/overview/components',
  'src/features/landing/components',
];

const TARGET_EXTENSIONS = ['.json', '.tsx', '.ts', '.jsx', '.js'];

const ROOT = process.cwd();

// ─── Helpers ───
function walkDir(dir) {
  const files = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        files.push(...walkDir(full));
      } else if (TARGET_EXTENSIONS.some(ext => full.endsWith(ext))) {
        files.push(full);
      }
    }
  } catch {
    // Directory doesn't exist, skip
  }
  return files;
}

function applyReplacements(content) {
  let result = content;
  let totalChanges = 0;
  const changeDetails = [];

  for (const rule of REPLACEMENTS) {
    const matches = result.match(rule.from);
    if (matches) {
      totalChanges += matches.length;
      changeDetails.push({
        pattern: rule.from.source.slice(0, 40),
        replacement: rule.to,
        count: matches.length,
      });
      result = result.replace(rule.from, rule.to);
    }
  }

  return { result, totalChanges, changeDetails };
}

// ─── Main ───
console.log('');
console.log(`╔══════════════════════════════════════════════════╗`);
console.log(`║  SWEO Rebranding Script                         ║`);
console.log(`╠══════════════════════════════════════════════════╣`);
console.log(`║  Brand:    ${BRAND.padEnd(37)}║`);
console.log(`║  Company:  ${COMPANY.padEnd(37)}║`);
console.log(`║  Domain:   ${DOMAIN.padEnd(37)}║`);
console.log(`║  Mode:     ${(DRY_RUN ? '🔍 DRY RUN (preview)' : '✏️  APPLYING CHANGES').padEnd(37)}║`);
console.log(`╚══════════════════════════════════════════════════╝`);
console.log('');

// Collect all target files
const files = TARGET_DIRS.flatMap(dir => walkDir(join(ROOT, dir)));
console.log(`📁 Scanning ${files.length} files...\n`);

let grandTotal = 0;
let filesChanged = 0;
const summary = [];

for (const filePath of files) {
  const content = readFileSync(filePath, 'utf-8');
  const { result, totalChanges, changeDetails } = applyReplacements(content);

  if (totalChanges > 0) {
    filesChanged++;
    grandTotal += totalChanges;
    const rel = relative(ROOT, filePath);

    summary.push({ file: rel, changes: totalChanges, details: changeDetails });

    if (!DRY_RUN) {
      writeFileSync(filePath, result, 'utf-8');
    }

    // Show per-file summary
    console.log(`${DRY_RUN ? '  would change' : '  ✅ changed'} ${rel} (${totalChanges} replacements)`);
    for (const d of changeDetails) {
      console.log(`     ${d.count}× ${d.pattern} → ${d.replacement}`);
    }
  }
}

console.log('');
console.log('─'.repeat(50));
console.log(`  Files: ${filesChanged} changed out of ${files.length} scanned`);
console.log(`  Total: ${grandTotal} replacements`);
console.log('─'.repeat(50));

if (DRY_RUN && grandTotal > 0) {
  console.log('');
  console.log('  This was a dry run. To apply changes:');
  console.log(`  node scripts/rebrand.mjs --apply`);
  console.log(`  node scripts/rebrand.mjs --apply --brand "YourBrand" --company "YourCompany"`);
}

if (!DRY_RUN && grandTotal > 0) {
  console.log('');
  console.log('  ✅ All changes applied! Run `npm run build` to verify.');
}

console.log('');
