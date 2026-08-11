import { z } from "zod";
import { ProjectMetadataSchema } from "../output/register-project.schema.js";

export const RemoveProjectInputSchema = z.object({
  projectId: ProjectMetadataSchema.shape.id,
});
