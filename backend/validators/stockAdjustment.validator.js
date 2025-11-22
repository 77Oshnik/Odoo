const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ObjectId format');
  }
  return true;
};

const createStockAdjustmentValidator = [
  body('product')
    .notEmpty()
    .withMessage('Product is required')
    .custom(isValidObjectId)
    .withMessage('Product must be a valid ObjectId'),
  
  body('warehouse')
    .notEmpty()
    .withMessage('Warehouse is required')
    .custom(isValidObjectId)
    .withMessage('Warehouse must be a valid ObjectId'),
  
  body('recordedQuantity')
    .notEmpty()
    .withMessage('Recorded quantity is required')
    .isFloat({ min: 0 })
    .withMessage('Recorded quantity must be a non-negative number')
    .toFloat(),
  
  body('countedQuantity')
    .notEmpty()
    .withMessage('Counted quantity is required')
    .isFloat({ min: 0 })
    .withMessage('Counted quantity must be a non-negative number')
    .toFloat(),
  
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isIn(['damaged', 'lost', 'found', 'expired', 'miscounted', 'other'])
    .withMessage('Reason must be one of: damaged, lost, found, expired, miscounted, other'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const stockAdjustmentIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Stock adjustment ID is required')
    .custom(isValidObjectId)
    .withMessage('Stock adjustment ID must be a valid ObjectId')
];

module.exports = {
  createStockAdjustmentValidator,
  stockAdjustmentIdValidator
};

