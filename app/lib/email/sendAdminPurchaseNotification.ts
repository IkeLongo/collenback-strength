import nodemailer from "nodemailer";
import type { PurchaseLine } from "./sendPurchaseConfirmation";

export type SendAdminPurchaseNotificationOptions = {
  to: string; // admin inbox
  paymentId: number;
  totalCents: number;
  currency: string;

  client: {
    userId: number;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };

  lines: PurchaseLine[];

  brandName?: string;
};

function formatMoney(cents: number, currency: string) {
  const amt = (cents / 100).toFixed(2);
  return `${currency.toUpperCase()} $${amt}`;
}

function categoryLabel(cat?: string | null) {
  const map: Record<string, string> = {
    in_person: "In-Person Coaching",
    online: "Online Coaching",
    program: "Programs",
    nutrition: "Nutrition Coaching",
  };
  if (!cat) return "Service";
  return map[cat] ?? cat.replace(/_/g, " ");
}

function kindLabel(kind: PurchaseLine["kind"]) {
  if (kind === "pack") return "Pack";
  if (kind === "membership") return "Membership";
  return "Program";
}

export async function sendAdminPurchaseNotificationEmail(
  opts: SendAdminPurchaseNotificationOptions
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const brand = opts.brandName || "Collenback Strength";
  const buyerLabel =
    opts.client.name || opts.client.email || `User ${opts.client.userId}`;

  const subject = `New order — ${buyerLabel}`;

  // Email-safe absolute fallback image
  const FALLBACK_LINE_IMAGE =
    process.env.SITE_NAME_VAR
      ? `${process.env.SITE_NAME_VAR}/logo-stamp.png`
      : "https://collenbackstrength.com/logo-stamp.png";

  const rowsHtml = opts.lines
    .map((l) => {
      const img = l.imageUrl || FALLBACK_LINE_IMAGE;

      return `
        <tr>
          <td style="padding:14px 0; border-bottom:1px solid rgba(0,0,0,0.06);">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
              <tr>
                <!-- Left: image + name -->
                <td style="vertical-align:top;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="vertical-align:top; padding-right:12px;">
                        <img
                          src="${img}"
                          width="56"
                          height="56"
                          alt=""
                          style="display:block; width:56px; height:56px; border-radius:12px; object-fit:cover; border:1px solid rgba(0,0,0,0.12);"
                        />
                      </td>
                      <td style="vertical-align:top;">
                        <div style="color:#111827; font-size:14px; font-weight:700; line-height:1.3;">
                          ${l.title}
                        </div>
                        <div style="margin-top:4px; color:#6B7280; font-size:12px; line-height:1.4;">
                          ${kindLabel(l.kind)} • ${categoryLabel(l.category)}
                          ${l.quantity > 1 ? ` • Qty ${l.quantity}` : ""}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>

                <!-- Right: totals -->
                <td style="vertical-align:top; text-align:right; white-space:nowrap;">
                  <div style="color:#111827; font-size:14px; font-weight:700;">
                    ${formatMoney(l.amountCents, opts.currency)}
                  </div>
                  <div style="margin-top:4px; color:#6B7280; font-size:12px;">
                    ${formatMoney(l.unitAmountCents, opts.currency)} each
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>

  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#ffffff;">
    <!-- Full-width wrapper (no colored background) -->
    <div style="width:100%; background:#ffffff;">
      <!-- Content container -->
      <div style="max-width:680px; margin:0 auto; padding:24px 18px;">
        
        <!-- Header: logo left + title -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="vertical-align:middle;">
              <img
                src="https://collenbackstrength.com/logo-stamp.png"
                alt="${brand}"
                width="44"
                height="44"
                style="display:block; width:44px; height:44px; background:#18181b; border-radius:8px;"
              />
            </td>
            <td style="vertical-align:middle; padding-left:12px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="color:#111827; font-size:26px; font-weight:800; line-height:1.1;">
                  New Order
                </span>
                <!-- Inline SVG bag icon -->
                <span style="display:inline-block; vertical-align:middle;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                    <path d="M7 7V6a5 5 0 0 1 10 0v1" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
                    <path d="M6 7h12l1 14H5L6 7Z" stroke="#111827" stroke-width="2" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
              <div style="margin-top:6px; color:#6B7280; font-size:13px; line-height:1.4;">
                Payment ID <b style="color:#111827;">${opts.paymentId}</b> • Total <b style="color:#111827;">${formatMoney(
                  opts.totalCents,
                  opts.currency
                )}</b>
              </div>
            </td>
          </tr>
        </table>

        <!-- Buyer block -->
        <div style="margin-top:18px; border:1px solid rgba(0,0,0,0.10); border-radius:14px; padding:14px 14px;">
          <div style="color:#111827; font-size:13px; font-weight:800; margin-bottom:8px;">
            Buyer details
          </div>
          <div style="color:#374151; font-size:13px; line-height:1.6;">
            <div><b>Name:</b> ${opts.client.name ?? "-"}</div>
            <div><b>Email:</b> ${opts.client.email ?? "-"}</div>
            <div><b>Phone:</b> ${opts.client.phone ?? "-"}</div>
          </div>
        </div>

        <!-- Items -->
        <div style="margin-top:18px;">
          <div style="color:#111827; font-size:16px; font-weight:800; margin:0 0 10px 0;">
            Items
          </div>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <!-- Grand total row -->
          <div style="margin-top:12px; text-align:right;">
            <div style="color:#6B7280; font-size:12px;">Grand Total</div>
            <div style="color:#111827; font-size:18px; font-weight:900;">
              ${formatMoney(opts.totalCents, opts.currency)}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top:22px; padding-top:14px; border-top:1px solid rgba(0,0,0,0.08); text-align:center;">
          <div style="color:#6B7280; font-size:12px;">
            ${brand} • Purchase notification
          </div>
        </div>
      </div>
    </div>
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
