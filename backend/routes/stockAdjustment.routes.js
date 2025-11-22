const express = require('express');
const router = express.Router();
const {
  getStockAdjustments,
  getStockAdjustment,
  createStockAdjustment,
  deleteStockAdjustment
} = require('../controllers/stockAdjustment.controller');
const {
  createStockAdjustmentValidator,
  stockAdjustmentIdValidator
} = require('../validators/stockAdjustment.validator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');

router.get('/', auth, getStockAdjustments);

router.get('/:id', auth, stockAdjustmentIdValidator, validate, getStockAdjustment);

router.post('/', auth, createStockAdjustmentValidator, validate, createStockAdjustment);

router.delete('/:id', auth, stockAdjustmentIdValidator, validate, deleteStockAdjustment);

module.exports = router;

