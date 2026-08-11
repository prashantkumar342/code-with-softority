import { RegisterProjectService } from "../services/register-project.service.js";
import { RegisterProjectInputSchema } from "../schemas/input/register-project.schema.js";
import { stderr } from "node:process";
import { RegisterProjectOutput } from "../types/index.js";

const projectService = new RegisterProjectService();

export const registerProjectTool = {
  toolName: "project_register",
  description: "Register a local project directory for MCP to manage",
  inputSchema: RegisterProjectInputSchema,
  handler: async (args: { path: string }): Promise<RegisterProjectOutput> => {
    try {
      const result = await projectService.registerProject(args.path);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error: any) {
      throw error;
    }
  },
};
