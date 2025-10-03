const ProductModel = require('../models/product.model');

async function createProduct(data) {
  return await ProductModel.create(data);
}

async function updateProduct(id, data) {
  await ProductModel.update(id, data);
  return await ProductModel.findById(id);
}

async function deleteProduct(id) {
  return await ProductModel.delete(id);
}

async function listProducts(query) {
  const { page = 1, limit = 12, category, minPrice, maxPrice, q } = query;
  return await ProductModel.list({ page: Number(page), limit: Number(limit), category, minPrice, maxPrice, q });
}

async function getProductById(id) {
  return await ProductModel.findById(id);
}

async function setProductImage(id, image_url) {
  await ProductModel.updateImage(id, image_url);
  return await ProductModel.findById(id);
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  getProductById,
  setProductImage
};
