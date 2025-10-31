const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Ø§ÛŒØ¬Ø§Ø¯ Ù…Ø­ØµÙˆÙ„ (ÙÙ‚Ø· admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  productController.createProduct
);

// Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ù…Ø­ØµÙˆÙ„Ø§Øª (Ø¹Ù…ÙˆÙ…ÛŒ)
router.get('/', productController.getAllProducts);

// Ø¯Ø±ÛŒØ§ÙØª Ù…Ø­ØµÙˆÙ„ Ø¨Ø± Ø§Ø³Ø§Ø³ ID (Ø¹Ù…ÙˆÙ…ÛŒ)
router.get('/:id', productController.getProductById);

// Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù…Ø­ØµÙˆÙ„ (ÙÙ‚Ø· admin)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  productController.updateProduct
);

// Ø­Ø°Ù Ù…Ø­ØµÙˆÙ„ (ÙÙ‚Ø· admin)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  productController.deleteProduct
);

module.exports = router;
