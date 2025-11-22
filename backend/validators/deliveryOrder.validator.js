const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ObjectId format');
  }
  return true;
};

const createDeliveryOrderValidator = [
  body('warehouse')
    .notEmpty()
    .withMessage('Warehouse is required')
    .custom(isValidObjectId)
    .withMessage('Warehouse must be a valid ObjectId'),
  
  body('customer')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Customer name must be between 1 and 200 characters'),
  
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
  
  body('products.*.quantityOrdered')
    .notEmpty()
    .withMessage('Quantity ordered is required for each product')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity ordered must be a positive number')
    .toFloat(),
  
  body('products.*.quantityPicked')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity picked must be a non-negative number')
    .toFloat(),
  
  body('products.*.quantityPacked')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity packed must be a non-negative number')
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
  
  body('deliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Delivery date must be a valid ISO 8601 date')
    .toDate(),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const updateDeliveryOrderValidator = [
  param('id')
    .notEmpty()
    .withMessage('Delivery order ID is required')
    .custom(isValidObjectId)
    .withMessage('Delivery order ID must be a valid ObjectId'),
  
  body('warehouse')
    .optional()
    .notEmpty()
    .withMessage('Warehouse cannot be empty if provided')
    .custom(isValidObjectId)
    .withMessage('Warehouse must be a valid ObjectId'),
  
  body('customer')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Customer name must be between 1 and 200 characters'),
  
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
  
  body('products.*.quantityOrdered')
    .if(body('products').exists())
    .notEmpty()
    .withMessage('Quantity ordered is required for each product')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity ordered must be a positive number')
    .toFloat(),
  
  body('products.*.quantityPicked')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity picked must be a non-negative number')
    .toFloat(),
  
  body('products.*.quantityPacked')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity packed must be a non-negative number')
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
  
  body('deliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Delivery date must be a valid ISO 8601 date')
    .toDate(),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const deliveryOrderIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Delivery order ID is required')
    .custom(isValidObjectId)
    .withMessage('Delivery order ID must be a valid ObjectId')
];

const pickDeliveryOrderValidator = [
  param('id')
    .notEmpty()
    .withMessage('Delivery order ID is required')
    .custom(isValidObjectId)
    .withMessage('Delivery order ID must be a valid ObjectId'),
  
  body('products')
    .optional()
    .isArray()
    .withMessage('Products must be an array'),
  
  body('products.*.product')
    .if(body('products').exists())
    .notEmpty()
    .withMessage('Product ID is required')
    .custom(isValidObjectId)
    .withMessage('Product ID must be a valid ObjectId'),
  
  body('products.*.quantityPicked')
    .if(body('products').exists())
    .notEmpty()
    .withMessage('Quantity picked is required')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity picked must be a positive number')
    .toFloat()
];

const packDeliveryOrderValidator = [
  param('id')
    .notEmpty()
    .withMessage('Delivery order ID is required')
    .custom(isValidObjectId)
    .withMessage('Delivery order ID must be a valid ObjectId'),
  
  body('products')
    .optional()
    .isArray()
    .withMessage('Products must be an array'),
  
  body('products.*.product')
    .if(body('products').exists())
    .notEmpty()
    .withMessage('Product ID is required')
    .custom(isValidObjectId)
    .withMessage('Product ID must be a valid ObjectId'),
  
  body('products.*.quantityPacked')
    .if(body('products').exists())
    .notEmpty()
    .withMessage('Quantity packed is required')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity packed must be a positive number')
    .toFloat()
];

module.exports = {
  createDeliveryOrderValidator,
  updateDeliveryOrderValidator,
  deliveryOrderIdValidator,
  pickDeliveryOrderValidator,
  packDeliveryOrderValidator
};

