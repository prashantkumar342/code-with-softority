import { describe, test, expect, vi, afterEach } from "vitest";
import { fileSearchTool } from "../../../../../src/modules/file/tools/file-search.js";
import { FileSearchService } from "../../../../../src/modules/file/services/file-search.service.js";

vi.mock("../../../../../src/modules/file/services/file-search.service.js");

describe("fileSearchTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns formatted content on success", async () => {
    const mockResult = { success: true, matches: [] };
    vi.mocked(FileSearchService.prototype.searchFiles).mockResolvedValue(mockResult as any);

    const result = await fileSearchTool.handler({ projectId: "123e4567-e89b-12d3-a456-426614174000", query: "test" });
    
    expect(FileSearchService.prototype.searchFiles).toHaveBeenCalledWith({ projectId: "123e4567-e89b-12d3-a456-426614174000", query: "test" });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockResult));
  });
});
