import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceDefinition } from "./types.js";
import { projectTreeResource } from "../../modules/file/resources/project-tree.resource.js";
import { fileContentResource } from "../../modules/file/resources/file-content.resource.js";

const allResources: ResourceDefinition[] = [
  projectTreeResource,
  fileContentResource
];

export function registerAllResources(server: McpServer) {
  for (const resource of allResources) {
    if (typeof resource.uriOrTemplate === "string") {
      server.registerResource(
        resource.name,
        resource.uriOrTemplate,
        { description: resource.description, mimeType: resource.mimeType },
        resource.readHandler as any
      );
    } else {
      server.registerResource(
        resource.name,
        resource.uriOrTemplate,
        { description: resource.description, mimeType: resource.mimeType },
        resource.readHandler as any
      );
    }
  }
}
