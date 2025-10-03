const { body, param, query } = require("express-validator");

exports.registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Email harus valid"),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password minimal 8 karakter, harus mengandung huruf besar, kecil, dan angka",
    ),
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Nama harus 2-50 karakter"),
];

exports.loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
];

exports.profileUpdateValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Nama harus 2-50 karakter"),
];

exports.productValidation = [
  body("name").trim().notEmpty().withMessage("Nama produk wajib diisi"),
  body("price").isFloat({ min: 0 }).withMessage("Harga harus angka positif"),
  body("stock").isInt({ min: 0 }).withMessage("Stok harus angka positif"),
  body("category").trim().notEmpty().withMessage("Kategori wajib diisi"),
];

exports.productUpdateValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Nama tidak boleh kosong"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Harga harus angka positif"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stok harus angka positif"),
  body("category")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Kategori tidak boleh kosong"),
  body("description").optional().isString(),
];

exports.productQueryValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("category").optional().isString(),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("q").optional().isString(),
];

exports.idParamValidation = [param("id").isInt({ min: 1 })];

exports.cartItemValidation = [
  body("productId").isInt({ min: 1 }),
  body("quantity").isInt({ min: 1 }),
];

exports.checkoutValidation = [
  body("address").trim().isLength({ min: 5 }),
  body("city").trim().notEmpty(),
  body("postalCode").trim().notEmpty(),
  body("country").trim().notEmpty(),
  body("paymentMethod")
    .isIn(["simulated_gateway"])
    .withMessage("Invalid payment method"),
];

exports.passwordResetRequestValidation = [
  body("email").isEmail().normalizeEmail(),
];

exports.passwordResetConfirmValidation = [
  body("token").isString().notEmpty(),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password minimal 8 karakter, harus mengandung huruf besar, kecil, dan angka",
    ),
];

exports.orderStatusUpdateValidation = [
  body("status").isIn(["pending", "paid", "shipped", "completed", "cancelled"]),
];

exports.userRoleUpdateValidation = [body("role").isIn(["user", "admin"])];
