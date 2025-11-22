const express = require('express');
const router = express.Router();
const {
  getMoveHistory,
  getMoveHistoryByProduct
} = require('../controllers/moveHistory.controller');
const {
  getMoveHistoryValidator,
  productIdValidator
} = require('../validators/moveHistory.validator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');

router.get('/', auth, getMoveHistoryValidator, validate, getMoveHistory);

router.get('/:productId', auth, productIdValidator, validate, getMoveHistoryByProduct);

module.exports = router;

