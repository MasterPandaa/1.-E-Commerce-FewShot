const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const dayjs = require("dayjs");
const { upload } = require("../config/config");

function generateInvoiceNumber(orderId) {
  const date = dayjs().format("YYYYMMDD");
  return `INV-${date}-${String(orderId).padStart(6, "0")}`;
}

async function generateInvoicePDF(order, items) {
  const invoiceNo = generateInvoiceNumber(order.id);
  const invoicePath = path.join(upload.invoicesDir, `${invoiceNo}.pdf`);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(invoicePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text("INVOICE", { align: "right" }).moveDown();

    doc
      .fontSize(12)
      .text("Shop Co.", { continued: true })
      .text(" | no-reply@example.com")
      .moveDown();

    // Invoice details
    doc
      .text(`Invoice No: ${invoiceNo}`)
      .text(
        `Date: ${dayjs(order.created_at || new Date()).format("YYYY-MM-DD")}`,
      )
      .moveDown();

    // Billing
    doc
      .text("Bill To:")
      .text(`${order.customer_name || order.email || "Customer"}`)
      .text(
        `${order.address}, ${order.city}, ${order.postal_code}, ${order.country}`,
      )
      .moveDown();

    // Table Header
    doc.font("Helvetica-Bold");
    doc.text("Item", 50, doc.y, { continued: true });
    doc.text("Qty", 300, doc.y, { continued: true });
    doc.text("Price", 360, doc.y, { continued: true });
    doc.text("Subtotal", 430);
    doc.moveDown();
    doc.font("Helvetica");

    items.forEach((it) => {
      const subtotal = Number(it.price) * it.quantity;
      doc.text(it.name, 50, doc.y, { continued: true });
      doc.text(String(it.quantity), 300, doc.y, { continued: true });
      doc.text(Number(it.price).toFixed(2), 360, doc.y, { continued: true });
      doc.text(subtotal.toFixed(2), 430);
    });

    doc.moveDown();
    doc.font("Helvetica-Bold");
    doc.text(`Total: ${Number(order.total_amount).toFixed(2)}`, {
      align: "right",
    });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return { invoiceNo, invoicePath };
}

module.exports = { generateInvoicePDF };
