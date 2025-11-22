const { body, param } = require('express-validator');
const mongoose = require('mongoose');

// Helper to validate MongoDB ObjectId
const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ObjectId format');
  }
  return true;
};

const createReceiptValidator = [
  body('warehouse')
    .notEmpty()
    .withMessage('Warehouse is required')
    .custom(isValidObjectId)
    .withMessage('Warehouse must be a valid ObjectId'),
  
  body('supplier')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Supplier name must be between 1 and 200 characters'),
  
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
  
  body('products.*.quantityReceived')
    .notEmpty()
    .withMessage('Quantity received is required for each product')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity received must be a positive number')
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
  
  body('receivedDate')
    .optional()
    .isISO8601()
    .withMessage('Received date must be a valid ISO 8601 date')
    .toDate(),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const updateReceiptValidator = [
  param('id')
    .notEmpty()
    .withMessage('Receipt ID is required')
    .custom(isValidObjectId)
    .withMessage('Receipt ID must be a valid ObjectId'),
  
  body('warehouse')
    .optional()
    .notEmpty()
    .withMessage('Warehouse cannot be empty if provided')
    .custom(isValidObjectId)
    .withMessage('Warehouse must be a valid ObjectId'),
  
  body('supplier')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Supplier name must be between 1 and 200 characters'),
  
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
  
  body('products.*.quantityReceived')
    .if(body('products').exists())
    .notEmpty()
    .withMessage('Quantity received is required for each product')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity received must be a positive number')
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
  
  body('receivedDate')
    .optional()
    .isISO8601()
    .withMessage('Received date must be a valid ISO 8601 date')
    .toDate(),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const receiptIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Receipt ID is required')
    .custom(isValidObjectId)
    .withMessage('Receipt ID must be a valid ObjectId')
];

module.exports = {
  createReceiptValidator,
  updateReceiptValidator,
  receiptIdValidator
};
