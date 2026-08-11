import { describe, test, expect, vi, afterEach } from "vitest";
import { simpleGit } from "simple-git";
import path from "node:path";
import { GitDiffService } from "../../../../../src/modules/git/services/git-diff.service.js";
import { ProjectRepository } from "../../../../../src/modules/project/repositories/project.repository.js";
import { RegisterProjectService } from "../../../../../src/modules/project/index.js";

vi.mock("simple-git");
vi.mock("../../../../../src/modules/project/repositories/project.repository.js");
vi.mock("../../../../../src/modules/project/index.js");

describe("GitDiffService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns NOT_FOUND if project does not exist", async () => {
    const service = new GitDiffService();
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue(null);

    const result = await service.getDiff({ projectId: "1" });
    
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_FOUND");
  });

  test("returns FORBIDDEN on path traversal", async () => {
    const service = new GitDiffService();
    const project = { id: "1", path: path.join(process.cwd(), "src"), git: true } as any;
    
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue(project);
    vi.mocked(RegisterProjectService.prototype.registerProject).mockResolvedValue({} as any);
    
    const mockGit = { diff: vi.fn() };
    vi.mocked(simpleGit as any).mockReturnValue(mockGit);

    const result = await service.getDiff({ projectId: "1", filePath: "../outside.txt" });
    
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("FORBIDDEN");
  });

  test("returns git diff with commit hash and valid file path", async () => {
    const service = new GitDiffService();
    const project = { id: "1", path: process.cwd(), git: true } as any;
    
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue(project);
    vi.mocked(RegisterProjectService.prototype.registerProject).mockResolvedValue({} as any);

    const mockGit = {
      diff: vi.fn().mockResolvedValue("diff content")
    };
    vi.mocked(simpleGit as any).mockReturnValue(mockGit);

    const result = await service.getDiff({ projectId: "1", commitHash: "abc", filePath: "src/main.ts" });
    
    expect(result.success).toBe(true);
    expect(result.content).toBe("diff content");
    
    // verify the arguments passed to diff
    const diffCalls = mockGit.diff.mock.calls;
    expect(diffCalls[0][0]).toContain("abc");
    expect(diffCalls[0][0]).toContain("--");
  });

  test("handles simple-git exceptions", async () => {
    const service = new GitDiffService();
    const project = { id: "1", path: "/test", git: true } as any;
    
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue(project);
    vi.mocked(RegisterProjectService.prototype.registerProject).mockResolvedValue({} as any);

    const mockGit = {
      diff: vi.fn().mockRejectedValue(new Error("Git crashed")),
    };
    vi.mocked(simpleGit as any).mockReturnValue(mockGit);

    const result = await service.getDiff({ projectId: "1" });
    
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INTERNAL_ERROR");
  });
});
