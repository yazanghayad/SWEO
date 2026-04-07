#!/usr/bin/env python3
"""Fix JSX parse errors in landing page files.

Each fix targets the exact error position from the build log.
The approach: for each known error file+line+col, extract the problematic
text and apply the appropriate fix.
"""
import os
import re

BASE = '/workspaces/chat/src/app/(landing)'

# ============================================================
# Helper: apply a text replacement at a specific position in a file
# ============================================================
def fix_file(rel_path, replacements):
    """Apply text replacements to a file.
    
    rel_path: path relative to BASE (e.g., 'help/en/articles/.../page.tsx')
    replacements: list of (old_text, new_text) tuples, applied in order
    """
    full_path = os.path.join(BASE, rel_path)
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old_text, new_text in replacements:
        if old_text not in content:
            print(f"  WARNING: '{old_text[:60]}...' not found in {rel_path}")
            continue
        content = content.replace(old_text, new_text, 1)
    
    if content != original:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  FIXED: {rel_path} ({len(replacements)} replacements)")
    else:
        print(f"  UNCHANGED: {rel_path}")


# ============================================================
# Fix each file with known errors
# ============================================================

# 1. help/en/articles/10614191 - Unescaped > in "Apps and integrations > APIs > Conversations API"
fix_file('help/en/articles/10614191-fin-for-zendesk-messaging-setup/page.tsx', [
    ('> <b>APIs</b> > <b>Conversations API', '&gt; <b>APIs</b> &gt; <b>Conversations API'),
])

# 2. help/en/articles/10614196 - Unescaped { in JSON code block
fix_file('help/en/articles/10614196-fin-messenger-zendesk-setup/page.tsx', [
    ('<pre>{<br />  "id": "457"', '<pre>{"{"}<br />  &quot;id&quot;: &quot;457&quot;'),
])

# 3. help/en/articles/10644329 - Unescaped { in template variables
fix_file('help/en/articles/10644329-provide-fin-ai-agent-with-specific-guidance/page.tsx', [
    ('{Company name}', '{"{"} Company name {"}"}'),
])

# 4. help/en/articles/10644781 - Complex: <<i>company email</i>{">"} 
fix_file('help/en/articles/10644781-fin-guidance-best-practices/page.tsx', [
    ('<<i>company email</i>{">"}"', '&lt;<i>company email</i>&gt;&quot;'),
])

# 5. help/en/articles/10751648 - Unescaped { in JSON code
fix_file('help/en/articles/10751648-create-data-connectors-for-fin/page.tsx', [
    ('"to": "our_ticketing_email', '&quot;to&quot;: &quot;our_ticketing_email'),
])

# 6. help/en/articles/10763810 - This one seems to be at a position where the error is about something else
# Error at col 74617 - let me check what's actually there

# 7. help/en/articles/10840651 - Unescaped > in "Add filter > Language"
fix_file('help/en/articles/10840651-use-fin-ai-agent-in-multiple-languages/page.tsx', [
    ('> <b>Language</b>', '&gt; <b>Language</b>'),
])

# 8. help/en/articles/10853206 - Unescaped > in "Edit > Add chart"
fix_file('help/en/articles/10853206-measure-and-report-on-fin-csat/page.tsx', [
    ('> <b>Add chart</b>', '&gt; <b>Add chart</b>'),
])

# 9. help/en/articles/10903029 - Unescaped > in code example ">monthly_spend"
fix_file('help/en/articles/10903029-manage-audiences-and-targeting-for-fin/page.tsx', [
    ('<code>>monthly_spend', '<code>&gt;monthly_spend'),
])

# 10. help/en/articles/10980759 - Multiple &#123; that look like they should work (HTML entities)
# But the error is JSX parse - &#123; renders as { which confuses JSX?
# Actually &#123; in JSX IS a literal { character. Let me check more carefully.

# 11. help/en/articles/11077738 - Unescaped { in text "inserter {..}"
fix_file('help/en/articles/11077738-how-attributes-can-power-your-fin-tasks-escalations-workflows-and-data-connectors/page.tsx', [
    ('inserter {..}', 'inserter {"{"}..["}"}'),
])

# 12. help/en/articles/11115093 - Unescaped > in "Deploy >Salesforce cases >Install"
fix_file('help/en/articles/11115093-fin-for-salesforce-cases-required-permissions/page.tsx', [
    ('Deploy >Salesforce cases >Install', 'Deploy &gt;Salesforce cases &gt;Install'),
    ('Salesforce Setup ></b>', 'Salesforce Setup &gt;</b>'),
])

# 13. help/en/articles/11116863 - Unescaped { in JS code: ("boot", {<br />
fix_file('help/en/articles/11116863-authenticating-users-in-fin-messenger-with-json-web-tokens-jwts/page.tsx', [
    ('("boot", {<br />', '(&quot;boot&quot;, {"{"}<br />'),
])

# 14. help/en/articles/11116923 - Unescaped { in JS code: payload = {<br />
fix_file('help/en/articles/11116923-migrating-from-identity-verification-to-messenger-security-with-jwts/page.tsx', [
    ('payload = {<br />', 'payload = {"{"}<br />'),
])

# 15. help/en/articles/11370516 - Unescaped < in "</body>" code reference
fix_file('help/en/articles/11370516-fin-messenger-setting-up-with-salesforce-miaw/page.tsx', [
    ('<code></body></code>', '<code>&lt;/body&gt;</code>'),
])

# 16. help/en/articles/11470337 - Multiple unescaped > in SAML URL references
fix_file('help/en/articles/11470337-integrate-with-an-identity-provider-and-log-in-with-saml-sso/page.tsx', [
    ('<p>>You', '<p>&gt;You'),
    ('&lt;SAML URL>.</p>', '&lt;SAML URL&gt;.</p>'),
    ('</b>>&lt;SAML URL>/consume', '</b>&gt;&lt;SAML URL&gt;/consume'),
    # There are multiple instances of this pattern
])

# 17. help/en/articles/11667266 - Unescaped > in "Settings > Zendesk Integration"  
fix_file('help/en/articles/11667266-fin-for-zendesk-tickets-faqs/page.tsx', [
    ('> <b>Zendesk Integration</b>', '&gt; <b>Zendesk Integration</b>'),
])

# 18. help/en/articles/11777290 - Unescaped > in "Settings > "
fix_file('help/en/articles/11777290-adding-or-removing-a-teammate/page.tsx', [
    ('>Settings > </a>', '&gt;Settings &gt; </a>'),
])

# 19. help/en/articles/11801771 - Unescaped { in JWT.encode({
fix_file('help/en/articles/11801771-sync-salesforce-account-data/page.tsx', [
    ('JWT.encode({email:', 'JWT.encode({"{"} email:'),
])

# 20. help/en/articles/11992116 - Unescaped { in JSON code
fix_file('help/en/articles/11992116-fin-messenger-map-data-using-salesforce-flows/page.tsx', [
    ('<pre>{<br /> "_firstName"', '<pre>{"{"}<br /> &quot;_firstName&quot;'),
])

# 21. help/en/articles/12066458 - Unescaped > in "Sites > (your site)"
fix_file('help/en/articles/12066458-fin-messenger-embedding-in-your-salesforce-portal/page.tsx', [
    ('Sites > (your site)', 'Sites &gt; (your site)'),
])

# 22. help/en/articles/12313161 - Unescaped > in "Salesforce Setup >"
fix_file('help/en/articles/12313161-fin-messenger-required-permissions-for-salesforce/page.tsx', [
    ('Salesforce Setup ></b>', 'Salesforce Setup &gt;</b>'),
])

# 23. help/en/articles/12586661 - Unescaped < in "<your_stripe_api_key>"
fix_file('help/en/articles/12586661-create-authentication-and-api-tokens/page.tsx', [
    ('<your_stripe_api_key>', '&lt;your_stripe_api_key&gt;'),
])

# 24. help/en/articles/12890230 - Unescaped { in JSON code
fix_file('help/en/articles/12890230-how-to-use-data-connectors-in-fin-procedures/page.tsx', [
    ('"order_id": "ORD-1001"', '&quot;order_id&quot;: &quot;ORD-1001&quot;'),
])

# 25. help/en/articles/13703405 - Unescaped > in code: >(datetime
fix_file('help/en/articles/13703405-how-to-write-code-conditions-for-fin-procedures/page.tsx', [
    ('<pre>>(datetime', '<pre>&gt;(datetime'),
])

# 26. salesforce-integration - xml:space namespace attribute
fix_file('salesforce-integration/page.tsx', [
    ('xml:space="preserve"', 'xmlSpace="preserve"'),
])

# 27. zendesk-integration - bare < in JSX text
fix_file('zendesk-integration/page.tsx', [
    ('"><</span>', '">&lt;</span>'),
])

print("\n=== All fixes applied ===")
