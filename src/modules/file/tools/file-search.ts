import { ToolDefinition } from "../../../core/tools/types.js";
import { FileSearchInputSchema } from "../schemas/index.js";
import { FileSearchService } from "../services/file-search.service.js";

const fileSearchService = new FileSearchService();

export const fileSearchTool: ToolDefinition<typeof FileSearchInputSchema.shape> = {
  toolName: "file_search",
  description: "Lightning fast text search across all files in a registered project directory.",
  inputSchema: FileSearchInputSchema,
  handler: async (input) => {
    try {
      const result = await fileSearchService.searchFiles(input);
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
