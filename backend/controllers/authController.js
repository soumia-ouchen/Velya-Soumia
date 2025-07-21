
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import transporter from "../config/email.js";

import crypto from 'crypto';
import sendEmail from '../config/email.js';

// Register a new user
export const register = async (req, res) => {
  try {
    const { lname, fname, email, password } = req.body;
    console.log('Registration attempt for:', email); // Add logging

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    console.log('Generated token for:', email);

    // Create new user
    user = new User({
      lname,
      fname,
      email,
      password,
      verificationToken,
    });

    await user.save();
    console.log('User saved successfully:', user._id);

    // Send verification email
    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;
    console.log('Verification URL:', verificationUrl);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify Your Email',
      html: `
        <h1>Welcome to Velya!</h1>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you did not create an account, no further action is required.</p>
      `,

    });


    console.log('Verification email sent to:', user.email);

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error); // Detailed error logging
    res.status(500).json({
      message: 'Server error',
      error: error.message // Include actual error message
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params; // Récupérer le token depuis l'URL

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Lien de vérification invalide ou expiré' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Rediriger vers le frontend avec un message de succès
    res.redirect(`${process.env.FRONTEND_URL}/email-verified`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/email-verification-error`);
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        fname: user.fname,
        lname: user.lname,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error :', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Create reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'forgot Password ',
      html: `
        <h1>Password Reset Request</h1>
        <p>Please click on this link to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you did not request a password reset, no further action is required.</p>
      `,

    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};