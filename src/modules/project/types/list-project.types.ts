import z from "zod";
import * as ProjectSchemas from "../schemas/index.js";
import { ProjectMetadata } from "./project.types.js";

export type ListProjectOutput = z.infer<typeof ProjectSchemas.ListProjectOutputSchema>;

export interface ListProjectReturn {
  success: boolean;
  projects: ProjectMetadata[];
}
