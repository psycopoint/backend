import {
  SelectDiagram,
  SelectDocument,
  SelectPatient,
  SelectPsychologist,
  SelectUser,
} from "../db/schemas";
import { PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";
import { convertTextualValue } from "./money";

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
  const response = await fetch("https://media.psycopoint.com/logo.png");
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

// receipt
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
  const logoRes = await fetch("https://media.psycopoint.com/logo.png");
  if (!logoRes.ok) throw new Error("Failed to fetch image");
  const logoArrayBuffer = await logoRes.arrayBuffer();
  const logoBytes = new Uint8Array(logoArrayBuffer);
  const logo = await pdfDoc.embedPng(logoBytes);

  // Assinatura
  const signRes = await fetch("https://media.psycopoint.com/sign.png");
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

  // Título: "Recibo de Pagamento" centralizado
  drawCenteredText(
    "Recibo de Pagamento",
    height - 150,
    helveticaFontBold,
    18,
    purpleColor,
    page,
    width
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
    page
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
    rgb(0.5, 0.5, 0.5),
    page,
    width
  );

  // Linha de Assinatura
  const signatureLineY = height - 400;
  drawCenteredText(
    "________________________",
    signatureLineY,
    helveticaFont,
    12,
    rgb(0, 0, 0),
    page,
    width
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
    rgb(0, 0, 0),
    page,
    width
  );
  drawCenteredText(
    `CRP: ${values.user.crp}`,
    signatureLineY - 40,
    helveticaFont,
    12,
    rgb(0, 0, 0),
    page,
    width
  );

  // Salvar o PDF
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};

// certificate
export const createCertificatePdf = async (values: {
  patient: SelectPatient;
  document: SelectDocument & { data: { description: string; daysOff: string } };
  user: SelectUser & SelectPsychologist;
}) => {
  const pdfDoc = await PDFDocument.create();

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cor personalizada
  const purpleColor = rgb(148 / 255, 103 / 255, 254 / 255);

  // Logo
  const logoRes = await fetch("https://media.psycopoint.com/logo.png");
  if (!logoRes.ok) throw new Error("Failed to fetch image");
  const logoArrayBuffer = await logoRes.arrayBuffer();
  const logoBytes = new Uint8Array(logoArrayBuffer);
  const logo = await pdfDoc.embedPng(logoBytes);

  // Assinatura
  const signRes = await fetch("https://media.psycopoint.com/sign.png");
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

  // Título: "Atestado" centralizado
  drawCenteredText(
    "Atestado",
    height - 150,
    helveticaFontBold,
    24,
    purpleColor,
    page,
    width
  );

  // Texto do atestado
  const patientCpf = values.patient.cpf || "Não informado";
  const certificateText = `Eu ${
    values.user.name
  }, psicólogo com registro no CRP: ${values.user.crp}, atesto que ${
    values.patient.firstName
  } ${values.patient.lastName}, ${
    values.patient.gender === "female"
      ? "portadora"
      : values.patient.gender === "male"
      ? "portador"
      : "portador(a)"
  } do CPF: ${patientCpf}, compareceu ao atendimento psicológico no dia ${new Date().toLocaleDateString(
    "pt-BR"
  )}, e necessita de afastamento de suas atividades laborais por ${
    values.document.data.daysOff
  } ${
    parseInt(values.document.data.daysOff) === 1 ? "dia" : "dias"
  }, devido a ${values.document.data.description}.`;

  // Desenhar o texto quebrado em várias linhas
  drawWrappedText(
    certificateText,
    50, // margem esquerda
    height - 200,
    helveticaFont,
    12,
    rgb(0, 0, 0),
    width - 100,
    page
  );

  // Data e local
  const dateText = `São Paulo, ${new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}`;
  drawCenteredText(
    dateText,
    height - 300,
    helveticaFontBold,
    14,
    rgb(0.5, 0.5, 0.5),
    page,
    width
  );

  // Linha de Assinatura
  const signatureLineY = height - 400;
  drawCenteredText(
    "________________________",
    signatureLineY,
    helveticaFont,
    12,
    rgb(0, 0, 0),
    page,
    width
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
    rgb(0, 0, 0),
    page,
    width
  );
  drawCenteredText(
    `CRP: ${values.user.crp}`,
    signatureLineY - 40,
    helveticaFont,
    12,
    rgb(0, 0, 0),
    page,
    width
  );

  // Salvar o PDF
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
};

// declaration
export const createHoursDeclarationPdf = async (values: {
  patient: SelectPatient;
  document: SelectDocument & {
    data: {
      description: string;
      daysOff: string;
      startTime: string;
      endTime: string;
    };
  };
  user: SelectUser & SelectPsychologist;
}) => {
  const pdfDoc = await PDFDocument.create();

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cor personalizada
  const purpleColor = rgb(148 / 255, 103 / 255, 254 / 255);

  // Logo
  const logoRes = await fetch("https://media.psycopoint.com/logo.png");
  if (!logoRes.ok) throw new Error("Failed to fetch image");
  const logoArrayBuffer = await logoRes.arrayBuffer();
  const logoBytes = new Uint8Array(logoArrayBuffer);
  const logo = await pdfDoc.embedPng(logoBytes);

  // Assinatura
  const signRes = await fetch("https://media.psycopoint.com/sign.png");
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

  // Título: "Declaração de Horas" centralizado
  drawCenteredText(
    "Declaração de Horas",
    height - 150,
    helveticaFontBold,
    24,
    purpleColor
  );

  // Texto da declaração
  const patientCpf = values.patient.cpf || "Não informado";
  const declarationText = `Eu ${values.user.name}, psicólogo com registro no CRP ${values.user.crp}, declaro que ${values.patient.firstName} ${values.patient.lastName}, portador(a) do CPF: ${patientCpf}, compareceu ao atendimento psicológico no dia ${values.document.createdAt} das ${values.document.data.startTime} às ${values.document.data.endTime}.`;

  // Desenhar o texto quebrado em várias linhas, se necessário
  const drawTextWithWrapping = (
    text: string,
    x: number,
    y: number,
    font: any,
    size: number,
    color: any,
    maxWidth: number
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

  drawTextWithWrapping(
    declarationText,
    50, // margem esquerda
    height - 200,
    helveticaFont,
    12,
    rgb(0, 0, 0),
    width - 100 // largura máxima do texto (margem direita)
  );

  // Data e local
  const dateText = `São Paulo, ${new Date().toLocaleDateString("pt-BR", {
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
