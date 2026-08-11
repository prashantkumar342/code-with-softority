import { describe, test, expect, vi, afterEach } from "vitest";
import { registerAllTools } from "../../../../src/core/tools/registry.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

describe("Tools Registry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("registers all defined tools with the MCP server", () => {
    const mockServer = {
      registerTool: vi.fn(),
    } as unknown as McpServer;

    registerAllTools(mockServer);

    expect(mockServer.registerTool).toHaveBeenCalled();
    
    const calls = (mockServer.registerTool as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(9);
    
    const toolNames = calls.map((call: any[]) => call[0]);
    expect(toolNames).toContain("project_register");
    expect(toolNames).toContain("list_project");
    expect(toolNames).toContain("file_search");
    expect(toolNames).toContain("git_diff");
    
    const registerProjectCall = calls.find((call: any[]) => call[0] === "project_register");
    expect(registerProjectCall[1]).toHaveProperty("description");
    expect(registerProjectCall[1]).toHaveProperty("inputSchema");
    expect(typeof registerProjectCall[2]).toBe("function"); // handler
  });
});
