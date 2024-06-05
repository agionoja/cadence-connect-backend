import nodemailer from "nodemailer";
import AppError from "../utils/appError.js";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Cadence Connect <cadence.connect@cadence.com>",
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  const maxRetries = 3;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await transporter.sendMail(mailOptions);
      return; // Email sent successfully
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      if (error.responseCode === 421 || error.message.includes("4.2.1")) {
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
      } else {
        throw new AppError(
          "There was an error sending the email. Please try again later.",
          500,
        );
      }
    }
  }
  throw new AppError(
    "Exceeded maximum retries. There was an error sending the email. Please try again later.",
    500,
  );
};

export default sendEmail;
