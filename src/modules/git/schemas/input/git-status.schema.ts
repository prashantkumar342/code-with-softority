import { z } from "zod";

export const GitStatusInputSchema = z.object({
  projectId: z.uuid("Invalid Project ID format"),
});

export type GitStatusInput = z.infer<typeof GitStatusInputSchema>;
