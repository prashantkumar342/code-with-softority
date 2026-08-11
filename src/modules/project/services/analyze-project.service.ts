import path from "node:path";
import fs from "fs/promises";
import { ProjectMetadata } from "../types/project.types.js";
import { AnalyzeProjectReturn } from "../types/analyze-project.types.js";
import { ProjectRepository } from "../repositories/project.repository.js";

export class AnalyzeProjectService {
  private projectRepository = new ProjectRepository();

  async analyzeProject(projectId: ProjectMetadata["id"]): Promise<AnalyzeProjectReturn> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    const files = await this.safeReaddir(project.path);
    const { dependencies, devDependencies } = await this.readPackageJson(project.path);

    const { totalFiles, topFileTypes } = await this.analyzeGeneralStructure(project.path);
    const languages = await this.detectLanguages(project.path, files);
    const packageManager = this.detectPackageManager(files);
    const frameworks = this.detectFrameworks(dependencies, devDependencies);
    const entryPoints = await this.detectEntryPoints(project.path, files);
    const sourceDirectories = await this.findDirectories(project.path, ["src", "lib", "app", "core"]);
    const testDirectories = await this.findDirectories(project.path, ["test", "tests", "__tests__", "e2e", "spec"]);
    
    const knownConfigPattern = /^(tsconfig.*\.json|nest-cli\.json|.*\.(config|rc)\.(js|ts|json|cjs|mjs|yaml|yml)|angular\.json|nx\.json)$/i;
    const configurationFiles = files.filter((f) => knownConfigPattern.test(f));
    const environmentFiles = files.filter((f) => f.startsWith(".env"));
    const dockerFiles = files.filter((f) => f.toLowerCase().includes("docker"));
    const hasGit = files.includes(".git");
    const architectureIndicators = this.detectArchitecture(dependencies);

    let directoryType: "software" | "assets" | "workspace" | "empty" | "unknown" = "unknown";
    if (totalFiles === 0) {
      directoryType = "empty";
    } else if (languages.length > 0 || packageManager !== "unknown" || frameworks.length > 0) {
      directoryType = "software";
    } else {
      const mediaExts = new Set([".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mp3", ".wav", ".svg", ".webp"]);
      let mediaCount = 0;
      for (const [ext, count] of Object.entries(topFileTypes)) {
        if (mediaExts.has(ext)) mediaCount += count;
      }
      if (mediaCount > 0 && mediaCount / totalFiles > 0.5) {
        directoryType = "assets";
      } else {
        directoryType = "workspace";
      }
    }

    return {
      success: true,
      analysis: {
        directoryType,
        totalFiles,
        topFileTypes,
        languages,
        frameworks,
        packageManager,
        entryPoints,
        sourceDirectories,
        testDirectories,
        configurationFiles,
        environmentFiles,
        dockerFiles,
        hasGit,
        dependencies,
        devDependencies,
        architectureIndicators,
      },
    };
  }

  // Removed unused getProjectById helper

  private async analyzeGeneralStructure(projectPath: string) {
    const fileTypes: Record<string, number> = {};
    let totalFiles = 0;
    
    const ignoredDirs = new Set(["node_modules", ".git", ".vscode", "dist", "build"]);
    
    const scanDir = async (dir: string, depth: number) => {
      if (depth > 3) return; // Prevent scanning too deeply for generic folders
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            if (!ignoredDirs.has(entry.name)) {
              await scanDir(path.join(dir, entry.name), depth + 1);
            }
          } else if (entry.isFile()) {
            totalFiles++;
            const ext = path.extname(entry.name).toLowerCase() || "no-extension";
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
          }
        }
      } catch {
        // Ignore read errors
      }
    };
    
    await scanDir(projectPath, 0);

    // Sort file types by count
    const topFileTypes = Object.entries(fileTypes)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [ext, count]) => {
        acc[ext] = count;
        return acc;
      }, {} as Record<string, number>);

    return { totalFiles, topFileTypes };
  }

  private async safeReaddir(dir: string): Promise<string[]> {
    try {
      return await fs.readdir(dir);
    } catch {
      return [];
    }
  }

  private detectPackageManager(files: string[]): "npm" | "yarn" | "pnpm" | "bun" | "unknown" {
    if (files.includes("yarn.lock")) return "yarn";
    if (files.includes("pnpm-lock.yaml")) return "pnpm";
    if (files.includes("bun.lockb") || files.includes("bun.lock")) return "bun";
    if (files.includes("package-lock.json")) return "npm";
    if (files.includes("package.json")) return "npm";
    return "unknown";
  }

  private async readPackageJson(projectPath: string) {
    try {
      const content = await fs.readFile(path.join(projectPath, "package.json"), "utf-8");
      const pkg = JSON.parse(content);
      return {
        dependencies: pkg.dependencies || {},
        devDependencies: pkg.devDependencies || {},
      };
    } catch {
      return { dependencies: {}, devDependencies: {} };
    }
  }

  private detectFrameworks(deps: Record<string, string>, devDeps: Record<string, string>): string[] {
    const allDeps = { ...deps, ...devDeps };
    const frameworks = new Set<string>();

    if (allDeps["@nestjs/core"]) frameworks.add("NestJS");
    if (allDeps["express"]) frameworks.add("Express");
    if (allDeps["react"]) frameworks.add("React");
    if (allDeps["vue"]) frameworks.add("Vue");
    if (allDeps["next"]) frameworks.add("Next.js");
    if (allDeps["@angular/core"]) frameworks.add("Angular");
    if (allDeps["fastify"]) frameworks.add("Fastify");
    if (allDeps["koa"]) frameworks.add("Koa");
    if (allDeps["svelte"]) frameworks.add("Svelte");

    return Array.from(frameworks);
  }

  private detectArchitecture(deps: Record<string, string>): string[] {
    const indicators = new Set<string>();
    
    if (deps["graphql"] || deps["@nestjs/graphql"]) indicators.add("GraphQL");
    if (deps["@grpc/grpc-js"]) indicators.add("gRPC");
    if (deps["@nestjs/microservices"] || deps["amqplib"] || deps["kafkajs"]) indicators.add("Microservices");
    if (deps["typeorm"] || deps["prisma"] || deps["mongoose"] || deps["sequelize"]) indicators.add("Database/ORM");
    if (deps["redis"] || deps["ioredis"]) indicators.add("Caching (Redis)");
    
    return Array.from(indicators);
  }

  private async detectEntryPoints(projectPath: string, rootFiles: string[]): Promise<string[]> {
    const entryPoints: string[] = [];
    const candidates = [
      "src/main.ts", "src/main.js",
      "src/index.ts", "src/index.js",
      "index.ts", "index.js",
      "main.ts", "main.js",
      "app.ts", "app.js",
      "server.ts", "server.js"
    ];

    for (const candidate of candidates) {
      try {
        const stats = await fs.stat(path.join(projectPath, candidate));
        if (stats.isFile()) entryPoints.push(candidate);
      } catch {
        // file doesn't exist
      }
    }
    
    if (rootFiles.includes("main.py")) entryPoints.push("main.py");
    if (rootFiles.includes("main.go")) entryPoints.push("main.go");

    return entryPoints;
  }

  private async findDirectories(projectPath: string, candidates: string[]): Promise<string[]> {
    const found: string[] = [];
    for (const dir of candidates) {
      try {
        const stats = await fs.stat(path.join(projectPath, dir));
        if (stats.isDirectory()) found.push(dir);
      } catch {
        // directory doesn't exist
      }
    }
    return found;
  }

  private async detectLanguages(projectPath: string, rootFiles: string[]): Promise<string[]> {
    const languages = new Set<string>();

    try {
      if (rootFiles.includes("tsconfig.json")) languages.add("TypeScript");
      if (rootFiles.includes("package.json") && !languages.has("TypeScript")) languages.add("JavaScript");
      if (rootFiles.includes("go.mod")) languages.add("Go");
      if (rootFiles.includes("requirements.txt") || rootFiles.includes("pyproject.toml")) languages.add("Python");
      if (rootFiles.includes("pom.xml") || rootFiles.includes("build.gradle")) languages.add("Java");
      if (rootFiles.includes("Cargo.toml")) languages.add("Rust");

      const dirsToScan = [projectPath];
      if (rootFiles.includes("src")) dirsToScan.push(path.join(projectPath, "src"));
      if (rootFiles.includes("lib")) dirsToScan.push(path.join(projectPath, "lib"));

      for (const dir of dirsToScan) {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase();
              switch (ext) {
                case ".ts":
                case ".tsx":
                  languages.add("TypeScript");
                  break;
                case ".js":
                case ".jsx":
                  languages.add("JavaScript");
                  break;
                case ".py":
                  languages.add("Python");
                  break;
                case ".go":
                  languages.add("Go");
                  break;
                case ".java":
                  languages.add("Java");
                  break;
                case ".cs":
                  languages.add("C#");
                  break;
                case ".cpp":
                case ".cc":
                case ".cxx":
                  languages.add("C++");
                  break;
                case ".c":
                case ".h":
                  languages.add("C");
                  break;
                case ".rs":
                  languages.add("Rust");
                  break;
                case ".php":
                  languages.add("PHP");
                  break;
                case ".rb":
                  languages.add("Ruby");
                  break;
                case ".swift":
                  languages.add("Swift");
                  break;
                case ".kt":
                case ".kts":
                  languages.add("Kotlin");
                  break;
              }
            }
          }
        } catch (e) {
          // Ignore read errors for subdirectories
        }
      }
    } catch (error) {
      // Ignore
    }

    return Array.from(languages);
  }
}
