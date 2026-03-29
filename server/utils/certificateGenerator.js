const PDFDocument = require("pdfkit");

function generateCertificatePdfBuffer({ studentName, matricNumber, dateString, departments }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("UNIVERSITY STUDENT CLEARANCE CERTIFICATE", { align: "center" });
    doc.moveDown(1.5);

    doc.fontSize(12).text(`This is to certify that:`);
    doc.moveDown(0.5);
    doc.fontSize(14).text(studentName, { continued: true }).fontSize(12).text(` (${matricNumber})`);
    doc.moveDown(0.75);
    doc.text("has successfully completed all departmental clearance requirements.");
    doc.moveDown(1);

    doc.fontSize(12).text("Cleared Departments:", { underline: true });
    doc.moveDown(0.5);
    for (const d of departments) {
      doc.text(`- ${d}`);
    }
    doc.moveDown(1.5);

    doc.text(`Issued on: ${dateString}`);
    doc.moveDown(2.5);

    doc.text("______________________________", { align: "left" });
    doc.text("Registrar / Authorized Signatory", { align: "left" });

    doc.end();
  });
}

module.exports = { generateCertificatePdfBuffer };

