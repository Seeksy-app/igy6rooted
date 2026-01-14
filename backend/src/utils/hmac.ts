import crypto from 'crypto';

export async function signHmac(payload: string, secret: string): Promise<string> {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

export async function verifyHmac(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string,
  maxAgeSeconds = 120
): Promise<boolean> {
  // Check timestamp freshness
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  
  if (Math.abs(now - requestTime) > maxAgeSeconds) {
    return false;
  }

  // Verify signature
  const expectedSignature = await signHmac(`${timestamp}.${payload}`, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export default { signHmac, verifyHmac };
