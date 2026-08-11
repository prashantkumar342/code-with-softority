import fs from "fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { isBinaryFile } from "isbinaryfile";
import { ProjectRepository } from "../../project/repositories/project.repository.js";
import { FileSearchInput } from "../schemas/index.js";
import { FileSearchReturn, SearchMatch } from "../types/index.js";

export class FileSearchService {
  private projectRepository = new ProjectRepository();

  async searchFiles(input: FileSearchInput): Promise<FileSearchReturn> {
    try {
      const project = await this.projectRepository.findById(input.projectId);
      if (!project) {
        return { success: false, error: { code: "NOT_FOUND", message: `Project with ID ${input.projectId} not found.` } };
      }

      const absoluteProjectPath = path.resolve(project.path);
      const targetPath = path.resolve(absoluteProjectPath, input.path);

      if (!targetPath.startsWith(absoluteProjectPath)) {
        return { success: false, error: { code: "FORBIDDEN", message: "Path traversal violation." } };
      }

      try {
        const stat = await fs.stat(targetPath);
        if (!stat.isDirectory()) {
            return { success: false, error: { code: "INVALID_TARGET", message: "Search path must be a directory." } };
        }
      } catch {
        return { success: false, error: { code: "NOT_FOUND", message: `Path not found: ${input.path}` } };
      }

      // fast-glob to quickly find all files, ignoring common noise
      let patterns = ["**/*"];
      if (input.fileTypes && input.fileTypes.length > 0) {
          patterns = input.fileTypes.map((ext: string) => `**/*.${ext.replace(/^\./, '')}`);
      }

      const filePaths = await fg(patterns, {
        cwd: targetPath,
        dot: false, // mostly ignore hidden files (.git, .env) for speed unless specified
        ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
        onlyFiles: true,
        absolute: true,
        suppressErrors: true
      });

      const matches: SearchMatch[] = [];
      let totalMatches = 0;

      // To make it lightning fast in Node.js, we process files concurrently with a limit
      const BATCH_SIZE = 50; 
      
      const regexFlags = input.caseSensitive ? "g" : "gi";
      // We escape user query if it's not meant to be regex. For now, assuming exact string search.
      // If we wanted full regex, we could allow it, but we'll stick to exact string for safety.
      const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapeRegExp(input.query), regexFlags);

      for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
        if (matches.length >= input.maxResults) break;
        
        const batch = filePaths.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (filePath) => {
           // Skip if we hit the limit
           if (matches.length >= input.maxResults) return;

           try {
             // Quick size check to avoid reading huge binary ISOs
             const stat = await fs.stat(filePath);
             if (stat.size > 5 * 1024 * 1024) return; // skip files > 5MB

             const buffer = await fs.readFile(filePath);
             
             // Quick binary check on first bytes
             if (await isBinaryFile(buffer, { size: stat.size })) return;
             
             const content = buffer.toString("utf-8");
             const lines = content.split(/\r?\n/);

             lines.forEach((line, index) => {
               if (matches.length >= input.maxResults) return;
               
               searchRegex.lastIndex = 0; // reset for global regex
               if (searchRegex.test(line)) {
                 matches.push({
                   filePath: path.relative(absoluteProjectPath, filePath).replace(/\\/g, "/"),
                   lineNumber: index + 1,
                   snippet: line.trim().substring(0, 200) // limit snippet length
                 });
                 totalMatches++;
               }
             });
           } catch {
             // Ignore individual file read errors (e.g. permission denied)
           }
        }));
      }

      return {
        success: true,
        matches,
        totalMatches
      };

    } catch (error: any) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: error.message } };
    }
  }
}
