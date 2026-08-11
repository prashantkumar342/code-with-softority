import { describe, test, expect, vi, afterEach } from "vitest";
import { fileListTool } from "../../../../../src/modules/file/tools/file-list.js";
import { FileListService } from "../../../../../src/modules/file/services/file-list.service.js";

vi.mock("../../../../../src/modules/file/services/file-list.service.js");

describe("fileListTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns formatted content on success", async () => {
    const mockResult = { success: true, files: [{ name: "a.ts" }] };
    vi.mocked(FileListService.prototype.listFiles).mockResolvedValue(mockResult as any);

    const result = await fileListTool.handler({ projectId: "123e4567-e89b-12d3-a456-426614174000", path: "." });
    
    expect(FileListService.prototype.listFiles).toHaveBeenCalledWith({ projectId: "123e4567-e89b-12d3-a456-426614174000", path: "." });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockResult));
  });
});
