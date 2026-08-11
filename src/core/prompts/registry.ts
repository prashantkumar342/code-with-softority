import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PromptDefinition } from "./types.js";
import { codeReviewPrompt } from "../../modules/project/prompts/code-review.prompt.js";
import { bugAnalysisPrompt } from "../../modules/project/prompts/bug-analysis.prompt.js";

const allPrompts: PromptDefinition<any>[] = [
  codeReviewPrompt,
  bugAnalysisPrompt
];

export function registerAllPrompts(server: McpServer) {
  for (const prompt of allPrompts) {
    server.registerPrompt(
      prompt.name,
      {
        description: prompt.description,
        argsSchema: prompt.argsSchema?.shape ?? {},
      },
      prompt.handler as any
    );
  }
}
