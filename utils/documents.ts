import { PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";
import Content from "twilio/lib/rest/Content";

// function to center text
const drawCenteredText = (
  text: string,
  y: number,
  font: any,
  size: number,
  color: any,
  page: PDFPage,
  width: number
) => {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (width - textWidth) / 2,
    y,
    size,
    font,
    color,
  });
};

// fucntion to break text in multiple lines
const drawWrappedText = (
  text: string,
  x: number,
  y: number,
  font: any,
  size: number,
  color: any,
  maxWidth: number,
  page: PDFPage
) => {
  const words = text.split(" ");
  let line = "";
  let lineHeight = size + 4;
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + " ";
    let testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && n > 0) {
      page.drawText(line, { x, y, size, font, color });
      line = words[n] + " ";
      y -= lineHeight;
    } else {
      line = testLine;
    }
  }
  page.drawText(line, { x, y, size, font, color });
};

type DocumentTypeProps = {
  config?: {
    showDate?: boolean;
    showSignature?: boolean;
    paddingBellowText?: number;
  };
  content: {
    title: string;
    text: string;
    crp: string;
    city: string;
    name: string;
    signature: string;
  };
};

// showDate = true,
// showSignature = true,
// paddingBelowReceiptText = 20,

export const createDocumentPdf = async (values: DocumentTypeProps) => {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const purpleColor = rgb(148 / 255, 103 / 255, 254 / 255);
  const page = pdfDoc.addPage([600, 550]);
  const { width, height } = page.getSize();

  // Logo
  const logoRes = await fetch("https://media.psycopoint.com/logo.png");
  if (!logoRes.ok) throw new Error("Failed to fetch logo image");
  const logoArrayBuffer = await logoRes.arrayBuffer();
  const logoBytes = new Uint8Array(logoArrayBuffer);
  const logo = await pdfDoc.embedPng(logoBytes);
  const logoDims = logo.scale(0.6);
  page.drawImage(logo, {
    x: (width - logoDims.width) / 2,
    y: height - logoDims.height - 50,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Title centered
  drawCenteredText(
    values.content.title,
    height - 150,
    helveticaFontBold,
    18,
    purpleColor,
    page,
    width
  );

  // Split the text into sentences
  const receiptArray = values.content.text
    .split("|")
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  let currentY = height - 200;

  // Center each sentence
  receiptArray.forEach((sentence) => {
    drawCenteredText(
      sentence,
      currentY,
      helveticaFont,
      12,
      rgb(0, 0, 0),
      page,
      width
    );
    currentY -= 20;
  });

  // Date and location
  if (values.config?.showDate || true) {
    const today = new Date();
    const dateText = `${values.content.city}, ${today.toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    )}`;
    drawCenteredText(
      dateText,
      currentY - 20,
      helveticaFontBold,
      14,
      rgb(0.5, 0.5, 0.5),
      page,
      width
    );
    currentY -= 40; // Adjust Y position for the next element
  }

  // Signature line
  if (values.config?.showSignature || true) {
    const signatureLineY = currentY - 60;
    drawCenteredText(
      "________________________",
      signatureLineY,
      helveticaFont,
      12,
      rgb(0, 0, 0),
      page,
      width
    );

    // Signature image
    const signRes = await fetch(values.content.signature);
    if (!signRes.ok) throw new Error("Failed to fetch signature image");
    const signArrayBuffer = await signRes.arrayBuffer();
    const signBytes = new Uint8Array(signArrayBuffer);
    const sign = await pdfDoc.embedPng(signBytes);
    const signDims = sign.scale(0.4);
    page.drawImage(sign, {
      x: (width - signDims.width) / 2,
      y: signatureLineY - 15,
      width: signDims.width,
      height: signDims.height,
    });

    // Name and CRP centered
    drawCenteredText(
      `${values.content.name}`,
      signatureLineY - 30,
      helveticaFont,
      12,
      rgb(0, 0, 0),
      page,
      width
    );
    drawCenteredText(
      `CRP: ${values.content.crp}`,
      signatureLineY - 50,
      helveticaFont,
      12,
      rgb(0, 0, 0),
      page,
      width
    );
  }

  // Add padding below receipt text if needed
  currentY -= values.config?.paddingBellowText || 40;

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
