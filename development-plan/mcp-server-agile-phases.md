# Agile Development Phases for MCP Server

This document outlines the multi-phase Agile development strategy for the MCP Server. Following Agile principles, **every phase is designed to be a complete, shippable product** that provides immediate value to users. 

Instead of waiting for all tools to be developed, we will release working sets of features (Tools, Resources, and Prompts) incrementally.

---

## Phase 1: The Core Read-Only Engine (MVP)
**Goal:** Establish the foundational MCP server, allowing an AI assistant to safely read and understand a developer's project files and basic git state.
**Shippable Value:** Users can connect their AI to their local filesystem safely, read code, search for references, and use standard prompts.

### 1. Infrastructure & Core APIs
*   **Transport:** stdio integration (for VS Code / Desktop AI clients).
*   **Framework:** Base Node.js/TypeScript setup with MCP official SDK.
*   **Security:** Strict path boundary enforcement (prevent `../` traversal).

### 2. Shipped Tools
*   `project_register`: Register a local directory as a project.
*   `project_list`: List registered projects.
*   `file_list`: Browse directory structures.
*   `file_read`: Read file contents safely (with limits on size/binaries).
*   `file_search`: Search across the project (e.g., using ripgrep logic).
*   `git_status`: Check current branch and uncommitted changes.
*   `git_diff`: View working tree differences.

### 3. Shipped Resources & Prompts
*   **Resources:** `project://{project}/tree`, `project://{project}/file/{path}`.
*   **Prompts:** `code_review`, `bug_analysis` (Basic Markdown templates).

**Definition of Done for Phase 1:**
The server can be installed locally, connected to an MCP-compatible client (like Claude Desktop), and can successfully answer questions about the user's local code without crashing or exposing files outside the registered directory.

---

## Phase 2: Developer Intelligence (The "Smart" Phase)
**Goal:** Upgrade the server from a simple file-reader to an intelligent semantic analyzer. The server will now understand *frameworks* and *architecture*.
**Shippable Value:** AI assistants can now understand NestJS routing, TypeScript dependencies, and Prisma database models without needing to read every single file manually.

### 1. Shipped Tools
*   `typescript_analyze`: Extract TS compiler options.
*   `typescript_symbols`: Extract classes, interfaces, and exports.
*   `nestjs_analyze`: Detect Modules, Controllers, Providers.
*   `nestjs_routes`: Extract API endpoints.
*   `nestjs_dependency_graph`: Map injection relationships.
*   `db_schema` (via Prisma): Inspect Prisma schemas and models.
*   `project_analyze`: Deep inspection of project metadata and entry points.

### 2. Shipped Resources & Prompts
*   **Resources:** `project://{project}/typescript`, `project://{project}/nestjs`.
*   **Prompts:** `architecture_review`, `nestjs_review`, `api_review`.

**Definition of Done for Phase 2:**
When a user asks the AI "What are the API routes in my NestJS project?", the AI can call the NestJS tools to instantly provide a mapped list of endpoints instead of grep-searching raw text.

---

## Phase 3: Infrastructure & Database (The Context Expansion Phase)
**Goal:** Connect the MCP server to the surrounding infrastructure (Docker and live databases).
**Shippable Value:** Users can ask their AI to debug running containers, check environment configurations, and query read-only data from their local databases to help debug issues.

### 1. Infrastructure & Core APIs
*   **Transport:** Streamable HTTP support (optional, for remote/team setups).
*   **Auth:** Basic authentication/authorization for HTTP mode.

### 2. Shipped Tools
*   `docker_status`: List running containers.
*   `docker_container_inspect`: View container details (networks, mounts).
*   `docker_logs`: Stream or read container logs.
*   `docker_compose_analyze`: Parse `docker-compose.yml`.
*   `db_connect`: Register DB connection safely.
*   `db_list_tables`, `db_describe_table`, `db_indexes`: Live database schema inspection.
*   `db_query_readonly`: Safe `SELECT` execution with row limits.

### 3. Shipped Resources & Prompts
*   **Resources:** `project://{project}/docker`, `project://{project}/database/schema`.
*   **Prompts:** `database_review`, `docker_review`, `security_review`.

**Definition of Done for Phase 3:**
The AI can inspect a running Docker container, read its logs, and query a local PostgreSQL database to confirm if a bug is code-related or data-related.

---

## Phase 4: Controlled Mutation (The "Agentic" Phase)
**Goal:** Allow the AI to take action and modify the project, strictly governed by user confirmation.
**Shippable Value:** The AI transitions from a read-only assistant to an active developer capable of writing code, committing changes, and managing containers.

### 1. Security & Core APIs
*   **Safeguards:** Strict diff generation, backup creation, and explicit user-approval hooks for write operations.

### 2. Shipped Tools (Write Operations)
*   **Files:** `file_write` (full replacement), `file_patch` (targeted diffs).
*   **Git:** `git_stage`, `git_commit`, `git_create_branch`, `git_checkout`.
*   **Docker:** `docker_start`, `docker_stop`, `docker_compose_up`.
*   **Prompts Management:** `prompt_create`, `prompt_update`, `prompt_delete`.

### 3. Shipped Resources & Prompts
*   **Prompts:** `refactor_plan`, `documentation` (Prompts designed to trigger write operations).

**Definition of Done for Phase 4:**
A user can ask the AI to "Fix the null reference bug in users.service.ts and commit it to a new branch." The AI will use `file_patch` to fix the code and `git_commit` to save it, providing the user a seamless, agentic experience.

---

## Summary of the Agile Workflow

1.  **Develop & Test:** Build the specific tools for the current phase.
2.  **Validate Security:** Ensure boundaries are respected (especially in Phase 1 and 4).
3.  **Ship:** Release the version (e.g., v0.1 for Phase 1, v0.2 for Phase 2).
4.  **Feedback Loop:** Use the shipped server with an AI client to gather feedback and refine prompts/tools before starting the next phase.
