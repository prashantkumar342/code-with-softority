import path from "node:path";
import { simpleGit } from "simple-git";
import { ProjectRepository } from "../../project/repositories/project.repository.js";
import { GitDiffInput } from "../schemas/index.js";
import { GitDiffReturn } from "../types/index.js";
import { RegisterProjectService } from "../../project/index.js";

export class GitDiffService {
  private static readonly projectService = new RegisterProjectService();
  private projectRepository = new ProjectRepository();

  async getDiff(input: GitDiffInput): Promise<GitDiffReturn> {
    try {
      let project = await this.projectRepository.findById(input.projectId);
      if (!project) {
        return { success: false, error: { code: "NOT_FOUND", message: `Project with ID ${input.projectId} not found.` } };
      }

      await GitDiffService.projectService.registerProject(project.path);
      project = await this.projectRepository.findById(input.projectId);

      if (!project) {
        return { success: false, error: { code: "NOT_FOUND", message: `Project with ID ${input.projectId} not found.` } };
      }

      if (!project.git) {
        return { success: false, error: { code: "NOT_GIT_REPO", message: "This project is not marked as a Git repository." } };
      }

      const absoluteProjectPath = path.resolve(project.path);
      const git = simpleGit(absoluteProjectPath);

      const diffArgs: string[] = [];

      if (input.commitHash) {
        diffArgs.push(input.commitHash);
      } else if (input.branch) {
        diffArgs.push(input.branch);
      }

      if (input.filePath) {
        // Prevent path traversal
        const targetPath = path.resolve(absoluteProjectPath, input.filePath);
        if (!targetPath.startsWith(absoluteProjectPath)) {
          return { success: false, error: { code: "FORBIDDEN", message: "Path traversal violation." } };
        }
        diffArgs.push("--", targetPath);
      }

      const diff = await git.diff(diffArgs);

      return {
        success: true,
        content: diff
      };
    } catch (error: any) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: error.message } };
    }
  }
}
