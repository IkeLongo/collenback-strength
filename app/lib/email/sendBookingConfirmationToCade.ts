import nodemailer from "nodemailer";

export type SendBookingConfirmationOptions = {
  to: string;
  firstName?: string;
  lastName?: string;
  start: string; // ISO string
  end: string;   // ISO string
  serviceTitle?: string;
};

export async function sendBookingConfirmationEmail({ to, firstName, lastName, start, end, serviceTitle }: SendBookingConfirmationOptions) {
  // Configure your transporter (use environment variables for credentials)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = "Your Session Booking Confirmation";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Session Booking Confirmation</title>
    </head>
    <body style="margin:0; padding:20px; font-family: Arial, sans-serif; background-color: transparent;">
      <div style="max-width:600px; margin:0 auto; background-color: #292929ff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="padding: 32px 24px 24px;
                    text-align: center;">
          <img
            src="https://collenbackstrength.com/logo-stamp.png"
            alt="Collenback Strength"
            width="140"
            height="auto"
            style="display: block;
                  margin: 0 auto 10px auto;
                  max-width: 140px;
                  height: auto;
                  border: 0;
                  outline: none;
                  text-decoration: none;"
          />
          <p style="margin: 8px 0 0;
                    color: #BEBDBD;
                    opacity: 0.92;
                    font-size: 20px;
                    font-family: Arial, sans-serif;">
            Session Booking Confirmation
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
                <td style="padding:8px 0; font-weight:700; color:#fff; width:90px; font-size:16px;">Name:</td>
                <td style="padding:8px 0; color: #BEBDBD; font-size:16px;">${(firstName || "") + (lastName ? ` ${lastName}` : "") || "Valued Client"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Service:</td>
                <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">${serviceTitle || "Personal Training"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Date:</td>
                <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">
                  ${new Date(start).toLocaleDateString("en-US", { timeZone: "America/Chicago", year: "numeric", month: "long", day: "numeric" })}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">Start:</td>
                <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">
                  ${new Date(start).toLocaleTimeString("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit", hour12: true })}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-weight:700; color:#fff; font-size:16px;">End:</td>
                <td style="padding:8px 0; color:#BEBDBD; font-size:16px;">
                  ${new Date(end).toLocaleTimeString("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit", hour12: true })}
                </td>
              </tr>
            </table>
          </div>
          <div style="margin-bottom:28px;">
            <h2 style="color:#CB9F24; margin:0 0 14px 0; font-size:22px; border-bottom:2px solid #FFE98F; padding-bottom:8px; font-weight:600;">
              Thank You!
            </h2>
            <div style="background-color: #ffffffff; padding:18px; border-radius:6px; border-left:4px solid #CB9F24; line-height:1.7; color: #292929ff; font-size:16px;">
              Your session is confirmed. We look forward to seeing you at Collenback Strength!<br><br>
              If you have any questions or concerns, please call us at <a href="tel:${process.env.BUSINESS_PHONE}" style="color:#CB9F24; text-decoration:none; font-weight:600;">${process.env.BUSINESS_PHONE}</a>.
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #292929ff; padding:18px; text-align:center; border-top:1px solid #eee;">
          <p style="margin:0; color:#CB9F24; font-size:14px;">
            This email was sent from Collenback Strength.
          </p>
          <p style="margin:5px 0 0 0; color:#BEBDBD; font-size:14px;">
            Received: ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}
