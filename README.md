# E-Commerce Backend (Node.js + Express + MySQL)

A production-ready backend service implementing an E-Commerce API with MVC architecture, service layer, validation, JWT authentication, rate limiting, structured logging, email notifications, PDF invoice generation, and secure MySQL queries using prepared statements.

## Features

- Authentication
  - Register with validation
  - Login with JWT
  - Password reset via email (tokenized)
- Product Management
  - Admin CRUD (Create, Read, Update, Delete)
  - Browse with pagination, category filter, price range, and search query
  - Image upload (max 5MB, jpeg/png/webp)
- Shopping Cart
  - Add/update/remove items
  - Automatic total calculation
  - Persistent across sessions (DB-based)
- Checkout & Payment
  - Shipping address form
  - Simulated payment gateway
  - Invoice PDF generation
  - Email notification with invoice attachment
- Admin Dashboard Endpoints
  - Sales statistics (overview, last 7 days, top products)
  - Manage orders & statuses
  - User management (list, update role)
- Technical
  - MVC + Service layer
  - Prepared statements for all SQL
  - Validation middleware with express-validator
  - Central error handling
  - Rate limiting for API
  - Winston logger with daily rotation
  - Environment variables via dotenv
  - Organized folder structure

## Folder Structure

```
src/
  app.js
  server.js
  config/
    config.js
    database.js
    logger.js
  middleware/
    auth.js
    errorHandler.js
    rateLimit.js
    upload.js
    validation.js
  models/
    user.model.js
    product.model.js
    cart.model.js
    order.model.js
    passwordReset.model.js
  services/
    user.service.js
    product.service.js
    cart.service.js
    order.service.js
    email.service.js
    payment.service.js
    invoice.service.js
  controllers/
    user.controller.js
    product.controller.js
    cart.controller.js
    order.controller.js
    admin.controller.js
  routes/
    index.js
    user.routes.js
    product.routes.js
    cart.routes.js
    order.routes.js
    admin.routes.js
public/
  uploads/
  invoices/

db/
  schema.sql
```

## Requirements

- Node.js 18+
- MySQL 8+

## Setup

1) Copy environment file

```
cp .env.example .env
```

Fill in values for DB, JWT, and SMTP (for email). For local dev, you can use any SMTP provider or set up a test inbox (e.g., Ethereal or MailHog).

2) Install dependencies

```
npm install
```

3) Create database schema

Using MySQL CLI:

```
# Adjust credentials accordingly
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ecommerce_db;"
mysql -u root -p ecommerce_db < db/schema.sql
```

4) Start the server

```
# Development (with nodemon)
npm run dev

# Production
npm start
```

The API will run at http://localhost:3000 (configurable via .env).

## API Endpoints (Summary)

- Health
  - GET `/api/health`

- Users
  - POST `/api/users/register` { email, password, name }
  - POST `/api/users/login` { email, password }
  - GET `/api/users/profile` (JWT)
  - PUT `/api/users/profile` (JWT) { name }
  - POST `/api/users/password/reset-request` { email }
  - POST `/api/users/password/reset-confirm` { token, password }

- Products
  - GET `/api/products`?page&limit&category&minPrice&maxPrice&q
  - GET `/api/products/:id`
  - POST `/api/products` (Admin JWT) { name, description, price, stock, category }
  - PUT `/api/products/:id` (Admin JWT) partial update
  - DELETE `/api/products/:id` (Admin JWT)
  - POST `/api/products/:id/image` (Admin JWT, multipart/form-data with field `image`)

- Cart (JWT)
  - GET `/api/cart`
  - POST `/api/cart/add` { productId, quantity }
  - PUT `/api/cart/set` { productId, quantity }
  - DELETE `/api/cart/item/:productId`
  - DELETE `/api/cart/clear`

- Orders (JWT)
  - POST `/api/orders/checkout` { address, city, postalCode, country, paymentMethod: 'simulated_gateway' }
  - GET `/api/orders/my`
  - GET `/api/orders/:id`

- Admin (Admin JWT)
  - GET `/api/admin/stats`
  - GET `/api/admin/orders`?page&limit&status
  - PUT `/api/admin/orders/:id/status` { status: 'pending'|'paid'|'shipped'|'completed'|'cancelled' }
  - GET `/api/admin/users`?page&limit
  - PUT `/api/admin/users/:id/role` { role: 'user'|'admin' }

## Notes

- Product images are stored under `public/uploads/`. Max upload size is configured via `UPLOAD_MAX_SIZE_MB` in `.env` (default 5MB). Allowed types: jpeg/png/webp.
- Invoices are generated under `public/invoices/` and attached to order confirmation emails.
- Admin account: register a user then manually update role to `admin` using the Admin API or directly in DB.
- Logging outputs to `logs/` with daily rotation; console logs in non-production.

## Security & Best Practices

- All SQL uses prepared statements via `mysql2/promise` pool.
- JWT tokens are required for protected routes; admin routes require `role=admin`.
- Validation is enforced using `express-validator` with centralized schemas in `middleware/validation.js`.
- Rate limiting is applied to `/api` routes globally.
- Errors propagate to centralized error handler in `middleware/errorHandler.js`.

## Development Tips

- Use a test SMTP like Ethereal or MailHog for local password reset and invoice emails.
- Use tools like Postman/Insomnia to test endpoints.
- For charting in the Admin dashboard, consume the `/api/admin/stats` JSON from your frontend chart library.
