import { z } from "zod";

export const SearchMatchSchema = z.object({
  filePath: z.string(),
  lineNumber: z.number(),
  snippet: z.string()
});

export const FileSearchOutputSchema = z.object({
  success: z.boolean(),
  matches: z.array(SearchMatchSchema).optional(),
  totalMatches: z.number().optional(),
  error: z.object({
    code: z.string(),
    message: z.string()
  }).optional()
});

export type FileSearchOutput = z.infer<typeof FileSearchOutputSchema>;
