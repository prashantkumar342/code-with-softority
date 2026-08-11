import { z } from "zod";

export const FileNodeSchema = z.object({
  name: z.string(),
  type: z.enum(["file", "directory", "symlink", "other"]),
  size: z.number().optional(),
  path: z.string(),
});

export const FileListOutputSchema = z.object({
  success: z.boolean(),
  files: z.array(FileNodeSchema).optional(),
  error: z.object({
    code: z.string(),
    message: z.string()
  }).optional()
});

export type FileListOutput = z.infer<typeof FileListOutputSchema>;
