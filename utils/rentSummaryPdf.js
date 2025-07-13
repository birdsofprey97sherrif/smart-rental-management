exports.generateRentHistoryPDF = (payments, tenant, res) => {
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=rent-history.pdf`);
  doc.pipe(res);

  doc.fontSize(16).text("🏠 Smart Rental Management", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text("Full Rent Payment History", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Tenant: ${tenant.fullName}`);
  doc.moveDown();

  payments.forEach((p, index) => {
    doc.text(
      `${index + 1}. ${p.paymentDate.toDateString()} | KES ${p.amountPaid} | ${p.paymentMethod}`
    );
  });

  doc.moveDown().text("End of report", { align: "center" });
  doc.end();
};
exports.generateRentSummaryPDF = async (req, res) => {
  try {
    const tenantId = req.user.userId;
    const tenant = await User.findById(tenantId).select("fullName email phone");
    const payments = await RentPayment.find({ tenantId }).sort({ paymentDate: -1 });

    generateRentSummaryPDF(payments, tenant, res);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate rent summary" });
  }
};