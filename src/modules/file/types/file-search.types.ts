import { z } from "zod";
import { FileSearchOutputSchema, SearchMatchSchema } from "../schemas/output/file-search.schema.js";

export type SearchMatch = z.infer<typeof SearchMatchSchema>;
export type FileSearchReturn = z.infer<typeof FileSearchOutputSchema>;
