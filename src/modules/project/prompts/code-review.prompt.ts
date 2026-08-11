import { z } from "zod";
import { PromptDefinition } from "../../../core/prompts/types.js";

export const codeReviewPrompt: PromptDefinition = {
  name: "code_review",
  description: "Conducts a code review of a project, optionally scoped to a branch or commit",
  argsSchema: z.object({
    projectId: z.string().uuid("Invalid Project ID"),
    branch: z.string().optional().describe("Branch name to review"),
    commitHash: z.string().optional().describe("Commit hash to review"),
  }),
  handler: async (args) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please review the code changes in project ${args.projectId}. 
${args.branch ? `Focus on the branch: ${args.branch}.` : ""}
${args.commitHash ? `Focus on the commit: ${args.commitHash}.` : ""}
            
1. Analyze the architecture and code quality.
2. Identify potential security issues or bugs.
3. Check for adherence to best practices.
4. Suggest concrete improvements.

Please provide your review in a structured markdown format.`,
          },
        },
      ],
    };
  },
};
