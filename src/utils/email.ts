import nodemailer from 'nodemailer';

const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<void> => {
  // Check if email configuration is present
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.warn('Email configuration missing. Email not sent.');
    return; // Skip sending email instead of throwing error
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `${process.env.APP_NAME || 'School Medical System'} <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

export default sendEmail;
