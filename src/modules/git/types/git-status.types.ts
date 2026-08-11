import { z } from "zod";
import { GitStatusOutputSchema } from "../schemas/output/git-status.schema.js";

export type GitStatusReturn = z.infer<typeof GitStatusOutputSchema>;
