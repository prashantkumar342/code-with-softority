import { z } from "zod";

export const FileListInputSchema = z.object({
  projectId: z.uuid("Invalid Project ID format"),
  path: z.string().default("."),
  recursive: z.boolean().default(false),
  includeHidden: z.boolean().default(false),
  maxDepth: z.number().int().min(1).max(20).default(5)
});

export type FileListInput = z.infer<typeof FileListInputSchema>;
