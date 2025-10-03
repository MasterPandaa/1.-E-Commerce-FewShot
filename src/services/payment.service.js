const { v4: uuidv4 } = require("uuid");

async function processPayment({ amount, method, metadata }) {
  // Simulate gateway latency
  await new Promise((res) => setTimeout(res, 400));
  if (method !== "simulated_gateway") {
    const err = new Error("Unsupported payment method");
    err.code = "PAYMENT_METHOD_UNSUPPORTED";
    throw err;
  }
  // Randomized approval for demonstration, but keep it deterministic enough
  const approved = true; // Always approve in this simulation
  if (!approved) {
    const err = new Error("Payment declined");
    err.code = "PAYMENT_DECLINED";
    throw err;
  }
  return {
    transactionId: "SIM-" + uuidv4(),
    status: "approved",
  };
}

module.exports = { processPayment };
