import { ToolDefinition } from "../../../core/tools/types.js";
import { FileReadInputSchema } from "../schemas/index.js";
import { FileReadService } from "../services/file-read.service.js";

const fileReadService = new FileReadService();

export const fileReadTool: ToolDefinition<typeof FileReadInputSchema.shape> = {
  toolName: "file_read",
  description: "Reads the contents of a specific file within a registered project.",
  inputSchema: FileReadInputSchema,
  handler: async (input) => {
    try {
      const result = await fileReadService.readFile(input);
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
