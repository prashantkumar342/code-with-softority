import { z } from "zod";

export const ProjectMetadataSchema = z.object({
  id: z.uuid().describe("Unique identifier for the project"),
  name: z.string().describe("Name of the project based on directory or package.json"),
  path: z.string().describe("Absolute path to the project directory"),
  type: z.enum(["nestjs", "typescript", "javascript", "unknown"]).describe("Detected project type"),
  git: z.boolean().describe("True if a .git directory exists"),
  docker: z.boolean().describe("True if a Dockerfile or docker-compose.yml exists"),
});


export const RegisterProjectOutputSchema = z.object({
  content: z.array(
    z.object({
      type: z.string().describe("Content type"),
      text: z.string(),
    }),
  ),
});
