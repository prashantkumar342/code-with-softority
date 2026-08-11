import { describe, test, expect, vi, afterEach } from "vitest";
import { listProjectTool } from "../../../../../src/modules/project/tools/list-project.js";
import { ListProjectService } from "../../../../../src/modules/project/services/list-project.service.js";

vi.mock("../../../../../src/modules/project/services/list-project.service.js");

describe("listProjectTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns formatted content on success", async () => {
    const mockResult = { success: true, projects: [{ id: "1", name: "test", path: "/test" }] };
    vi.mocked(ListProjectService.prototype.listProjects).mockResolvedValue(mockResult as any);

    const result = await listProjectTool.handler({ path: "/mock/path" });
    
    expect(ListProjectService.prototype.listProjects).toHaveBeenCalled();
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockResult));
  });
});
