import { describe, test, expect, vi, afterEach } from "vitest";
import { simpleGit } from "simple-git";
import { GitStatusService } from "../../../../../src/modules/git/services/git-status.service.js";
import { ProjectRepository } from "../../../../../src/modules/project/repositories/project.repository.js";
import { RegisterProjectService } from "../../../../../src/modules/project/index.js";

vi.mock("simple-git");
vi.mock("../../../../../src/modules/project/repositories/project.repository.js");
vi.mock("../../../../../src/modules/project/index.js");

describe("GitStatusService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns NOT_FOUND if project does not exist", async () => {
    const service = new GitStatusService();
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue(null);

    const result = await service.getStatus({ projectId: "1" });
    
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_FOUND");
  });

  test("returns NOT_GIT_REPO if project is not a git repo", async () => {
    const service = new GitStatusService();
    const project = { id: "1", path: "/test", git: false } as any;
    
    // findById is called twice in the service
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue(project);
    vi.mocked(RegisterProjectService.prototype.registerProject).mockResolvedValue({} as any);

    const result = await service.getStatus({ projectId: "1" });
    
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_GIT_REPO");
  });

  test("returns git status successfully", async () => {
    const service = new GitStatusService();
    const project = { id: "1", path: "/test", git: true } as any;
    
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue(project);
    vi.mocked(RegisterProjectService.prototype.registerProject).mockResolvedValue({} as any);

    const mockGit = {
      status: vi.fn().mockResolvedValue({
        current: "main",
        tracking: "origin/main",
        isClean: () => true,
        modified: [],
        staged: [],
        not_added: []
      }),
      branchLocal: vi.fn().mockResolvedValue({
        all: ["main", "dev"]
      })
    };
    
    vi.mocked(simpleGit as any).mockReturnValue(mockGit);

    const result = await service.getStatus({ projectId: "1" });
    
    expect(result.success).toBe(true);
    expect(result.content?.currentBranch).toBe("main");
    expect(result.content?.isClean).toBe(true);
    expect(result.content?.branches).toEqual(["main", "dev"]);
  });

  test("handles simple-git exceptions", async () => {
    const service = new GitStatusService();
    const project = { id: "1", path: "/test", git: true } as any;
    
    vi.mocked(ProjectRepository.prototype.findById).mockResolvedValue(project);
    vi.mocked(RegisterProjectService.prototype.registerProject).mockResolvedValue({} as any);

    const mockGit = {
      status: vi.fn().mockRejectedValue(new Error("Git crashed")),
    };
    vi.mocked(simpleGit as any).mockReturnValue(mockGit);

    const result = await service.getStatus({ projectId: "1" });
    
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INTERNAL_ERROR");
  });
});
