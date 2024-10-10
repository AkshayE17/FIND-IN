import jwt from 'jsonwebtoken';

export function generateAccessToken(userId: string) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}
