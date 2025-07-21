import Token from '../models/Token.model.js';

import { generateToken } from '../config/jwt.js';


export const createToken = async (userId) => {
  const token = generateToken(userId);
  await Token.create({ userId, token });
  return token;
};

export const verifyToken = async (token) => {
  const tokenDoc = await Token.findOne({ token });
  if (!tokenDoc) throw new Error('Invalid or expired token');
  return tokenDoc.userId;
};

export const deleteToken = async (token) => {
  await Token.deleteOne({ token });
};

