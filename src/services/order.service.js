const db = require('../config/database');
const CartModel = require('../models/cart.model');
const ProductModel = require('../models/product.model');
const OrderModel = require('../models/order.model');
const UserModel = require('../models/user.model');
const { processPayment } = require('./payment.service');
const { generateInvoicePDF } = require('./invoice.service');
const emailService = require('./email.service');

async function checkout(userId, shipping, paymentMethod) {
  const items = await CartModel.getItems(userId);
  if (!items || items.length === 0) {
    const err = new Error('Cart is empty');
    err.code = 'CART_EMPTY';
    throw err;
  }

  const normalized = items.map((it) => ({
    productId: it.product_id,
    name: it.name,
    price: Number(it.price),
    quantity: it.quantity
  }));

  const totalAmount = normalized.reduce((acc, it) => acc + it.price * it.quantity, 0);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Validate and adjust stock
    for (const it of normalized) {
      const prod = await ProductModel.findById(it.productId);
      if (!prod || prod.stock < it.quantity) {
        const err = new Error(`Insufficient stock for ${it.name}`);
        err.code = 'OUT_OF_STOCK';
        throw err;
      }
      const ok = await ProductModel.adjustStock(conn, it.productId, -it.quantity);
      if (!ok) {
        const err = new Error(`Failed to reserve stock for ${it.name}`);
        err.code = 'RESERVE_STOCK_FAILED';
        throw err;
      }
    }

    // Create order
    const orderId = await OrderModel.createOrder(conn, {
      userId,
      address: shipping.address,
      city: shipping.city,
      postalCode: shipping.postalCode,
      country: shipping.country,
      totalAmount,
      paymentMethod,
      status: 'pending'
    });

    for (const it of normalized) {
      await OrderModel.addOrderItem(conn, {
        orderId,
        productId: it.productId,
        name: it.name,
        price: it.price,
        quantity: it.quantity
      });
    }

    // Process payment
    const payment = await processPayment({ amount: totalAmount, method: paymentMethod, metadata: { orderId, userId } });
    await OrderModel.updateStatus(conn, orderId, 'paid', payment.transactionId);

    // Clear cart after payment success
    await CartModel.clear(userId);

    await conn.commit();

    // Generate invoice and email outside transaction
    const order = await OrderModel.getById(orderId);
    const orderItems = await OrderModel.getItems(orderId);
    const user = await UserModel.findById(userId);

    const { invoiceNo, invoicePath } = await generateInvoicePDF({ ...order, email: user.email, customer_name: user.name }, orderItems);

    const html = `
      <p>Halo ${user.name || user.email},</p>
      <p>Terima kasih atas pesanan Anda. Berikut adalah detail pesanan Anda dengan nomor invoice <b>${invoiceNo}</b>.</p>
      <p>Total pembayaran: <b>${Number(order.total_amount).toFixed(2)}</b></p>
      <p>Invoice terlampir pada email ini.</p>
    `;
    await emailService.sendMail({
      to: user.email,
      subject: `Invoice ${invoiceNo}`,
      html,
      attachments: [
        { filename: `${invoiceNo}.pdf`, path: invoicePath }
      ]
    });

    return { orderId, invoiceNo, paymentTxnId: payment.transactionId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function listMyOrders(userId, opts) {
  return await OrderModel.listByUser(userId, opts || {});
}

async function getMyOrder(userId, orderId) {
  const order = await OrderModel.getById(orderId);
  if (!order || order.user_id !== userId) return null;
  const items = await OrderModel.getItems(orderId);
  return { order, items };
}

async function adminListOrders(opts) {
  return await OrderModel.list(opts || {});
}

async function adminUpdateOrderStatus(orderId, status) {
  return await OrderModel.updateStatus(null, orderId, status, null);
}

async function adminStats() {
  const overview = await OrderModel.statsOverview();
  const sales7d = await OrderModel.statsSales(7);
  const topProducts = await OrderModel.statsTopProducts(5);
  return { overview, sales7d, topProducts };
}

module.exports = {
  checkout,
  listMyOrders,
  getMyOrder,
  adminListOrders,
  adminUpdateOrderStatus,
  adminStats
};
