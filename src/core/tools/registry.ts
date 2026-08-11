import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolDefinition } from "./types.js";
import { registerProjectTool } from "../../modules/project/tools/register-project.js";
import { listProjectTool } from "../../modules/project/tools/list-project.js";
import { removeProjectTool } from "../../modules/project/tools/remove-project.js";
import { analyzeProjectTool } from "../../modules/project/tools/analyze-project.js";
import { fileListTool, fileReadTool, fileSearchTool } from "../../modules/file/tools/index.js";
import { gitStatusTool, gitDiffTool } from "../../modules/git/tools/index.js";

const allTools: ToolDefinition<any>[] = [
  registerProjectTool, 
  listProjectTool, 
  removeProjectTool, 
  analyzeProjectTool,
  fileListTool,
  fileReadTool,
  fileSearchTool,
  gitStatusTool,
  gitDiffTool
];

export function registerAllTools(server: McpServer) {
  for (const tool of allTools) {
    server.registerTool(
      tool.toolName,
      {
        description: tool.description,
        inputSchema: tool.inputSchema?.shape ?? {},
      },
      tool.handler,
    );
  }
}
