import nodemailer from "nodemailer";
import twilio from "twilio";

// =====================================================
// CLIENTS
// =====================================================

let emailTransporter = null;
let smsClient = null;

// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const getEmailTransporter = () => {
   if (emailTransporter) {
      return emailTransporter;
   }

   if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
   ) {
      console.warn("⚠️ Email configuration missing");
      return null;
   }

   const port = Number(process.env.SMTP_PORT || 587);

   emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,

      // Gmail SMTP port 587 = STARTTLS
      secure: port === 465,

      auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASS,
      },

      // Local development certificate issue fix
      // IMPORTANT:
      // Production me proper valid certificate use karna.
      tls: {
         rejectUnauthorized:
            String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED) !== "false",
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
   });

   return emailTransporter;
};

// =====================================================
// SMS CLIENT
// =====================================================

const getSmsClient = () => {
   if (smsClient) {
      return smsClient;
   }

   if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN
   ) {
      console.warn("⚠️ Twilio configuration missing");
      return null;
   }

   smsClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
   );

   return smsClient;
};

// =====================================================
// EMAIL
// =====================================================

export const sendResultEmail = async ({
   to,
   studentName,
   exam,
   className,
   percentage,
   grade,
}) => {
   try {
      const transporter = getEmailTransporter();

      if (!transporter) {
         return {
            sent: false,
            reason: "Email configuration missing",
         };
      }

      if (!to) {
         return {
            sent: false,
            reason: "Parent email missing",
         };
      }

      const mailResult = await transporter.sendMail({
         from:
            process.env.SMTP_FROM ||
            `"School Management System" <${process.env.SMTP_USER}>`,

         to,

         subject: `${studentName} - ${exam} Result`,

         text: `
Dear Parent,

${studentName}'s ${exam} result has been updated.

Class: ${className}

Percentage: ${percentage}%

Grade: ${grade}

Please login to the school portal for complete subject-wise marks.

School Management System
      `.trim(),

         html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Result Notification</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f3f4f6;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <div
    style="
      max-width:620px;
      margin:30px auto;
      background:#ffffff;
      border-radius:18px;
      overflow:hidden;
      border:1px solid #e5e7eb;
    "
  >

    <div
      style="
        background:#4338ca;
        padding:28px;
        color:white;
        text-align:center;
      "
    >
      <h1 style="margin:0;font-size:25px;">
        School Result Notification
      </h1>

      <p style="margin:8px 0 0;opacity:.9;">
        Examination Result Published
      </p>
    </div>

    <div style="padding:30px;">

      <p style="font-size:16px;">
        Dear Parent,
      </p>

      <p style="font-size:16px;line-height:1.6;">
        <strong>${studentName}</strong>'s
        <strong>${exam}</strong>
        result has been updated.
      </p>

      <div
        style="
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:14px;
          padding:20px;
          margin:22px 0;
        "
      >

        <p style="margin:8px 0;">
          <strong>Student:</strong>
          ${studentName}
        </p>

        <p style="margin:8px 0;">
          <strong>Class:</strong>
          ${className}
        </p>

        <p style="margin:8px 0;">
          <strong>Examination:</strong>
          ${exam}
        </p>

        <p style="margin:8px 0;">
          <strong>Percentage:</strong>
          ${percentage}%
        </p>

        <p style="margin:8px 0;">
          <strong>Grade:</strong>
          ${grade}
        </p>

      </div>

      <p style="font-size:15px;line-height:1.6;">
        Please login to the school portal to view
        complete subject-wise marks and result details.
      </p>

      <hr
        style="
          border:none;
          border-top:1px solid #e5e7eb;
          margin:25px 0;
        "
      />

      <p
        style="
          margin:0;
          color:#64748b;
          font-size:13px;
          text-align:center;
        "
      >
        School Management System
      </p>

    </div>
  </div>
</body>
</html>
      `,
      });

      console.log(
         `✅ Result email sent successfully to ${to}`
      );

      return {
         sent: true,
         messageId: mailResult.messageId,
      };
   } catch (error) {
      console.error(
         "❌ Result email error:",
         error.message
      );

      return {
         sent: false,
         reason: error.message || "Email sending failed",
      };
   }
};

// =====================================================
// SMS
// =====================================================

export const sendResultSms = async ({
   to,
   studentName,
   exam,
   percentage,
   grade,
}) => {
   try {
      const client = getSmsClient();

      if (!client) {
         return {
            sent: false,
            reason: "Twilio configuration missing",
         };
      }

      if (!to) {
         return {
            sent: false,
            reason: "Parent phone number missing",
         };
      }

      if (!process.env.TWILIO_PHONE_NUMBER) {
         return {
            sent: false,
            reason: "Twilio FROM phone number missing",
         };
      }

      // =================================================
      // TRIAL ACCOUNT
      // =================================================
      //
      // Twilio trial accounts can reject custom parameters/
      // custom messaging depending on the account's trial
      // restrictions.
      //
      // We catch that error so that result saving does NOT fail.
      // =================================================

      const messageBody =
         `${studentName}: ${exam} result updated. ` +
         `Percentage ${percentage}%, Grade ${grade}. ` +
         `Login to school portal for details.`;

      const message = await client.messages.create({
         body: messageBody,

         from: process.env.TWILIO_PHONE_NUMBER,

         to,
      });

      console.log(
         `✅ Result SMS sent successfully to ${to}`
      );

      return {
         sent: true,
         sid: message.sid,
      };
   } catch (error) {
      console.error(
         "❌ Result SMS error:",
         error.message
      );

      // Result should still remain saved
      return {
         sent: false,
         reason: error.message || "SMS sending failed",
      };
   }
};