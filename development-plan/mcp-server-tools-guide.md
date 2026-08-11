# MCP Server Tools Implementation Guide

This document provides a comprehensive implementation guide for all the Model Context Protocol (MCP) server tools specified in the `mcp-server-requirements.md`. It breaks down every tool, explaining its purpose, required input parameters, expected outputs, core features, and how to develop it safely according to the architectural principles (local-first, explicit boundaries, safe read/write separation).

You can use this guide as a checklist and development blueprint to build the tools one by one.

---

## 1. Project Tools

These tools manage the registration and analysis of developer projects (workspaces).

### 1.1 `project_list`

- **Purpose:** Returns a list of all currently registered projects in the MCP server.
- **Input Schema:** `{ "includeMetadata": boolean }` (Optional: whether to include deep analysis metadata or just basic info).
- **Output:** Array of project objects containing `id`, `name`, `path`, `type` (e.g., nestjs), and boolean flags for `git` and `docker`.
- **Features:** Should read from an internal state or configuration file (e.g., `~/.mcp/projects.json`) where registered projects are persisted.
- **How to Develop:** Create a persistent store (JSON file or SQLite) to save project paths. On invocation, read this store. If `includeMetadata` is true, perform a lightweight check on the project directory to update flags.

### 1.2 `project_register`

- **Purpose:** Registers a new local project for the MCP server to manage.
- **Input Schema:** `{ "path": string }` (Absolute or relative path).
- **Output:** The registered project object with initial analysis flags.
- **Features:** Validates if the directory exists. Resolves the path to absolute. Detects project type (NestJS, TypeScript), Git presence, Docker presence, and package manager.
- **How to Develop:** Use `fs.existsSync` and `fs.statSync`. Check for `.git`, `Dockerfile`, `tsconfig.json`, `package.json`, and `nest-cli.json` to populate the project metadata. Save the absolute path and metadata to the persistent store.

### 1.3 `project_remove`

- **Purpose:** Deregisters a project from the MCP server.
- **Input Schema:** `{ "projectId": string }`
- **Output:** Success confirmation boolean.
- **Features:** Removes the entry from the persistent store. **CRITICAL:** Does _not_ delete actual project files on the disk.
- **How to Develop:** Simple delete operation on your persistent state layer.

### 1.4 `project_analyze`

- **Purpose:** Performs a deep analysis of a registered project to provide context.
- **Input Schema:** `{ "projectId": string }`
- **Output:** Detailed JSON with languages, frameworks, entry points, src/test directories, dependencies, etc.
- **Features:** Reads `package.json` for dependencies, scans directory structure for `src/`, `test/`, reads `.env.example`, detects architectural patterns.
- **How to Develop:** Combine file-system scanning with JSON parsing. This should be heavily cached as it's an expensive operation.

---

## 2. File Tools

These tools provide safe filesystem access strictly bounded by the registered project paths.

### 2.1 `file_list`

- **Purpose:** Lists files and directories within a project.
- **Input Schema:** `{ "project": string, "path": string, "recursive": boolean, "includeHidden": boolean, "maxDepth": number }`
- **Output:** Array of file/directory objects (name, type, size, path).
- **Features:** Path traversal prevention. Must not list files outside the project root.
- **How to Develop:** Use `fs.readdir` or `fast-glob`. Normalize the requested path and assert it starts with the project's root path to prevent `../` attacks. Filter out hidden files unless `includeHidden` is true.

### 2.2 `file_read`

- **Purpose:** Reads the contents of a specific file.
- **Input Schema:** `{ "project": string, "path": string, "startLine": number, "endLine": number }`
- **Output:** File contents as a string, with line number metadata.
- **Features:** UTF-8 encoding support, file size limits (reject files >10MB), binary file detection (reject reading binaries as text).
- **How to Develop:** Use `fs.createReadStream` or `fs.readFileSync`. Check file extension or use a library like `isbinaryfile` to block binaries. If lines are specified, split by `\n` and slice the array.

### 2.3 `file_search`

- **Purpose:** Searches for text/patterns across project files.
- **Input Schema:** `{ "query": string, "path": string, "fileTypes": string[], "caseSensitive": boolean, "maxResults": number }`
- **Output:** Array of match objects (file path, line number, matched text snippet).
- **Features:** Glob filtering, regex search, default exclusions (`node_modules`, `.git`, `dist`).
- **How to Develop:** Consider wrapping `ripgrep` (rg) if available on the system for speed, or use a Node.js text search library. Ensure search is strictly bounded to the project directory.

### 2.4 `file_write`

- **Purpose:** Writes or replaces a complete file.
- **Input Schema:** `{ "project": string, "path": string, "content": string, "createBackup": boolean }`
- **Output:** Success confirmation.
- **Features:** **CRITICAL SAFETY:** Path boundary check. Generate a diff before modification. Require explicit client/user confirmation for destructive replacement.
- **How to Develop:** Ensure path is inside project. If file exists, read it, optionally copy to a `.backup` location, then write the new content. Return a unified diff in the output so the AI/User can see what changed.

### 2.5 `file_patch`

- **Purpose:** Applies targeted patch modifications to a file (preferred over `file_write`).
- **Input Schema:** `{ "project": string, "path": string, "patch": string, "createBackup": boolean }`
- **Output:** Success confirmation and updated file hash.
- **Features:** Safer than full replacement.
- **How to Develop:** Use a library like `diff` to apply standard unified patches. Handle hunk application failures gracefully and return clear errors if the patch cannot be cleanly applied.

### 2.6 `directory_tree`

- **Purpose:** Returns a structured tree visualization of the directory.
- **Input Schema:** `{ "project": string, "path": string }`
- **Output:** Hierarchical JSON structure of the directory.
- **How to Develop:** Recursive `fs.readdir` building a nested object tree. Limit depth or exclude `node_modules` to prevent massive payloads.

---

## 3. Git Integration Tools

Tools to safely interact with Git without allowing arbitrary shell commands.

### 3.1 `git_status` & `git_branches`

- **Purpose:** Returns current branch, modified, staged, untracked files, and a list of branches.
- **Input Schema:** `{ "project": string }`
- **How to Develop:** Use the `simple-git` npm package. Call `git.status()` and `git.branchLocal()`. Parse and return the structured JSON.

### 3.2 `git_diff` & `git_log` & `git_show` & `git_blame`

- **Purpose:** Read operations for Git history and changes.
- **Input Schema:** Various parameters (branch, limit, file path, commit hash).
- **How to Develop:** Map directly to `simple-git` functions (`git.diff()`, `git.log()`). Ensure formatting is clean and returns structured JSON (e.g., commit hash, author, date, message) instead of raw text blocks where possible.

### 3.3 Optional Write Operations (`git_stage`, `git_commit`, `git_checkout`, etc.)

- **Purpose:** Mutate git state.
- **Safety:** Each must be a distinct tool with typed schemas. NEVER use a generic `git_exec` tool.
- **How to Develop:** Implement individual typed wrappers using `simple-git`. E.g., `git_commit` takes `{ "message": string }`.

---

## 4. Database Tools

Tools for schema inspection and read-only querying.

### 4.1 `db_connect`

- **Purpose:** Registers a DB connection string securely.
- **Input:** `{ "connectionString": string, "profileName": string }`
- **Safety:** Never return credentials in output.
- **How to Develop:** Store connection strings securely in memory or an encrypted local config. Use libraries like `pg` (Postgres), `mysql2`, or `better-sqlite3`.

### 4.2 Schema Inspection (`db_list_tables`, `db_describe_table`, `db_schema`, `db_relationships`, `db_indexes`)

- **Purpose:** Extracts database structure.
- **How to Develop:** Query `information_schema` (for Postgres/MySQL) or `sqlite_master`. Map results into standardized JSON objects representing tables, columns (with types/nullability), PKs, and FKs.

### 4.3 `db_query_readonly`

- **Purpose:** Executes safe `SELECT` statements.
- **Input:** `{ "profile": string, "query": string, "limit": number }`
- **Safety:** Must use read-only transactions if supported by the DB. Reject queries containing `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`. Enforce a strict row limit (e.g., 100).
- **How to Develop:** Pre-parse the query using a basic SQL parser (like `node-sql-parser`) to ensure it's a `SELECT`. Wrap execution in a timeout.

---

## 5. TypeScript & NestJS Intelligence

Semantic code analysis tools that understand the framework, not just the text.

### 5.1 `typescript_analyze` & `typescript_symbols` & `typescript_dependencies`

- **Purpose:** Understands the TS configuration and extracts types/classes.
- **How to Develop:** Use the internal `typescript` compiler API (`ts.createProgram`). Parse `tsconfig.json`. Walk the Abstract Syntax Tree (AST) to find classes, interfaces, and exported functions. Track `import` statements to build a dependency graph.

### 5.2 NestJS Tools (`nestjs_analyze`, `nestjs_modules`, `nestjs_routes`, `nestjs_dependency_graph`)

- **Purpose:** Framework-specific awareness.
- **How to Develop:** Use the TypeScript AST to look for NestJS decorators (`@Module`, `@Controller`, `@Injectable`, `@Get`, `@Post`).
  - **Routes:** Parse `@Controller('prefix')` and method decorators (`@Get('path')`) to construct full API endpoints.
  - **Modules:** Look at the `imports`, `controllers`, and `providers` arrays in `@Module` decorators to build the framework dependency graph.

---

## 6. Docker Tools

Tools to understand containerized environments.

### 6.1 `docker_status` & `docker_container_inspect` & `docker_logs`

- **Purpose:** Monitor running containers.
- **How to Develop:** Use the `dockerode` npm package. Map `docker.listContainers()`, `container.inspect()`, and `container.logs()`. Filter out sensitive environment variables by default in the inspect tool.

### 6.2 `docker_compose_analyze` & `dockerfile_analyze`

- **Purpose:** Static analysis of Docker configurations.
- **How to Develop:**
  - **Compose:** Parse `docker-compose.yml` using `yaml` package. Extract services, ports, and volumes.
  - **Dockerfile:** Read the file text and extract `FROM`, `RUN`, `EXPOSE`, `ENV`, `CMD` instructions using regex or a Dockerfile parser.

### 6.3 Write Tools (`docker_start`, `docker_compose_up`, etc.)

- **Purpose:** Container lifecycle management.
- **Safety:** Requires explicit authorization.
- **How to Develop:** Use `dockerode` or execute specific typed shell commands using Node's `child_process.exec` (but heavily parameterized, NO shell injection).

---

## 7. Custom Prompt Tools

Tools to manage reusable LLM instructions/workflows.

### 7.1 `prompt_list`, `prompt_get`, `prompt_create`, `prompt_update`, `prompt_delete`

- **Purpose:** Manage Markdown files containing standard AI prompts.
- **How to Develop:** Store these in a `.mcp/prompts/` directory within the user's home folder or workspace. Each tool simply performs basic CRUD operations on these markdown files.
- **Prompt Arguments:** Implement a template rendering system (like Handlebars or simple string replacement) so prompts can accept variables like `{{project}}` or `{{file}}`.

---

## Security & Architecture Reminders for Implementation

1. **No Arbitrary Shell Execution:** Never build a tool that takes a string and runs `exec(input)`.
2. **Validation:** Use `Zod` for every tool's input schema. If the input doesn't match the schema, throw an immediate `INVALID_INPUT` error.
3. **Path Traversal Protection:** For any file tool, write a utility function `isPathWithinProject(projectRoot, requestedPath)` using `path.resolve()` and `path.relative()` and enforce it rigorously.
4. **Error Handling:** Standardize all tool returns. A tool should never crash the server. Catch all exceptions and return:
   ```json
   { "success": false, "error": { "code": "...", "message": "..." } }
   ```
5. **NestJS Architecture:** You can use NestJS to build the server itself. Create modules for `ProjectModule`, `FileModule`, `GitModule`. Map MCP tool invocations directly to NestJS Service methods.
