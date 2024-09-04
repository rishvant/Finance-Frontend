import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";

export const generateInvoicePDF = async (purchase) => {
    const doc = new jsPDF("portrait", "pt", "A4");

    // Title
    doc.setFontSize(18);
    doc.text("Invoice", 40, 40);

    // Invoice Number and Date
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${purchase.invoiceNumber}`, 40, 70);
    doc.text(`Invoice Date: ${purchase.invoiceDate}`, 40, 90);

    // Transporter Details
    doc.text(`Transport: ${purchase.transporterId.transport}`, 40, 110);
    doc.text(`Transport Agency: ${purchase.transporterId.transportAgency}`, 40, 130);
    doc.text(`Transport Contact: ${purchase.transporterId.transportContact}`, 40, 150);

    // Warehouse Details
    doc.text(`Warehouse: ${purchase.warehouseId.name}`, 40, 170);

    // Order Details
    if (purchase.orderId) {
        doc.text(`Order Number: ${purchase.orderId.companyBargainNo}`, 40, 190);
    }

    // Items Table
    const items = purchase.items.map((item, index) => [
        index + 1,
        item.itemId.name,
        item.itemId.packaging,
        item.itemId.staticPrice,
        item.itemId.type,
        item.itemId.weight,
        item.quantity,
    ]);

    doc.autoTable({
        head: [["#", "Item Name", "Packaging", "Static Price", "Type", "Weight", "Quantity"]],
        body: items,
        startY: 210,
        theme: "grid",
        styles: {
            fontSize: 10,
            textColor: [0, 0, 0],
        },
    });

    // Footer
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 40, doc.internal.pageSize.height - 30);

    // Save the PDF
    doc.save(`invoice_${purchase.invoiceNumber}.pdf`);
};
