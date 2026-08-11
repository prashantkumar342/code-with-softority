import { z } from "zod";

export const GitDiffInputSchema = z.object({
  projectId: z.string().uuid("Invalid Project ID format"),
  filePath: z.string().optional().describe("Optional path to a specific file"),
  branch: z.string().optional().describe("Optional branch name to diff against"),
  commitHash: z.string().optional().describe("Optional commit hash to diff against"),
});

export type GitDiffInput = z.infer<typeof GitDiffInputSchema>;
