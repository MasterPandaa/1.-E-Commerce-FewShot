const { validationResult } = require('express-validator');
const orderService = require('../services/order.service');
const adminService = require('../services/admin.service');

exports.stats = async (req, res) => {
  try {
    const data = await orderService.adminStats();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const status = req.query.status;
    const data = await orderService.adminListOrders({ page, limit, status });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = Number(req.params.id);
    const { status } = req.body;
    await orderService.adminUpdateOrderStatus(id, status);
    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const data = await adminService.listUsers({ page, limit });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = Number(req.params.id);
    const { role } = req.body;
    await adminService.updateUserRole(id, role);
    res.json({ success: true, message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
