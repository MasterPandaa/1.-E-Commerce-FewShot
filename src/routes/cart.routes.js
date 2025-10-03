const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const cartController = require('../controllers/cart.controller');
const { cartItemValidation } = require('../middleware/validation');

router.use(authenticateToken);

router.get('/', cartController.getCart);
router.post('/add', cartItemValidation, cartController.addItem);
router.put('/set', cartItemValidation, cartController.setQuantity);
router.delete('/item/:productId', cartController.removeItem);
router.delete('/clear', cartController.clear);

module.exports = router;
