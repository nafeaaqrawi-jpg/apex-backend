// Stripe integration stubbed — add STRIPE_SECRET_KEY to .env to activate.

export async function createCheckoutSession(
  _userId: string,
  _userEmail: string,
  plan: 'monthly' | 'annual'
): Promise<string> {
  // Return a placeholder URL so the frontend doesn't crash
  const price = plan === 'annual' ? '$5/mo' : '$7/mo';
  throw new Error(`Payment processing coming soon. Plan: ${price}`);
}

export async function handleWebhook(_payload: Buffer, _sig: string): Promise<void> {
  // no-op until Stripe keys are configured
}
