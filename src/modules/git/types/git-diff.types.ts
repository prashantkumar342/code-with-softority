import { z } from "zod";
import { GitDiffOutputSchema } from "../schemas/output/git-diff.schema.js";

export type GitDiffReturn = z.infer<typeof GitDiffOutputSchema>;
