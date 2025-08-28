// src/utils/auth.ts
import jwt from 'jsonwebtoken';

export const verifyToken = (token: string): { id: string; role: string } | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    console.log('Decoded token:', decoded);
    if (!decoded.role) {
      console.error('Token does not contain role information');
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};