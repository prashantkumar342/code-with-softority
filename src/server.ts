#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./core/tools/registry.js";
import { registerAllResources } from "./core/resources/registry.js";
import { registerAllPrompts } from "./core/prompts/registry.js";

// Initialize the MCP Server
const server = new McpServer(
  {
    name: "developer-mcp-server",
    version: "0.1.0",
  },
);

registerAllTools(server);
registerAllResources(server);
registerAllPrompts(server);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Developer MCP Server running on stdio");
}

runServer().catch(console.error);
