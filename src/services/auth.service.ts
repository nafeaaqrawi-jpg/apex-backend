import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { users, verificationTokens, colleges } from '../db/schema';
import { hashPassword, verifyPassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { AppError } from '../middleware/error.middleware';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase().trim()))
    .limit(1);

  if (existing.length > 0) {
    // Don't reveal whether the email is registered — prevents account enumeration.
    // Return the same success message and silently drop the duplicate.
    return {
      message: 'Account created. Check your email to verify your account.',
      userId: existing[0].id,
    };
  }

  const passwordHash = await hashPassword(input.password);
  const normalizedEmail = input.email.toLowerCase().trim();
  // Auto-verify school email: any .edu domain gets the Verified Student badge
  const schoolEmailVerified = normalizedEmail.endsWith('.edu');

  const [user] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      age: 0, // placeholder — overwritten with real age computed from DOB during onboarding
      schoolEmailVerified,
    })
    .returning({ id: users.id, email: users.email, firstName: users.firstName });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.insert(verificationTokens).values({
    userId: user.id,
    token,
    type: 'EMAIL',
    expiresAt,
  });

  await sendVerificationEmail(user.email, user.firstName, token);

  return {
    message: 'Account created. Check your email to verify your account.',
    userId: user.id,
  };
}

export async function verifyEmail(token: string) {
  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (!record || record.type !== 'EMAIL') {
    throw new AppError('Invalid verification link.', 400, 'TOKEN_INVALID');
  }

  if (record.expiresAt < new Date()) {
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
    throw new AppError(
      'This verification link has expired. Request a new one.',
      400,
      'TOKEN_EXPIRED'
    );
  }

  const [user] = await db
    .update(users)
    .set({ verified: true })
    .where(eq(users.id, record.userId))
    .returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      verified: users.verified,
      idVerified: users.idVerified,
    });

  await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

  const jwt = signToken({ userId: user.id, email: user.email });
  return { user, jwt };
}

export async function loginUser(input: LoginInput) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      firstName: users.firstName,
      lastName: users.lastName,
      verified: users.verified,
      idVerified: users.idVerified,
      onboardingComplete: users.onboardingComplete,
    })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase().trim()))
    .limit(1);

  // Generic error message prevents account enumeration
  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.verified) {
    throw new AppError(
      'Please verify your email before logging in.',
      403,
      'EMAIL_NOT_VERIFIED'
    );
  }

  const jwt = signToken({ userId: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      verified: user.verified,
      idVerified: user.idVerified,
      onboardingComplete: user.onboardingComplete,
    },
    jwt,
  };
}

export async function forgotPassword(email: string) {
  const [user] = await db
    .select({ id: users.id, email: users.email, firstName: users.firstName })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  // Always return success — prevents revealing which emails are registered
  if (!user) return;

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.userId, user.id));

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(verificationTokens).values({
    userId: user.id,
    token,
    type: 'PASSWORD_RESET',
    expiresAt,
  });

  await sendPasswordResetEmail(user.email, user.firstName, token);
}

export async function resetPassword(token: string, newPassword: string) {
  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (!record || record.type !== 'PASSWORD_RESET') {
    throw new AppError('Invalid or expired reset link.', 400, 'TOKEN_INVALID');
  }

  if (record.expiresAt < new Date()) {
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
    throw new AppError(
      'This reset link has expired. Request a new one.',
      400,
      'TOKEN_EXPIRED'
    );
  }

  const passwordHash = await hashPassword(newPassword);

  await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
  await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
}

export async function getMe(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      age: users.age,
      dateOfBirth: users.dateOfBirth,
      gender: users.gender,
      bio: users.bio,
      headline: users.headline,
      currentRole: users.currentRole,
      company: users.company,
      locationLabel: users.locationLabel,
      workLocation: users.workLocation,
      futureLocation: users.futureLocation,
      major: users.major,
      gpa: users.gpa,
      sat: users.sat,
      act: users.act,
      relationshipGoal: users.relationshipGoal,
      interests: users.interests,
      values: users.values,
      collegeId: users.collegeId,
      profilePhotoUrl: users.profilePhotoUrl,
      idPhotoUrl: users.idPhotoUrl,
      idVerified: users.idVerified,
      verified: users.verified,
      latitude: users.latitude,
      longitude: users.longitude,
      socialLinks: users.socialLinks,
      onboardingComplete: users.onboardingComplete,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new AppError('User not found.', 404, 'NOT_FOUND');
  }

  let college = null;
  if (user.collegeId) {
    const [c] = await db
      .select({ id: colleges.id, name: colleges.name, tier: colleges.tier })
      .from(colleges)
      .where(eq(colleges.id, user.collegeId))
      .limit(1);
    college = c ?? null;
  }

  return { ...user, college };
}

export async function resendVerification(email: string) {
  const [user] = await db
    .select({ id: users.id, email: users.email, firstName: users.firstName, verified: users.verified })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  // Silent fail to prevent email enumeration
  if (!user || user.verified) return;

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.userId, user.id));

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(verificationTokens).values({
    userId: user.id,
    token,
    type: 'EMAIL',
    expiresAt,
  });

  await sendVerificationEmail(user.email, user.firstName, token);
}
