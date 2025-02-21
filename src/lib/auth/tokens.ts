import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function generateVerificationToken(userId: string): Promise<string> {
  const randomString = randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const token = `${userId}.${timestamp}.${randomString}`;
  
  // Base64 encode the token
  return Buffer.from(token).toString('base64url');
}

export async function verifyToken(token: string): Promise<{ userId: string; valid: boolean }> {
  try {
    // Decode the base64 token
    const decoded = Buffer.from(token, 'base64url').toString();
    const [userId, timestamp, randomString] = decoded.split('.');
    
    // Check if the token has expired
    const tokenTime = parseInt(timestamp);
    if (Date.now() - tokenTime > TOKEN_EXPIRY) {
      return { userId, valid: false };
    }
    
    return { userId, valid: true };
  } catch (error) {
    return { userId: '', valid: false };
  }
} 