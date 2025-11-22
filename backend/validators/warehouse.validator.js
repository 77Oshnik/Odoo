const { body, param } = require('express-validator');

const mongoIdMessage = 'Valid MongoDB ObjectId is required';

const createWarehouseValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('location').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const updateWarehouseValidator = [
  param('id').isMongoId().withMessage(mongoIdMessage),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('location').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const warehouseIdValidator = [param('id').isMongoId().withMessage(mongoIdMessage)];

module.exports = {
  createWarehouseValidator,
  updateWarehouseValidator,
  warehouseIdValidator
};
