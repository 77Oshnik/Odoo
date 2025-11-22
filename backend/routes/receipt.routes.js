const express = require('express');
const router = express.Router();
const {
  getReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  validateReceipt,
  cancelReceipt,
} = require('../controllers/receipt.controller');
const { createReceiptValidator, updateReceiptValidator } = require('../validators/receipt.validator');
const validate = require('../middlewares/validate');

// Routes
router.route('/')
  .get(getReceipts)
  .post(createReceiptValidator, validate, createReceipt);

router.route('/:id')
  .get(getReceipt)
  .put(updateReceiptValidator, validate, updateReceipt)
  .delete(deleteReceipt);

router.post('/:id/validate', validateReceipt);
router.post('/:id/cancel', cancelReceipt);

module.exports = router;
