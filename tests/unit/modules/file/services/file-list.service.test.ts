import { describe, test, expect, vi, beforeEach } from "vitest";
import path from "node:path";
import { FileListService } from "../../../../../src/modules/file/services/file-list.service.js";
import { ProjectRepository } from "../../../../../src/modules/project/repositories/project.repository.js";

// We use the 'describe' block to group all tests related to the FileListService together.
describe("FileListService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("successfully lists files in a directory", async () => {
    // 1. Setup Phase
    const service = new FileListService();
    
    const mockProject = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Test Project",
      path: process.cwd(), // We use the current working directory so we know files exist
      type: "typescript",
      git: true,
      docker: false,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(mockProject);

    // 2. Execution Phase
    const result = await service.listFiles({
      projectId: mockProject.id,
      path: "src/modules/file", // A directory we know exists
      recursive: false,
      includeHidden: false,
      maxDepth: 1
    });

    // 3. Assertion Phase
    expect(result.success).toBe(true);
    expect(result.files).toBeDefined();
    expect(result.files!.length).toBeGreaterThan(0);
    
    const firstFile = result.files![0];
    expect(firstFile.name).toBeTruthy();
    expect(["file", "directory", "symlink", "other"]).toContain(firstFile.type);
  });

  test("returns FORBIDDEN error when attempting path traversal outside project", async () => {
    // 1. Setup Phase
    const service = new FileListService();
    const mockProject = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      path: path.join(process.cwd(), "src"), // Project root is set to /src
    } as any;

    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(mockProject);

    // 2. Execution Phase
    const result = await service.listFiles({
      projectId: mockProject.id,
      path: "../../", // Malicious path attempting to escape the project boundary
      recursive: false,
      includeHidden: false,
      maxDepth: 1
    });

    // 3. Assertion Phase
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("FORBIDDEN");
  });

  test("returns NOT_FOUND error when project does not exist in database", async () => {
    // 1. Setup Phase
    const service = new FileListService();
    
    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(null);

    // 2. Execution Phase
    const result = await service.listFiles({
      projectId: "00000000-0000-0000-0000-000000000000", // Non-existent ID
      path: ".",
      recursive: false,
      includeHidden: false,
      maxDepth: 1
    });

    // 3. Assertion Phase
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_FOUND");
  });
});
