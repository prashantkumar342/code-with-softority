import { ProjectMetadata, ListProjectReturn } from "../types/index.js";
import { ProjectRepository } from "../repositories/project.repository.js";

export class ListProjectService {
  private projectRepository = new ProjectRepository();

  async listProjects(): Promise<ListProjectReturn> {
    const dbProjects = await this.projectRepository.findAll();

    const projects: ProjectMetadata[] = dbProjects.map((p) => ({
      id: p.id,
      name: p.name,
      path: p.path,
      type: p.type as any,
      git: p.git,
      docker: p.docker,
    }));

    return {
      success: true,
      projects,
    };
  }
}
