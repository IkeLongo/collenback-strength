import nodemailer from "nodemailer";

export type MembershipStatusKind =
  | "cancel_scheduled"
  | "cancel_removed"
  | "canceled"
  | "renewed"
  | "payment_failed"
  | "payment_recovered";

export type SendMembershipStatusEmailOptions = {
  to: string;
  firstName?: string | null;
  lastName?: string | null;

  brandName?: string;

  kind: MembershipStatusKind;

  serviceTitle?: string | null;
  serviceCategory?: string | null;

  periodEnd?: Date | null;      // when access ends (if cancel scheduled)
  dashboardUrl: string;
  manageUrl?: string | null;    // optional Stripe portal URL if you add later
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function titleFor(kind: MembershipStatusKind) {
  switch (kind) {
    case "cancel_scheduled":
      return "Membership cancellation scheduled";
    case "cancel_removed":
      return "Membership renewed";
    case "canceled":
      return "Membership canceled";
    case "renewed":
      return "Membership active";
    case "payment_failed":
      return "Payment issue with membership";
    case "payment_recovered":
      return "Payment received — membership restored";
  }
}

function messageFor(kind: MembershipStatusKind, periodEnd?: Date | null) {
  switch (kind) {
    case "cancel_scheduled":
      return periodEnd
        ? `Your membership will remain active until ${formatDate(periodEnd)}. You can still book sessions through your dashboard until then.`
        : `Your membership is set to cancel at the end of the current billing period.`;
    case "cancel_removed":
      return `You’re back on track — your membership will continue renewing as normal. Book a session and keep the momentum going.`;
    case "canceled":
      return `Your membership has been canceled. If this was a mistake, you can re-activate from your dashboard.`;
    case "renewed":
      return `Your membership is active. Book your next session and keep stacking wins.`;
    case "payment_failed":
      return `We couldn’t process your most recent membership payment. Your access may be limited if it isn’t resolved. Please check your payment method.`;
    case "payment_recovered":
      return `Your payment went through — your membership access is active again.`;
  }
}

export async function sendMembershipStatusEmail(opts: SendMembershipStatusEmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const brand = opts.brandName || "Collenback Strength";
  const name =
    [opts.firstName, opts.lastName].filter(Boolean).join(" ") || "Valued Client";

  const subject = `${titleFor(opts.kind)} — ${brand}`;

  const serviceLine = opts.serviceTitle
    ? `<div style="margin-top:6px; color:#676666; font-size:13px;">
         <b style="color:#1A1A1A;">Membership:</b> ${opts.serviceTitle}
       </div>`
    : "";

  const manageLink = opts.manageUrl
    ? `<div style="margin-top:10px; font-size:13px;">
         <a href="${opts.manageUrl}" style="color:#0c2244; font-weight:700; text-decoration:none;">
           Manage membership
         </a>
       </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
  </head>

  <body style="margin:0; padding:0; background:#ffffff; font-family: Arial, sans-serif; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#ffffff;">
      <tr>
        <td style="padding:24px 14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; max-width:720px; margin:0 auto;">
            <tr>
              <td style="padding:0 0 14px 0;">
                <img
                  src="https://collenbackstrength.com/logo-horizontal.png"
                  alt="${brand}"
                  width="160"
                  style="display:block; max-width:160px; height:auto; border:0;"
                />
              </td>
            </tr>

            <tr>
              <td style="font-size:26px; font-weight:900; color:#0c2244; line-height:1.2;">
                ${titleFor(opts.kind)}
              </td>
            </tr>

            <tr>
              <td style="padding:12px 0 18px 0; font-size:14px; color:#1A1A1A; line-height:1.6;">
                Hi <span style="font-weight:800; color:#0c2244;">${name}</span>,<br/>
                ${messageFor(opts.kind, opts.periodEnd)}
                ${serviceLine}
                ${manageLink}
              </td>
            </tr>

            <tr>
              <td style="padding:0 0 22px 0;">
                <!-- Bulletproof button -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
                  <tr>
                    <td bgcolor="#CB9F24" style="background:#CB9F24; border-radius:10px; text-align:center; mso-padding-alt:12px 16px;">
                      <a href="${opts.dashboardUrl}"
                        style="display:inline-block; padding:12px 16px; font-weight:800; font-size:13px; line-height:13px; text-decoration:none; color:#ffffff; background:#CB9F24; border:1px solid #CB9F24; border-radius:10px; -webkit-text-size-adjust:none;">
                        Go to Dashboard
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 0 0 0; border-top:1px solid #EBEAEA; text-align:center;">
                <div style="font-size:12px; color:#676666; line-height:1.6;">
                  This email was sent from ${brand}.
                </div>
                <div style="font-size:12px; color:#676666; line-height:1.6;">
                  Questions?
                  <a href="tel:${process.env.BUSINESS_PHONE}" style="color:#0c2244; text-decoration:none; font-weight:800;">
                    ${process.env.BUSINESS_PHONE}
                  </a>
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: opts.to,
    subject,
    html,
  });
}
