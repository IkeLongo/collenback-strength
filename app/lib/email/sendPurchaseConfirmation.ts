import nodemailer from "nodemailer";

export type PurchaseLine = {
  title: string;
  category?: string | null;
  kind: "pack" | "membership" | "program";
  quantity: number;
  unitAmountCents: number;
  amountCents: number;
  meta?: {
    sessionsPurchased?: number | null;
    membershipInterval?: string | null;
    membershipIntervalCount?: number | null;
    programVersion?: string | null;
  };
};

export type SendPurchaseConfirmationOptions = {
  to: string;
  firstName?: string | null;
  lastName?: string | null;

  paymentId: number;
  totalCents: number;
  currency: string;

  lines: PurchaseLine[];

  dashboardUrl: string; // e.g. https://collenbackstrength.com/client/dashboard
  brandName?: string;   // optional override
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

export async function sendPurchaseConfirmationEmail(opts: SendPurchaseConfirmationOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const brand = opts.brandName || "Collenback Strength";
  const name =
    [opts.firstName, opts.lastName].filter(Boolean).join(" ") || "Valued Client";

  const subject = `Purchase confirmed — ${brand}`;

  const rowsHtml = opts.lines
    .map((l) => {
      const details: string[] = [];

      if (l.kind === "pack" && l.meta?.sessionsPurchased) {
        details.push(`${l.meta.sessionsPurchased} session(s) added`);
      }
      if (l.kind === "membership" && l.meta?.membershipInterval) {
        const c = l.meta.membershipIntervalCount ?? 1;
        details.push(`Renews every ${c} ${l.meta.membershipInterval}${c > 1 ? "s" : ""}`);
      }
      if (l.kind === "program" && l.meta?.programVersion) {
        details.push(`Version ${l.meta.programVersion}`);
      }

      return `
        <tr>
          <td style="padding:10px 0; color:#fff; font-weight:700;">${l.title}</td>
          <td style="padding:10px 0; color:#BEBDBD;">${kindLabel(l.kind)} • ${categoryLabel(l.category)}${
            details.length ? ` • ${details.join(" • ")}` : ""
          }</td>
          <td style="padding:10px 0; color:#BEBDBD; text-align:right;">${l.quantity}</td>
          <td style="padding:10px 0; color:#BEBDBD; text-align:right;">${formatMoney(l.amountCents, opts.currency)}</td>
        </tr>
      `;
    })
    .join("");

  const purchasedKinds = new Set(opts.lines.map((l) => l.kind));

  const hasPack = purchasedKinds.has("pack");
  const hasProgram = purchasedKinds.has("program");
  const hasMembership = purchasedKinds.has("membership");

  const nextStepsHtml = `
  <div style="color:#292929ff; font-size:14px; line-height:1.6;">
    <b>Next steps:</b><br/>
    ${hasPack ? "Packs: Book sessions from your dashboard.<br/>" : ""}
    ${hasProgram ? "Programs: Download anytime from the Programs tab.<br/>" : ""}
    ${hasMembership ? "Memberships: Your access is active immediately. Book sessions from your dashboard.<br/>" : ""}
  </div>
`;

  const html = `
  <!DOCTYPE html>
  <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0; padding:20px; font-family: Arial, sans-serif;">
      <div style="max-width:650px; margin:0 auto; background-color:#292929ff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08);">

        <div style="padding: 32px 24px 22px; text-align:center;">
          <img src="https://collenbackstrength.com/logo-horizontal.png" alt="${brand}" width="140"
            style="display:block; margin:0 auto 10px; max-width:140px; height:auto; border:0;" />
          <p style="margin: 8px 0 0; color:#BEBDBD; font-size:20px;">Purchase Confirmation</p>
        </div>

        <div style="padding: 28px 24px;">
          <p style="margin:0 0 14px; color:#fff; font-size:16px;">
            Hi <span style="color:#CB9F24; font-weight:700;">${name}</span> — your payment was successful.
          </p>

          <div style="margin-top:18px;">
            <h2 style="color:#CB9F24; margin:0 0 12px 0; font-size:18px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
              Order Summary
            </h2>

            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left; padding:8px 0; color:#fff; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">Item</th>
                  <th style="text-align:left; padding:8px 0; color:#fff; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">Details</th>
                  <th style="text-align:right; padding:8px 0; color:#fff; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">Qty</th>
                  <th style="text-align:right; padding:8px 0; color:#fff; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <tr>
                  <td colspan="4" style="border-top:1px solid rgba(255,255,255,0.12); padding-top:12px;"></td>
                </tr>
                <tr>
                  <td colspan="3" style="padding:10px 0; color:#fff; font-weight:700; text-align:right;">Grand Total</td>
                  <td style="padding:10px 0; color:#fff; font-weight:700; text-align:right;">${formatMoney(
                    opts.totalCents,
                    opts.currency
                  )}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top:18px; background:#ffffff; border-radius:6px; padding:16px; border-left:4px solid #CB9F24;">
              ${nextStepsHtml}

              <div style="margin-top:14px;">
                <a href="${opts.dashboardUrl}"
                  style="display:inline-block; background:#292929ff; color:#fff; text-decoration:none; font-weight:700; font-size:13px; padding:10px 14px; border-radius:8px;">
                  Go to Dashboard
                </a>
              </div>
            </div>

            <p style="margin:16px 0 0; color:#BEBDBD; font-size:12px;">
              Receipt ID: ${opts.paymentId}
            </p>
          </div>
        </div>

        <div style="background-color:#292929ff; padding:18px; text-align:center; border-top:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0; color:#CB9F24; font-size:14px;">This email was sent from ${brand}.</p>
          <p style="margin:5px 0 0; color:#BEBDBD; font-size:14px;">
            Questions? <a href="tel:${process.env.BUSINESS_PHONE}" style="color:#CB9F24; text-decoration:none; font-weight:600;">${process.env.BUSINESS_PHONE}</a>
          </p>
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
