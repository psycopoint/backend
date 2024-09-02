import { z } from "zod";

export const receiptSchema = z.object({
  id: z.string(), // Identificador único do recibo
  url: z.string().url(), // URL do recibo, validado como uma string que deve ser uma URL
  issueDate: z.string().datetime({ offset: true }), // Data de emissão do recibo, validada como uma string no formato ISO 8601
  amount: z.number().positive(), // Valor associado ao recibo, deve ser um número positivo
  description: z.string().optional(), // Descrição opcional do recibo
  method: z.enum(["pix", "credit_card"]), // Método de pagamento, usando enum para garantir que seja um dos valores especificados
  status: z.enum(["issued", "canceled"]), // Status do recibo, também usando enum para valores válidos
});

// Tipo inferido a partir do esquema zod
export type SelectReceipt = z.infer<typeof receiptSchema>;
export type InsertReceipt = Omit<SelectReceipt, "id" | "issueDate">;
