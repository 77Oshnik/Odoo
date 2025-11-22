const express = require('express');
const router = express.Router();
const {
  getInternalTransfers,
  getInternalTransfer,
  createInternalTransfer,
  updateInternalTransfer,
  deleteInternalTransfer,
  completeInternalTransfer,
  cancelInternalTransfer
} = require('../controllers/internalTransfer.controller');
const {
  createInternalTransferValidator,
  updateInternalTransferValidator,
  internalTransferIdValidator
} = require('../validators/internalTransfer.validator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');

router.get('/', auth, getInternalTransfers);

router.get('/:id', auth, internalTransferIdValidator, validate, getInternalTransfer);

router.post('/', auth, createInternalTransferValidator, validate, createInternalTransfer);

router.put('/:id', auth, updateInternalTransferValidator, validate, updateInternalTransfer);

router.delete('/:id', auth, internalTransferIdValidator, validate, deleteInternalTransfer);

router.post('/:id/complete', auth, internalTransferIdValidator, validate, completeInternalTransfer);

router.post('/:id/cancel', auth, internalTransferIdValidator, validate, cancelInternalTransfer);

module.exports = router;


