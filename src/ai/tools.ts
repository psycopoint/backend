import { zodFunction } from "openai/helpers/zod.mjs";
import { z } from "zod";

export const UI = z.lazy(
  (): z.ZodObject<any> =>
    z.object({
      type: z.enum(["div", "button", "header", "section", "field", "form"]),
      label: z.string(),
      children: z.array(UI).optional(),
      attributes: z
        .array(
          z.object({
            name: z.string(),
            value: z.string(),
          })
        )
        .optional(),
    })
);
