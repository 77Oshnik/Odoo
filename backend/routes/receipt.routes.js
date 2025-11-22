const express = require('express');
const router = express.Router();
const {
  getReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  validateReceipt,
  cancelReceipt
} = require('../controllers/receipt.controller');
const {
  createReceiptValidator,
  updateReceiptValidator,
  receiptIdValidator
} = require('../validators/receipt.validator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');


router.get('/', auth, getReceipts);

router.get('/:id', auth, receiptIdValidator, validate, getReceipt);

router.post('/', auth, createReceiptValidator, validate, createReceipt);

router.put('/:id', auth, updateReceiptValidator, validate, updateReceipt);

router.delete('/:id', auth, receiptIdValidator, validate, deleteReceipt);

router.post('/:id/validate', auth, receiptIdValidator, validate, validateReceipt);

router.post('/:id/cancel', auth, receiptIdValidator, validate, cancelReceipt);

module.exports = router;
