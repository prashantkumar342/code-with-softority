import z from "zod";
import * as ProjectSchemas from "../schemas/index.js";

export type ProjectMetadata = z.infer<typeof ProjectSchemas.ProjectMetadataSchema>;
