const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { jwt: jwtCfg, baseUrl } = require("../config/config");
const UserModel = require("../models/user.model");
const PasswordResetModel = require("../models/passwordReset.model");
const emailService = require("./email.service");

async function createUser({ email, password, name }) {
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    const err = new Error("Email already registered");
    err.code = "USER_EXISTS";
    throw err;
  }
  const user = await UserModel.create({ email, password, name });
  return user;
}

async function authenticate({ email, password }) {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    const err = new Error("Invalid credentials");
    err.code = "AUTH_FAILED";
    throw err;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid credentials");
    err.code = "AUTH_FAILED";
    throw err;
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtCfg.secret,
    { expiresIn: jwtCfg.expiresIn },
  );
  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

async function getProfile(userId) {
  return await UserModel.findById(userId);
}

async function updateProfile(userId, { name }) {
  await UserModel.updateProfile(userId, { name });
  return await UserModel.findById(userId);
}

async function requestPasswordReset(email) {
  const user = await UserModel.findByEmail(email);
  if (!user) return; // do not leak existence

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await PasswordResetModel.deleteByUser(user.id);
  await PasswordResetModel.create({ userId: user.id, tokenHash, expiresAt });

  const resetLink = `${baseUrl}/reset-password?token=${token}`;
  const html = `
    <p>Halo ${user.name || user.email},</p>
    <p>Kami menerima permintaan reset password. Klik tautan di bawah untuk mengatur password baru (berlaku 1 jam):</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>Jika Anda tidak meminta reset, abaikan email ini.</p>
  `;
  await emailService.sendMail({
    to: user.email,
    subject: "Reset Password",
    html,
  });
}

async function resetPassword(token, newPassword) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await PasswordResetModel.findValidByHash(tokenHash);
  if (!record) {
    const err = new Error("Invalid or expired token");
    err.code = "TOKEN_INVALID";
    throw err;
  }
  await UserModel.updatePassword(record.user_id, newPassword);
  await PasswordResetModel.deleteByUser(record.user_id);
}

module.exports = {
  createUser,
  authenticate,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword,
};
