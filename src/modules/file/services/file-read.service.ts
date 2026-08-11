import fs from "fs/promises";
import path from "node:path";
import { isBinaryFile } from "isbinaryfile";
import { ProjectRepository } from "../../project/repositories/project.repository.js";
import { FileReadInput } from "../schemas/index.js";
import { FileReadReturn } from "../types/index.js";

export class FileReadService {
  private projectRepository = new ProjectRepository();

  async readFile(input: FileReadInput): Promise<FileReadReturn> {
    try {
      const project = await this.projectRepository.findById(input.projectId);
      if (!project) {
        return { success: false, error: { code: "NOT_FOUND", message: `Project with ID ${input.projectId} not found.` } };
      }

      const absoluteProjectPath = path.resolve(project.path);
      const targetPath = path.resolve(absoluteProjectPath, input.path);

      if (!targetPath.startsWith(absoluteProjectPath)) {
        return { success: false, error: { code: "FORBIDDEN", message: "Path traversal violation: Cannot access files outside the project root." } };
      }

      let stat;
      try {
        stat = await fs.stat(targetPath);
      } catch {
        return { success: false, error: { code: "NOT_FOUND", message: `File not found: ${input.path}` } };
      }

      if (!stat.isFile()) {
        return { success: false, error: { code: "INVALID_TARGET", message: "Path is not a file." } };
      }

      // Check file size (limit to 10MB as per spec)
      if (stat.size > 10 * 1024 * 1024) {
        return { success: false, error: { code: "FILE_TOO_LARGE", message: "File exceeds 10MB limit." } };
      }

      // Check if it's a binary file
      const buffer = await fs.readFile(targetPath);
      const isBinary = await isBinaryFile(buffer);

      if (isBinary) {
        return {
          success: true,
          metadata: { totalLines: 0, isBinary: true }
        };
      }

      const content = buffer.toString("utf-8");
      const lines = content.split(/\r?\n/);

      let startLine = input.startLine ? Math.max(1, input.startLine) : 1;
      let endLine = input.endLine ? Math.min(lines.length, input.endLine) : lines.length;

      // Adjust to 0-based index for slice
      const slicedContent = lines.slice(startLine - 1, endLine).join("\n");

      return {
        success: true,
        content: slicedContent,
        metadata: {
          totalLines: lines.length,
          startLine,
          endLine,
          isBinary: false
        }
      };
    } catch (error: any) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: error.message } };
    }
  }
}
