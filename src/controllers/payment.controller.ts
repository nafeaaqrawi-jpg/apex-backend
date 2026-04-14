import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createCheckoutSession, handleWebhook } from '../services/payment.service';

const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'annual']),
});

export async function createCheckoutSessionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { plan } = checkoutSchema.parse(req.body);
    const user = req.user as { userId: string; email: string };
    const url = await createCheckoutSession(user.userId, user.email, plan);
    res.json({ success: true, data: { url } });
  } catch (error) {
    next(error);
  }
}

export async function webhookHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sig = req.headers['stripe-signature'] as string;
    await handleWebhook(req.body as Buffer, sig);
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}
