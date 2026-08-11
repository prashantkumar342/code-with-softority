import fs from "fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { ProjectRepository } from "../../project/repositories/project.repository.js";
import { FileListInput } from "../schemas/index.js";
import { FileListReturn } from "../types/index.js";

export class FileListService {
  private projectRepository = new ProjectRepository();

  async listFiles(input: FileListInput): Promise<FileListReturn> {
    try {
      const project = await this.projectRepository.findById(input.projectId);
      if (!project) {
        return { success: false, error: { code: "NOT_FOUND", message: `Project with ID ${input.projectId} not found.` } };
      }

      const absoluteProjectPath = path.resolve(project.path);
      const targetPath = path.resolve(absoluteProjectPath, input.path);

      // Path traversal protection
      if (!targetPath.startsWith(absoluteProjectPath)) {
        return { success: false, error: { code: "FORBIDDEN", message: "Path traversal violation: Cannot access files outside the project root." } };
      }

      // Check if target exists
      try {
        await fs.access(targetPath);
      } catch {
        return { success: false, error: { code: "NOT_FOUND", message: `Path not found: ${input.path}` } };
      }

      // fast-glob pattern
      const pattern = input.recursive ? "**/*" : "*";

      const entries = await fg(pattern, {
        cwd: targetPath,
        dot: input.includeHidden,
        deep: input.maxDepth,
        onlyFiles: false,
        stats: true,
        absolute: true,
        markDirectories: true,
        suppressErrors: true
      });

      const files = entries.map(entry => {
        let type: "file" | "directory" | "symlink" | "other" = "other";

        if (entry.dirent.isDirectory()) type = "directory";
        else if (entry.dirent.isFile()) type = "file";
        else if (entry.dirent.isSymbolicLink()) type = "symlink";

        return {
          name: entry.name.replace(/\/$/, ""),
          type,
          size: entry.stats?.size,
          path: path.relative(absoluteProjectPath, entry.path).replace(/\\/g, "/")
        };
      });

      return {
        success: true,
        files
      };
    } catch (error: any) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: error.message } };
    }
  }
}
