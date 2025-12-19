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

export async function sendAdminPurchaseNotificationEmail(opts: SendAdminPurchaseNotificationOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const brand = opts.brandName || "Collenback Strength";
  const subject = `New purchase — ${opts.client.name || opts.client.email || `User ${opts.client.userId}`}`;

  const rowsHtml = opts.lines
    .map((l) => {
      return `
        <tr>
          <td style="padding:10px 0; color:#fff; font-weight:700;">${l.title}</td>
          <td style="padding:10px 0; color:#BEBDBD;">${categoryLabel(l.category)}</td>
          <td style="padding:10px 0; color:#BEBDBD; text-align:right;">${l.quantity}</td>
          <td style="padding:10px 0; color:#BEBDBD; text-align:right;">${formatMoney(l.amountCents, opts.currency)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
  <!DOCTYPE html>
  <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0; padding:20px; font-family: Arial, sans-serif;">
      <div style="max-width:650px; margin:0 auto; background-color:#292929ff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08);">

        <div style="padding: 28px 24px 18px;">
          <p style="margin:0; color:#CB9F24; font-size:18px; font-weight:700;">New Purchase</p>
          <p style="margin:6px 0 0; color:#BEBDBD; font-size:14px;">
            Payment ID: ${opts.paymentId} • Total: ${formatMoney(opts.totalCents, opts.currency)}
          </p>
        </div>

        <div style="padding: 0 24px 24px;">
          <div style="background:#ffffff; border-radius:6px; padding:14px; border-left:4px solid #CB9F24;">
            <div style="color:#292929ff; font-size:14px; line-height:1.6;">
              <b>Buyer</b><br/>
              User ID: ${opts.client.userId}<br/>
              Name: ${opts.client.name ?? "-"}<br/>
              Email: ${opts.client.email ?? "-"}<br/>
              Phone: ${opts.client.phone ?? "-"}<br/>
            </div>
          </div>

          <h3 style="margin:18px 0 10px; color:#CB9F24; font-size:16px; border-bottom:2px solid #FFE98F; padding-bottom:8px;">
            Items
          </h3>

          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left; padding:8px 0; color:#fff; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">Item</th>
                <th style="text-align:left; padding:8px 0; color:#fff; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">Category</th>
                <th style="text-align:right; padding:8px 0; color:#fff; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">Qty</th>
                <th style="text-align:right; padding:8px 0; color:#fff; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <div style="background-color:#292929ff; padding:16px; text-align:center; border-top:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0; color:#BEBDBD; font-size:13px;">${brand} • Purchase notification</p>
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
