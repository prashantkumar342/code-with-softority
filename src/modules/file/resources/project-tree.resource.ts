import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceDefinition } from "../../../core/resources/types.js";
import { ProjectRepository } from "../../project/repositories/project.repository.js";
import { FileListService } from "../services/file-list.service.js";

const projectRepository = new ProjectRepository();
const fileListService = new FileListService();

export const projectTreeResource: ResourceDefinition = {
  name: "project_tree",
  uriOrTemplate: new ResourceTemplate("project://{projectId}/tree", { list: undefined }),
  description: "Get the directory tree of a registered project",
  mimeType: "application/json",
  readHandler: async (uri: URL) => {
    const match = uri.href.match(/^project:\/\/([^\/]+)\/tree$/);
    if (!match) {
      throw new Error("Invalid URI format for project tree");
    }
    const projectId = match[1];

    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const result = await fileListService.listFiles({
      projectId,
      path: ".",
      recursive: true,
      includeHidden: false,
      maxDepth: 10
    });
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to list files");
    }

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(result.files, null, 2),
        },
      ],
    };
  },
};
