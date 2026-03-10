import nodemailer from "nodemailer";

type SendResetEmailOptions = {
  to: string;
  resetUrl: string;

  // optional personalization
  firstName?: string | null;
  brandName?: string; // e.g. "Collenback Strength"
  supportEmail?: string; // e.g. "support@collenbackstrength.com"
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Brand-styled HTML email (card layout + gold CTA)
 * Matches the type of layout typically used in transactional templates.
 */
function renderResetEmailHtml(params: {
  brandName: string;
  greetingName?: string;
  resetUrl: string;
  supportEmail?: string;
}) {
  const brandName = escapeHtml(params.brandName);
  const greetingName = params.greetingName ? escapeHtml(params.greetingName) : null;
  const supportEmail = params.supportEmail ? escapeHtml(params.supportEmail) : null;

  // Brand palette (based on your project theme tokens: greys + gold)
  const colors = {
    bg: "#f6f7f8",
    card: "#ffffff",
    text: "#1A1A1A", // grey-700-ish
    muted: "#676666", // grey-500-ish
    border: "#EBEAEA", // grey-100-ish
    gold: "#CB9F24", // your gold
    goldHover: "#B88E1F",
    link: "#3D3D3D",
  };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0;padding:0;background:${colors.bg};font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="width:100%;padding:28px 12px;box-sizing:border-box;">
      <div style="max-width:560px;margin:0 auto;">
        
        <!-- Brand header -->
        <div style="padding:6px 6px 14px 6px;">
          <div style="font-weight:800;letter-spacing:0.2px;color:${colors.text};font-size:18px;">
            ${brandName}
          </div>
          <div style="color:${colors.muted};font-size:13px;margin-top:4px;">
            Account Security
          </div>
        </div>

        <!-- Card -->
        <div style="background:${colors.card};border:1px solid ${colors.border};border-radius:16px;padding:22px;box-shadow:0 1px 0 rgba(0,0,0,0.03);">
          <div style="font-size:18px;font-weight:700;color:${colors.text};margin-bottom:10px;">
            Reset your password
          </div>

          <div style="font-size:14px;line-height:1.55;color:${colors.text};">
            ${greetingName ? `Hi ${greetingName},` : `Hi,`}<br/>
            We received a request to reset your password. Click the button below to choose a new one.
          </div>

          <!-- CTA -->
          <div style="margin-top:16px;">
            <a href="${params.resetUrl}"
              style="display:inline-block;background:${colors.gold};color:white;text-decoration:none;font-weight:700;
              padding:12px 16px;border-radius:12px;font-size:14px;">
              Reset password →
            </a>
          </div>

          <!-- Fallback link -->
          <div style="margin-top:16px;font-size:12.5px;line-height:1.5;color:${colors.muted};">
            If the button doesn’t work, copy and paste this link into your browser:
            <div style="margin-top:8px;word-break:break-all;">
              <a href="${params.resetUrl}" style="color:${colors.link};text-decoration:underline;">
                ${params.resetUrl}
              </a>
            </div>
          </div>

          <div style="margin-top:16px;border-top:1px solid ${colors.border};padding-top:14px;">
            <div style="font-size:12.5px;line-height:1.55;color:${colors.muted};">
              If you didn’t request a password reset, you can ignore this email. Your password will not change.
            </div>

            ${
              supportEmail
                ? `<div style="margin-top:10px;font-size:12.5px;color:${colors.muted};">
                    Need help? Contact <a href="mailto:${supportEmail}" style="color:${colors.link};text-decoration:underline;">${supportEmail}</a>.
                  </div>`
                : ""
            }
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:14px 6px 0 6px;font-size:11.5px;color:${colors.muted};line-height:1.5;">
          This is an automated message from ${brandName}.
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function renderResetEmailText(params: {
  brandName: string;
  greetingName?: string;
  resetUrl: string;
  supportEmail?: string;
}) {
  const greeting = params.greetingName ? `Hi ${params.greetingName},` : "Hi,";
  const support = params.supportEmail ? `\nNeed help? ${params.supportEmail}` : "";

  return `${params.brandName} — Password Reset

${greeting}
We received a request to reset your password.

Reset your password using this link:
${params.resetUrl}

If you didn’t request a password reset, ignore this email. Your password will not change.${support}
`;
}

/**
 * Sends a password reset email using the same nodemailer pattern you likely use elsewhere.
 * Environment variables (recommended):
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - EMAIL_FROM  (e.g., "Collenback Strength <no-reply@collenbackstrength.com>")
 */
export async function sendResetEmail(options: SendResetEmailOptions) {
  const {
    to,
    resetUrl,
    firstName,
    brandName = "Collenback Strength",
    supportEmail,
  } = options;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || `${brandName} <no-reply@collenbackstrength.com>`;

  if (!host || !user || !pass) {
    // Fail loudly in dev; in prod you want to ensure env is set
    throw new Error("Missing SMTP env vars (SMTP_HOST, SMTP_USER, SMTP_PASS).");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587/STARTTLS
    auth: { user, pass },
  });

  const greetingName = firstName?.trim() ? firstName.trim() : undefined;

  const subject = `${brandName}: Reset your password`;

  const html = renderResetEmailHtml({
    brandName,
    greetingName,
    resetUrl,
    supportEmail,
  });

  const text = renderResetEmailText({
    brandName,
    greetingName,
    resetUrl,
    supportEmail,
  });

  await transporter.sendMail({
    to,
    from,
    subject,
    html,
    text,
  });
}
