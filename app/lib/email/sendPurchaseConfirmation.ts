import nodemailer from "nodemailer";

export type PurchaseLine = {
  title: string;
  category?: string | null;
  kind: "pack" | "membership" | "program";
  quantity: number;
  unitAmountCents: number;
  amountCents: number;

  // OPTIONAL: if you ever add this metadata, we can show actual thumbnails
  imageUrl?: string | null;

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

  dashboardUrl: string;
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

function buildMotivationCopy({
  hasPack,
  hasMembership,
  hasProgram,
  name,
}: {
  hasPack: boolean;
  hasMembership: boolean;
  hasProgram: boolean;
  name: string;
}) {
  // priority: membership > pack > program > mixed
  if ((hasMembership || hasPack) && hasProgram) {
    return `You’re officially locked in — training + structure in your pocket. Your next step is simple: pick your first session (or download your program) and let’s build momentum.`;
  }
  if (hasMembership) {
    return `Welcome in — you’re set up for real progress. Book your first session this week and let’s get a win on the board early. Consistency starts now.`;
  }
  if (hasPack) {
    return `You just took the hardest step — committing. Your sessions are ready, and your strength & athletic goals are officially in motion. Book your first session and let’s get to work.`;
  }
  if (hasProgram) {
    return `Your program is ready. Download it from your dashboard and start today — small, consistent reps turn into big results.`;
  }
  return `Your order is confirmed.`;
}

function buildNextStepsHtml({
  hasPack,
  hasMembership,
  hasProgram,
  dashboardUrl,
}: {
  hasPack: boolean;
  hasMembership: boolean;
  hasProgram: boolean;
  dashboardUrl: string;
}) {
  const steps: string[] = [];

  if (hasMembership || hasPack) {
    steps.push(`Book your first session from your dashboard.`);
  }
  if (hasProgram) {
    steps.push(`Download your program anytime from the Programs tab.`);
  }
  if (hasMembership) {
    steps.push(`Your membership access is active immediately.`);
  }

  const bulletsHtml = steps
    .map(
      (s) => `
      <tr>
        <td style="padding:4px 0; color:#1A1A1A; font-size:14px; line-height:1.5;">${s}</td>
      </tr>
    `
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:16px; border:1px solid #EBEAEA; border-radius:12px;">
          <div style="font-size:14px; color:#1A1A1A; font-weight:700; margin:0 0 8px;">
            Next steps
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${bulletsHtml}
          </table>

          <div style="margin-top:14px;">
            <!-- BULLETPROOF BUTTON -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
              <tr>
                <td
                  bgcolor="#CB9F24"
                  style="
                    background:#CB9F24;
                    border-radius:10px;
                    text-align:center;
                    mso-padding-alt:12px 16px;
                  "
                >
                  <a href="${dashboardUrl}"
                    style="
                      display:inline-block;
                      padding:12px 16px;
                      font-weight:800;
                      font-size:13px;
                      line-height:13px;
                      text-decoration:none;
                      color:#ffffff;
                      background:#CB9F24;
                      border:1px solid #CB9F24;
                      border-radius:10px;
                      -webkit-text-size-adjust:none;
                      mso-hide:all;
                    "
                  >
                    Go to Dashboard
                  </a>
                </td>
              </tr>
            </table>
            <!-- /BULLETPROOF BUTTON -->
          </div>
        </td>
      </tr>
    </table>
  `;
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

  const subject = `Order confirmation — ${brand}`;

  const purchasedKinds = new Set(opts.lines.map((l) => l.kind));
  const hasPack = purchasedKinds.has("pack");
  const hasProgram = purchasedKinds.has("program");
  const hasMembership = purchasedKinds.has("membership");

  const motivation = buildMotivationCopy({
    hasPack,
    hasMembership,
    hasProgram,
    name,
  });

  const nextStepsBlock = buildNextStepsHtml({
    hasPack,
    hasMembership,
    hasProgram,
    dashboardUrl: opts.dashboardUrl,
  });

  // Line items: Photo + name left, totals right
  // NOTE: Since you don't currently pass an image URL, we render a nice placeholder thumbnail box.
  const lineItemsHtml = opts.lines
    .map((l) => {
      const details: string[] = [];

      if (l.kind === "pack" && l.meta?.sessionsPurchased) {
        details.push(`${l.meta.sessionsPurchased} session(s)`);
      }
      if (l.kind === "membership" && l.meta?.membershipInterval) {
        const c = l.meta.membershipIntervalCount ?? 1;
        details.push(`Renews every ${c} ${l.meta.membershipInterval}${c > 1 ? "s" : ""}`);
      }
      if (l.kind === "program" && l.meta?.programVersion) {
        details.push(`Version ${l.meta.programVersion}`);
      }

      const detailsText =
        details.length ? ` • ${details.join(" • ")}` : "";

      return `
        <tr>
          <td style="padding:14px 0; border-bottom:1px solid #EBEAEA;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <!-- photo -->
                <td style="width:56px; vertical-align:top; padding-right:12px;">
                  ${l.imageUrl
                    ? `<img src="${l.imageUrl}" width="56" height="56" alt=""
                        style="display:block;width:56px;height:56px;border-radius:12px;object-fit:cover;border:1px solid #BEBDBD; background:#18181b;" />`
                    : `<div style="width:56px;height:56px;border-radius:12px;background:#18181b;border:1px solid #BEBDBD;"></div>`
                  }
                </td>

                <!-- name/details -->
                <td style="vertical-align:top;">
                  <div style="font-size:14px; font-weight:700; color:#1A1A1A; margin:0;">
                    ${l.title}
                  </div>
                  <div style="font-size:12px; color:#676666; margin-top:4px;">
                    ${kindLabel(l.kind)} • ${categoryLabel(l.category)}${detailsText}
                  </div>
                  <div style="font-size:12px; color:#676666; margin-top:2px;">
                    Qty: ${l.quantity}
                  </div>
                </td>

                <!-- price -->
                <td style="width:140px; vertical-align:top; text-align:right;">
                  <div style="font-size:12px; color:#676666; margin:0;">Total</div>
                  <div style="font-size:14px; font-weight:700; color:#1A1A1A; margin-top:4px;">
                    ${formatMoney(l.amountCents, opts.currency)}
                  </div>
                  <div style="font-size:12px; color:#676666; margin-top:4px;">
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
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
  </head>

  <body style="margin:0; padding:0; background:#ffffff; font-family: Arial, sans-serif;">
    <!-- full-width wrapper -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#ffffff;">
      <tr>
        <td style="padding:24px 14px;">
          <!-- container -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; max-width:720px; margin:0 auto;">
            
            <!-- header row -->
            <tr>
              <td style="padding:0 0 18px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <!-- logo upper-left -->
                    <td style="vertical-align:middle;">
                      <img
                        src="https://collenbackstrength.com/logo-horizontal.png"
                        alt="${brand}"
                        width="160"
                        style="display:block; max-width:160px; height:auto; border:0;"
                      />
                    </td>
                    <td style="text-align:right; vertical-align:middle; font-size:12px; color:#676666;">
                      Receipt ID: ${opts.paymentId}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- title -->
            <tr>
              <td style="padding:0 0 12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="font-size:28px; font-weight:800; color:#0c2244; line-height:1.2; font-family: 'Anton', Arial, sans-serif;">
                      Order Confirmation
                    </td>
                    <td style="width:10px;"></td>
                    <!-- shopping bag icon (inline SVG) -->
                    <td style="vertical-align:middle;">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" style="display:block;">
                        <path d="M7 9V7a5 5 0 0 1 10 0v2" stroke="#0c2244" stroke-width="2" stroke-linecap="round"/>
                        <path d="M6 9h12l-1 12H7L6 9Z" stroke="#0c2244" stroke-width="2" stroke-linejoin="round"/>
                      </svg>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- greeting -->
            <tr>
              <td style="padding:0 0 18px 0; font-size:14px; color:#1A1A1A; line-height:1.6;">
                <div style="margin:0 0 8px 0;">
                  Hi <span style="font-weight:700; color:#0c2244;">${name}</span>,
                </div>
                <div style="margin:0;">
                  Thank you for shopping with us! ${motivation}
                </div>
              </td>
            </tr>

            <!-- line items -->
            <tr>
              <td style="padding:0 0 10px 0;">
                <div style="font-size:14px; font-weight:800; color:#1A1A1A; margin:0 0 8px 0;">
                  Your items
                </div>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  ${lineItemsHtml}
                </table>
              </td>
            </tr>

            <!-- totals -->
            <tr>
              <td style="padding:14px 0 22px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td></td>
                    <td style="width:220px; text-align:right;">
                      <div style="font-size:12px; color:#676666;">Grand Total</div>
                      <div style="font-size:18px; font-weight:900; color:#1A1A1A; margin-top:6px;">
                        ${formatMoney(opts.totalCents, opts.currency)}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- next steps -->
            <tr>
              <td style="padding:0 0 22px 0;">
                ${nextStepsBlock}
              </td>
            </tr>

            <!-- footer (kept simple, can match your existing one) -->
            <tr>
              <td style="padding:16px 0 0 0; border-top:1px solid #EBEAEA; text-align:center;">
                <div style="font-size:12px; color:#676666; line-height:1.6;">
                  This email was sent from ${brand}.
                </div>
                <div style="font-size:12px; color:#676666; line-height:1.6;">
                  Questions?
                  <a href="tel:${process.env.BUSINESS_PHONE}" style="color:#0c2244; text-decoration:none; font-weight:700;">
                    ${process.env.BUSINESS_PHONE}
                  </a>
                </div>
              </td>
            </tr>

          </table>
          <!-- /container -->
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
