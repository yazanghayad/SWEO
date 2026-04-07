#!/usr/bin/env python3
"""
Extract structured content from all fin.ai HTML files.
Outputs JSON data files for use as Next.js page content.
"""

import re, json, os, sys
from pathlib import Path

FIN_DIR = Path(__file__).parent.parent / 'fin.ai'
OUT_DIR = Path(__file__).parent.parent / 'src' / 'data'

def clean_text(s):
    """Clean extracted text"""
    s = s.replace('\\n', ' ').replace('\\t', ' ').replace('\\"', '"')
    s = s.replace('\\u0027', "'").replace('\\u0026', '&').replace('\\u003c', '<').replace('\\u003e', '>')
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def extract_meta(raw):
    """Extract meta tags from raw HTML"""
    result = {}
    
    title = re.findall(r'<title>([^<]+)</title>', raw)
    if title:
        result['metaTitle'] = clean_text(title[0])
    
    desc = re.findall(r'<meta\s+name="description"\s+content="([^"]*)"', raw)
    if desc:
        result['metaDescription'] = clean_text(desc[0])
    
    og_img = re.findall(r'<meta\s+property="og:image"\s+content="([^"]*)"', raw)
    if og_img:
        result['ogImage'] = og_img[0]
    
    return result

def get_rsc_text(raw):
    """Combine all RSC payload text"""
    chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', raw, re.DOTALL)
    if not chunks:
        return raw
    full = ''.join(chunks)
    return full.replace('\\n', '\n').replace('\\t', ' ').replace('\\"', '"').replace('\\u0027', "'").replace('\\u0026', '&')

def extract_content_strings(rsc_text):
    """Extract meaningful content strings from RSC data"""
    # Find quoted strings that look like real content
    strings = re.findall(r'"([^"]{10,1000})"', rsc_text)
    content = []
    skip_patterns = ['className', 'function(', 'webpack', 'undefined', 'self.__next',
                     'createElement', 'addEventListener', 'querySelector', 'prototype',
                     'enumerable', 'configurable', 'Object.define', '__esModule',
                     'module.exports', 'Symbol.', 'toString', '.call(', 'typeof ',
                     'data-slot', 'data-theme', 'aria-', 'tabIndex', 'text-[', 'bg-[',
                     'font-', 'leading-', 'tracking-', 'max-w-', 'grid-cols', 'inline-flex',
                     'flex ', 'relative ', 'absolute ', 'px-', 'py-', 'gap-', 'rounded',
                     'border-', 'hover:', 'focus:', 'transition-', 'duration-', 'ease-',
                     'PrivacyPolicy', 'WorkflowTrigger', 'Analytics', 'Listener',
                     'viewport', 'width=device', 'charset', 'Content-Type', 'X-UA',
                     'application/json', 'text/css', 'text/javascript',
                     '/_next/', '/static/', '/chunks/', '.js', '.css', '.woff',
                     'fetchPriority', 'crossOrigin', 'integrity', 'nonce=']
    for s in strings:
        s_clean = clean_text(s)
        if len(s_clean) < 15:
            continue
        if any(p in s for p in skip_patterns):
            continue
        # Must have at least one space (real sentence)
        if ' ' not in s_clean:
            continue
        # Skip hex hashes
        if re.match(r'^[A-F0-9]{20,}$', s_clean):
            continue
        content.append(s_clean)
    
    return content

def extract_customer_page(filepath):
    """Extract customer case study content"""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        raw = f.read()
    
    meta = extract_meta(raw)
    rsc = get_rsc_text(raw)
    strings = extract_content_strings(rsc)
    
    # H1 from raw HTML
    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', raw, re.DOTALL)
    title = clean_text(re.sub(r'<[^>]+>', '', h1[0])) if h1 else meta.get('metaTitle', '')
    
    # Find stats (numbers like "50%", "3x", etc.)
    stats = []
    for s in strings:
        if re.match(r'^\d+[%x×+]', s) or re.match(r'^[<>≈~]\d+', s):
            stats.append(s)
    
    # Find quotes (longer strings that are testimonials)
    quotes = [s for s in strings if len(s) > 80 and any(w in s.lower() for w in ['we ', 'our ', 'i ', "we're", "we've", 'helped', 'allowed', 'enabled'])]
    
    # Company description - usually short string after company name
    desc_candidates = [s for s in strings if 15 < len(s) < 200 and not any(w in s.lower() for w in ['cookie', 'privacy', 'sign up', 'log in', 'contact', 'terms'])]
    
    slug = filepath.stem
    
    return {
        'slug': slug,
        'title': title,
        'description': meta.get('metaDescription', desc_candidates[0] if desc_candidates else ''),
        'ogImage': meta.get('ogImage', ''),
        'stats': stats[:4],
        'quotes': quotes[:3],
        'contentBlocks': desc_candidates[:10],
    }

def extract_solution_page(filepath):
    """Extract solution/industry page content"""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        raw = f.read()
    
    meta = extract_meta(raw)
    rsc = get_rsc_text(raw)
    strings = extract_content_strings(rsc)
    
    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', raw, re.DOTALL)
    title = clean_text(re.sub(r'<[^>]+>', '', h1[0])) if h1 else meta.get('metaTitle', '')
    
    desc_candidates = [s for s in strings if 30 < len(s) < 300 and not any(w in s.lower() for w in ['cookie', 'privacy', 'sign up', 'terms'])]
    
    slug = filepath.stem
    return {
        'slug': slug,
        'title': title,
        'description': meta.get('metaDescription', ''),
        'ogImage': meta.get('ogImage', ''),
        'sections': desc_candidates[:15],
    }

def extract_glossary_term(filepath):
    """Extract glossary term"""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        raw = f.read()
    
    meta = extract_meta(raw)
    rsc = get_rsc_text(raw)
    strings = extract_content_strings(rsc)
    
    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', raw, re.DOTALL)
    title = clean_text(re.sub(r'<[^>]+>', '', h1[0])) if h1 else meta.get('metaTitle', '').split('|')[0].strip()
    
    # Definition is usually the first long paragraph
    long_strings = [s for s in strings if len(s) > 50 and not any(w in s.lower() for w in ['cookie', 'privacy', 'sign up', 'terms', 'contact us'])]
    
    slug = filepath.stem
    return {
        'slug': slug,
        'title': title,
        'definition': long_strings[0] if long_strings else meta.get('metaDescription', ''),
        'content': long_strings[1:6],
        'metaDescription': meta.get('metaDescription', ''),
    }

def extract_learn_article(filepath):
    """Extract learn/blog article"""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        raw = f.read()
    
    meta = extract_meta(raw)
    rsc = get_rsc_text(raw)
    strings = extract_content_strings(rsc)
    
    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', raw, re.DOTALL)
    title = clean_text(re.sub(r'<[^>]+>', '', h1[0])) if h1 else meta.get('metaTitle', '')
    
    content = [s for s in strings if len(s) > 40 and not any(w in s.lower() for w in ['cookie', 'privacy', 'sign up', 'terms', 'contact us', 'log in'])]
    
    slug = filepath.stem
    return {
        'slug': slug,
        'title': title,
        'description': meta.get('metaDescription', ''),
        'ogImage': meta.get('ogImage', ''),
        'content': content[:20],
    }

def extract_update_page(filepath):
    """Extract update/changelog entry"""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        raw = f.read()
    
    meta = extract_meta(raw)
    rsc = get_rsc_text(raw)
    strings = extract_content_strings(rsc)
    
    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', raw, re.DOTALL)
    title = clean_text(re.sub(r'<[^>]+>', '', h1[0])) if h1 else meta.get('metaTitle', '').split('|')[0].strip()
    
    content = [s for s in strings if len(s) > 30 and not any(w in s.lower() for w in ['cookie', 'privacy', 'sign up', 'terms'])]
    
    slug = filepath.stem
    return {
        'slug': slug,
        'title': title,
        'description': meta.get('metaDescription', content[0] if content else ''),
        'ogImage': meta.get('ogImage', ''),
        'content': content[:15],
    }

def extract_main_page(filepath):
    """Extract standalone main page"""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        raw = f.read()
    
    meta = extract_meta(raw)
    rsc = get_rsc_text(raw)
    strings = extract_content_strings(rsc)
    
    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', raw, re.DOTALL)
    title = clean_text(re.sub(r'<[^>]+>', '', h1[0])) if h1 else meta.get('metaTitle', '')
    
    content = [s for s in strings if len(s) > 30 and not any(w in s.lower() for w in ['cookie', 'privacy', 'sign up', 'terms', 'log in'])]
    
    slug = filepath.stem
    return {
        'slug': slug,
        'title': title,
        'description': meta.get('metaDescription', ''),
        'ogImage': meta.get('ogImage', ''),
        'sections': content[:20],
    }

# ──────────────────────────────────────
# Main extraction
# ──────────────────────────────────────
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Customer case studies
customers_dir = FIN_DIR / 'customers'
customers = []
for f in sorted(customers_dir.glob('*.html')):
    try:
        data = extract_customer_page(f)
        customers.append(data)
        print(f"  ✓ customer: {f.stem}")
    except Exception as e:
        print(f"  ✗ customer: {f.stem} - {e}")
with open(OUT_DIR / 'customers.json', 'w') as f:
    json.dump(customers, f, indent=2, ensure_ascii=False)
print(f"\n→ {len(customers)} customers extracted\n")

# 2. Solutions
solutions_dir = FIN_DIR / 'solutions'
solutions = []
for f in sorted(solutions_dir.glob('*.html')):
    try:
        data = extract_solution_page(f)
        solutions.append(data)
        print(f"  ✓ solution: {f.stem}")
    except Exception as e:
        print(f"  ✗ solution: {f.stem} - {e}")
with open(OUT_DIR / 'solutions.json', 'w') as f:
    json.dump(solutions, f, indent=2, ensure_ascii=False)
print(f"\n→ {len(solutions)} solutions extracted\n")

# 3. Glossary terms
glossary_dir = FIN_DIR / 'glossary'
glossary = []
for f in sorted(glossary_dir.glob('*.html')):
    try:
        data = extract_glossary_term(f)
        glossary.append(data)
        print(f"  ✓ glossary: {f.stem}")
    except Exception as e:
        print(f"  ✗ glossary: {f.stem} - {e}")
with open(OUT_DIR / 'glossary.json', 'w') as f:
    json.dump(glossary, f, indent=2, ensure_ascii=False)
print(f"\n→ {len(glossary)} glossary terms extracted\n")

# 4. Learn/blog articles
learn_dir = FIN_DIR / 'learn'
learn = []
for f in sorted(learn_dir.glob('*.html')):
    if '/page/' in str(f):
        continue  # Skip pagination pages
    try:
        data = extract_learn_article(f)
        learn.append(data)
        print(f"  ✓ learn: {f.stem}")
    except Exception as e:
        print(f"  ✗ learn: {f.stem} - {e}")
with open(OUT_DIR / 'learn.json', 'w') as f:
    json.dump(learn, f, indent=2, ensure_ascii=False)
print(f"\n→ {len(learn)} learn articles extracted\n")

# 5. Updates/changelog
updates_dir = FIN_DIR / 'updates'
updates = []
for f in sorted(updates_dir.glob('*.html')):
    try:
        data = extract_update_page(f)
        updates.append(data)
        print(f"  ✓ update: {f.stem}")
    except Exception as e:
        print(f"  ✗ update: {f.stem} - {e}")
with open(OUT_DIR / 'updates.json', 'w') as f:
    json.dump(updates, f, indent=2, ensure_ascii=False)
print(f"\n→ {len(updates)} updates extracted\n")

# 6. Main pages
main_pages = [
    'contact-sales.html', 'customer-agent.html', 'cx-models.html',
    'fin-sales-agent.html', 'fin3.html', 'glossary.html', 'guarantee.html',
    'learn.html', 'professional-services.html', 'roi-calculator.html',
    'salesforce-integration.html', 'updates.html', 'view-demos.html',
    'zendesk-integration.html'
]
mains = []
for fname in main_pages:
    f = FIN_DIR / fname
    if f.exists():
        try:
            data = extract_main_page(f)
            mains.append(data)
            print(f"  ✓ main: {f.stem}")
        except Exception as e:
            print(f"  ✗ main: {f.stem} - {e}")
with open(OUT_DIR / 'main-pages.json', 'w') as f:
    json.dump(mains, f, indent=2, ensure_ascii=False)
print(f"\n→ {len(mains)} main pages extracted\n")

print(f"\n{'='*50}")
print(f"TOTAL: {len(customers) + len(solutions) + len(glossary) + len(learn) + len(updates) + len(mains)} pages extracted")
print(f"Output: {OUT_DIR}")
