import { z } from "zod";

export const FileReadOutputSchema = z.object({
  success: z.boolean(),
  content: z.string().optional(),
  metadata: z.object({
    totalLines: z.number(),
    startLine: z.number().optional(),
    endLine: z.number().optional(),
    isBinary: z.boolean().default(false),
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string()
  }).optional()
});

export type FileReadOutput = z.infer<typeof FileReadOutputSchema>;
