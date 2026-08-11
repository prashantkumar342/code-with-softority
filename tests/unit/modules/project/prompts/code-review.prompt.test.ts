import { describe, test, expect } from "vitest";
import { codeReviewPrompt } from "../../../../../src/modules/project/prompts/code-review.prompt.js";

describe("codeReviewPrompt", () => {
  test("generates basic code review prompt without branch or commit", async () => {
    const result = await codeReviewPrompt.handler({ projectId: "123" });
    
    expect(result.messages.length).toBe(1);
    expect(result.messages[0].role).toBe("user");
    const text = (result.messages[0].content as any).text;
    
    expect(text).toContain("Please review the code changes in project 123");
    expect(text).not.toContain("Focus on the branch");
    expect(text).not.toContain("Focus on the commit");
  });

  test("includes branch and commit if provided", async () => {
    const result = await codeReviewPrompt.handler({ 
      projectId: "123",
      branch: "main",
      commitHash: "abcdef"
    });
    
    const text = (result.messages[0].content as any).text;
    expect(text).toContain("Focus on the branch: main.");
    expect(text).toContain("Focus on the commit: abcdef.");
  });
});
