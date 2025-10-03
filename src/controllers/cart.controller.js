const { validationResult } = require('express-validator');
const cartService = require('../services/cart.service');

exports.getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(req.user.id, Number(productId), Number(quantity));
    res.status(201).json({ success: true, message: 'Item added to cart', data: cart });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.setQuantity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId, quantity } = req.body;
    const cart = await cartService.setQuantity(req.user.id, Number(productId), Number(quantity));
    res.json({ success: true, message: 'Cart updated', data: cart });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const cart = await cartService.removeItem(req.user.id, productId);
    res.json({ success: true, message: 'Item removed', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.clear = async (req, res) => {
  try {
    await cartService.clearCart(req.user.id);
    res.json({ success: true, message: 'Cart cleared', data: { items: [], total: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
