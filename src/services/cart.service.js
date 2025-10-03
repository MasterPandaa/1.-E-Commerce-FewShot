const CartModel = require('../models/cart.model');
const ProductModel = require('../models/product.model');

async function getCart(userId) {
  const items = await CartModel.getItems(userId);
  const enriched = items.map((it) => ({
    productId: it.product_id,
    name: it.name,
    price: Number(it.price),
    image_url: it.image_url,
    stock: it.stock,
    quantity: it.quantity,
    subtotal: Number(it.price) * it.quantity
  }));
  const total = enriched.reduce((acc, it) => acc + it.subtotal, 0);
  return { items: enriched, total };
}

async function addItem(userId, productId, quantity) {
  const product = await ProductModel.findById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  await CartModel.addOrUpdate(userId, productId, quantity);
  return await getCart(userId);
}

async function setQuantity(userId, productId, quantity) {
  const product = await ProductModel.findById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  await CartModel.setQuantity(userId, productId, quantity);
  return await getCart(userId);
}

async function removeItem(userId, productId) {
  await CartModel.removeItem(userId, productId);
  return await getCart(userId);
}

async function clearCart(userId) {
  await CartModel.clear(userId);
  return { items: [], total: 0 };
}

module.exports = {
  getCart,
  addItem,
  setQuantity,
  removeItem,
  clearCart
};
