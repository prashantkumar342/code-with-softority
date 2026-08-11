import { describe, test, expect, vi, afterEach } from "vitest";
import path from "node:path";
import fs from "fs/promises";
import { AnalyzeProjectService } from "../../../../../src/modules/project/services/analyze-project.service.js";
import { ProjectRepository } from "../../../../../src/modules/project/repositories/project.repository.js";

describe("AnalyzeProjectService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("throws error if project not found", async () => {
    const service = new AnalyzeProjectService();
    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(null);

    await expect(service.analyzeProject("123")).rejects.toThrow("Project with ID 123 not found.");
  });

  test("analyzes a project successfully", async () => {
    const service = new AnalyzeProjectService();
    const mockProject = {
      id: "123",
      path: "/fake/path"
    } as any;

    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(mockProject);
    
    // Mock fs.readdir
    vi.spyOn(fs, "readdir").mockImplementation(async (dir: any, options: any) => {
      if (options?.withFileTypes) {
        if (dir === "/fake/path") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
            { name: "package.json", isDirectory: () => false, isFile: () => true },
            { name: ".env", isDirectory: () => false, isFile: () => true },
            { name: "tsconfig.json", isDirectory: () => false, isFile: () => true },
            { name: ".git", isDirectory: () => true, isFile: () => false },
          ] as any;
        }
        if (dir === path.join("/fake/path", "src")) {
          return [
            { name: "main.ts", isDirectory: () => false, isFile: () => true },
            { name: "app.ts", isDirectory: () => false, isFile: () => true },
          ] as any;
        }
        return [];
      } else {
        return ["src", "package.json", ".env", "tsconfig.json", ".git", "Dockerfile"];
      }
    });

    vi.spyOn(fs, "readFile").mockImplementation(async () => {
      return JSON.stringify({
        dependencies: { "express": "^4.0.0", "prisma": "^5.0.0" },
        devDependencies: { "typescript": "^5.0.0" }
      });
    });

    vi.spyOn(fs, "stat").mockImplementation(async (p: any) => {
      const pStr = String(p);
      if (pStr.includes("src") && !pStr.includes(".")) return { isDirectory: () => true, isFile: () => false } as any;
      if (pStr.endsWith("src\\main.ts") || pStr.endsWith("src/main.ts")) return { isDirectory: () => false, isFile: () => true } as any;
      if (pStr.endsWith("src\\app.ts") || pStr.endsWith("src/app.ts")) return { isDirectory: () => false, isFile: () => true } as any;
      throw new Error("ENOENT");
    });

    const result = await service.analyzeProject("123");

    expect(result.success).toBe(true);
    expect(result.analysis.directoryType).toBe("software");
    expect(result.analysis.languages).toContain("TypeScript");
    expect(result.analysis.frameworks).toContain("Express");
    expect(result.analysis.packageManager).toBe("npm");
    expect(result.analysis.hasGit).toBe(true);
    expect(result.analysis.architectureIndicators).toContain("Database/ORM");
    expect(result.analysis.environmentFiles).toContain(".env");
    expect(result.analysis.dockerFiles).toContain("Dockerfile");
  });

  test("analyzes empty directory", async () => {
    const service = new AnalyzeProjectService();
    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue({ id: "1", path: "/empty" } as any);
    vi.spyOn(fs, "readdir").mockResolvedValue([]);
    vi.spyOn(fs, "readFile").mockRejectedValue(new Error("ENOENT"));
    vi.spyOn(fs, "stat").mockRejectedValue(new Error("ENOENT"));

    const result = await service.analyzeProject("1");
    expect(result.success).toBe(true);
    expect(result.analysis.directoryType).toBe("empty");
  });
});
