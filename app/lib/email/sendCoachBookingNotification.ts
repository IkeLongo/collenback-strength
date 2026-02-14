import nodemailer from "nodemailer";

export type SendCoachBookingNotificationOptions = {
  to: string;
  coachName?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  start: string; // ISO
  end: string;   // ISO
  serviceTitle?: string;
};


function coachTemplate({
  coachName,
  clientName,
  clientEmail,
  clientPhone,
  start,
  end,
  serviceTitle,
}: SendCoachBookingNotificationOptions) {
  const tz = "America/Chicago";
  const date = new Date(start).toLocaleDateString("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const startTime = new Date(start).toLocaleTimeString("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endTime = new Date(end).toLocaleTimeString("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Session Booked</title>
    </head>
    <body style="margin:0; padding:20px; font-family: Arial, sans-serif; background-color: transparent;">
      <div style="max-width:600px; margin:0 auto; background-color: #292929ff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="padding: 32px 24px 24px; text-align: center;">
          <img
            src="https://collenbackstrength.com/logo-stamp.png"
            alt="Collenback Strength"
            width="140"
            height="auto"
            style="display: block; margin: 0 auto 10px auto; max-width: 140px; height: auto; border: 0; outline: none; text-decoration: none;"
          />
          <p style="margin: 8px 0 0; color: #BEBDBD; opacity: 0.92; font-size: 20px; font-family: Arial, sans-serif;">
            New Session Booked
          </p>
        </div>
        <!-- Content -->
        <div style="padding:32px 24px;">
          <div style="margin-bottom:28px;">
            <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
              Session Details
            </h2>
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; width:110px; font-size:16px;">Client:</td>
                <td style="padding:8px 0; color: #BEBDBD; font-size:16px;">${clientName || "—"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Email:</td>
                <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${clientEmail || "—"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Phone:</td>
                <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${clientPhone || "—"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Service:</td>
                <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${serviceTitle || "Personal Training"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Date:</td>
                <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${date}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Start:</td>
                <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${startTime}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">End:</td>
                <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${endTime}</td>
              </tr>
            </table>
          </div>
          <div style="margin-bottom:28px;">
            <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
              Notification
            </h2>
            <div style="background-color: #ffffffff; padding:18px; border-radius:6px; border-left:4px solid #CB9F24; line-height:1.7; color: #292929ff; font-size:16px;">
              Hi ${coachName || "Coach"},<br><br>
              A client has booked a session${serviceTitle ? ` for <b>${serviceTitle}</b>` : ""}.<br>
              Please review the session details above.
            </div>
          </div>
        </div>
        <!-- Footer -->
        <div style="background-color: #292929ff; padding:18px; text-align:center; border-top:1px solid #eee;">
          <p style="margin:0; color:#CB9F24; font-size:14px;">
            This is an automated notification from Collenback Strength.
          </p>
          <p style="margin:5px 0 0 0; color:#BEBDBD; font-size:14px;">
            Received: ${new Date().toLocaleString("en-US", { timeZone: tz })}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendCoachBookingNotificationEmail(opts: SendCoachBookingNotificationOptions) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) throw new Error("SMTP env vars not configured");
  if (!opts.to) throw new Error("Coach recipient email missing");

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (Number(process.env.SMTP_PORT) || 465) === 465,
    auth: { user, pass },
  });

  // Optional but VERY helpful for debugging:
  // await transporter.verify();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to: opts.to,
    subject: "New session booked",
    html: coachTemplate(opts),
  });
}