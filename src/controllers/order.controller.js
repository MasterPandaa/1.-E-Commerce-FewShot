const { validationResult } = require('express-validator');
const orderService = require('../services/order.service');

exports.checkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { address, city, postalCode, country, paymentMethod } = req.body;
    const result = await orderService.checkout(
      req.user.id,
      { address, city, postalCode, country },
      paymentMethod
    );
    res.status(201).json({ success: true, message: 'Order placed', data: result });
  } catch (error) {
    if (error.code === 'CART_EMPTY') {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    if (error.code === 'OUT_OF_STOCK' || error.code === 'RESERVE_STOCK_FAILED') {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.code === 'PAYMENT_DECLINED') {
      return res.status(402).json({ success: false, message: 'Payment declined' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const data = await orderService.listMyOrders(req.user.id, { page, limit });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getMyOrder = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await orderService.getMyOrder(req.user.id, id);
    if (!data) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
