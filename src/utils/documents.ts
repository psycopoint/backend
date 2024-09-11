import { SelectDiagram, SelectDocument, SelectPatient } from "@/db/schemas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// docuemnt
export const createDocumentPdf = async (values: {
  patient: SelectPatient;
  document: SelectDocument;
}) => {
  // SETUP
  const pdfDoc = await PDFDocument.create();

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // LOGO
  // Fetch the image from URL
  const response = await fetch(
    "https://media.psycohub.com/psycopoint-logo.png"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch image");
  }
  const imageArrayBuffer = await response.arrayBuffer();
  const imageBytes = new Uint8Array(imageArrayBuffer);
  const logo = await pdfDoc.embedPng(imageBytes);

  const pupleColor = rgb(148 / 255, 103 / 255, 254 / 255);

  // Add a page to the document
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();

  // Get the original dimensions of the logo
  const logoDims = logo.scale(0.5); // Scale the logo if needed
  const originalWidth = logoDims.width;
  const originalHeight = logoDims.height;
  const aspectRatio = originalWidth / originalHeight;

  // Calculate new dimensions for the image
  const newWidth = originalWidth + 60; // Increase width
  const newHeight = newWidth / aspectRatio; // Maintain aspect ratio

  // Calculate the position to center the image horizontally
  const xPosition = (width - newWidth) / 2;

  // Calculate the position to place the image at the top
  const yPosition = height - newHeight;

  // Draw the image
  page.drawImage(logo, {
    x: xPosition,
    y: yPosition + -30,
    width: newWidth,
    height: newHeight,
  });

  // draw title
  page.drawText(
    `Diagrama do Paciente: ${values.patient.firstName}${values.patient.lastName}`,
    {
      x: 50,
      y: height - 100,
      size: 20,
      font: timesRomanFont,
      color: pupleColor,
    }
  );

  // Draw the JSON values text
  page.drawText(JSON.stringify(values.document, null, 2), {
    x: 50,
    y: height - 100,
    size: 20,
    font: timesRomanFont,
    color: pupleColor,
  });

  // Save the PDF and get the bytes
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};

// diagram
export const createDiagramPdf = async (values: {
  patient: SelectPatient;
  diagram: SelectDiagram;
}) => {
  // SETUP
  const pdfDoc = await PDFDocument.create();

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // LOGO
  // Fetch the image from URL
  const response = await fetch(
    "https://media.psycohub.com/psycopoint-logo.png"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch image");
  }
  const imageArrayBuffer = await response.arrayBuffer();
  const imageBytes = new Uint8Array(imageArrayBuffer);
  const logo = await pdfDoc.embedPng(imageBytes);

  const pupleColor = rgb(148 / 255, 103 / 255, 254 / 255);

  // Add a page to the document
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();

  // Get the original dimensions of the logo
  const logoDims = logo.scale(0.5); // Scale the logo if needed
  const originalWidth = logoDims.width;
  const originalHeight = logoDims.height;
  const aspectRatio = originalWidth / originalHeight;

  // Calculate new dimensions for the image
  const newWidth = originalWidth + 60; // Increase width
  const newHeight = newWidth / aspectRatio; // Maintain aspect ratio

  // Calculate the position to center the image horizontally
  const xPosition = (width - newWidth) / 2;

  // Calculate the position to place the image at the top
  const yPosition = height - newHeight;

  // Draw the image
  page.drawImage(logo, {
    x: xPosition,
    y: yPosition + -30,
    width: newWidth,
    height: newHeight,
  });

  // Draw the JSON values text
  page.drawText(
    `Diagrama do Paciente: ${values.patient.firstName}${values.patient.lastName}`,
    {
      x: 50,
      y: height - 100,
      size: 20,
      font: timesRomanFont,
      color: pupleColor,
    }
  );

  // Save the PDF and get the bytes
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};
