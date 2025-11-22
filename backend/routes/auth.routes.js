const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout
} = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/verify-otp', verifyOtpValidator, validate, verifyOtp);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);
router.post('/logout', auth, logout);

module.exports = router;
