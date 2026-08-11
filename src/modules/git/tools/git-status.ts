import { ToolDefinition } from "../../../core/tools/types.js";
import { GitStatusInputSchema } from "../schemas/index.js";
import { GitStatusService } from "../services/git-status.service.js";

const gitStatusService = new GitStatusService();

export const gitStatusTool: ToolDefinition<typeof GitStatusInputSchema.shape> = {
  toolName: "git_status",
  description: "Returns the current git branch, modified, staged, and untracked files, and a list of branches for a registered project.",
  inputSchema: GitStatusInputSchema,
  handler: async (input) => {
    try {
      const result = await gitStatusService.getStatus(input);
      if (!result.success) {
        throw new Error(`[${result.error?.code}] ${result.error?.message}`);
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result)
          }
        ]
      };
    } catch (error: any) {
      throw error;
    }
  },
};
