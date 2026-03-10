import nodemailer from "nodemailer";
import type { MembershipStatusKind } from "./sendMembershipStatusEmail";

export type SendAdminMembershipStatusEmailOptions = {
  to: string;

  kind: MembershipStatusKind;

  brandName?: string;

  stripeSubscriptionId: string;
  stripeCustomerId?: string | null;

  user: {
    id: number;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };

  service?: {
    sanityServiceId?: string | null;
    sanityServiceSlug?: string | null;
    title?: string | null;
  };

  status?: string | null;
  currentPeriodEnd?: Date | null;
};

function titleFor(kind: MembershipStatusKind) {
  switch (kind) {
    case "cancel_scheduled":
      return "Cancel Scheduled";
    case "cancel_removed":
      return "Cancel Removed (Renewed)";
    case "canceled":
      return "Canceled";
    case "renewed":
      return "Renewed / Active";
    case "payment_failed":
      return "Payment Failed";
    case "payment_recovered":
      return "Payment Recovered";
  }
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function periodEndLabel(kind: MembershipStatusKind): string | null {
  switch (kind) {
    case "cancel_scheduled":
      return "Access ends on:";
    case "canceled":
      return "Canceled on:";
    case "renewed":
    case "cancel_removed":
    case "payment_recovered":
      return "Next billing date:";
    case "payment_failed":
      // usually still useful to show when access might end
      return "Current period ends:";
    default:
      return null;
  }
}

export async function sendAdminMembershipStatusEmail(
  opts: SendAdminMembershipStatusEmailOptions
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const brand = opts.brandName || "Collenback Strength";
  const subject = `Membership ${titleFor(opts.kind)} — ${opts.user.email || `User ${opts.user.id}`}`;

  const label = periodEndLabel(opts.kind);

  const periodEndText =
    opts.currentPeriodEnd ? formatShortDate(opts.currentPeriodEnd) : null;

  // Only show the row if we actually have BOTH a label and a date.
  const periodRowHtml =
    label && periodEndText
      ? `
        <div style="margin-top:6px;">
          <b>${label}</b> ${periodEndText}
        </div>
      `
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
  <body style="margin:0; padding:0; background:#ffffff; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:24px 14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; max-width:720px; margin:0 auto;">
            <tr>
              <td style="padding:0 0 14px 0;">
                <img src="https://collenbackstrength.com/logo-horizontal.png" alt="${brand}" width="160"
                  style="display:block; max-width:160px; height:auto; border:0;" />
              </td>
            </tr>

            <tr>
              <td style="font-size:22px; font-weight:900; color:#0c2244;">
                Membership ${titleFor(opts.kind)}
              </td>
            </tr>

            <tr>
              <td style="padding:12px 0 0 0; font-size:13px; color:#1A1A1A; line-height:1.6;">
                <div><b>User:</b> ${opts.user.name ?? "-"}</div>
                <div><b>Email:</b> ${opts.user.email ?? "-"}</div>
                <div><b>Phone:</b> ${opts.user.phone ?? "-"}</div>
                <div style="margin-top:8px;"><b>Service:</b> ${opts.service?.title ?? "-"}</div>
                <div><b>Status:</b> ${opts.status ?? "-"}</div>
                ${periodRowHtml}
              </td>
            </tr>

            <tr>
              <td style="padding:16px 0 0 0; border-top:1px solid #EBEAEA; text-align:center;">
                <div style="font-size:12px; color:#676666;">${brand} • Membership notification</div>
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
