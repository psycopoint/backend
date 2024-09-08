import { Context } from "hono";
import { Resend } from "resend";

export const sendLoginEmail = async (
  c: Context,
  to: string,
  subject: string,
  html: string
) => {
  const resend = new Resend(c.env.RESEND_API_KEY);

  if (!to) {
    console.error("No email address provided");
    return;
  }

  try {
    await resend.emails.send({
      from: "no-reply@psycohub.com",
      to,
      subject,
      html,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
