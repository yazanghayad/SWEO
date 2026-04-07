#!/usr/bin/env node
/**
 * convert-fin-pages.mjs
 *
 * Converts fin.ai HTML pages into Next.js TSX page components.
 *
 * What it does:
 * 1. Reads HTML files from fin.ai/
 * 2. Extracts <main> content (skips nav + footer since layout.tsx provides those)
 * 3. Converts HTML → JSX (class→className, for→htmlFor, fixes self-closing tags, etc.)
 * 4. Extracts metadata (title, description, og:image)
 * 5. Writes TSX page files into src/app/(landing)/{slug}/page.tsx
 *
 * Usage: node scripts/convert-fin-pages.mjs [--all | --page <name> ...]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const ROOT = process.cwd();
const FIN_DIR = join(ROOT, 'fin.ai');
const OUT_DIR = join(ROOT, 'src', 'app', '(landing)');

// Priority pages to convert
const PRIORITY_PAGES = [
  'ai-engine',
  'capabilities',
  'pricing',
  'voice',
  'channels',
  'procedures',
  'testing',
  'insights',
  'trust-reliability',
  'train',
  'guarantee',
  'integrations',
  'cx-models',
  'customer-agent',
  'contact-sales',
  'view-demos',
  'updates',
  'learn',
  'glossary',
  'professional-services',
  'roi-calculator',
  'zendesk-integration',
  'salesforce-integration',
  'fin3',
  'fin-sales-agent',
];

// Nested pages (subdirectories)
const NESTED_PAGES = [
  'channels/email',
  'channels/live-chat',
  'solutions/technology',
  'solutions/financial-services',
  'solutions/enterprise',
  'solutions/ecommerce',
  'solutions/gaming',
];

// Customer story pages
const CUSTOMER_PAGES = [
  'customers/anthropic',
  'customers/clay',
  'customers/consensys',
  'customers/fundrise',
  'customers/gamma',
  'customers/jukebox',
  'customers/lightspeed',
  'customers/lightspeed-transformation',
  'customers/mony-group',
  'customers/mpb',
  'customers/nuuly',
  'customers/peddle',
  'customers/road',
  'customers/rocket-money',
  'customers/swyftx',
  'customers/synthesia',
  'customers/underdog-fantasy',
  'customers/whoop',
];

// Update pages
const UPDATE_PAGES = [
  'updates/batch-test',
  'updates/conversational-fin',
  'updates/cx-score',
  'updates/data-connector-templates',
  'updates/data-connectors',
  'updates/december-2025',
  'updates/fin-attributes',
  'updates/fin-audiences-and-identities',
  'updates/fin-for-platforms',
  'updates/fin-guidance',
  'updates/fin-insights',
  'updates/fin-over-email',
  'updates/fin-over-slack',
  'updates/fin-over-whatsapp-and-sms',
  'updates/fin-preview',
  'updates/fin-preview-improvements',
  'updates/fin-tasks',
  'updates/fin-vision',
  'updates/fin-workflows',
  'updates/january-2025',
  'updates/knowledge-sources',
  'updates/multilingual-fin',
  'updates/optimize-dashboard',
  'updates/performance-dashboard',
  'updates/procedures',
  'updates/real-time-translation',
  'updates/suggestions',
  'updates/tone-of-voice',
  'updates/topics-explorer',
  'updates/usage-limits-and-notifications',
];

/* ─── HTML → JSX conversion ─── */
function htmlToJsx(html) {
  let jsx = html;

  // 1. class → className
  jsx = jsx.replace(/\bclass="/g, 'className="');
  jsx = jsx.replace(/\bclass='/g, "className='");

  // 2. for → htmlFor (on labels)
  jsx = jsx.replace(/\bfor="/g, 'htmlFor="');

  // 3a. Convert <style>...</style> → <style dangerouslySetInnerHTML={{__html: `...`}} />
  jsx = jsx.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => {
    const escaped = css.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    return `<style dangerouslySetInnerHTML={{__html: \`${escaped}\`}} />`;
  });

  // 3b. Convert <script>...</script> → <pre><code>...</code></pre>
  // (These are code examples in help articles, not executable scripts)
  // Also handle malformed </script (missing closing >)
  jsx = jsx.replace(/<script>([\s\S]*?)<\/script>?/g, (_, code) => {
    const escaped = code.replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/{/g, '&#123;').replace(/}/g, '&#125;');
    return `<pre><code>${escaped}</code></pre>`;
  });

  // 3. Fix self-closing tags (HTML void elements)
  const voidTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'area', 'col', 'embed', 'wbr', 'track'];
  for (const tag of voidTags) {
    // Match <tag ... > that doesn't already end with />
    const re = new RegExp(`<(${tag}\\b[^>]*?)(?<!/)>`, 'g');
    jsx = jsx.replace(re, '<$1 />');
  }

  // 4. style="..." → style={{...}} (inline styles)
  jsx = jsx.replace(/style="([^"]*)"/g, (_, styleStr) => {
    const pairs = styleStr.split(';').filter(Boolean).map(pair => {
      const [prop, ...valParts] = pair.split(':');
      if (!prop || valParts.length === 0) return null;
      const camelProp = prop.trim().replace(/-([a-z])/g, (__, c) => c.toUpperCase());
      const value = valParts.join(':').trim();
      // Check if value is a number
      const numVal = parseFloat(value);
      if (!isNaN(numVal) && String(numVal) === value) {
        return `${camelProp}: ${numVal}`;
      }
      return `${camelProp}: '${value.replace(/'/g, "\\'")}'`;
    }).filter(Boolean);
    return `style={{${pairs.join(', ')}}}`;
  });

  // 5. tabindex → tabIndex
  jsx = jsx.replace(/\btabindex="/g, 'tabIndex="');
  jsx = jsx.replace(/\btabindex=/g, 'tabIndex=');

  // 6. aria-hidden="true" is fine in JSX
  // 7. data-* attributes are fine in JSX

  // 8. Fix HTML entities that might cause issues
  // &amp; &lt; &gt; are fine in JSX

  // 9. Fix onclick → onClick, onchange → onChange etc.
  jsx = jsx.replace(/\bonclick="/g, 'onClick="');
  jsx = jsx.replace(/\bonchange="/g, 'onChange="');
  jsx = jsx.replace(/\bonsubmit="/g, 'onSubmit="');

  // 10. Fix <!-- comments --> → {/* comments */}
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

  // 11. Replace &amp; inside text (not attributes)
  // Already handled by React

  // 12. Fix rowspan/colspan → rowSpan/colSpan
  jsx = jsx.replace(/\browspan="/g, 'rowSpan="');
  jsx = jsx.replace(/\bcolspan="/g, 'colSpan="');

  // 13. Fix autocomplete → autoComplete
  jsx = jsx.replace(/\bautocomplete="/g, 'autoComplete="');

  // 14. Fix crossorigin → crossOrigin
  jsx = jsx.replace(/\bcrossorigin="/g, 'crossOrigin="');
  jsx = jsx.replace(/\bcrossorigin=""/g, 'crossOrigin="anonymous"');

  // 15. Fix xlink:href → xlinkHref (SVG)
  jsx = jsx.replace(/\bxlink:href="/g, 'xlinkHref="');

  // 16. Fix fill-rule → fillRule, clip-rule → clipRule, stroke-width etc. (SVG attributes)
  jsx = jsx.replace(/\bfill-rule="/g, 'fillRule="');
  jsx = jsx.replace(/\bclip-rule="/g, 'clipRule="');
  jsx = jsx.replace(/\bstroke-width="/g, 'strokeWidth="');
  jsx = jsx.replace(/\bstroke-linecap="/g, 'strokeLinecap="');
  jsx = jsx.replace(/\bstroke-linejoin="/g, 'strokeLinejoin="');
  jsx = jsx.replace(/\bstroke-dasharray="/g, 'strokeDasharray="');
  jsx = jsx.replace(/\bstroke-dashoffset="/g, 'strokeDashoffset="');
  jsx = jsx.replace(/\bstroke-miterlimit="/g, 'strokeMiterlimit="');
  jsx = jsx.replace(/\bstroke-opacity="/g, 'strokeOpacity="');
  jsx = jsx.replace(/\bfill-opacity="/g, 'fillOpacity="');
  jsx = jsx.replace(/\bclip-path="/g, 'clipPath="');

  // 17. Fix fetchpriority → fetchPriority
  jsx = jsx.replace(/\bfetchpriority="/g, 'fetchPriority="');

  // 18. Fix srcset → srcSet
  jsx = jsx.replace(/\bsrcset="/g, 'srcSet="');
  // But not imagesrcset
  jsx = jsx.replace(/\bimageSrcSet="/g, 'imageSrcSet="');

  // 19. Fix imagesrcset → imageSrcSet, imagesizes → imageSizes
  jsx = jsx.replace(/\bimagesrcset="/g, 'imageSrcSet="');
  jsx = jsx.replace(/\bimagesizes="/g, 'imageSizes="');

  // 20. Fix readonly → readOnly
  jsx = jsx.replace(/\breadonly=""/g, 'readOnly');
  jsx = jsx.replace(/\breadonly(?=[\s/>])/g, 'readOnly');

  // 21. Fix checked="" → defaultChecked
  jsx = jsx.replace(/\bchecked=""/g, 'defaultChecked');
  jsx = jsx.replace(/\bchecked(?=[\s/>])/g, 'defaultChecked');

  // 22. Fix viewbox → viewBox (SVG)
  jsx = jsx.replace(/\bviewbox="/g, 'viewBox="');

  // 23. Fix autoplay → autoPlay, muted → keep (valid in JSX)
  jsx = jsx.replace(/\bautoplay(?=[\s/>])/gi, 'autoPlay');

  // 24. Fix allowfullscreen → allowFullScreen
  jsx = jsx.replace(/\ballowfullscreen/g, 'allowFullScreen');

  // 25. Fix novalidate → noValidate
  jsx = jsx.replace(/\bnovalidate/g, 'noValidate');

  // 26. Decode HTML entities in className and text content
  jsx = jsx.replace(/&amp;/g, '&');
  jsx = jsx.replace(/&#x27;/g, "'");
  jsx = jsx.replace(/&#39;/g, "'");
  jsx = jsx.replace(/&quot;/g, '"');
  jsx = jsx.replace(/&#x2F;/g, '/');
  jsx = jsx.replace(/&lt;/g, '<');
  jsx = jsx.replace(/&gt;/g, '>');

  // 26b. After entity decode, <script> and <style> tags may reappear from encoded HTML
  // Convert any remaining <style>...</style> tags
  jsx = jsx.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => {
    const escaped = css.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    return `<style dangerouslySetInnerHTML={{__html: \`${escaped}\`}} />`;
  });
  // Convert any remaining <script>...</script> tags (code examples)
  // Also handle malformed </script (missing closing >)
  jsx = jsx.replace(/<script>([\s\S]*?)<\/script>?/g, (_, code) => {
    const escaped = code.replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/{/g, '&#123;').replace(/}/g, '&#125;');
    return `<pre><code>${escaped}</code></pre>`;
  });

  // 27. Fix aria-valuemin/max/now to be numeric JSX
  jsx = jsx.replace(/aria-valuemin="(\d+)"/g, 'aria-valuemin={$1}');
  jsx = jsx.replace(/aria-valuemax="(\d+)"/g, 'aria-valuemax={$1}');
  jsx = jsx.replace(/aria-valuenow="(\d+)"/g, 'aria-valuenow={$1}');

  // 28. Fix tabIndex to be numeric
  jsx = jsx.replace(/tabIndex="(-?\d+)"/g, 'tabIndex={$1}');

  // 29. Fix width/height on img/svg to be numeric
  jsx = jsx.replace(/(width|height)="(\d+)"/g, '$1={$2}');

  return jsx;
}

/* ─── Extract metadata from <head> ─── */
function extractMetadata(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
  const themeMatch = html.match(/data-page-theme="([^"]+)"/);

  return {
    title: titleMatch ? titleMatch[1].replace(/\| Intercom$/, '').trim() : '',
    description: descMatch ? descMatch[1] : '',
    ogImage: ogImageMatch ? ogImageMatch[1] : '',
    canonical: canonicalMatch ? canonicalMatch[1] : '',
    theme: themeMatch ? themeMatch[1] : 'navy',
  };
}

/* ─── Extract <main> content ─── */
function extractMainContent(html) {
  const mainStart = html.indexOf('<main>');
  const mainEnd = html.indexOf('</main>');

  let content;

  if (mainStart !== -1 && mainEnd !== -1) {
    content = html.substring(mainStart + 6, mainEnd).trim();
  } else {
    // Fallback: find content between </header> and </body>
    const headerEnd = html.indexOf('</header>');
    if (headerEnd === -1) {
      console.warn('  ⚠ Could not find </header>');
      return '';
    }

    // Use </body> as the end boundary
    let bodyEnd = html.indexOf('</body>');
    if (bodyEnd === -1) bodyEnd = html.length;

    content = html.substring(headerEnd + 9, bodyEnd).trim();
  }

  // Remove inline <script> blocks (nav JS etc.)
  content = content.replace(/<script[\s\S]*?<\/script>/g, '');

  // Remove injected SWEO footer block (<!-- SWEO Footer ... </footer>)
  content = content.replace(/<!-- SWEO Footer[\s\S]*?<footer class="fin-footer">[\s\S]*?<\/footer>/g, '');

  // Remove original Fin site footer (the last big footer with theme- class)
  content = content.replace(/<footer class="relative z-1 w-full overflow-hidden[\s\S]*?<\/footer>\s*$/g, '');

  return content.trim();
}

/* ─── Generate TSX page ─── */
function generatePageTsx(slug, metadata, jsxContent) {
  const componentName = slug
    .split(/[-/]/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') + 'Page';

  // Escape any backticks or ${} in the content
  const safeJsx = jsxContent
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

  return `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${metadata.title.replace(/'/g, "\\'")}',
  description: '${metadata.description.replace(/'/g, "\\'")}',${metadata.ogImage ? `
  openGraph: {
    images: ['${metadata.ogImage}'],
  },` : ''}
};

export default function ${componentName}() {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;
}

/* ─── Process one page ─── */
function processPage(slug) {
  const htmlPath = join(FIN_DIR, `${slug}.html`);
  if (!existsSync(htmlPath)) {
    console.warn(`  ⚠ ${slug}.html not found, skipping`);
    return false;
  }

  console.log(`  Converting ${slug}.html ...`);
  const html = readFileSync(htmlPath, 'utf-8');

  // Extract metadata
  const metadata = extractMetadata(html);

  // Extract main content
  let mainContent = extractMainContent(html);
  if (!mainContent) {
    console.warn(`  ⚠ No main content found in ${slug}.html`);
    return false;
  }

  // Convert HTML → JSX
  const jsxContent = htmlToJsx(mainContent);

  // Generate TSX
  const tsx = generatePageTsx(slug, metadata, jsxContent);

  // Write file
  const outPath = join(OUT_DIR, slug, 'page.tsx');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, tsx, 'utf-8');

  console.log(`  ✓ ${slug}/page.tsx written (${Math.round(tsx.length / 1024)}KB)`);
  return true;
}

/* ─── Main ─── */
function main() {
  const args = process.argv.slice(2);
  let pages = PRIORITY_PAGES;

  if (args.includes('--all')) {
    pages = [...PRIORITY_PAGES, ...NESTED_PAGES, ...CUSTOMER_PAGES, ...UPDATE_PAGES];
  } else if (args.includes('--page')) {
    const idx = args.indexOf('--page');
    pages = args.slice(idx + 1);
  }

  console.log(`\n🔄 Converting ${pages.length} fin.ai pages to TSX...\n`);

  let success = 0;
  let failed = 0;

  for (const slug of pages) {
    try {
      if (processPage(slug)) {
        success++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`  ✗ Error converting ${slug}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Done: ${success} converted, ${failed} skipped/failed\n`);
  console.log('Pages are now at: src/app/(landing)/{slug}/page.tsx');
  console.log('They share the layout at: src/app/(landing)/layout.tsx');
  console.log('The catch-all route in (fin-pages) still serves remaining HTML pages.\n');
}

main();
