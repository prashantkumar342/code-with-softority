import { describe, test, expect, vi, afterEach } from "vitest";
import { registerAllPrompts } from "../../../../src/core/prompts/registry.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

describe("Prompts Registry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("registers all defined prompts with the MCP server", () => {
    // Create a mock MCP server
    const mockServer = {
      registerPrompt: vi.fn(),
    } as unknown as McpServer;

    registerAllPrompts(mockServer);

    // Verify registerPrompt was called for the expected prompts
    expect(mockServer.registerPrompt).toHaveBeenCalled();
    
    // We can inspect the calls
    const calls = (mockServer.registerPrompt as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(2); // At least code_review and bug_analysis
    
    const promptNames = calls.map((call: any[]) => call[0]);
    expect(promptNames).toContain("code_review");
    expect(promptNames).toContain("bug_analysis");
    
    // Check arguments shape for one
    const codeReviewCall = calls.find((call: any[]) => call[0] === "code_review");
    expect(codeReviewCall[1]).toHaveProperty("description");
    expect(codeReviewCall[1]).toHaveProperty("argsSchema");
    expect(typeof codeReviewCall[2]).toBe("function");
  });
});
