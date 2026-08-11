import { z } from "zod";
import { FileListOutputSchema, FileNodeSchema } from "../schemas/output/file-list.schema.js";

export type FileNode = z.infer<typeof FileNodeSchema>;
export type FileListReturn = z.infer<typeof FileListOutputSchema>;
