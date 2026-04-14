import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
});

export async function sendVerificationEmail(
  to: string,
  firstName: string,
  token: string
): Promise<void> {
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'Verify your Apex account',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
        <h1 style="color:#1a1a2e;margin-bottom:8px;">Welcome to Apex, ${firstName}.</h1>
        <p style="color:#444;font-size:16px;line-height:1.6;">
          You're one step away from meeting your intellectual match.
          Click the button below to verify your email address.
        </p>
        <a href="${verifyUrl}" style="
          display:inline-block;background:#7c3aed;color:#fff;
          padding:14px 28px;text-decoration:none;border-radius:8px;
          font-weight:bold;font-size:16px;margin:24px 0;
        ">Verify Email</a>
        <p style="color:#888;font-size:13px;">This link expires in 24 hours.</p>
        <p style="color:#888;font-size:13px;">
          If you didn't create an Apex account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  token: string
): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'Reset your Apex password',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
        <h1 style="color:#1a1a2e;margin-bottom:8px;">Reset your password</h1>
        <p style="color:#444;font-size:16px;line-height:1.6;">
          Hi ${firstName}, we received a request to reset your Apex password.
        </p>
        <a href="${resetUrl}" style="
          display:inline-block;background:#7c3aed;color:#fff;
          padding:14px 28px;text-decoration:none;border-radius:8px;
          font-weight:bold;font-size:16px;margin:24px 0;
        ">Reset Password</a>
        <p style="color:#888;font-size:13px;">This link expires in 1 hour.</p>
        <p style="color:#888;font-size:13px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
