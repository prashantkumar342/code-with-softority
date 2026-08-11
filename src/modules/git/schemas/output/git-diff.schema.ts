import { z } from "zod";

export const GitDiffOutputSchema = z.object({
  success: z.boolean(),
  content: z.string().optional(),
  error: z.object({
    code: z.string(),
    message: z.string()
  }).optional()
});

export type GitDiffOutput = z.infer<typeof GitDiffOutputSchema>;
