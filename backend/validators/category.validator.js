const { body, param } = require('express-validator');

const mongoIdMessage = 'Valid MongoDB ObjectId is required';

const createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const updateCategoryValidator = [
  param('id').isMongoId().withMessage(mongoIdMessage),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const categoryIdValidator = [param('id').isMongoId().withMessage(mongoIdMessage)];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator
};
