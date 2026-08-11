import { describe, test, expect, vi, afterEach } from "vitest";
import { registerProjectTool } from "../../../../../src/modules/project/tools/register-project.js";
import { RegisterProjectService } from "../../../../../src/modules/project/services/register-project.service.js";

vi.mock("../../../../../src/modules/project/services/register-project.service.js");

describe("registerProjectTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns formatted content on success", async () => {
    const mockResult = { success: true, id: "1", metadata: { name: "test", type: "unknown", path: "/test" } };
    vi.mocked(RegisterProjectService.prototype.registerProject).mockResolvedValue(mockResult as any);

    const result = await registerProjectTool.handler({ path: "/test" });
    
    expect(RegisterProjectService.prototype.registerProject).toHaveBeenCalledWith("/test");
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockResult));
  });

  test("throws error if service throws", async () => {
    const error = new Error("Failed");
    vi.mocked(RegisterProjectService.prototype.registerProject).mockRejectedValue(error);

    await expect(registerProjectTool.handler({ path: "/test" })).rejects.toThrow("Failed");
  });
});
