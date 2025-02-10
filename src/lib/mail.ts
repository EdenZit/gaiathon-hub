import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import TeamInvitationEmail from '../emails/TeamInvitationEmail';

interface TeamInvitationVariables {
  teamName: string;
  inviterName: string;
  invitationLink: string;
  expiryDate: string;
}

interface SendMailOptions {
  to: string;
  subject: string;
  template: 'team-invitation';
  variables: TeamInvitationVariables;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, template, variables }: SendMailOptions) {
  try {
    let html: string;

    // Select template based on type
    switch (template) {
      case 'team-invitation':
        html = await render(TeamInvitationEmail(variables));
        break;
      default:
        throw new Error(`Unknown email template: ${template}`);
    }

    // Send email
    await transporter.sendMail({
      from: `"GAIAthon Hub" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
} 