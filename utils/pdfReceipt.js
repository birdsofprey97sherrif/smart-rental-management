const PDFDocument = require("pdfkit");
const fs = require("fs");

exports.generateReceiptPDF = (payment, tenant, house, res) => {
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=receipt-${payment._id}.pdf`);
  doc.pipe(res);

  doc.fontSize(16).text("🏠 Smart Rental Management", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text("Rent Payment Receipt", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Receipt ID: ${payment.receiptId}`);
  doc.text(`Date: ${payment.paymentDate.toDateString()}`);
  doc.text(`Tenant: ${tenant.fullName}`);
  doc.text(`House: ${house.title} (${house.location})`);
  doc.text(`Amount Paid: KES ${payment.amountPaid}`);
  doc.text(`Payment Method: ${payment.paymentMethod}`);
  doc.moveDown();
  doc.text("Thank you for your payment!", { align: "center" });

  doc.end();
};
exports.downloadReceipt = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await RentPayment.findById(paymentId);
    const tenant = await User.findById(payment.tenantId);
    const house = await House.findById(payment.houseId);
    if (!payment || !tenant || !house) {
      return res.status(404).send("Payment or related information not found");
    }
    this.generateReceiptPDF(payment, tenant, house, res);
  } catch (error) {
    console.error("Error downloading receipt:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.generateReceipt = async (payment) => {
  const doc = new PDFDocument();
  const filePath = `./receipts/receipt-${payment._id}.pdf`;
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text("🏠 Smart Rental Management", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text("Rent Payment Receipt", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Receipt ID: ${payment.receiptId}`);
  doc.text(`Date: ${payment.paymentDate.toDateString()}`);
  doc.text(`Tenant: ${payment.tenantId.fullName}`);
  doc.text(`House: ${payment.houseId.title} (${payment.houseId.location})`);
  doc.text(`Amount Paid: KES ${payment.amountPaid}`);
  doc.text(`Payment Method: ${payment.paymentMethod}`);
  doc.moveDown();
  doc.text("Thank you for your payment!", { align: "center" });

  doc.end();
  return filePath;
};