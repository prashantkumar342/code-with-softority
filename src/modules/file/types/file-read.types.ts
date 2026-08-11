import { z } from "zod";
import { FileReadOutputSchema } from "../schemas/output/file-read.schema.js";

export type FileReadReturn = z.infer<typeof FileReadOutputSchema>;
