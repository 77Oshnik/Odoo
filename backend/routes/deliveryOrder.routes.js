const express = require('express');
const router = express.Router();
const {
  getDeliveryOrders,
  getDeliveryOrder,
  createDeliveryOrder,
  updateDeliveryOrder,
  deleteDeliveryOrder,
  pickDeliveryOrder,
  packDeliveryOrder,
  validateDeliveryOrder,
  cancelDeliveryOrder
} = require('../controllers/deliveryOrder.controller');
const {
  createDeliveryOrderValidator,
  updateDeliveryOrderValidator,
  deliveryOrderIdValidator,
  pickDeliveryOrderValidator,
  packDeliveryOrderValidator
} = require('../validators/deliveryOrder.validator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');

router.get('/', auth, getDeliveryOrders);

router.get('/:id', auth, deliveryOrderIdValidator, validate, getDeliveryOrder);

router.post('/', auth, createDeliveryOrderValidator, validate, createDeliveryOrder);

router.put('/:id', auth, updateDeliveryOrderValidator, validate, updateDeliveryOrder);

router.delete('/:id', auth, deliveryOrderIdValidator, validate, deleteDeliveryOrder);

router.post('/:id/pick', auth, pickDeliveryOrderValidator, validate, pickDeliveryOrder);

router.post('/:id/pack', auth, packDeliveryOrderValidator, validate, packDeliveryOrder);

router.post('/:id/validate', auth, deliveryOrderIdValidator, validate, validateDeliveryOrder);

router.post('/:id/cancel', auth, deliveryOrderIdValidator, validate, cancelDeliveryOrder);

module.exports = router;

