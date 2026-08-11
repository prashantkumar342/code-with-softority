import { describe, test, expect, vi, afterEach } from "vitest";
import { ProjectRepository } from "../../../../../src/modules/project/repositories/project.repository.js";
import { prisma } from "../../../../../src/core/database/prisma.service.js";

// Mock prisma client
vi.mock("../../../../../src/core/database/prisma.service.js", () => {
  return {
    prisma: {
      project: {
        create: vi.fn(),
        upsert: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      }
    }
  };
});

describe("ProjectRepository", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("create calls prisma.project.create", async () => {
    const repo = new ProjectRepository();
    const data: any = { id: "1", name: "Test" };
    
    vi.mocked(prisma.project.create).mockResolvedValue(data);
    const result = await repo.create(data);
    
    expect(prisma.project.create).toHaveBeenCalledWith({ data });
    expect(result).toEqual(data);
  });

  test("upsert calls prisma.project.upsert", async () => {
    const repo = new ProjectRepository();
    const data: any = { id: "1", name: "Test", path: "/test" };
    
    vi.mocked(prisma.project.upsert).mockResolvedValue(data);
    const result = await repo.upsert(data);
    
    expect(prisma.project.upsert).toHaveBeenCalledWith({
      where: { path: data.path },
      update: data,
      create: data,
    });
    expect(result).toEqual(data);
  });

  test("findAll calls prisma.project.findMany", async () => {
    const repo = new ProjectRepository();
    const data: any[] = [{ id: "1", name: "Test" }];
    
    vi.mocked(prisma.project.findMany).mockResolvedValue(data);
    const result = await repo.findAll();
    
    expect(prisma.project.findMany).toHaveBeenCalled();
    expect(result).toEqual(data);
  });

  test("findById calls prisma.project.findUnique", async () => {
    const repo = new ProjectRepository();
    const data: any = { id: "1", name: "Test" };
    
    vi.mocked(prisma.project.findUnique).mockResolvedValue(data);
    const result = await repo.findById("1");
    
    expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(result).toEqual(data);
  });

  test("delete calls prisma.project.delete", async () => {
    const repo = new ProjectRepository();
    const data: any = { id: "1", name: "Test" };
    
    vi.mocked(prisma.project.delete).mockResolvedValue(data);
    const result = await repo.delete("1");
    
    expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(result).toEqual(data);
  });
});
