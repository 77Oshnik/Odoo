const { body } = require('express-validator');

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long');

const emailRule = body('email')
  .isEmail()
  .withMessage('Valid email is required')
  .normalizeEmail();

const signupValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  emailRule,
  passwordRule
];

const loginValidator = [
  emailRule,
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidator = [emailRule];

const verifyOtpValidator = [
  emailRule,
  body('code')
    .isLength({ min: 4, max: 10 })
    .withMessage('OTP code must be between 4 and 10 characters')
];

const resetPasswordValidator = [
  emailRule,
  body('code').notEmpty().withMessage('OTP code is required'),
  passwordRule
];

module.exports = {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator
};
