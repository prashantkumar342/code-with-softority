import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface ResourceDefinition {
  name: string;
  uriOrTemplate: string | ResourceTemplate;
  description?: string;
  mimeType?: string;
  readHandler: (request: any) => Promise<{ contents: { uri: string; mimeType?: string; text?: string; blob?: string }[] }>;
}
