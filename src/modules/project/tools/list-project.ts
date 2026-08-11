import { ListProjectOutput } from "../types/index.js";
import { ListProjectService } from "../services/list-project.service.js";

const projectService = new ListProjectService();

export const listProjectTool = {
  toolName: "list_project",
  description: "List all tools that are registered for mcp",
  handler: async (args: { path: string }): Promise<ListProjectOutput> => {
    try {
      const result = await projectService.listProjects();
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
