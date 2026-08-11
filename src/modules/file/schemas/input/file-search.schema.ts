import { z } from "zod";

export const FileSearchInputSchema = z.object({
  projectId: z.uuid("Invalid Project ID format"),
  query: z.string().min(1, "Search query is required"),
  path: z.string().default("."),
  fileTypes: z.array(z.string()).optional(),
  caseSensitive: z.boolean().default(false),
  maxResults: z.number().int().min(1).max(1000).default(100),
});

export type FileSearchInput = z.infer<typeof FileSearchInputSchema>;
