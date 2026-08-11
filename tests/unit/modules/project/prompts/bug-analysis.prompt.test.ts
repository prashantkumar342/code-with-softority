import { describe, test, expect } from "vitest";
import { bugAnalysisPrompt } from "../../../../../src/modules/project/prompts/bug-analysis.prompt.js";

describe("bugAnalysisPrompt", () => {
  test("generates bug analysis prompt without filePath", async () => {
    const result = await bugAnalysisPrompt.handler({ 
      projectId: "123",
      errorDescription: "Null pointer exception"
    });
    
    const text = (result.messages[0].content as any).text;
    expect(text).toContain("project 123");
    expect(text).toContain("Null pointer exception");
    expect(text).toContain("Please search the project to locate the source of the issue.");
  });

  test("includes filePath if provided", async () => {
    const result = await bugAnalysisPrompt.handler({ 
      projectId: "123",
      errorDescription: "Error",
      filePath: "src/main.ts"
    });
    
    const text = (result.messages[0].content as any).text;
    expect(text).toContain("Please focus your investigation starting at this file: src/main.ts");
  });
});
