const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ObjectId format');
  }
  return true;
};

const createInternalTransferValidator = [
  body('sourceWarehouse')
    .notEmpty()
    .withMessage('Source warehouse is required')
    .custom(isValidObjectId)
    .withMessage('Source warehouse must be a valid ObjectId'),
  
  body('destinationWarehouse')
    .notEmpty()
    .withMessage('Destination warehouse is required')
    .custom(isValidObjectId)
    .withMessage('Destination warehouse must be a valid ObjectId')
    .custom((value, { req }) => {
      if (value === req.body.sourceWarehouse) {
        throw new Error('Source and destination warehouses cannot be the same');
      }
      return true;
    }),
  
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product is required')
    .custom((products) => {
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error('Products must be a non-empty array');
      }
      return true;
    }),
  
  body('products.*.product')
    .notEmpty()
    .withMessage('Product ID is required for each product')
    .custom(isValidObjectId)
    .withMessage('Product ID must be a valid ObjectId'),
  
  body('products.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each product')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be a positive number')
    .toFloat(),
  
  body('products.*.unitOfMeasure')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Unit of measure must be less than 50 characters'),
  
  body('status')
    .optional()
    .isIn(['draft', 'waiting', 'ready', 'done', 'canceled'])
    .withMessage('Status must be one of: draft, waiting, ready, done, canceled'),
  
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
    .toDate(),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const updateInternalTransferValidator = [
  param('id')
    .notEmpty()
    .withMessage('Internal transfer ID is required')
    .custom(isValidObjectId)
    .withMessage('Internal transfer ID must be a valid ObjectId'),
  
  body('sourceWarehouse')
    .optional()
    .notEmpty()
    .withMessage('Source warehouse cannot be empty if provided')
    .custom(isValidObjectId)
    .withMessage('Source warehouse must be a valid ObjectId'),
  
  body('destinationWarehouse')
    .optional()
    .notEmpty()
    .withMessage('Destination warehouse cannot be empty if provided')
    .custom(isValidObjectId)
    .withMessage('Destination warehouse must be a valid ObjectId')
    .custom((value, { req }) => {
      const sourceWarehouse = req.body.sourceWarehouse || req.body._sourceWarehouse;
      if (value === sourceWarehouse) {
        throw new Error('Source and destination warehouses cannot be the same');
      }
      return true;
    }),
  
  body('products')
    .optional()
    .isArray({ min: 1 })
    .withMessage('If provided, products must be a non-empty array')
    .custom((products) => {
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error('Products must be a non-empty array');
      }
      return true;
    }),
  
  body('products.*.product')
    .if(body('products').exists())
    .notEmpty()
    .withMessage('Product ID is required for each product')
    .custom(isValidObjectId)
    .withMessage('Product ID must be a valid ObjectId'),
  
  body('products.*.quantity')
    .if(body('products').exists())
    .notEmpty()
    .withMessage('Quantity is required for each product')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be a positive number')
    .toFloat(),
  
  body('products.*.unitOfMeasure')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Unit of measure must be less than 50 characters'),
  
  body('status')
    .optional()
    .isIn(['draft', 'waiting', 'ready', 'done', 'canceled'])
    .withMessage('Status must be one of: draft, waiting, ready, done, canceled'),
  
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
    .toDate(),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const internalTransferIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Internal transfer ID is required')
    .custom(isValidObjectId)
    .withMessage('Internal transfer ID must be a valid ObjectId')
];

module.exports = {
  createInternalTransferValidator,
  updateInternalTransferValidator,
  internalTransferIdValidator
};

