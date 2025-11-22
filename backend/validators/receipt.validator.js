const { body } = require('express-validator');

const createReceiptValidator = [
    body('supplier').notEmpty().withMessage('Supplier is required'),
    body('warehouse').notEmpty().withMessage('Warehouse is required'),
    body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
];

const updateReceiptValidator = [
    body('supplier').optional().notEmpty().withMessage('Supplier is required'),
    body('warehouse').optional().notEmpty().withMessage('Warehouse is required'),
    body('products').optional().isArray({ min: 1 }).withMessage('At least one product is required'),
];

module.exports = {
    createReceiptValidator,
    updateReceiptValidator,
};
