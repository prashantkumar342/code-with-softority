import { describe, test, expect, vi, afterEach } from "vitest";
import { registerAllResources } from "../../../../src/core/resources/registry.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

describe("Resources Registry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("registers all defined resources with the MCP server", () => {
    const mockServer = {
      registerResource: vi.fn(),
    } as unknown as McpServer;

    registerAllResources(mockServer);

    expect(mockServer.registerResource).toHaveBeenCalled();
    
    const calls = (mockServer.registerResource as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(2); // project_tree, file_content
    
    const resourceNames = calls.map((call: any[]) => call[0]);
    expect(resourceNames).toContain("project_tree");
    expect(resourceNames).toContain("file_content");
    
    const projectTreeCall = calls.find((call: any[]) => call[0] === "project_tree");
    expect(projectTreeCall[1]).toBeDefined(); // uriOrTemplate
    expect(projectTreeCall[2]).toHaveProperty("description");
    expect(projectTreeCall[2]).toHaveProperty("mimeType");
    expect(typeof projectTreeCall[3]).toBe("function"); // handler
  });
});
