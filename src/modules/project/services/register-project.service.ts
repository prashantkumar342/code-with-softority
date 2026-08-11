import fs from "fs/promises";
import path from "path";
import { ProjectMetadata, RegisterProjectReturn } from "../types/index.js";
import { ProjectRepository } from "../repositories/project.repository.js";

export class RegisterProjectService {
  private projectRepository = new ProjectRepository();
  /**
   * Registers a project by analyzing its directory contents.
   */
  public async registerProject(targetPath: string): Promise<RegisterProjectReturn> {
    const absolutePath = path.resolve(targetPath);

    let stats;
    try {
      stats = await fs.stat(absolutePath);
    } catch (error) {
      throw new Error(`Directory not found or inaccessible: ${absolutePath}`);
    }

    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${absolutePath}`);
    }

    //  Analyze the project
    const projectName = path.basename(absolutePath);

    const hasGit = await this.fileExists(path.join(absolutePath, ".git"));
    const hasDocker =
      (await this.fileExists(path.join(absolutePath, "Dockerfile"))) ||
      (await this.fileExists(path.join(absolutePath, "docker-compose.yml")));

    const hasPackageJson = await this.fileExists(path.join(absolutePath, "package.json"));
    const hasTsConfig = await this.fileExists(path.join(absolutePath, "tsconfig.json"));
    const hasNestCli = await this.fileExists(path.join(absolutePath, "nest-cli.json"));

    let projectType: ProjectMetadata["type"] = "unknown";
    if (hasPackageJson) {
      projectType = "javascript";
      if (hasTsConfig) {
        projectType = "typescript";
      }
      if (hasNestCli) {
        projectType = "nestjs";
      }

      // Fallback check for NestJS in package.json if nest-cli.json is missing
      if (projectType !== "nestjs") {
        try {
          const pkgRaw = await fs.readFile(path.join(absolutePath, "package.json"), "utf-8");
          if (pkgRaw.includes("@nestjs/core")) {
            projectType = "nestjs";
          }
        } catch (e) {
          // Ignore read errors
        }
      }
    }

    const data = {
      name: projectName,
      path: absolutePath,
      type: projectType,
      git: hasGit,
      docker: hasDocker,
    };

    //  Store the project in SQLite via Repository
    const createdProject = await this.projectRepository.upsert(data);

    // Map back to our standard metadata format if needed
    const metadata: ProjectMetadata = {
      id: createdProject.id,
      name: createdProject.name,
      path: createdProject.path,
      type: createdProject.type as any,
      git: createdProject.git,
      docker: createdProject.docker,
    };

    return {
      success: true,
      metadata,
    };
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

}
