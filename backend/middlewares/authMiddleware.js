import jwt from 'jsonwebtoken';

export const auth = async (req, res, next) => {
  console.log('Auth middleware triggered'); // Add logging
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      console.log('No token provided'); // Add logging
      return res.status(401).json({ message: 'No token provided' });
    }
    console.log('Token received:', token); // Add logging
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export default auth;


