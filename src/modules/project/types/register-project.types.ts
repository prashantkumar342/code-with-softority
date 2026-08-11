import z from "zod";
import * as ProjectSchemas from "../schemas/index.js";
import { ProjectMetadata } from "./project.types.js";

export type RegisterProjectOutput = z.infer<typeof ProjectSchemas.RegisterProjectOutputSchema>;

export interface RegisterProjectReturn {
  success: boolean;
  metadata: ProjectMetadata;
}
