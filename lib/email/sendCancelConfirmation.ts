import nodemailer from "nodemailer";

export type SendClientCancelConfirmationOptions = {
  to: string;
  clientName?: string;
  start: string; // UTC ISO
  end: string;   // UTC ISO
  serviceTitle?: string;
  coachName?: string;
  policy?: "release" | "consume"; // >=24h release / <24h consume
};

export type SendCoachCancelNotificationOptions = {
  to: string;
  coachName?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  start: string; // UTC ISO
  end: string;   // UTC ISO
  serviceTitle?: string;
  policy?: "release" | "consume";
};

const TZ = "America/Chicago";

function fmtDateParts(startIso: string, endIso: string) {
  const date = new Date(startIso).toLocaleDateString("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const startTime = new Date(startIso).toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endTime = new Date(endIso).toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return { date, startTime, endTime };
}

function policyLine(policy?: "release" | "consume") {
  if (!policy) return "";
  return policy === "release"
    ? "Cancellation policy: ✅ Credit released (24+ hours notice)."
    : "Cancellation policy: ⚠️ Credit consumed (less than 24 hours notice).";
}

function baseShell({
  title,
  subtitle,
  bodyHtml,
}: {
  title: string;
  subtitle: string;
  bodyHtml: string;
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><title>${title}</title></head>
  <body style="margin:0; padding:20px; font-family: Arial, sans-serif; background-color: transparent;">
    <div style="max-width:600px; margin:0 auto; background-color: #292929ff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
      <div style="padding: 32px 24px 24px; text-align: center;">
        <img
          src="https://collenbackstrength.com/logo-stamp.png"
          alt="Collenback Strength"
          width="140"
          height="auto"
          style="display:block; margin:0 auto 10px auto; max-width:140px; height:auto; border:0; outline:none; text-decoration:none;"
        />
        <p style="margin: 8px 0 0; color: #BEBDBD; opacity:0.92; font-size: 20px;">
          ${subtitle}
        </p>
      </div>

      <div style="padding:32px 24px;">
        ${bodyHtml}
      </div>

      <div style="background-color:#292929ff; padding:18px; text-align:center; border-top:1px solid #eee;">
        <p style="margin:0; color:#CB9F24; font-size:14px;">
          This is an automated notification from Collenback Strength.
        </p>
        <p style="margin:5px 0 0 0; color:#BEBDBD; font-size:14px;">
          Sent: ${new Date().toLocaleString("en-US", { timeZone: TZ })}
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

function coachCancelTemplate(opts: SendCoachCancelNotificationOptions) {
  const { date, startTime, endTime } = fmtDateParts(opts.start, opts.end);

  const bodyHtml = `
    <div style="margin-bottom:28px;">
      <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
        Cancelled Session Details
      </h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; width:110px; font-size:16px;">Client:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.clientName || "—"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Email:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.clientEmail || "—"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Phone:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.clientPhone || "—"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Service:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.serviceTitle || "Personal Training"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Date:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${date}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Start:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${startTime}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">End:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${endTime}</td></tr>
      </table>
    </div>

    <div style="margin-bottom:28px;">
      <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
        Notification
      </h2>
      <div style="background-color:#ffffffff; padding:18px; border-radius:6px; border-left:4px solid #CB9F24; line-height:1.7; color:#292929ff; font-size:16px;">
        Hi ${opts.coachName || "Coach"},<br><br>
        A client cancelled their session${opts.serviceTitle ? ` for <b>${opts.serviceTitle}</b>` : ""}.<br>
        ${policyLine(opts.policy)}
      </div>
    </div>
  `;

  return baseShell({
    title: "Session Cancelled",
    subtitle: "Session Cancelled",
    bodyHtml,
  });
}

function clientCancelTemplate(opts: SendClientCancelConfirmationOptions) {
  const { date, startTime, endTime } = fmtDateParts(opts.start, opts.end);

  const bodyHtml = `
    <div style="margin-bottom:28px;">
      <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
        Cancellation Confirmed
      </h2>
      <div style="background-color:#ffffffff; padding:18px; border-radius:6px; border-left:4px solid #CB9F24; line-height:1.7; color:#292929ff; font-size:16px;">
        Hi ${opts.clientName || "there"},<br><br>
        Your session has been cancelled successfully.<br>
        ${policyLine(opts.policy)}
      </div>
    </div>

    <div style="margin-bottom:28px;">
      <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
        Cancelled Session Details
      </h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; width:110px; font-size:16px;">Service:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.serviceTitle || "Personal Training"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Coach:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.coachName || "—"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Date:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${date}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Time:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${startTime}–${endTime}</td></tr>
      </table>
    </div>
  `;

  return baseShell({
    title: "Cancellation Confirmed",
    subtitle: "Cancellation Confirmed",
    bodyHtml,
  });
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) throw new Error("SMTP env vars not configured");

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (Number(process.env.SMTP_PORT) || 465) === 465,
    auth: { user, pass },
  });
}

export async function sendCoachCancelNotificationEmail(opts: SendCoachCancelNotificationOptions) {
  if (!opts.to) throw new Error("Coach recipient email missing");
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER!,
    to: opts.to,
    subject: "Session cancelled",
    html: coachCancelTemplate(opts),
  });
}

export async function sendClientCancelConfirmationEmail(opts: SendClientCancelConfirmationOptions) {
  if (!opts.to) throw new Error("Client recipient email missing");
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER!,
    to: opts.to,
    subject: "Your session was cancelled",
    html: clientCancelTemplate(opts),
  });
}

// ==================== NO-SHOW EMAIL TYPES ====================

export type SendClientNoShowNotificationOptions = {
  to: string;
  clientName?: string;
  start: string; // UTC ISO
  end: string;   // UTC ISO
  serviceTitle?: string;
  coachName?: string;
};

export type SendCoachNoShowNotificationOptions = {
  to: string;
  coachName?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  start: string; // UTC ISO
  end: string;   // UTC ISO
  serviceTitle?: string;
};

// ==================== NO-SHOW EMAIL TEMPLATES ====================

function coachNoShowTemplate(opts: SendCoachNoShowNotificationOptions) {
  const { date, startTime, endTime } = fmtDateParts(opts.start, opts.end);

  const bodyHtml = `
    <div style="margin-bottom:28px;">
      <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
        No-Show Session Details
      </h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; width:110px; font-size:16px;">Client:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.clientName || "—"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Email:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.clientEmail || "—"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Phone:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.clientPhone || "—"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Service:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.serviceTitle || "Personal Training"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Date:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${date}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Start:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${startTime}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">End:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${endTime}</td></tr>
      </table>
    </div>

    <div style="margin-bottom:28px;">
      <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
        Notification
      </h2>
      <div style="background-color:#ffffffff; padding:18px; border-radius:6px; border-left:4px solid #DC2626; line-height:1.7; color:#292929ff; font-size:16px;">
        Hi ${opts.coachName || "Coach"},<br><br>
        A client did not show up for their scheduled session${opts.serviceTitle ? ` for <b>${opts.serviceTitle}</b>` : ""}.<br>
        ⚠️ <b>No-show policy:</b> Credit has been consumed.
      </div>
    </div>
  `;

  return baseShell({
    title: "Client No-Show",
    subtitle: "Client No-Show",
    bodyHtml,
  });
}

function clientNoShowTemplate(opts: SendClientNoShowNotificationOptions) {
  const { date, startTime, endTime } = fmtDateParts(opts.start, opts.end);

  const bodyHtml = `
    <div style="margin-bottom:28px;">
      <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
        Missed Session Notification
      </h2>
      <div style="background-color:#ffffffff; padding:18px; border-radius:6px; border-left:4px solid #DC2626; line-height:1.7; color:#292929ff; font-size:16px;">
        Hi ${opts.clientName || "there"},<br><br>
        We noticed you did not attend your scheduled session. We hope everything is okay!<br><br>
        ⚠️ <b>No-show policy:</b> Your session credit has been consumed.
      </div>
    </div>

    <div style="margin-bottom:28px;">
      <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
        Missed Session Details
      </h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; width:110px; font-size:16px;">Service:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.serviceTitle || "Personal Training"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Coach:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${opts.coachName || "—"}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Date:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${date}</td></tr>
        <tr><td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Time:</td>
            <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${startTime}–${endTime}</td></tr>
      </table>
    </div>

    <div style="margin-bottom:28px;">
      <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
        Next Steps
      </h2>
      <div style="background-color:#ffffffff; padding:18px; border-radius:6px; border-left:4px solid #CB9F24; line-height:1.7; color:#292929ff; font-size:16px;">
        If you need to reschedule or have questions about your account, please reach out to us.<br><br>
        Remember to cancel at least 24 hours in advance to avoid credit consumption.
      </div>
    </div>
  `;

  return baseShell({
    title: "Missed Session Notification",
    subtitle: "Missed Session",
    bodyHtml,
  });
}

// ==================== NO-SHOW EMAIL SENDERS ====================

export async function sendCoachNoShowNotificationEmail(opts: SendCoachNoShowNotificationOptions) {
  if (!opts.to) throw new Error("Coach recipient email missing");
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER!,
    to: opts.to,
    subject: "Client no-show notification",
    html: coachNoShowTemplate(opts),
  });
}

export async function sendClientNoShowNotificationEmail(opts: SendClientNoShowNotificationOptions) {
  if (!opts.to) throw new Error("Client recipient email missing");
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER!,
    to: opts.to,
    subject: "Missed session notification",
    html: clientNoShowTemplate(opts),
  });
}
