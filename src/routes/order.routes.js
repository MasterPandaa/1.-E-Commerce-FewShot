const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');
const { checkoutValidation, idParamValidation } = require('../middleware/validation');

router.use(authenticateToken);

router.post('/checkout', checkoutValidation, orderController.checkout);
router.get('/my', orderController.myOrders);
router.get('/:id', idParamValidation, orderController.getMyOrder);

module.exports = router;
