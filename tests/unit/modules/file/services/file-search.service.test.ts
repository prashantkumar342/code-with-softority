import { describe, test, expect, vi, afterEach } from "vitest";
import path from "node:path";
import { FileSearchService } from "../../../../../src/modules/file/services/file-search.service.js";
import { ProjectRepository } from "../../../../../src/modules/project/repositories/project.repository.js";

describe("FileSearchService", () => {

  // Cleanup our mocks after every test to prevent memory leaks or side effects
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("successfully searches and finds exact text across multiple files", async () => {
    // 1. Setup Phase
    const service = new FileSearchService();
    const mockProject = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      path: process.cwd(), // We search the current MCP repository
    } as any;

    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(mockProject);

    // 2. Execution Phase
    // We are searching for a highly specific string we know exists in our project setup.
    const result = await service.searchFiles({
      projectId: mockProject.id,
      path: "src/modules/file", // Limit search to this directory for speed
      query: "FileSearchService", // The name of the class we are currently testing!
      caseSensitive: true,
      maxResults: 10
    });

    // 3. Assertion Phase
    expect(result.success).toBe(true);

    // We expect it to find matches because the class name is used in this very test file 
    // and in the service file itself.
    expect(result.totalMatches).toBeGreaterThan(0);
    expect(result.matches).toBeDefined();
    expect(result.matches!.length).toBeGreaterThan(0);

    // Verify the structure of a match object
    const firstMatch = result.matches![0];
    expect(firstMatch.filePath).toContain("file-search");
    expect(firstMatch.lineNumber).toBeGreaterThan(0);
    expect(firstMatch.snippet).toContain("FileSearchService");
  });

  test("honors fileType filters", async () => {
    // 1. Setup Phase
    const service = new FileSearchService();
    const mockProject = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      path: process.cwd(),
    } as any;

    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(mockProject);

    // 2. Execution Phase
    // We search for something common, but strictly limit it to Markdown files.
    const result = await service.searchFiles({
      projectId: mockProject.id,
      path: ".",
      query: "Project",
      caseSensitive: false,
      fileTypes: ["md"], // ONLY search .md files
      maxResults: 50
    });

    // 3. Assertion Phase
    expect(result.success).toBe(true);

    // We iterate through all matches to guarantee no .ts or .json files snuck in
    if (result.matches) {
      for (const match of result.matches) {
        expect(match.filePath.endsWith(".md")).toBe(true);
      }
    }
  });

  test("blocks searching outside the project root", async () => {
    // 1. Setup Phase
    const service = new FileSearchService();
    const mockProject = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      path: path.join(process.cwd(), "src"),
    } as any;

    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(mockProject);

    // 2. Execution Phase
    // Attempting a path traversal attack
    const result = await service.searchFiles({
      projectId: mockProject.id,
      path: "../", // Attempting to search the parent directory
      query: "password",
      caseSensitive: false,
      maxResults: 10
    });

    // 3. Assertion Phase
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("FORBIDDEN");
  });
});
