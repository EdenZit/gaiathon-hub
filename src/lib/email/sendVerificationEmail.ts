import nodemailer from 'nodemailer';

// Amazon SES configuration
const emailConfig = {
  host: process.env.AWS_SES_HOST, // e.g., 'email-smtp.us-east-1.amazonaws.com'
  port: parseInt(process.env.AWS_SES_PORT || '587'),
  secure: process.env.AWS_SES_PORT === '465',
  auth: {
    user: process.env.AWS_SES_ACCESS_KEY_ID,
    pass: process.env.AWS_SES_SECRET_ACCESS_KEY,
  },
  debug: process.env.NODE_ENV === 'development',
  from: process.env.AWS_SES_FROM_EMAIL,
};

const transporter = nodemailer.createTransport(emailConfig);

// Verify transporter configuration in development
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter verification failed:', error);
    } else {
      console.log('Email transporter is ready to send emails');
    }
  });
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: emailConfig.from,
    to: email,
    subject: 'Verify your GAIAthon Hub email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A192F; margin-bottom: 20px;">Verify your email address</h2>
        <p style="color: #4A5568; margin-bottom: 20px;">
          Thank you for registering with GAIAthon Hub. Please click the button below to verify your email address:
        </p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #0A192F; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #718096; margin-top: 20px;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        <p style="color: #4A5568; word-break: break-all;">
          ${verificationUrl}
        </p>
        <p style="color: #718096; margin-top: 20px; font-size: 14px;">
          This link will expire in 24 hours. If you didn't request this verification, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
} 