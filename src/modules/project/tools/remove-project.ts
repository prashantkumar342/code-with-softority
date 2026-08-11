import { RemoveProjectInputSchema } from "../schemas/index.js";
import { RemoveProjectService } from "../services/remove-project.service.js";
import { RemoveProjectOutput } from "../types/index.js";

const projectService = new RemoveProjectService();

export const removeProjectTool = {
  toolName: "remove_project",
  description: "Remove a project by its ID",
  inputSchema: RemoveProjectInputSchema,
  handler: async (args: { projectId: string }): Promise<RemoveProjectOutput> => {
    try {
      const parsedArgs = RemoveProjectInputSchema.parse(args);
      const result = await projectService.removeProject(parsedArgs.projectId);
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
