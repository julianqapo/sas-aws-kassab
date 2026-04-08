import jsPDF from "jspdf";

interface InvoiceData {
  id: number;
  invoice_number: string;
  type: string;
  amount: string;
  description: string;
  paid: number;
  created_by: number;
  created_at: string;
  payment_method: string | null;
  due_date: string;
}

interface UserInfo {
  firstname: string;
  lastname: string;
}

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

import arabicReshaper from "arabic-reshaper";

function reshapeArabic(text: string): string {
  if (!hasArabic(text)) return text;
  
  // The arabic-reshaper v1.1.0 exports an object with convertArabic method
  let reshapeFn: any;
  if (typeof arabicReshaper === "function") {
    reshapeFn = arabicReshaper;
  } else if (arabicReshaper && typeof (arabicReshaper as any).convertArabic === "function") {
    reshapeFn = (arabicReshaper as any).convertArabic;
  } else if (arabicReshaper && typeof (arabicReshaper as any).default?.convertArabic === "function") {
    reshapeFn = (arabicReshaper as any).default.convertArabic;
  } else {
    reshapeFn = (arabicReshaper as any)?.reshape || (arabicReshaper as any)?.default;
  }

  if (typeof reshapeFn !== "function") {
    console.error("Could not find arabic reshaper function", arabicReshaper);
    return text;
  }

  const reshaped = reshapeFn(text);
  return reshaped.split("").reverse().join("");
}

async function loadArabicSupport(doc: jsPDF): Promise<void> {
  const fontUrl = "https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf";
  const response = await fetch(fontUrl);
  const buffer = await response.arrayBuffer();

  const binary = new Uint8Array(buffer);
  let raw = "";
  const chunkSize = 8192;
  for (let i = 0; i < binary.length; i += chunkSize) {
    raw += String.fromCharCode(...binary.subarray(i, i + chunkSize));
  }
  const fontBase64 = btoa(raw);

  doc.addFileToVFS("Amiri-Regular.ttf", fontBase64);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.addFont("Amiri-Regular.ttf", "Amiri", "bold");
}

export async function generateInvoicePDF(
  invoice: InvoiceData,
  user: UserInfo,
  action: "download" | "print" = "download"
) {
  const pageWidth = 45;
  const margin = 3;
  const contentWidth = pageWidth - margin * 2;

  const customerName = `${user.firstname} ${user.lastname}`;
  const needsArabic = hasArabic(customerName) || hasArabic(invoice.description);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageWidth, 120] });

  if (needsArabic) {
    await loadArabicSupport(doc);
  }

  const setFont = (d: jsPDF, style: "normal" | "bold", size: number) => {
    d.setFontSize(size);
    d.setFont(needsArabic ? "Amiri" : "helvetica", style);
  };

  const displayName = reshapeArabic(customerName);
  const displayDesc = reshapeArabic(invoice.description);

  const centerText = (d: jsPDF, text: string, yPos: number, size: number, style: "normal" | "bold" = "normal") => {
    setFont(d, style, size);
    const tw = d.getTextWidth(text);
    d.text(text, (pageWidth - tw) / 2, yPos);
  };

  const leftText = (d: jsPDF, text: string, yPos: number, size: number, style: "normal" | "bold" = "normal") => {
    setFont(d, style, size);
    d.text(text, margin, yPos);
  };

  const rightText = (d: jsPDF, text: string, yPos: number, size: number, style: "normal" | "bold" = "normal") => {
    setFont(d, style, size);
    const tw = d.getTextWidth(text);
    d.text(text, pageWidth - margin - tw, yPos);
  };

  const dashedLine = (d: jsPDF, yPos: number) => {
    d.setLineDashPattern([1, 1], 0);
    d.setLineWidth(0.2);
    d.line(margin, yPos, pageWidth - margin, yPos);
  };

  const formattedAmount = new Intl.NumberFormat("ar-IQ", {
    style: "currency",
    currency: "IQD",
    maximumFractionDigits: 0,
  }).format(Number(invoice.amount));

  const status = invoice.paid ? "PAID" : "UNPAID";

  const renderContent = (d: jsPDF): number => {
    let y = 4;

    centerText(d, "INVOICE", y, 10, "bold"); y += 5;
    dashedLine(d, y); y += 4;

    centerText(d, invoice.invoice_number, y, 7, "bold"); y += 5;

    leftText(d, "Customer:", y, 6, "bold"); y += 3.5;
    if (hasArabic(customerName)) {
      rightText(d, displayName, y, 7, "normal");
    } else {
      leftText(d, displayName, y, 7, "normal");
    }
    y += 5;

    dashedLine(d, y); y += 4;

    leftText(d, "Description:", y, 6, "bold"); y += 3.5;
    setFont(d, "normal", 6);
    const descLines = d.splitTextToSize(displayDesc, contentWidth);
    d.text(descLines, margin, y);
    y += descLines.length * 3 + 2;

    leftText(d, "Date:", y, 6, "bold");
    rightText(d, invoice.created_at.split(" ")[0], y, 6, "normal"); y += 4;

    leftText(d, "Due Date:", y, 6, "bold");
    rightText(d, invoice.due_date.split(" ")[0], y, 6, "normal"); y += 4;

    leftText(d, "Type:", y, 6, "bold");
    rightText(d, invoice.type.toUpperCase(), y, 6, "normal"); y += 4;

    if (invoice.payment_method) {
      leftText(d, "Payment:", y, 6, "bold");
      rightText(d, invoice.payment_method, y, 6, "normal"); y += 4;
    }

    y += 1; dashedLine(d, y); y += 5;

    centerText(d, "TOTAL", y, 6, "bold"); y += 4;
    centerText(d, formattedAmount, y, 10, "bold"); y += 5;
    centerText(d, status, y, 8, "bold"); y += 5;

    dashedLine(d, y); y += 4;
    centerText(d, "Thank you!", y, 6, "normal"); y += 3;
    centerText(d, invoice.created_at.split(" ")[1] || "", y, 5, "normal");

    return y;
  };

  const finalY = renderContent(doc);

  const trimmedDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageWidth, finalY + 4] });
  if (needsArabic) {
    await loadArabicSupport(trimmedDoc);
  }
  renderContent(trimmedDoc);

  if (action === "print") {
    const pdfBlob = trimmedDoc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
  } else {
    trimmedDoc.save(`invoice-${invoice.invoice_number}.pdf`);
  }
}