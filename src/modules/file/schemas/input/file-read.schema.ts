import { z } from "zod";

export const FileReadInputSchema = z
  .object({
    projectId: z.uuid("Invalid Project ID format"),
    path: z.string().min(1, "Path is required"),
    startLine: z.number().int().min(1).optional(),
    endLine: z.number().int().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.startLine !== undefined && data.endLine !== undefined) {
        return data.endLine >= data.startLine;
      }
      return true;
    },
    {
      message: "endLine must be greater than or equal to startLine",
      path: ["endLine"],
    },
  );

export type FileReadInput = z.infer<typeof FileReadInputSchema>;
