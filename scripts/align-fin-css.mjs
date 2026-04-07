#!/usr/bin/env node

/**
 * align-fin-css.mjs
 *
 * Makes the scraped fin.ai HTML pages visually consistent with the
 * homepage by:
 *
 *  1. Rewriting all _next/static/ asset paths to /fin-assets/
 *  2. Replacing proprietary font @font-face (MediumLL, IvoryLL, AeonikFono)
 *     with open-source equivalents (Inter, Georgia, JetBrains Mono)
 *  3. Fixing Next.js image optimization URLs → direct paths
 *  4. Removing dead JS (RSC flight data, chunks, webpack)
 *  5. Fixing hydration-dependent visibility (opacity-0 → opacity-100)
 *  6. Injecting a small CSS override block so colors/fonts match fin-landing.css
 *
 * Usage:
 *   node scripts/align-fin-css.mjs --dry-run      # Preview changes
 *   node scripts/align-fin-css.mjs --apply         # Apply changes to fin.ai/ folder
 */

import { readdir, readFile, writeFile, copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FIN_DIR = path.join(ROOT, 'fin.ai');
const FIN_ASSETS = path.join(ROOT, 'public', 'fin-assets');

// ─── SWEO Nav Template ──────────────────────────────────────────────────────

const SWEO_NAV_PATH = path.join(FIN_ASSETS, 'sweo-nav.html');
let SWEO_NAV_HTML = '';
if (existsSync(SWEO_NAV_PATH)) {
  const { readFileSync } = await import('fs');
  SWEO_NAV_HTML = readFileSync(SWEO_NAV_PATH, 'utf-8');
}

// ─── SWEO Footer Template ───────────────────────────────────────────────────

const SWEO_FOOTER_PATH = path.join(FIN_ASSETS, 'sweo-footer.html');
let SWEO_FOOTER_HTML = '';
if (existsSync(SWEO_FOOTER_PATH)) {
  const { readFileSync } = await import('fs');
  SWEO_FOOTER_HTML = readFileSync(SWEO_FOOTER_PATH, 'utf-8');
}

const SWEO_NAV_CSS_LINK = `<link rel="stylesheet" href="/fin-assets/css/sweo-nav.css" />`;

// ─── Configuration ───────────────────────────────────────────────────────────

const FONT_OVERRIDE_CSS = `
/* ══ Font Override: replace proprietary fonts with open-source alternatives ══ */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Lora:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');

@font-face {
  font-family: 'MediumLL';
  src: local('Inter');
  font-display: swap;
  font-weight: 100 900;
  font-style: normal;
}
@font-face {
  font-family: 'MediumLL Fallback';
  src: local('Inter');
  font-display: swap;
  font-weight: 100 900;
  font-style: normal;
}
@font-face {
  font-family: 'IvoryLL';
  src: local('Lora');
  font-display: swap;
  font-weight: 300 700;
  font-style: normal;
}
@font-face {
  font-family: 'IvoryLL Fallback';
  src: local('Lora'), local('Georgia');
  font-display: swap;
  font-weight: 300 700;
  font-style: normal;
}
@font-face {
  font-family: 'AeonikFono';
  src: local('JetBrains Mono');
  font-display: swap;
  font-weight: 300 500;
  font-style: normal;
}
}
`;

// Inline style block injected into every HTML <head> for consistency
const HEAD_INJECT_CSS = `
<style data-aligned="true">
/* ── Align fin.ai pages with homepage styling ── */
${FONT_OVERRIDE_CSS}

/* Fix button-hover mismatch (fin.ai uses transparent, homepage uses opaque) */
:root {
  --color-button-hover: color-mix(in srgb, #fff 80%, transparent) !important;
}

/* Ensure images are visible without JS hydration */
img[style*="opacity"] {
  opacity: 1 !important;
}

/* Remove loading skeleton animations that wait for JS */
[data-nimg] {
  opacity: 1 !important;
}
</style>
`;

// ─── HTML Transform Pipeline ─────────────────────────────────────────────────

function transformHtml(html, filePath) {
  const changes = [];
  const original = html;

  // 1. Rewrite _next/static/css/ and _next/static/media/
  //    Handle both absolute (_next/...) and relative (../_next/...) paths
  html = html.replace(/(?:\.\.\/)*_next\/static\/css\//g, '/fin-assets/css/');
  html = html.replace(/(?:\.\.\/)*_next\/static\/media\//g, '/fin-assets/media/');

  // 2. Fix Next.js Image Optimization URLs in src attributes
  //    Pattern: src="_next/filename.webp?url=%2Fimg%2Fpath&amp;w=3840&amp;q=90&amp;dpl=..."
  //    → src="/img/path"
  html = html.replace(
    /src="(?:\.\.\/)*_next\/[^"]*\?url=([^&"]+)(?:&amp;|&)[^"]*"/g,
    (_match, encodedUrl) => `src="${decodeURIComponent(encodedUrl)}"`
  );

  // 3. Fix srcset attributes with Next.js image patterns
  html = html.replace(
    /srcset="([^"]*)"/g,
    (_match, srcsetValue) => {
      if (!srcsetValue.includes('_next/') || !srcsetValue.includes('url=')) {
        return _match;
      }
      const entries = srcsetValue.split(',').map((entry) => {
        const urlMatch = entry.match(/url=([^&\s]+)/);
        const densityMatch = entry.match(/\s(1x|2x)\s*$/);
        // Also handle the 2xe typo pattern from scraping
        const density2xeMatch = entry.match(/\s2xe\?/);
        if (urlMatch) {
          const imgPath = decodeURIComponent(urlMatch[1]);
          const density = densityMatch
            ? ` ${densityMatch[1]}`
            : density2xeMatch
              ? ' 2x'
              : '';
          return `${imgPath}${density}`;
        }
        return entry.trim();
      });
      return `srcset="${entries.join(', ')}"`;
    }
  );

  // 4. Fix srcset with "1x?" density-then-query pattern
  html = html.replace(
    /srcset="([^"]*)"/g,
    (_match, val) => {
      if (!val.includes('_next/')) return _match;
      // Re-extract any _next patterns we might have missed
      const cleaned = val.replace(
        /_next\/[^\s,]*\?url=([^&\s,]+)[^\s,]*/g,
        (_, u) => decodeURIComponent(u)
      );
      return `srcset="${cleaned}"`;
    }
  );

  // 5. Clean up any remaining _next/ image references without url= param
  html = html.replace(
    /src="(?:\.\.\/)*_next\/([^"?]+)"/g,
    'src=""'
  );

  // 6. Remove JS chunks (both absolute and relative _next paths)
  html = html.replace(/<script[^>]*src="[^"]*_next[^"]*"[^>]*><\/script>/g, '');
  html = html.replace(/<script>self\.__next_f\.push\(\[1,.*?\]\)<\/script>/g, '');
  html = html.replace(
    /<script>\(self\.__next_f=self\.__next_f\|\|\[\]\)\.push\(\[0\]\)<\/script>/g,
    ''
  );
  html = html.replace(/<script>[^<]*__next_f[^<]*<\/script>/g, '');
  html = html.replace(/<script[^>]*src="[^"]*webpack[^"]*"[^>]*><\/script>/g, '');

  // 7. Remove preload links for JS chunks
  html = html.replace(/<link[^>]*rel="preload"[^>]*as="script"[^>]*>/g, '');

  // 8. Fix opacity-0 (hydration-dependent visibility)
  html = html.replaceAll(' opacity-0', ' opacity-100');
  // Also in style attributes
  html = html.replace(/style="[^"]*color:\s*transparent[^"]*"/g, (m) =>
    m.replace('color:transparent', 'color:inherit')
  );

  // 9. Remove hidden="" attributes (JS removes these on mount)
  html = html.replace(/\shidden=""/g, '');

  // 10. Inject or update our CSS override into <head>
  if (!html.includes('data-aligned="true"')) {
    html = html.replace('</head>', `${HEAD_INJECT_CSS}\n</head>`);
  } else if (!html.includes('fonts.googleapis.com')) {
    // Update existing style block with new font imports
    html = html.replace(
      /<style data-aligned="true">[\s\S]*?<\/style>/,
      HEAD_INJECT_CSS.trim()
    );
    changes.push('font-update');
  }

  // 11. Inject SWEO nav CSS link into <head>
  if (SWEO_NAV_HTML && !html.includes('sweo-nav.css')) {
    html = html.replace('</head>', `${SWEO_NAV_CSS_LINK}\n</head>`);
  }

  // 12. Replace the original <header> with the SWEO navbar
  if (SWEO_NAV_HTML && !html.includes('id="sweo-nav"')) {
    // Match the first <header ...>...</header> block (non-greedy, handles nested tags via counting)
    const headerStart = html.indexOf('<header');
    if (headerStart !== -1) {
      // Find matching </header> by counting open/close tags
      let depth = 0;
      let i = headerStart;
      let headerEnd = -1;
      while (i < html.length) {
        if (html.startsWith('<header', i) && (html[i + 7] === ' ' || html[i + 7] === '>')) {
          depth++;
          i += 7;
        } else if (html.startsWith('</header>', i)) {
          depth--;
          if (depth === 0) {
            headerEnd = i + '</header>'.length;
            break;
          }
          i += 9;
        } else {
          i++;
        }
      }
      if (headerEnd !== -1) {
        html = html.slice(0, headerStart) + SWEO_NAV_HTML + html.slice(headerEnd);
        changes.push('nav-replace');
      }
    }
  }

  // 13. Inject chapter-nav.js on pages that have data-chapter-layout="nav"
  if (html.includes('data-chapter-layout="nav"') && !html.includes('chapter-nav.js')) {
    html = html.replace('</body>', `<script src="/fin-assets/js/chapter-nav.js" defer></script>\n</body>`);
    changes.push('chapter-nav');
  }

  // 14. Replace old footer with SWEO footer
  if (SWEO_FOOTER_HTML && !html.includes('sweo-footer-grid')) {
    const footerStart = html.indexOf('<footer');
    if (footerStart !== -1) {
      // Find the matching </footer> using depth counting
      let depth = 0;
      let footerEnd = -1;
      let i = footerStart;
      while (i < html.length) {
        if (html.startsWith('<footer', i) && (html[i + 7] === ' ' || html[i + 7] === '>')) {
          depth++;
          i += 7;
        } else if (html.startsWith('</footer>', i)) {
          depth--;
          if (depth === 0) {
            footerEnd = i + '</footer>'.length;
            break;
          }
          i += 9;
        } else {
          i++;
        }
      }
      if (footerEnd !== -1) {
        html = html.slice(0, footerStart) + SWEO_FOOTER_HTML + html.slice(footerEnd);
        changes.push('footer-replace');
      }
    }
  }

  // 15. Remove the original @font-face for woff2 (proprietary fonts)
  //     from the font CSS file reference — we override them in our injected block

  // Count changes
  if (html !== original) {
    // Count distinct types of changes
    if (original.includes('_next/static/css/')) changes.push('css-paths');
    if (original.includes('_next/static/media/')) changes.push('font-paths');
    if (original.match(/src="\_next\/[^"]*\?url=/)) changes.push('image-urls');
    if (original.match(/<script[^>]*_next/)) changes.push('js-removal');
    if (original.includes(' opacity-0')) changes.push('opacity-fix');
    if (!original.includes('data-aligned="true"')) changes.push('css-inject');
  }

  return { html, changes };
}

// ─── CSS Font Override ───────────────────────────────────────────────────────

async function createFontOverrideCSS() {
  // The font CSS file (8a7e9520230d3a86.css) contains @font-face for the
  // proprietary fonts pointing to woff2 files. We need to replace it with
  // our open-source alternatives.
  const fontCssPath = path.join(FIN_ASSETS, 'css', '8a7e9520230d3a86.css');
  if (existsSync(fontCssPath)) {
    const originalCss = await readFile(fontCssPath, 'utf-8');

    // Replace @font-face declarations for proprietary fonts
    let newCss = originalCss;

    // Replace MediumLL @font-face blocks
    newCss = newCss.replace(
      /@font-face\s*\{[^}]*font-family:\s*["']?MediumLL["']?[^}]*\}/g,
      `@font-face {
  font-family: 'MediumLL';
  src: local('Inter'), local('system-ui');
  font-display: swap;
  font-weight: 100 900;
  font-style: normal;
}`
    );

    // Replace IvoryLL @font-face blocks
    newCss = newCss.replace(
      /@font-face\s*\{[^}]*font-family:\s*["']?IvoryLL["']?[^}]*\}/g,
      `@font-face {
  font-family: 'IvoryLL';
  src: local('Lora'), local('Georgia'), local('ui-serif');
  font-display: swap;
  font-weight: 300;
  font-style: normal;
}`
    );

    // Replace AeonikFono @font-face blocks
    newCss = newCss.replace(
      /@font-face\s*\{[^}]*font-family:\s*["']?AeonikFono["']?[^}]*\}/g,
      `@font-face {
  font-family: 'AeonikFono';
  src: local('JetBrains Mono'), local('ui-monospace'), local('Menlo');
  font-display: swap;
  font-weight: 300;
  font-style: normal;
}`
    );

    return { originalCss, newCss, path: fontCssPath };
  }
  return null;
}

// ─── Find all HTML files ─────────────────────────────────────────────────────

async function findHtmlFiles(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === '_next') continue; // Skip _next folder (build artifacts)
    if (entry.isDirectory()) {
      results.push(...(await findHtmlFiles(fullPath)));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const apply = args.includes('--apply');

  if (!dryRun && !apply) {
    console.log('Usage:');
    console.log('  node scripts/align-fin-css.mjs --dry-run    Preview changes');
    console.log('  node scripts/align-fin-css.mjs --apply       Apply changes');
    process.exit(0);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Fin.ai CSS Alignment Script`);
  console.log(`  Mode: ${dryRun ? 'DRY RUN (preview only)' : 'APPLY (writing files)'}`);
  console.log(`${'═'.repeat(60)}\n`);

  // 1. Process font CSS
  console.log('📝 Processing font CSS override...');
  const fontResult = await createFontOverrideCSS();
  if (fontResult) {
    if (fontResult.originalCss !== fontResult.newCss) {
      console.log(`  ✓ Font CSS: ${fontResult.path}`);
      console.log(`    Replaced proprietary @font-face → open-source alternatives`);
      if (apply) {
        // Backup original
        const backupPath = fontResult.path + '.bak';
        if (!existsSync(backupPath)) {
          await copyFile(fontResult.path, backupPath);
        }
        await writeFile(fontResult.path, fontResult.newCss, 'utf-8');
        console.log(`    ✅ Written`);
      }
    } else {
      console.log(`  ⏭  Font CSS already aligned`);
    }
  } else {
    console.log(`  ⚠  Font CSS file not found at ${path.join(FIN_ASSETS, 'css', '8a7e9520230d3a86.css')}`);
  }

  // 2. Process HTML files
  console.log('\n📄 Processing HTML files...\n');
  const htmlFiles = await findHtmlFiles(FIN_DIR);
  let totalChanges = 0;
  let filesChanged = 0;
  const changeSummary = {};

  for (const filePath of htmlFiles) {
    const relativePath = path.relative(ROOT, filePath);
    const original = await readFile(filePath, 'utf-8');
    const { html, changes } = transformHtml(original, filePath);

    if (changes.length > 0) {
      filesChanged++;
      totalChanges += changes.length;

      for (const c of changes) {
        changeSummary[c] = (changeSummary[c] || 0) + 1;
      }

      if (dryRun) {
        console.log(`  📝 ${relativePath} — ${changes.join(', ')}`);
      } else {
        await writeFile(filePath, html, 'utf-8');
        console.log(`  ✅ ${relativePath} — ${changes.join(', ')}`);
      }
    }
  }

  // 3. Summary
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`\n📊 Summary:`);
  console.log(`  HTML files scanned:  ${htmlFiles.length}`);
  console.log(`  HTML files changed:  ${filesChanged}`);
  console.log(`  Total change types:  ${totalChanges}`);
  console.log(`\n  By type:`);
  for (const [type, count] of Object.entries(changeSummary).sort(
    (a, b) => b[1] - a[1]
  )) {
    const labels = {
      'css-paths': 'CSS path rewrites (_next/ → /fin-assets/)',
      'font-paths': 'Font path rewrites',
      'image-urls': 'Image URL fixes (Next.js optimizer → direct)',
      'js-removal': 'Dead JS/RSC removal',
      'opacity-fix': 'Opacity visibility fixes',
      'css-inject': 'CSS override injection',
      'nav-replace': 'Navigation replaced with SWEO navbar',
      'chapter-nav': 'Chapter scroll navigation injected',
      'footer-replace': 'Footer replaced with SWEO footer',
      'font-update': 'Font imports updated (Google Fonts)',
    };
    console.log(`    ${labels[type] || type}: ${count} files`);
  }

  if (dryRun) {
    console.log(`\n💡 Run with --apply to write changes.\n`);
  } else {
    console.log(`\n✅ All changes applied!\n`);
  }
}

main().catch(console.error);
