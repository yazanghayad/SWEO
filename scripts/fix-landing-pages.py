#!/usr/bin/env python3
"""
Fix "Unknown regular expression flags" build errors in landing page TSX files.

Root causes:
  A. xmlns:xlink (not valid JSX, should be xmlnsXlink)
  B. xml:space (should be xmlSpace)
  C. Bare < followed by digits in JSX text (must be {"<"})
  D. Bare > followed by digits in JSX text (must be {">"})
  E. Bare < as standalone text content (must be {"<"})
  F. Nested double quotes inside double-quoted attributes
  G. Unclosed JSX tags causing parser to misinterpret </>
"""

import re
import os

BASE = os.path.join(os.path.dirname(__file__), '..', 'src', 'app', '(landing)')

fixes_applied = []

def fix_file(relpath, description, old, new, count=0):
    """Replace old with new in file. count=0 means replace all."""
    fpath = os.path.join(BASE, relpath)
    with open(fpath, 'r') as f:
        content = f.read()
    
    occurrences = content.count(old)
    if occurrences == 0:
        print(f"  WARNING: '{old[:60]}...' not found in {relpath}")
        return False
    
    if count > 0:
        new_content = content.replace(old, new, count)
    else:
        new_content = content.replace(old, new)
    
    actual_replacements = occurrences if count == 0 else min(count, occurrences)
    
    with open(fpath, 'w') as f:
        f.write(new_content)
    
    fixes_applied.append(f"  {relpath}: {description} ({actual_replacements}x)")
    print(f"  FIXED: {relpath} - {description} ({actual_replacements} replacements)")
    return True


def fix_structural(relpath, description):
    """Fix unclosed tags by analyzing and closing them."""
    fpath = os.path.join(BASE, relpath)
    with open(fpath, 'r') as f:
        lines = f.readlines()
    
    # Find the main content line (line 14, index 13)
    if len(lines) < 15:
        print(f"  WARNING: {relpath} has fewer than 15 lines")
        return False
    
    line14 = lines[13]
    
    # Use a stack-based approach to find unclosed tags
    # This is simplified but handles the common cases
    tag_stack = []
    i = 0
    while i < len(line14):
        # Skip JSX expressions {/* ... */} and {... }
        if line14[i] == '{':
            depth = 1
            i += 1
            in_string = False
            string_char = None
            while i < len(line14) and depth > 0:
                c = line14[i]
                if in_string:
                    if c == string_char and line14[i-1] != '\\':
                        in_string = False
                elif c in ('"', "'", '`'):
                    in_string = True
                    string_char = c
                elif c == '{':
                    depth += 1
                elif c == '}':
                    depth -= 1
                i += 1
            continue
        
        # Match closing tag
        m = re.match(r'</([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>', line14[i:])
        if m:
            tag_name = m.group(1)
            # Pop from stack
            if tag_stack and tag_stack[-1] == tag_name:
                tag_stack.pop()
            else:
                # Try to find matching tag further down the stack
                for j in range(len(tag_stack)-1, -1, -1):
                    if tag_stack[j] == tag_name:
                        tag_stack = tag_stack[:j]
                        break
            i += m.end()
            continue
        
        # Match self-closing tag
        m = re.match(r'<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?\s*/>', line14[i:])
        if m:
            i += m.end()
            continue
        
        # Match opening tag
        m = re.match(r'<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>', line14[i:])
        if m:
            tag_name = m.group(1)
            # Skip void elements
            if tag_name.lower() not in ('br', 'hr', 'img', 'input', 'meta', 'link', 
                                         'source', 'track', 'wbr', 'area', 'base', 
                                         'col', 'embed', 'param', 'template'):
                tag_stack.append(tag_name)
            i += m.end()
            continue
        
        i += 1
    
    if not tag_stack:
        print(f"  INFO: {relpath} - no unclosed tags found by parser")
        return False
    
    # Generate closing tags in reverse order
    closing_tags = ''.join(f'</{tag}>' for tag in reversed(tag_stack))
    
    # Append closing tags to end of line 14 (before newline)
    line14_stripped = line14.rstrip('\n')
    lines[13] = line14_stripped + closing_tags + '\n'
    
    with open(fpath, 'w') as f:
        f.writelines(lines)
    
    fixes_applied.append(f"  {relpath}: {description} (added {len(tag_stack)} closing tags: {closing_tags})")
    print(f"  FIXED: {relpath} - {description}")
    print(f"         Added {len(tag_stack)} closing tags: {closing_tags[:100]}{'...' if len(closing_tags) > 100 else ''}")
    return True


print("=" * 60)
print("Fixing landing page build errors")
print("=" * 60)

# === Category A: xmlns:xlink ===
print("\n[A] Fixing xmlns:xlink → xmlnsXlink")
fix_file(
    'solutions/ecommerce/page.tsx',
    'xmlns:xlink → xmlnsXlink',
    'xmlns:xlink="http://www.w3.org/1999/xlink"',
    'xmlnsXlink="http://www.w3.org/1999/xlink"'
)

# === Category B: xml:space ===
print("\n[B] Fixing xml:space → xmlSpace")
fix_file(
    'salesforce-integration/page.tsx',
    'xml:space → xmlSpace',
    'xml:space="preserve"',
    'xmlSpace="preserve"'
)

# === Category C: Bare < followed by digits ===
print("\n[C] Fixing bare < followed by digits")
fix_file(
    'professional-services/page.tsx',
    'bare <90 → {"<"}90',
    '"><90</div>',
    '">{"{\"<\"}"}90</div>'  # This won't work, let me use a different approach
)

# Actually, let me fix this properly with direct string replacement
# Revert and redo
fpath = os.path.join(BASE, 'professional-services/page.tsx')
with open(fpath, 'r') as f:
    content = f.read()
# Undo previous broken fix if applied
content = content.replace('">{"{\"<\"}"}90</div>', '"><90</div>')

# Now do correct replacements
content = content.replace(
    'text-white"><90</div>',
    'text-white">{"<"}90</div>'
)
content = content.replace(
    'uppercase"><span><03 months</span>',
    'uppercase"><span>{"<"}03 months</span>'
)
with open(fpath, 'w') as f:
    f.write(content)
fixes_applied.append("  professional-services/page.tsx: bare <90 and <03 → escaped (2x)")
print("  FIXED: professional-services/page.tsx - bare <90 and <03 months escaped")

fix_file(
    'solutions/enterprise/page.tsx',
    'bare <01 → {"<"}01',
    '><span><01</span>',
    '><span>{"<"}01</span>'
)

# === Category D: Bare > followed by digits ===
print("\n[D] Fixing bare > followed by digits")
fix_file(
    'solutions/financial-services/page.tsx',
    'bare >95% → {">"}95%',
    '">>95%</p>',
    '">{">"}95%</p>'
)

# === Category E: Bare < as standalone character ===
print("\n[E] Fixing bare < as text content")
fix_file(
    'zendesk-integration/page.tsx',
    'bare < → {"<"}',
    '><</span>',
    '>{"<"}</span>'
)

# === Category F: Nested quotes in alt attributes ===
print("\n[F] Fixing nested quotes in alt attributes")
# customer-agent has: alt="Illustration of the "Old Way" and "New way" of how customer agents work"
# Fix by switching outer quotes to single quotes using JSX expression
fix_file(
    'customer-agent/page.tsx',
    'nested quotes in alt → escaped',
    'alt="Illustration of the "Old Way" and "New way" of how customer agents work"',
    "alt='Illustration of the \"Old Way\" and \"New way\" of how customer agents work'"
)

# === Category G: Unclosed JSX tags (structural) ===
print("\n[G] Fixing unclosed JSX tags (structural)")
for relpath in ['cx-models/page.tsx', 'fin-sales-agent/page.tsx', 'fin3/page.tsx', 
                'guarantee/page.tsx', 'roi-calculator/page.tsx']:
    fix_structural(relpath, 'closing unclosed tags')

# Also fix customer-agent which has 1 unclosed div
fix_structural('customer-agent/page.tsx', 'closing unclosed div')

print("\n" + "=" * 60)
print(f"All fixes applied ({len(fixes_applied)} operations):")
for fix in fixes_applied:
    print(fix)
print("=" * 60)
