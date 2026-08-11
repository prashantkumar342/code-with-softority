import { describe, test, expect } from "vitest";
import { prisma } from "../../../../src/core/database/prisma.service.js";

describe("PrismaService", () => {
  test("exports a valid prisma client instance", () => {
    expect(prisma).toBeDefined();
    // Verify it has prisma client methods
    expect(typeof prisma.project.create).toBe("function");
    expect(typeof prisma.project.findMany).toBe("function");
  });
});
