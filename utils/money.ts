export const convertTextualValue = (value: number | string): string => {
  const units = [
    "zero",
    "um",
    "dois",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
    "dez",
    "onze",
    "doze",
    "treze",
    "quatorze",
    "quinze",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dezenove",
  ];

  const tens = [
    "",
    "",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa",
  ];

  const hundreds = [
    "",
    "cento",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos",
  ];

  // #############################################

  const convertToText = (number: number): string => {
    if (number === 0) return "zero";

    if (number < 20) return units[number];
    if (number < 100)
      return `${tens[Math.floor(number / 10)]}${
        number % 10 !== 0 ? " e " + units[number % 10] : ""
      }`;
    if (number < 1000) {
      const hundredPart = Math.floor(number / 100);
      const rest = number % 100;
      return `${
        hundredPart === 1 && rest === 0 ? "cem" : hundreds[hundredPart]
      }${rest !== 0 ? " e " + convertToText(rest) : ""}`;
    }

    if (number < 1000000) {
      const thousandPart = Math.floor(number / 1000);
      const rest = number % 1000;
      return `${
        thousandPart === 1 ? "mil" : convertToText(thousandPart) + " mil"
      }${rest !== 0 ? " e " + convertToText(rest) : ""}`;
    }

    if (number < 1000000000) {
      const millionPart = Math.floor(number / 1000000);
      const rest = number % 1000000;
      return `${
        millionPart === 1
          ? "um milhão"
          : convertToText(millionPart) + " milhões"
      }${rest !== 0 ? " e " + convertToText(rest) : ""}`;
    }

    return "Número muito grande";
  };

  // #############################################
  const number = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(number) || number < 0) throw new Error("Invalid number");

  const [integerPart, decimalPart] = number.toFixed(2).split(".").map(Number);

  const integerText = convertToText(integerPart);
  const decimalText = decimalPart
    ? `${convertToText(decimalPart)} centavos`
    : "";

  return `${integerText} reais${decimalText ? " e " + decimalText : ""}`;
};
