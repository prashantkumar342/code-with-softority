import { describe, test, expect, vi, afterEach } from "vitest";
import { fileContentResource } from "../../../../../src/modules/file/resources/file-content.resource.js";
import { FileReadService } from "../../../../../src/modules/file/services/file-read.service.js";
import { ProjectRepository } from "../../../../../src/modules/project/repositories/project.repository.js";
import { URL } from "node:url";

vi.mock("../../../../../src/modules/file/services/file-read.service.js");
vi.mock("../../../../../src/modules/project/repositories/project.repository.js");

describe("fileContentResource", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns file content on valid URI", async () => {
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue({ id: "1" } as any);
    vi.mocked(FileReadService.prototype.readFile).mockResolvedValue({ success: true, content: "hello" } as any);

    const uri = new URL("project://1/file/src%2Fmain.ts");
    const result = await fileContentResource.readHandler(uri as any);

    expect(ProjectRepository.prototype.findById).toHaveBeenCalledWith("1");
    expect(FileReadService.prototype.readFile).toHaveBeenCalledWith({
      projectId: "1",
      path: "src/main.ts"
    });
    
    expect(result.contents[0].uri).toBe("project://1/file/src%2Fmain.ts");
    expect(result.contents[0].text).toBe("hello");
  });

  test("throws error if invalid URI format", async () => {
    const uri = new URL("project://1/invalid/file");
    await expect(fileContentResource.readHandler(uri as any)).rejects.toThrow("Invalid URI format for file content");
  });
});
