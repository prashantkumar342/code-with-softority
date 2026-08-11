import { z } from "zod";

// define zod schema for input in Register Project tool
export const RegisterProjectInputSchema = z.object({
  path: z.string().describe("The absolute or relative path to the local project directory"),
});

// export type for Input Schema for better type safety
export type RegisterProjectInput = z.infer<typeof RegisterProjectInputSchema>;
