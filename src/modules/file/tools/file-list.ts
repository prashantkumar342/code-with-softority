import { ToolDefinition } from "../../../core/tools/types.js";
import { FileListInputSchema } from "../schemas/index.js";
import { FileListService } from "../services/file-list.service.js";

const fileListService = new FileListService();

export const fileListTool: ToolDefinition<typeof FileListInputSchema.shape> = {
  toolName: "file_list",
  description: "Lists files and directories within a registered project safely.",
  inputSchema: FileListInputSchema,
  handler: async (input) => {
    try {
      const result = await fileListService.listFiles(input);
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
