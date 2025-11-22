const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const buildToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

const buildUserResponse = (user) => {
  const { _id, name, email, isActive, createdAt, updatedAt } = user;
  return { id: _id, name, email, isActive, createdAt, updatedAt };
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = buildToken(user._id);
    return res.status(201).json({ user: buildUserResponse(user), token });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to sign up', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = buildToken(user._id);
    return res.json({ user: buildUserResponse(user), token });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = { code, expiresAt };
    await user.save();

    return res.json({ message: 'OTP generated successfully', code });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate OTP', error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const isExpired = user.otp.expiresAt && user.otp.expiresAt.getTime() < Date.now();
    if (user.otp.code !== code || isExpired) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const isExpired = user.otp.expiresAt && user.otp.expiresAt.getTime() < Date.now();
    if (user.otp.code !== code || isExpired) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.otp = undefined;
    await user.save();

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};

const logout = async (_req, res) => {
  return res.json({ message: 'Logged out successfully' });
};

module.exports = {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout
};
