import { z } from "zod";

/**
 * Zod schema for the Redaction interface
 */
export const RedactionSchema = z
  .object({
    id: z.string({ description: "unique identifier for the redaction" }),
    type: z.enum(
      ["name", "address", "phone", "email", "ip", "credit-card", "other", "MANUAL_PII"],
      {
        description: "type of the redaction",
      }
    ),
    confidence: z
      .number({ description: "confidence of the redaction" })
      .min(0)
      .max(1),
    start: z
      .number({ description: "start index of the redaction" })
      .int()
      .nonnegative(),
    end: z
      .number({ description: "end index of the redaction" })
      .int()
      .nonnegative(),
    text: z.string({ description: "the redacted text content" }).optional(),
  })
  .refine((data) => data.end >= data.start, {
    message: "End index must be greater than or equal to start index",
    path: ["end"], // This shows the error on the end field
  });

export type Redaction = z.infer<typeof RedactionSchema>;
