import { describe, test, expect, vi, afterEach } from "vitest";
import { gitDiffTool } from "../../../../../src/modules/git/tools/git-diff.js";
import { GitDiffService } from "../../../../../src/modules/git/services/git-diff.service.js";

vi.mock("../../../../../src/modules/git/services/git-diff.service.js");

describe("gitDiffTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns formatted content on success", async () => {
    const mockResult = { success: true, content: "diff" };
    vi.mocked(GitDiffService.prototype.getDiff).mockResolvedValue(mockResult as any);

    const result = await gitDiffTool.handler({ projectId: "1" });
    
    expect(GitDiffService.prototype.getDiff).toHaveBeenCalledWith({ projectId: "1" });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockResult));
  });
});
