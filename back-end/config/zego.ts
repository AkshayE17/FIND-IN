import crypto from 'crypto';

interface TokenGenerationParams {
  appId: number;
  userId: string;
  serverSecret: string;
  effectiveTimeInSeconds?: number;
  payload?: string;
}

export function generateZegoToken({
  appId,
  userId,
  serverSecret,
  effectiveTimeInSeconds = 3600, // Default 1 hour
  payload = ''
}: TokenGenerationParams): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: nonce,
    create_time: timestamp,
    expire_time: timestamp + effectiveTimeInSeconds,
    payload: payload
  };

  // Convert token info to JSON and then to base64
  const tokenInfoJson = JSON.stringify(tokenInfo);
  const tokenInfoBase64 = Buffer.from(tokenInfoJson).toString('base64');

  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', serverSecret);
  hmac.update(tokenInfoBase64);
  const signature = hmac.digest('hex');

  // Combine signature and base64 token info
  return `${signature}#${tokenInfoBase64}`;
}