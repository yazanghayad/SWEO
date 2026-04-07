/**
 * Email HTML templates for transactional emails.
 *
 * Brand colors:
 *  - Primary Orange: #ff5600
 *  - Dark Navy:      #020917
 *  - Light Cream:    #f6f6f1
 */

const BRAND = {
  navy: '#020917',
  textPrimary: '#020917',
  textSecondary: '#52525b',
  textMuted: '#94949c',
  border: '#e4e4e7'
} as const;

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'sweo.se';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? `https://${ROOT_DOMAIN}`;


function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>SWEO</title>
  <!--[if mso]>
  <style>body,table,td{font-family:Arial,Helvetica,sans-serif!important}</style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #e8e8e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #e8e8e8;">
    <tr>
      <td align="center" style="padding: 40px 24px;">

        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #ffffff; overflow: hidden;">

          <!-- Dark Header with Logo -->
          <tr>
            <td align="center" style="background-color: ${BRAND.navy}; padding: 28px 36px;">
              <img src="https://drive.google.com/uc?export=view&id=1pOjU8OVEoYy7MfUD7wHTzLUJNyWJzOKo" alt="SWEO" width="48" style="display: block; border: 0; outline: none;" />
            </td>
          </tr>

          ${content}

        </table>

<!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px;">
          <tr>
            <td style="padding: 24px 36px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #71717a; line-height: 1.6;">
                This message was sent by SWEO, ${ROOT_DOMAIN}.<br />
                &copy; ${new Date().getFullYear()} SWEO. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Welcome + verification email sent after signup.
 */
export function welcomeVerificationEmail(params: {
  name: string;
  code: string;
  subdomain: string;
}): { subject: string; html: string; text: string } {
  const { name, code, subdomain } = params;

  const html = baseLayout(`
    <!-- Header -->
    <tr>
      <td style="padding: 32px 36px 0;">
        <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: ${BRAND.textPrimary}; line-height: 1.3;">
          Verify your email address
        </h1>
        <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary}; line-height: 1.7;">
          Thanks for signing up, ${escapeHtml(name)}. We want to make sure it&rsquo;s really you. Please enter the following verification code when prompted. If you don&rsquo;t want to create an account, you can ignore this message.
        </p>
      </td>
    </tr>

    <!-- Verification Code -->
    <tr>
      <td style="padding: 28px 36px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: ${BRAND.textPrimary};">
          Verification code
        </p>
        <p style="margin: 0 0 8px; font-size: 36px; font-weight: 700; letter-spacing: 4px; color: ${BRAND.textPrimary}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          ${escapeHtml(code)}
        </p>
        <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">
          (This code is valid for 15 minutes)
        </p>
      </td>
    </tr>

    <!-- Divider -->
    <tr>
      <td style="padding: 0 36px;">
        <div style="border-top: 1px solid ${BRAND.border};"></div>
      </td>
    </tr>

    <!-- Security note -->
    <tr>
      <td style="padding: 20px 36px 28px;">
        <p style="margin: 0; font-size: 13px; color: ${BRAND.textSecondary}; line-height: 1.6;">
          SWEO will never email you and ask you to disclose or verify your password, credit card, or banking account number.
        </p>
      </td>
    </tr>
  `);

  const text = `Verify your email address

Thanks for signing up, ${name}. We want to make sure it's really you.
Please enter the following verification code when prompted.
If you don't want to create an account, you can ignore this message.

Verification code: ${code}
(This code is valid for 15 minutes)

Your workspace: ${subdomain}.${ROOT_DOMAIN}

SWEO will never email you and ask you to disclose or verify your password, credit card, or banking account number.`;

  return {
    subject: `${code} is your SWEO verification code`,
    html,
    text
  };
}

/**
 * Password reset code email.
 */
export function passwordResetEmail(params: {
  name: string;
  code: string;
}): { subject: string; html: string; text: string } {
  const { name, code } = params;

  const html = baseLayout(`
    <!-- Header -->
    <tr>
      <td style="padding: 32px 36px 0;">
        <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: ${BRAND.textPrimary}; line-height: 1.3;">
          Reset your password
        </h1>
        <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary}; line-height: 1.7;">
          Hi ${escapeHtml(name)}, we received a request to reset your password. Enter the following code when prompted. If you didn&rsquo;t request this, you can ignore this message.
        </p>
      </td>
    </tr>

    <!-- Reset Code -->
    <tr>
      <td style="padding: 28px 36px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: ${BRAND.textPrimary};">
          Reset code
        </p>
        <p style="margin: 0 0 8px; font-size: 36px; font-weight: 700; letter-spacing: 4px; color: ${BRAND.textPrimary}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          ${escapeHtml(code)}
        </p>
        <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">
          (This code is valid for 15 minutes)
        </p>
      </td>
    </tr>

    <!-- Divider -->
    <tr>
      <td style="padding: 0 36px;">
        <div style="border-top: 1px solid ${BRAND.border};"></div>
      </td>
    </tr>

    <!-- Security note -->
    <tr>
      <td style="padding: 20px 36px 28px;">
        <p style="margin: 0; font-size: 13px; color: ${BRAND.textSecondary}; line-height: 1.6;">
          SWEO will never email you and ask you to disclose or verify your password, credit card, or banking account number.
        </p>
      </td>
    </tr>
  `);

  const text = `Reset your password

Hi ${name}, we received a request to reset your password.

Your reset code: ${code}

Enter this code on the password reset page.
This code expires in 15 minutes.

If you didn't request this, you can safely ignore this email.`;

  return {
    subject: `${code} is your SWEO password reset code`,
    html,
    text
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
