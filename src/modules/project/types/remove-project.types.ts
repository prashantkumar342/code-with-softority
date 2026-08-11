import z from "zod";
import * as ProjectSchemas from "../schemas/index.js";

export type RemoveProjectInput = z.infer<typeof ProjectSchemas.RemoveProjectInputSchema>;
export type RemoveProjectOutput = z.infer<typeof ProjectSchemas.RemoveProjectOutputSchema>;

export interface RemoveProjectReturn {
  success: boolean;
  id: string;
}
