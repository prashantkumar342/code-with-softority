import { describe, test, expect, vi, afterEach } from "vitest";
import { analyzeProjectTool } from "../../../../../src/modules/project/tools/analyze-project.js";
import { AnalyzeProjectService } from "../../../../../src/modules/project/services/analyze-project.service.js";

vi.mock("../../../../../src/modules/project/services/analyze-project.service.js");

describe("analyzeProjectTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns formatted content on success", async () => {
    const mockResult = { success: true, analysis: { directoryType: "software" } };
    vi.mocked(AnalyzeProjectService.prototype.analyzeProject).mockResolvedValue(mockResult as any);

    const result = await analyzeProjectTool.handler({ projectId: "123e4567-e89b-12d3-a456-426614174000" });
    
    expect(AnalyzeProjectService.prototype.analyzeProject).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174000");
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockResult, null, 2));
  });
});
