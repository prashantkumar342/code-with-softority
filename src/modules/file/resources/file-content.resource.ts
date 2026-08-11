import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceDefinition } from "../../../core/resources/types.js";
import { ProjectRepository } from "../../project/repositories/project.repository.js";
import { FileReadService } from "../services/file-read.service.js";

const projectRepository = new ProjectRepository();
const fileReadService = new FileReadService();

export const fileContentResource: ResourceDefinition = {
  name: "file_content",
  uriOrTemplate: new ResourceTemplate("project://{projectId}/file/{path}", { list: undefined }),
  description: "Get the content of a specific file in a project",
  mimeType: "text/plain",
  readHandler: async (uri: URL) => {
    const match = uri.href.match(/^project:\/\/([^\/]+)\/file\/(.+)$/);
    if (!match) {
      throw new Error("Invalid URI format for file content");
    }
    const projectId = match[1];
    const filePath = decodeURIComponent(match[2]);

    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const result = await fileReadService.readFile({ projectId, path: filePath });
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to read file");
    }

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "text/plain",
          text: result.content,
        },
      ],
    };
  },
};
