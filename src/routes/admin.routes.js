const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');
const { idParamValidation, orderStatusUpdateValidation, userRoleUpdateValidation } = require('../middleware/validation');

router.use(authenticateToken, authorizeRoles('admin'));

router.get('/stats', adminController.stats);
router.get('/orders', adminController.listOrders);
router.put('/orders/:id/status', idParamValidation, orderStatusUpdateValidation, adminController.updateOrderStatus);
router.get('/users', adminController.listUsers);
router.put('/users/:id/role', idParamValidation, userRoleUpdateValidation, adminController.updateUserRole);

module.exports = router;
