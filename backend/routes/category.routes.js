const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator
} = require('../validators/category.validator');

const router = express.Router();

router.use(auth);

router.get('/', getCategories);
router.get('/:id', categoryIdValidator, validate, getCategoryById);
router.post('/', createCategoryValidator, validate, createCategory);
router.put('/:id', updateCategoryValidator, validate, updateCategory);
router.delete('/:id', categoryIdValidator, validate, deleteCategory);

module.exports = router;
