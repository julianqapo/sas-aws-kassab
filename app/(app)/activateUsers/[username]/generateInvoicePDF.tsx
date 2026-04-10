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

// Use jsPDF's built-in Arabic processing
function processArabicText(doc: jsPDF, text: string): string {
  if (!hasArabic(text)) return text;
  // jsPDF has a built-in processArabic that handles reshaping + ligatures + RTL
  return (doc as any).processArabic(text) || text;
}

async function loadArabicFont(doc: jsPDF): Promise<void> {
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

  const setFont = (d: jsPDF, style: "normal" | "bold", size: number) => {
    d.setFontSize(size);
    d.setFont("Amiri", style);
  };

  const centerText = (d: jsPDF, text: string, yPos: number, size: number, style: "normal" | "bold" = "normal") => {
    setFont(d, style, size);
    const processed = processArabicText(d, text);
    const tw = d.getTextWidth(processed);
    d.text(processed, (pageWidth - tw) / 2, yPos);
  };

  const rightText = (d: jsPDF, text: string, yPos: number, size: number, style: "normal" | "bold" = "normal") => {
    setFont(d, style, size);
    const processed = processArabicText(d, text);
    const tw = d.getTextWidth(processed);
    d.text(processed, pageWidth - margin - tw, yPos);
  };

  const leftText = (d: jsPDF, text: string, yPos: number, size: number, style: "normal" | "bold" = "normal") => {
    setFont(d, style, size);
    const processed = processArabicText(d, text);
    d.text(processed, margin, yPos);
  };

  const dashedLine = (d: jsPDF, yPos: number) => {
    d.setLineDashPattern([1, 1], 0);
    d.setLineWidth(0.2);
    d.line(margin, yPos, pageWidth - margin, yPos);
  };

  // old code for invoice total was not correct 
// const formattedAmount = new Intl.NumberFormat("en-US", {
//   maximumFractionDigits: 0,
// }).format(Number(invoice.amount)) + " د.ع";

// new code
const formattedAmount = getPriceFromInput(invoice.description);

  const statusText = invoice.paid ? "مدفوعة" : "غير مدفوعة";

 const renderContent = (d: jsPDF): number => {
    let y = 4;

    centerText(d, "فاتورة", y, 10, "bold"); y += 5;
    dashedLine(d, y); y += 4;

    centerText(d, invoice.invoice_number, y, 7, "bold"); y += 5;

    // Customer — label and colon separate
    rightText(d, "الزبون", y, 6, "bold");
    // Place colon just left of the label
    setFont(d, "bold", 6);
    const labelW1 = d.getTextWidth(processArabicText(d, "الزبون"));
    d.text(":", pageWidth - margin - labelW1 - 1, y);
    y += 3.5;
    rightText(d, customerName, y, 7, "normal"); y += 5;

    dashedLine(d, y); y += 4;

    // Description
    rightText(d, "الوصف", y, 6, "bold");
    setFont(d, "bold", 6);
    const labelW2 = d.getTextWidth(processArabicText(d, "الوصف"));
    d.text(":", pageWidth - margin - labelW2 - 1, y);
    y += 3.5;
    setFont(d, "normal", 6);
    const processedDesc = processArabicText(d, invoice.description);
    // const processedDesc = "كوكو"
    const descLines = d.splitTextToSize(processedDesc, contentWidth);
    for (const line of descLines) {
      const tw = d.getTextWidth(line);
      d.text(line, pageWidth - margin - tw, y);
      y += 3;
    }
    y += 2;

    // Date
    rightText(d, "التاريخ", y, 6, "bold");
    setFont(d, "bold", 6);
    const labelW3 = d.getTextWidth(processArabicText(d, "التاريخ"));
    d.text(":", pageWidth - margin - labelW3 - 1, y);
    leftText(d, invoice.created_at.split(" ")[0], y, 6, "normal"); y += 4;

    // Due Date
    rightText(d, "تاريخ الاستحقاق", y, 6, "bold");
    setFont(d, "bold", 6);
    const labelW4 = d.getTextWidth(processArabicText(d, "تاريخ الاستحقاق"));
    d.text(":", pageWidth - margin - labelW4 - 1, y);
    leftText(d, invoice.due_date.split(" ")[0], y, 6, "normal"); y += 4;

    // Type
    rightText(d, "النوع", y, 6, "bold");
    setFont(d, "bold", 6);
    const labelW5 = d.getTextWidth(processArabicText(d, "النوع"));
    d.text(":", pageWidth - margin - labelW5 - 1, y);
    leftText(d, invoice.type.toUpperCase(), y, 6, "normal"); y += 4;

    // Payment method
    if (invoice.payment_method) {
      rightText(d, "طريقة الدفع", y, 6, "bold");
      setFont(d, "bold", 6);
      const labelW6 = d.getTextWidth(processArabicText(d, "طريقة الدفع"));
      d.text(":", pageWidth - margin - labelW6 - 1, y);
      leftText(d, invoice.payment_method, y, 6, "normal"); y += 4;
    }

    y += 1; dashedLine(d, y); y += 5;

    // Total
    centerText(d, "المجموع", y, 6, "bold"); y += 4;

    // Amount — don't process through Arabic, render as-is centered
    setFont(d, "bold", 10);
    const amountW = d.getTextWidth(formattedAmount);
    d.text(formattedAmount, (pageWidth - amountW) / 2, y);
    y += 5;

    // Status
    centerText(d, statusText, y, 8, "bold"); y += 5;

    dashedLine(d, y); y += 4;
    centerText(d, "شكراً لكم", y, 6, "normal"); y += 3;

    // Time — plain text, no Arabic processing
    setFont(d, "normal", 5);
    const timeStr = invoice.created_at.split(" ")[1] || "";
    const timeW = d.getTextWidth(timeStr);
    d.text(timeStr, (pageWidth - timeW) / 2, y);

    return y;
  };

  // First pass — measure
  const measureDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageWidth, 120] });
  await loadArabicFont(measureDoc);
  const finalY = renderContent(measureDoc);

  // Second pass — trimmed page
  const trimmedDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageWidth, finalY + 4] });
  await loadArabicFont(trimmedDoc);
  renderContent(trimmedDoc);

    // Output
  if (action === "print") {
 const pdfDataUri = trimmedDoc.output("datauristring");
    
    let iframe = document.getElementById("invoice-print-frame") as HTMLIFrameElement | null;
    if (iframe) iframe.remove();
    
    iframe = document.createElement("iframe");
    iframe.id = "invoice-print-frame";
    iframe.style.display = "none";
    iframe.src = pdfDataUri;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe!.contentWindow?.focus();
      iframe!.contentWindow?.print();
    };
  } else {
    trimmedDoc.save(`invoice-${invoice.invoice_number}.pdf`);
  }
}


// sort out the orice for in the invoice
/**
 * Maps a profile/service name to its price based on keywords.
 * @param input The string to check (e.g., "Service: nova-60")
 * @returns The formatted price string or "Price Not Found"
 */
export function getPriceFromInput(input: string): string {
  const prices: Record<string, string> = {
    "nova-35": "35,000",
    "nova-40": "40,000",
    "nova-60": "45,000",
    "nova-100": "65,000"
  };

  // Find the first key that is included in the input string
  const foundKey = Object.keys(prices).find(key => 
    input.toLowerCase().includes(key.toLowerCase())
  );

  return foundKey ? prices[foundKey] + " د.ع" : "Price Not Found";
}