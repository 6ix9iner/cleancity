const jwt = require('jsonwebtoken');

/**
 * Generates a unique reward token — format: CCN-XXXX-XXXX
 * Uses unambiguous characters (no 0, O, 1, I)
 */
const generateRewardToken = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars[Math.floor(Math.random() * chars.length)];
    part2 += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CCN-${part1}-${part2}`;
};

/**
 * Generates a 6-digit numeric email verification code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Signs and returns a JWT for a given user ID
 */
const generateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { generateRewardToken, generateVerificationCode, generateJWT };