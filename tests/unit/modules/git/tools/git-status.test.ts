import { describe, test, expect, vi, afterEach } from "vitest";
import { gitStatusTool } from "../../../../../src/modules/git/tools/git-status.js";
import { GitStatusService } from "../../../../../src/modules/git/services/git-status.service.js";

vi.mock("../../../../../src/modules/git/services/git-status.service.js");

describe("gitStatusTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns formatted content on success", async () => {
    const mockResult = { success: true, content: { currentBranch: "main" } };
    vi.mocked(GitStatusService.prototype.getStatus).mockResolvedValue(mockResult as any);

    const result = await gitStatusTool.handler({ projectId: "1" });
    
    expect(GitStatusService.prototype.getStatus).toHaveBeenCalledWith({ projectId: "1" });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockResult));
  });
});
