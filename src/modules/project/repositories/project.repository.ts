import { prisma } from "../../../core/database/prisma.service.js";
import prismaPkg from "@prisma/client";
const { Prisma } = prismaPkg;

export class ProjectRepository {
  async create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({ data });
  }

  async upsert(data: Prisma.ProjectCreateInput) {
    return prisma.project.upsert({
      where: { path: data.path },
      update: data,
      create: data,
    });
  }

  async findAll() {
    return prisma.project.findMany();
  }

  async findById(id: string) {
    return prisma.project.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  }
}
