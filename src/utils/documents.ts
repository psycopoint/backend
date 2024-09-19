import {
  SelectDiagram,
  SelectDocument,
  SelectPatient,
  SelectPsychologist,
  SelectUser,
} from "@/db/schemas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { convertTextualValue } from "./money";
import dayjs from "dayjs";

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
    `Diagrama do Paciente: ${values.patient.firstName} ${values.patient.lastName}`,
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

// docuemnt
export const createReceiptPdf = async (values: {
  patient: SelectPatient;
  document: SelectDocument & { data: { amount: string; description: string } };
  user: SelectUser & SelectPsychologist;
}) => {
  // Criação do documento PDF
  const pdfDoc = await PDFDocument.create();

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cor personalizada
  const purpleColor = rgb(148 / 255, 103 / 255, 254 / 255);

  // Logo
  const logoRes = await fetch("https://media.psycohub.com/psycopoint-logo.png");
  if (!logoRes.ok) throw new Error("Failed to fetch image");
  const logoArrayBuffer = await logoRes.arrayBuffer();
  const logoBytes = new Uint8Array(logoArrayBuffer);
  const logo = await pdfDoc.embedPng(logoBytes);

  // Assinatura
  const signRes = await fetch("https://media.psycohub.com/sign.png");
  if (!signRes.ok) throw new Error("Failed to fetch image");
  const signArrayBuffer = await signRes.arrayBuffer();
  const signBytes = new Uint8Array(signArrayBuffer);
  const sign = await pdfDoc.embedPng(signBytes);

  // Adicionar página
  const page = pdfDoc.addPage([600, 550]);
  const { width, height } = page.getSize();

  // Redimensionar e desenhar o logo
  const logoDims = logo.scale(0.6);
  page.drawImage(logo, {
    x: (width - logoDims.width) / 2,
    y: height - logoDims.height - 30,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Função auxiliar para centralizar texto
  const drawCenteredText = (
    text: string,
    y: number,
    font: any,
    size: number,
    color: any
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

  // Função para dividir texto em várias linhas
  const drawWrappedText = (
    text: string,
    x: number,
    y: number,
    font: any,
    size: number,
    color: any,
    lineHeight: number,
    maxWidth: number
  ) => {
    const words = text.split(" ");
    let line = "";
    let lines = [];

    words.forEach((word) => {
      const testLine = line + word + " ";
      const testWidth = font.widthOfTextAtSize(testLine, size);
      if (testWidth > maxWidth) {
        lines.push(line.trim());
        line = word + " ";
      } else {
        line = testLine;
      }
    });
    lines.push(line.trim());

    lines.forEach((line, index) => {
      const yOffset = y - index * lineHeight;
      const textWidth = font.widthOfTextAtSize(line, size);
      page.drawText(line, {
        x: (width - textWidth) / 2,
        y: yOffset,
        size,
        font,
        color,
      });
    });
  };

  // Título: "Recibo de Pagamento" centralizado
  drawCenteredText(
    "Recibo de Pagamento",
    height - 150,
    helveticaFontBold,
    18,
    purpleColor
  );

  // Texto do recibo
  const patientCpf = values.patient.cpf || "Não informado";
  const amount = values.document.data.amount;
  const textualAmount = convertTextualValue(amount);

  const receiptText = `Eu ${values.user.name}, ${
    values.user.gender === "female"
      ? "portadora"
      : values.user.gender === "male"
      ? "portador"
      : "portador(a)"
  } do CPF: ${values.user.cpf}, recebi de ${values.patient.firstName} ${
    values.patient.lastName
  }, ${
    values.patient.gender === "female"
      ? "portadora"
      : values.patient.gender === "male"
      ? "portador"
      : "portador(a)"
  } do CPF: ${patientCpf}, a importância de R$ ${amount} (${textualAmount}), ${
    values.document.data.description
  }`;

  drawWrappedText(
    receiptText,
    50,
    height - 200,
    helveticaFont,
    12,
    rgb(0, 0, 0),
    16,
    width - 100
  );

  // Data e local
  const today = new Date();
  const dateText = `São Paulo, ${today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}`;
  drawCenteredText(
    dateText,
    height - 300,
    helveticaFontBold,
    14,
    rgb(0.5, 0.5, 0.5)
  );

  // Linha de Assinatura
  const signatureLineY = height - 400;
  drawCenteredText(
    "________________________",
    signatureLineY,
    helveticaFont,
    12,
    rgb(0, 0, 0)
  );

  // Assinatura (Imagem) logo acima da linha
  const signDims = sign.scale(0.2);
  page.drawImage(sign, {
    x: (width - signDims.width) / 2,
    y: signatureLineY - 15,
    width: signDims.width,
    height: signDims.height,
  });

  // Nome e CRP centralizados
  drawCenteredText(
    `${values.user.name}`,
    signatureLineY - 20,
    helveticaFont,
    12,
    rgb(0, 0, 0)
  );
  drawCenteredText(
    `CRP: ${values.user.crp}`,
    signatureLineY - 40,
    helveticaFont,
    12,
    rgb(0, 0, 0)
  );

  // Salvar o PDF
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
