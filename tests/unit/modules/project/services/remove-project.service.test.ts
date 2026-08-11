import { test, expect, describe, vi, afterEach } from "vitest";
import crypto from "node:crypto";
import { RemoveProjectService } from "../../../../../src/modules/project/services/remove-project.service.js";
import { PrismaService } from "../../../../../src/core/database/prisma.service.js";

describe("RemoveProjectService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("successfully removes an existing project", async () => {
    const service = new RemoveProjectService();
    const prisma = PrismaService.getInstance();
    
    // Insert a dummy project directly into DB to ensure it exists for this test
    const dummyId = crypto.randomUUID();
    await prisma.project.create({
      data: {
        id: dummyId,
        name: "test-remove-project",
        path: "/dummy/path/to/remove/" + dummyId,
        type: "unknown",
        git: false,
        docker: false
      }
    });

    const result = await service.removeProject(dummyId);

    expect(result.success).toBe(true);
    expect(result.id).toBe(dummyId);
    
    // Verify it was actually removed from DB
    const check = await prisma.project.findUnique({ where: { id: dummyId } });
    expect(check).toBeNull();
  });

  test("throws error if project is not found", async () => {
    const service = new RemoveProjectService();
    const nonExistentId = crypto.randomUUID();

    await expect(service.removeProject(nonExistentId)).rejects.toThrow(new RegExp(`Project with ID ${nonExistentId} not found`));
  });
});
