const { body, param, query } = require('express-validator');

const mongoIdMessage = 'Valid MongoDB ObjectId is required';

const stockByLocationRules = () => [
  body('stockByLocation')
    .optional()
    .isArray()
    .withMessage('stockByLocation must be an array'),
  body('stockByLocation.*.warehouse')
    .if(body('stockByLocation').exists())
    .notEmpty()
    .withMessage('Warehouse is required')
    .bail()
    .isMongoId()
    .withMessage(mongoIdMessage),
  body('stockByLocation.*.quantity')
    .if(body('stockByLocation').exists())
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a non-negative number')
];

const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').optional().isMongoId().withMessage(mongoIdMessage),
  body('unitOfMeasure').optional().trim(),
  ...stockByLocationRules(),
  body('reorderingRule').optional().isMongoId().withMessage(mongoIdMessage),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const updateProductValidator = [
  param('id').isMongoId().withMessage(mongoIdMessage),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('sku').optional().trim().notEmpty().withMessage('SKU cannot be empty'),
  body('category').optional().isMongoId().withMessage(mongoIdMessage),
  body('unitOfMeasure').optional().trim(),
  ...stockByLocationRules(),
  body('reorderingRule').optional().isMongoId().withMessage(mongoIdMessage),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const productIdValidator = [param('id').isMongoId().withMessage(mongoIdMessage)];

const productSearchValidator = [
  query('q').trim().notEmpty().withMessage('Search query is required')
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  productSearchValidator
};
