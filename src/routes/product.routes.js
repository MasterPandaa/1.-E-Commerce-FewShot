const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const productController = require('../controllers/product.controller');
const uploadImage = require('../middleware/upload');
const { productValidation, productUpdateValidation, productQueryValidation, idParamValidation } = require('../middleware/validation');

// Public browsing
router.get('/', productQueryValidation, productController.list);
router.get('/:id', idParamValidation, productController.getById);

// Admin CRUD
router.post('/', authenticateToken, authorizeRoles('admin'), productValidation, productController.create);
router.put('/:id', authenticateToken, authorizeRoles('admin'), idParamValidation, productUpdateValidation, productController.update);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), idParamValidation, productController.delete);

// Image upload
router.post('/:id/image', authenticateToken, authorizeRoles('admin'), idParamValidation, (req, res, next) => {
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, productController.uploadImage);

module.exports = router;
