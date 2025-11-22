const { body, param } = require('express-validator');

const mongoIdMessage = 'Valid MongoDB ObjectId is required';

const createLocationValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('code').trim().notEmpty().withMessage('Code is required'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const updateLocationValidator = [
  param('id').isMongoId().withMessage(mongoIdMessage),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Code cannot be empty'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const locationIdValidator = [param('id').isMongoId().withMessage(mongoIdMessage)];

module.exports = {
  createLocationValidator,
  updateLocationValidator,
  locationIdValidator
};
