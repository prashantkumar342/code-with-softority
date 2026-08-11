import { z } from "zod";


export const ListProjectOutputSchema = z.object({
  content: z.array(
    z.object({
      type: z.string().describe("Content type"),
      text: z.string(),
    }),
  ),
});


export type ListProjectOutputSchema = z.infer<typeof ListProjectOutputSchema>;
