import { z } from "zod";


export const RemoveProjectOutputSchema = z.object({
  content: z.array(
    z.object({
      type: z.string().describe("Content type"),
      text: z.string(),
    }),
  ),
});
