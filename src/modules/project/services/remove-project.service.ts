import { ProjectMetadata, RemoveProjectReturn } from "../types/index.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import prismaPkg from "@prisma/client";
const { Prisma } = prismaPkg;

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
