import jwt, { JwtPayload } from 'jsonwebtoken';

export interface TokenVerificationResult {
  success: boolean;
  payload?: JwtPayload;
  message?: string;
}

export async function verifyAccessToken(
  token: string,
): Promise<TokenVerificationResult> {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    if (!decoded) {
      return { success: false, message: 'Invalid token format' };
    }

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return { success: false, message: 'Token has expired' };
    }

    return { success: true, payload: decoded };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Verification failed';
    return { success: false, message };
  }
}
