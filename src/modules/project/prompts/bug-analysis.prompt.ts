import { z } from "zod";
import { PromptDefinition } from "../../../core/prompts/types.js";

export const bugAnalysisPrompt: PromptDefinition = {
  name: "bug_analysis",
  description: "Analyzes a project for potential bugs based on an error trace or description",
  argsSchema: z.object({
    projectId: z.string().uuid("Invalid Project ID"),
    errorDescription: z.string().describe("Description of the error, stack trace, or buggy behavior"),
    filePath: z.string().optional().describe("Specific file path where the bug is suspected"),
  }),
  handler: async (args) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I need help analyzing a bug in project ${args.projectId}.

Error details / Description:
${args.errorDescription}

${args.filePath ? `Please focus your investigation starting at this file: ${args.filePath}` : "Please search the project to locate the source of the issue."}

1. Identify the root cause of the bug.
2. Explain why it is happening.
3. Propose a specific code fix.
4. Explain how to test that the fix works.`,
          },
        },
      ],
    };
  },
};
