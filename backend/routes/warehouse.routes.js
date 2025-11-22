const express = require('express');
const {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} = require('../controllers/warehouse.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const {
  createWarehouseValidator,
  updateWarehouseValidator,
  warehouseIdValidator
} = require('../validators/warehouse.validator');

const router = express.Router();

router.use(auth);

router.get('/', getWarehouses);
router.get('/:id', warehouseIdValidator, validate, getWarehouseById);
router.post('/', createWarehouseValidator, validate, createWarehouse);
router.put('/:id', updateWarehouseValidator, validate, updateWarehouse);
router.delete('/:id', warehouseIdValidator, validate, deleteWarehouse);

module.exports = router;
