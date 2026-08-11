import { ProjectMetadata, RemoveProjectReturn } from "../types/index.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import { Prisma } from "@prisma/client";

export class RemoveProjectService {
  private projectRepository = new ProjectRepository();

  async removeProject(projectId: ProjectMetadata["id"]): Promise<RemoveProjectReturn> {
    try {
      await this.projectRepository.delete(projectId);
      return {
        success: true,
        id: projectId,
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new Error(`Project with ID ${projectId} not found.`);
      }
      throw error;
    }
  }
}
