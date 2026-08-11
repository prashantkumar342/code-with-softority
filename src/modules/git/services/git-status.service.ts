import path from "node:path";
import { simpleGit } from "simple-git";
import { ProjectRepository } from "../../project/repositories/project.repository.js";
import { GitStatusInput } from "../schemas/index.js";
import { GitStatusReturn } from "../types/index.js";
import { RegisterProjectService } from "../../project/index.js";

export class GitStatusService {
  private static readonly projectService = new RegisterProjectService();
  private projectRepository = new ProjectRepository();

  async getStatus(input: GitStatusInput): Promise<GitStatusReturn> {
    try {
      let project = await this.projectRepository.findById(input.projectId);
      if (!project) {
        return { success: false, error: { code: "NOT_FOUND", message: `Project with ID ${input.projectId} not found.` } };
      }

      await GitStatusService.projectService.registerProject(project.path);
      project = await this.projectRepository.findById(input.projectId);
      
      if (!project) {
        return { success: false, error: { code: "NOT_FOUND", message: `Project with ID ${input.projectId} not found.` } };
      }

      if (!project.git) {
        return { success: false, error: { code: "NOT_GIT_REPO", message: "This project is not marked as a Git repository." } };
      }

      const absoluteProjectPath = path.resolve(project.path);
      const git = simpleGit(absoluteProjectPath);

      const status = await git.status();
      const branches = await git.branchLocal();

      return {
        success: true,
        content: {
          currentBranch: status.current || "",
          tracking: status.tracking,
          isClean: status.isClean(),
          modified: status.modified,
          staged: status.staged,
          untracked: status.not_added,
          branches: branches.all,
        }
      };
    } catch (error: any) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: error.message } };
    }
  }
}
