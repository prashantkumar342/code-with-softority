import { test, expect, describe, vi, afterEach } from "vitest";
import fs from "fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { RegisterProjectService } from "../../../../../src/modules/project/services/register-project.service.js";

describe("RegisterProjectService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("successfully registers a valid project directory", async () => {
    const service = new RegisterProjectService();
    
    // Generate a unique path so we don't violate the DB unique constraint
    const targetPath = path.join(process.cwd(), "test-dir-" + crypto.randomUUID());
    
    // Mock fs.stat to pretend everything is a directory and files exist
    vi.spyOn(fs, "stat").mockImplementation(async (p) => {
      return {
        isDirectory: () => true,
      } as any;
    });

    // Mock readFile to pretend package.json exists and returns some deps
    vi.spyOn(fs, "readFile").mockImplementation(async (p) => {
      if (typeof p === "string" && p.includes("package.json")) {
        return JSON.stringify({ dependencies: { "@nestjs/core": "1.0.0" } });
      }
      throw new Error("ENOENT");
    });

    const result = await service.registerProject(targetPath);

    expect(result.success).toBe(true);
    expect(result.metadata.name).toBe(path.basename(targetPath));
    expect(result.metadata.type).toBe("nestjs");
    expect(result.metadata.path).toBe(path.resolve(targetPath));
  });

  test("throws error if path is not a directory", async () => {
    const service = new RegisterProjectService();
    
    vi.spyOn(fs, "stat").mockImplementation(async () => {
      return {
        isDirectory: () => false,
      } as any;
    });

    await expect(service.registerProject("some/invalid/path")).rejects.toThrow(/Path is not a directory/);
  });

  test("throws error if directory not found", async () => {
    const service = new RegisterProjectService();
    
    vi.spyOn(fs, "stat").mockImplementation(async () => {
      throw new Error("ENOENT");
    });

    await expect(service.registerProject("some/missing/path")).rejects.toThrow(/Directory not found or inaccessible/);
  });
});
