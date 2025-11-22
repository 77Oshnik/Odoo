const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStock,
  searchProducts,
  getLowStockProducts
} = require('../controllers/product.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  productSearchValidator
} = require('../validators/product.validator');

const router = express.Router();

router.use(auth);

router.get('/', getProducts);
router.get('/search', productSearchValidator, validate, searchProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/:id/stock', productIdValidator, validate, getProductStock);
router.get('/:id', productIdValidator, validate, getProductById);
router.post('/', createProductValidator, validate, createProduct);
router.put('/:id', updateProductValidator, validate, updateProduct);
router.delete('/:id', productIdValidator, validate, deleteProduct);

module.exports = router;
