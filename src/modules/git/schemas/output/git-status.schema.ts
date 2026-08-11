import { z } from "zod";

export const GitStatusOutputSchema = z.object({
  success: z.boolean(),
  content: z.object({
    currentBranch: z.string(),
    tracking: z.string().nullable(),
    isClean: z.boolean(),
    modified: z.array(z.string()),
    staged: z.array(z.string()),
    untracked: z.array(z.string()),
    branches: z.array(z.string())
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string()
  }).optional()
});

export type GitStatusOutput = z.infer<typeof GitStatusOutputSchema>;
