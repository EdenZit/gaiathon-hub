import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface TeamInvitationEmailProps {
  teamName: string;
  inviterName: string;
  invitationLink: string;
  expiryDate: string;
}

export default function TeamInvitationEmail({
  teamName,
  inviterName,
  invitationLink,
  expiryDate,
}: TeamInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Join {teamName} on GAIAthon Hub</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Team Invitation</Heading>
          
          <Text style={text}>
            Hello,
          </Text>
          
          <Text style={text}>
            {inviterName} has invited you to join their team <strong>{teamName}</strong> on GAIAthon Hub.
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={invitationLink}
            >
              Join Team
            </Button>
          </Section>

          <Text style={text}>
            This invitation will expire on {expiryDate}. If you don't have a GAIAthon Hub account yet,
            you'll be able to create one after clicking the button above.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you didn't expect this invitation, you can safely ignore this email.
            For questions, please contact{' '}
            <Link href="mailto:support@gaiathon-hub.com" style={link}>
              support@gaiathon-hub.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  padding: '0 48px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 48px',
};

const buttonContainer = {
  padding: '24px 48px',
};

const button = {
  backgroundColor: '#1e40af',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 48px',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 48px',
};

const link = {
  color: '#1e40af',
  textDecoration: 'underline',
}; 