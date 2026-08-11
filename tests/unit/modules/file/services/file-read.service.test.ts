import { describe, test, expect, vi, afterEach } from "vitest";
import path from "node:path";
import fs from "fs/promises";
import { FileReadService } from "../../../../../src/modules/file/services/file-read.service.js";
import { ProjectRepository } from "../../../../../src/modules/project/repositories/project.repository.js";

// The describe block groups our tests for FileReadService.
describe("FileReadService", () => {
  
  // We use afterEach to clear mocks after every test, ensuring tests don't interfere with each other.
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("successfully reads a text file and respects line constraints", async () => {
    // 1. Setup Phase
    const service = new FileReadService();
    
    // We create a temporary test file on the disk to read from.
    const testFilePath = path.join(process.cwd(), "temp-test-file.txt");
    await fs.writeFile(testFilePath, "Line 1\nLine 2\nLine 3\nLine 4\nLine 5");

    const mockProject = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      path: process.cwd(), // Project root is current directory
    } as any;

    // Mock the DB to return our project
    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(mockProject);

    // 2. Execution Phase
    // We request to read ONLY lines 2 through 4 of our test file.
    const result = await service.readFile({
      projectId: mockProject.id,
      path: "temp-test-file.txt",
      startLine: 2,
      endLine: 4
    });

    // 3. Assertion Phase
    expect(result.success).toBe(true);
    // We verify the content only contains the requested lines.
    expect(result.content).toBe("Line 2\nLine 3\nLine 4");
    expect(result.metadata?.totalLines).toBe(5);
    expect(result.metadata?.isBinary).toBe(false);

    // Cleanup: Delete the temporary file we created
    await fs.unlink(testFilePath);
  });

  test("detects and rejects reading binary files as text", async () => {
    // 1. Setup Phase
    const service = new FileReadService();
    
    // We create a temporary binary file (filled with null bytes)
    const testBinaryPath = path.join(process.cwd(), "temp-test-binary.bin");
    const binaryBuffer = Buffer.alloc(100, 0); // 100 null bytes
    await fs.writeFile(testBinaryPath, binaryBuffer);

    const mockProject = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      path: process.cwd(),
    } as any;

    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(mockProject);

    // 2. Execution Phase
    const result = await service.readFile({
      projectId: mockProject.id,
      path: "temp-test-binary.bin"
    });

    // 3. Assertion Phase
    expect(result.success).toBe(true);
    expect(result.content).toBeUndefined();
    expect(result.metadata?.isBinary).toBe(true);

    // Cleanup
    await fs.unlink(testBinaryPath);
  });

  test("returns FORBIDDEN error for path traversal attempts", async () => {
    // 1. Setup Phase
    const service = new FileReadService();
    const mockProject = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      path: path.join(process.cwd(), "src"), // Set root to /src
    } as any;

    vi.spyOn(ProjectRepository.prototype, "findById").mockResolvedValue(mockProject);

    // 2. Execution Phase
    // Trying to read a file outside the project boundary
    const result = await service.readFile({
      projectId: mockProject.id,
      path: "../package.json" // Going UP a directory is forbidden
    });

    // 3. Assertion Phase
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("FORBIDDEN");
  });
});
