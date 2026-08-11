import { describe, test, expect, vi, afterEach } from "vitest";
import { fileReadTool } from "../../../../../src/modules/file/tools/file-read.js";
import { FileReadService } from "../../../../../src/modules/file/services/file-read.service.js";

vi.mock("../../../../../src/modules/file/services/file-read.service.js");

describe("fileReadTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns formatted content on success", async () => {
    const mockResult = { success: true, content: "file content" };
    vi.mocked(FileReadService.prototype.readFile).mockResolvedValue(mockResult as any);

    const result = await fileReadTool.handler({ projectId: "1", path: "test.ts" });
    
    expect(FileReadService.prototype.readFile).toHaveBeenCalledWith({ projectId: "1", path: "test.ts", startLine: undefined, endLine: undefined });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockResult));
  });
});
