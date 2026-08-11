import { describe, test, expect, vi, afterEach } from "vitest";
import { removeProjectTool } from "../../../../../src/modules/project/tools/remove-project.js";
import { RemoveProjectService } from "../../../../../src/modules/project/services/remove-project.service.js";

vi.mock("../../../../../src/modules/project/services/remove-project.service.js");

describe("removeProjectTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns formatted content on success", async () => {
    const mockResult = { success: true, id: "1" };
    vi.mocked(RemoveProjectService.prototype.removeProject).mockResolvedValue(mockResult as any);

    const result = await removeProjectTool.handler({ projectId: "123e4567-e89b-12d3-a456-426614174000" });
    
    expect(RemoveProjectService.prototype.removeProject).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174000");
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockResult));
  });
});
