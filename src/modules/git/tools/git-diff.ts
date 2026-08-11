import { ToolDefinition } from "../../../core/tools/types.js";
import { GitDiffInputSchema } from "../schemas/index.js";
import { GitDiffService } from "../services/git-diff.service.js";

const gitDiffService = new GitDiffService();

export const gitDiffTool: ToolDefinition<typeof GitDiffInputSchema.shape> = {
  toolName: "git_diff",
  description: "Returns the git diff for a registered project. Can diff a specific file, branch, or commit.",
  inputSchema: GitDiffInputSchema,
  handler: async (input) => {
    try {
      const result = await gitDiffService.getDiff(input);
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
