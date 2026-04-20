const RESEND_API_URL = 'https://api.resend.com/emails';

function getFrom(): string {
  return process.env.EMAIL_FROM ?? 'Apex <onboarding@resend.dev>';
}

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL ?? 'http://localhost:5173';
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — email not sent to', to);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: getFrom(), to: [to], subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
}

export async function sendVerificationEmail(
  to: string,
  firstName: string,
  token: string
): Promise<void> {
  const verifyUrl = `${getFrontendUrl()}/verify-email?token=${token}`;

  await sendEmail(
    to,
    'Verify your Apex account',
    `
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
    `
  );
}

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  token: string
): Promise<void> {
  const resetUrl = `${getFrontendUrl()}/reset-password?token=${token}`;

  await sendEmail(
    to,
    'Reset your Apex password',
    `
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
    `
  );
}
