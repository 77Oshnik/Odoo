const { param, query } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ObjectId format');
  }
  return true;
};

const getMoveHistoryValidator = [
  query('product')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Product must be a valid ObjectId'),
  
  query('warehouse')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Warehouse must be a valid ObjectId'),
  
  query('transactionType')
    .optional()
    .isIn(['receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment'])
    .withMessage('Transaction type must be one of: receipt, delivery, transfer_in, transfer_out, adjustment'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt()
];

const productIdValidator = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .custom(isValidObjectId)
    .withMessage('Product ID must be a valid ObjectId')
];

module.exports = {
  getMoveHistoryValidator,
  productIdValidator
};

