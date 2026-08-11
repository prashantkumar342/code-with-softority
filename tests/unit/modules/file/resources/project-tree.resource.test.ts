import { describe, test, expect, vi, afterEach } from "vitest";
import { projectTreeResource } from "../../../../../src/modules/file/resources/project-tree.resource.js";
import { FileListService } from "../../../../../src/modules/file/services/file-list.service.js";
import { ProjectRepository } from "../../../../../src/modules/project/repositories/project.repository.js";
import { URL } from "node:url";

vi.mock("../../../../../src/modules/file/services/file-list.service.js");
vi.mock("../../../../../src/modules/project/repositories/project.repository.js");

describe("projectTreeResource", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns project tree on valid URI", async () => {
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue({ id: "1" } as any);
    vi.mocked(FileListService.prototype.listFiles).mockResolvedValue({ success: true, files: [] } as any);

    const uri = new URL("project://1/tree");
    const result = await projectTreeResource.readHandler(uri as any);

    expect(ProjectRepository.prototype.findById).toHaveBeenCalledWith("1");
    expect(FileListService.prototype.listFiles).toHaveBeenCalledWith({
      projectId: "1",
      path: ".",
      recursive: true,
      includeHidden: false,
      maxDepth: 10
    });
    
    expect(result.contents[0].uri).toBe("project://1/tree");
    expect(result.contents[0].text).toBe("[]");
  });

  test("throws error if invalid URI format", async () => {
    const uri = new URL("project://1/invalid");
    await expect(projectTreeResource.readHandler(uri as any)).rejects.toThrow("Invalid URI format for project tree");
  });

  test("throws error if project not found", async () => {
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue(null);
    const uri = new URL("project://1/tree");
    await expect(projectTreeResource.readHandler(uri as any)).rejects.toThrow("Project not found: 1");
  });
});
