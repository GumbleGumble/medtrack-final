import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailTemplateProps {
  url: string;
  appName?: string;
}

function createVerificationEmailHtml({ url, appName = 'MedTrack' }: EmailTemplateProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your email for ${appName}</title>
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; padding: 2rem; background-color: #f9fafb;">
        <div style="max-width: 580px; margin: 0 auto; background-color: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <h1 style="font-size: 1.5rem; font-weight: 600; color: #111827; text-align: center; margin-bottom: 1rem;">
            Welcome to ${appName}
          </h1>
          <p style="color: #374151; margin-bottom: 1.5rem;">
            Click the button below to verify your email address and complete your registration. This link will expire in 24 hours.
          </p>
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <a href="${url}" 
               style="display: inline-block; background-color: #2563eb; color: white; font-weight: 500; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 0.875rem;">
            If you didn't request this email, you can safely ignore it.
          </p>
          <p style="color: #6b7280; font-size: 0.75rem; margin-top: 2rem;">
            If the button above doesn't work, you can also click this link: 
            <a href="${url}" style="color: #2563eb; text-decoration: underline;">${url}</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

export async function sendVerificationEmail(email: string, url: string): Promise<void> {
  try {
    await resend.emails.send({
      from: `MedTrack <${process.env.EMAIL_FROM!}>`,
      to: email,
      subject: "Verify your email for MedTrack",
      html: createVerificationEmailHtml({ url }),
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendAccessInvitationEmail(email: string, url: string): Promise<void> {
  try {
    await resend.emails.send({
      from: `MedTrack <${process.env.EMAIL_FROM!}>`,
      to: email,
      subject: "You've been granted access to medications on MedTrack",
      html: createVerificationEmailHtml({ 
        url,
        appName: "MedTrack - Medication Access Invitation"
      }),
    });
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
} 