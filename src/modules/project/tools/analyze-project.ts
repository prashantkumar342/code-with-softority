import { AnalyzeProjectInputSchema } from "../schemas/index.js";
import { AnalyzeProjectService } from "../services/analyze-project.service.js";
import { AnalyzeProjectOutput } from "../types/index.js";

const projectService = new AnalyzeProjectService();

export const analyzeProjectTool = {
  toolName: "analyze_project",
  description: "Perform a deep analysis of a registered project to provide context",
  inputSchema: AnalyzeProjectInputSchema,
  handler: async (args: { projectId: string }): Promise<AnalyzeProjectOutput> => {
    try {
      const parsedArgs = AnalyzeProjectInputSchema.parse(args);
      const result = await projectService.analyzeProject(parsedArgs.projectId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw error;
    }
  },
};
