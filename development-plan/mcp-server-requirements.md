# Model Context Protocol (MCP) Server

## Requirements Specification

**Document Type:** Software Requirements Specification\
**Target:** Local Developer / Project Intelligence MCP Server\
**Primary Stack:** TypeScript, Node.js, NestJS-compatible,
Docker-compatible\
**Protocol:** Model Context Protocol (MCP)\
**Status:** Proposed\
**Version:** 1.0

------------------------------------------------------------------------

## 1. Objective

Build a **local-first MCP server** that gives AI clients controlled,
structured access to:

1.  Local project files and directories
2.  Git repositories and history
3.  Database schemas and database analysis
4.  Reusable custom drafting prompts
5.  TypeScript and NestJS project intelligence
6.  Docker and container environments
7.  Project-level metadata and configuration

The server acts as a **developer context and controlled execution
layer**, while keeping potentially destructive operations explicitly
restricted.

------------------------------------------------------------------------

# 2. Core Architecture

``` text
                    MCP Client
                 ┌──────────────┐
                 │ Claude / IDE │
                 │ AI Assistant │
                 └──────┬───────┘
                        │ MCP
              ┌─────────▼─────────┐
              │     MCP Server    │
              ├───────────────────┤
              │ Project Manager   │
              │ File Manager      │
              │ Git Manager       │
              │ Database Manager  │
              │ Docker Manager    │
              │ TS/Nest Analyzer  │
              │ Prompt Manager    │
              └───────┬───────────┘
                      │
       ┌──────────────┼────────────────┐
       ▼              ▼                ▼
   Filesystem       Git          DB / Docker
```

### Architectural Principles

-   **Local-first**
-   **Explicit filesystem boundaries**
-   **Read operations separated from write operations**
-   **Destructive operations require explicit confirmation**
-   **Typed tool inputs**
-   **Structured JSON outputs**
-   **No unrestricted shell execution**
-   **Project-aware context**
-   **Framework-aware analysis**
-   **Docker-aware execution**
-   **Least-privilege access**

------------------------------------------------------------------------

# 3. MCP Capabilities

The server should expose the three primary MCP primitives:

  Primitive       Purpose
  --------------- ------------------------------------------------
  **Tools**       Execute operations
  **Resources**   Expose project information and context
  **Prompts**     Provide reusable AI workflows and instructions

------------------------------------------------------------------------

# 4. Project Tools

## 4.1 `project_list`

List all registered projects.

### Input

``` json
{
  "includeMetadata": true
}
```

### Output

``` json
{
  "projects": [
    {
      "id": "project-id",
      "name": "my-api",
      "path": "C:\\Projects\\my-api",
      "type": "nestjs",
      "git": true,
      "docker": true
    }
  ]
}
```

------------------------------------------------------------------------

## 4.2 `project_register`

Register a local project.

### Requirements

-   Validate directory
-   Resolve absolute path
-   Detect project type
-   Detect Git
-   Detect Docker
-   Detect package manager
-   Detect TypeScript
-   Detect NestJS
-   Store project metadata

------------------------------------------------------------------------

## 4.3 `project_remove`

Remove a project from MCP registration without deleting project files.

------------------------------------------------------------------------

## 4.4 `project_analyze`

Analyze the project and return:

-   Programming languages
-   Frameworks
-   Package manager
-   Entry points
-   Source directories
-   Test directories
-   Configuration files
-   Environment files
-   Docker configuration
-   Git status
-   Dependencies
-   Architecture indicators

------------------------------------------------------------------------

# 5. Local File Tools

## 5.1 `file_list`

List files and directories.

### Parameters

``` text
project
path
recursive
includeHidden
maxDepth
```

### Supported file types

-   `.ts`
-   `.tsx`
-   `.js`
-   `.jsx`
-   `.json`
-   `.yaml`
-   `.yml`
-   `.env`
-   `.md`
-   `.sql`
-   Docker files
-   Configuration files

------------------------------------------------------------------------

## 5.2 `file_read`

Read a project file.

### Parameters

``` text
project
path
startLine
endLine
```

### Requirements

-   UTF-8 support
-   Line-number metadata
-   File-size limits
-   Binary-file detection
-   Encoding validation

------------------------------------------------------------------------

## 5.3 `file_search`

Search project files.

### Parameters

``` text
query
path
fileTypes
caseSensitive
maxResults
```

### Search capabilities

-   Plain-text search
-   Regex search
-   Glob filtering
-   Directory exclusion
-   File-type filtering

### Default exclusions

``` text
node_modules
.git
dist
build
coverage
.next
.cache
```

------------------------------------------------------------------------

## 5.4 `file_write`

Write or replace a file.

### Mandatory safeguards

-   Project must be registered
-   Path must remain inside project boundary
-   Detect existing files
-   Optional backup
-   Generate diff before modification
-   Require explicit confirmation for destructive replacement

------------------------------------------------------------------------

## 5.5 `file_patch`

Apply targeted file modifications.

### Input

``` json
{
  "path": "src/users/users.service.ts",
  "patch": "...",
  "createBackup": true
}
```

Patch-based modifications should be preferred over complete file
replacement.

------------------------------------------------------------------------

## 5.6 `directory_tree`

Return a structured directory tree without loading file contents.

------------------------------------------------------------------------

# 6. Git Integration

The server should provide a dedicated Git service instead of relying on
unrestricted shell execution.

## 6.1 Git Tools

### `git_status`

Return:

-   Current branch
-   Modified files
-   Added files
-   Deleted files
-   Untracked files
-   Staged files
-   Ahead/behind status

------------------------------------------------------------------------

### `git_diff`

Support:

-   Working-tree diff
-   Staged diff
-   Specific file diff
-   Commit-range diff

------------------------------------------------------------------------

### `git_log`

### Parameters

``` text
branch
limit
author
since
until
```

### Structured commit output

``` json
{
  "hash": "...",
  "author": "...",
  "date": "...",
  "subject": "..."
}
```

------------------------------------------------------------------------

### `git_show`

Inspect a specific commit.

------------------------------------------------------------------------

### `git_branches`

Return local and optionally remote branches.

------------------------------------------------------------------------

### `git_blame`

Return line-level authorship information.

------------------------------------------------------------------------

### `git_search`

Search Git history for:

-   Commit messages
-   Changed files
-   Authors
-   Code changes

------------------------------------------------------------------------

## 6.2 Optional Git Write Operations

These should remain separate tools:

``` text
git_stage
git_unstage
git_commit
git_create_branch
git_checkout
git_merge
git_revert
```

### Safety Requirement

Do **not** expose a generic:

``` text
execute_command("git ...")
```

tool as the primary Git interface.

Each Git operation should have its own validated input schema.

------------------------------------------------------------------------

# 7. Database Integration

The database module should initially focus on **schema inspection,
read-only analysis, and safe querying**, rather than unrestricted
database administration.

## Initial Database Support

-   PostgreSQL
-   MySQL
-   SQLite

## Future Database Support

-   SQL Server
-   MongoDB

------------------------------------------------------------------------

# 8. Database Tools

## 8.1 `db_connect`

Register a database connection.

Support:

-   Connection strings
-   Environment-based configuration
-   Named database profiles

Credentials must never be returned through MCP responses.

------------------------------------------------------------------------

## 8.2 `db_list_databases`

Return available databases where the database engine supports database
enumeration.

------------------------------------------------------------------------

## 8.3 `db_list_tables`

Return:

-   Schema
-   Table
-   Object type
-   Estimated row count

------------------------------------------------------------------------

## 8.4 `db_describe_table`

Return:

-   Columns
-   Data types
-   Nullable status
-   Defaults
-   Primary keys
-   Foreign keys
-   Unique constraints
-   Indexes

------------------------------------------------------------------------

## 8.5 `db_schema`

Return the complete relational schema.

Example:

``` text
User
 ├── id UUID PK
 ├── email VARCHAR UNIQUE
 └── created_at TIMESTAMP

Post
 ├── id UUID PK
 ├── author_id UUID FK → User.id
 └── content TEXT
```

------------------------------------------------------------------------

## 8.6 `db_relationships`

Return table relationships.

``` text
User 1 ─── N Post
Post N ─── N Tag
```

------------------------------------------------------------------------

## 8.7 `db_indexes`

Analyze:

-   Primary indexes
-   Unique indexes
-   Composite indexes
-   Potential missing indexes
-   Duplicate indexes

------------------------------------------------------------------------

## 8.8 `db_query_readonly`

Execute read-only SQL.

### Requirements

-   Read-only transaction
-   Query timeout
-   Result-size limit
-   Row limit
-   Multiple-statement prevention
-   No DDL
-   No DML

------------------------------------------------------------------------

## 8.9 `db_analyze`

Analyze the database for:

-   Normalization issues
-   Missing foreign keys
-   Missing indexes
-   Redundant indexes
-   Naming inconsistencies
-   Nullable-field patterns
-   Large tables
-   Potential performance issues
-   Relationship anomalies

------------------------------------------------------------------------

# 9. ORM Support

## 9.1 Prisma

Detect:

``` text
prisma/schema.prisma
```

Expose:

-   Models
-   Relations
-   Enums
-   Indexes
-   Constraints
-   Datasource
-   Generator

### Tool

``` text
prisma_analyze
```

------------------------------------------------------------------------

## 9.2 TypeORM

Detect decorators such as:

``` typescript
@Entity()
@Column()
@OneToMany()
@ManyToOne()
```

Analyze entity relationships and mappings.

------------------------------------------------------------------------

## 9.3 Sequelize

Detect:

-   Model definitions
-   Associations
-   Attributes
-   Constraints

------------------------------------------------------------------------

# 10. TypeScript Intelligence

The server should detect:

-   `tsconfig.json`
-   `tsconfig.*.json`
-   `package.json`
-   TypeScript version
-   Compiler options
-   Path aliases
-   Module system
-   Target
-   Strict mode

------------------------------------------------------------------------

## 10.1 `typescript_analyze`

Return:

``` text
TypeScript version
strict
target
module
paths
baseUrl
sourceMap
declaration
```

------------------------------------------------------------------------

## 10.2 `typescript_symbols`

Extract:

-   Classes
-   Interfaces
-   Types
-   Functions
-   Variables
-   Enums
-   Imports
-   Exports

------------------------------------------------------------------------

## 10.3 `typescript_dependencies`

Build an import dependency graph.

``` text
Controller
   ↓
Service
   ↓
Repository
   ↓
Database
```

------------------------------------------------------------------------

# 11. NestJS Intelligence

The server should automatically detect NestJS projects.

### Detection signals

``` text
@nestjs/core
@nestjs/common
nest-cli.json
```

------------------------------------------------------------------------

## 11.1 `nestjs_analyze`

Return:

-   Modules
-   Controllers
-   Providers
-   Guards
-   Interceptors
-   Pipes
-   Middleware
-   Filters
-   DTOs
-   Entities
-   Dependency relationships

------------------------------------------------------------------------

## 11.2 `nestjs_modules`

Example:

``` text
AppModule
 ├── AuthModule
 ├── UserModule
 ├── PostModule
 └── DatabaseModule
```

------------------------------------------------------------------------

## 11.3 `nestjs_routes`

Extract routes such as:

``` text
GET    /users
POST   /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

------------------------------------------------------------------------

## 11.4 `nestjs_dependency_graph`

Identify dependency injection relationships:

``` text
Controller → Service → Repository
```

------------------------------------------------------------------------

# 12. Docker Integration

The server should understand:

-   Dockerfiles
-   Docker Compose
-   Running containers
-   Images
-   Networks
-   Volumes

------------------------------------------------------------------------

# 13. Docker Tools

## 13.1 `docker_status`

Return:

-   Running containers
-   Stopped containers
-   Images
-   Networks
-   Volumes

------------------------------------------------------------------------

## 13.2 `docker_container_inspect`

Return:

-   Image
-   Ports
-   Environment variable names
-   Mounts
-   Networks
-   Health status
-   Resource configuration

Secret environment variable values must not be returned by default.

------------------------------------------------------------------------

## 13.3 `docker_logs`

### Parameters

``` text
container
tail
since
```

------------------------------------------------------------------------

## 13.4 `docker_compose_analyze`

Analyze:

``` yaml
services:
  api:
  postgres:
  redis:
```

Return:

-   Services
-   Service dependencies
-   Ports
-   Volumes
-   Networks
-   Health checks
-   Environment references

------------------------------------------------------------------------

## 13.5 `dockerfile_analyze`

Analyze:

-   Base image
-   Build stages
-   Installed dependencies
-   Exposed ports
-   Entry point
-   CMD
-   Environment declarations
-   Layer structure

------------------------------------------------------------------------

## 13.6 Optional Docker Write Tools

Keep lifecycle operations separate:

``` text
docker_start
docker_stop
docker_restart
docker_compose_up
docker_compose_down
```

All write operations require explicit authorization.

------------------------------------------------------------------------

# 14. MCP Resources

Resources should expose **context and project information**, not perform
destructive operations.

## Project Resources

``` text
project://{project}/metadata
project://{project}/tree
project://{project}/package
project://{project}/typescript
project://{project}/nestjs
project://{project}/git/status
project://{project}/git/diff
project://{project}/docker
project://{project}/database/schema
```

------------------------------------------------------------------------

# 15. Resource Templates

Use URI templates for dynamically addressable project data.

``` text
project://{project}/file/{path}
project://{project}/directory/{path}
project://{project}/git/commit/{hash}
project://{project}/database/table/{schema}/{table}
```

------------------------------------------------------------------------

# 16. Custom Drafting Prompts

Provide reusable prompts for common development workflows.

## Recommended Prompt Storage

``` text
.mcp/
└── prompts/
    ├── code-review.md
    ├── architecture-review.md
    ├── bug-analysis.md
    ├── api-design.md
    ├── database-review.md
    ├── security-review.md
    └── documentation.md
```

------------------------------------------------------------------------

## Prompt Tools

### `prompt_list`

List available custom prompts.

### `prompt_get`

Retrieve a prompt.

### `prompt_create`

Create a reusable prompt.

### `prompt_update`

Update an existing prompt.

### `prompt_delete`

Delete a prompt.

------------------------------------------------------------------------

## Prompt Arguments

Prompts should support typed arguments such as:

``` text
project
file
technology
objective
constraints
additional_context
```

------------------------------------------------------------------------

# 17. Recommended Built-in Prompts

  Prompt                  Purpose
  ----------------------- ----------------------------------
  `code_review`           Review selected code
  `architecture_review`   Analyze project architecture
  `nestjs_review`         Review NestJS structure
  `database_review`       Analyze database schema
  `api_review`            Review API design
  `security_review`       Identify security issues
  `performance_review`    Analyze performance
  `bug_analysis`          Investigate a reported bug
  `refactor_plan`         Produce a refactoring plan
  `documentation`         Generate technical documentation
  `docker_review`         Review Docker setup
  `git_review`            Analyze current Git changes

------------------------------------------------------------------------

# 18. Context Assembly

The server should provide a context aggregation layer so common
workflows do not require the model to call many independent tools.

### Example Resource

``` text
context://project/my-api/current
```

### Possible contents

``` text
Project metadata
+
Git status
+
Recent commits
+
Relevant files
+
TypeScript configuration
+
NestJS architecture
+
Docker configuration
+
Database schema
```

This provides a single project-level context surface for AI clients.

------------------------------------------------------------------------

# 19. Security Requirements

## 19.1 Filesystem Security

Mandatory controls:

-   Allowed project roots
-   Path traversal prevention
-   Symlink validation
-   Maximum file size
-   Binary-file detection
-   Sensitive-file protection

### Default sensitive patterns

``` text
.env
.env.*
*.pem
*.key
*.p12
*.crt
credentials.*
secrets.*
```

The server should return metadata or redacted content rather than
secrets.

------------------------------------------------------------------------

## 19.2 Command Execution

**Do not expose arbitrary shell execution by default.**

If command execution is required, provide a restricted:

``` text
command_execute
```

tool with:

-   Command allowlist
-   Working-directory restrictions
-   Timeout
-   Output limits
-   Environment filtering
-   Interactive-command prevention
-   Explicit approval for dangerous commands

------------------------------------------------------------------------

# 20. Authentication and Authorization

## Local stdio

Use:

-   OS-level user authorization
-   Filesystem sandbox boundaries
-   Explicit project registration

## HTTP

Support:

-   Authentication
-   Authorization
-   Origin validation
-   Host validation
-   Request limits
-   Rate limits

------------------------------------------------------------------------

# 21. Transport Requirements

## 21.1 stdio

Primary transport for:

-   VS Code
-   IDE integrations
-   Local AI clients
-   Desktop MCP clients

### Requirement

`stdout` must remain exclusively dedicated to MCP protocol traffic.
Diagnostic logs must go to `stderr`.

------------------------------------------------------------------------

## 21.2 Streamable HTTP

Required for:

-   Remote clients
-   Team environments
-   Containerized deployment
-   Centralized MCP servers

------------------------------------------------------------------------

# 22. NestJS Integration Strategy

The MCP server should **not require NestJS internally**, but it should
be fully compatible with NestJS deployments.

### Recommended architecture

``` text
src/
├── mcp/
│   ├── server.ts
│   ├── tools/
│   ├── resources/
│   └── prompts/
│
├── core/
│   ├── project/
│   ├── filesystem/
│   ├── git/
│   ├── database/
│   ├── docker/
│   └── analysis/
│
├── integrations/
│   ├── typescript/
│   ├── nestjs/
│   ├── prisma/
│   └── docker/
│
├── security/
├── config/
└── main.ts
```

NestJS may provide:

-   Dependency injection
-   HTTP transport
-   Configuration
-   Logging
-   Lifecycle management
-   Module organization

The MCP layer should remain independent of NestJS-specific business
logic.

------------------------------------------------------------------------

# 23. Docker Requirements

The project should provide:

``` text
Dockerfile
docker-compose.yml
.dockerignore
```

## Deployment Mode A --- Local Development

``` text
Host filesystem
      ↓
MCP server
      ↓
Git / Docker / Database
```

## Deployment Mode B --- Containerized

``` text
MCP container
 ├── Project mount
 ├── Git access
 ├── Docker API/socket
 └── Database network
```

Filesystem mounts must be explicitly configured. The container must not
automatically receive unrestricted access to the host filesystem.

------------------------------------------------------------------------

# 24. Configuration

Recommended configuration:

``` yaml
server:
  name: developer-mcp
  version: 1.0.0

projects:
  roots:
    - ./projects

filesystem:
  maxFileSize: 10485760

git:
  enabled: true

database:
  enabled: true

docker:
  enabled: true

security:
  allowWrites: false
  allowCommands: false
```

Environment variables should be capable of overriding configuration-file
values.

------------------------------------------------------------------------

# 25. Error Handling

All tools should return structured errors.

### Example

``` json
{
  "success": false,
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project does not exist",
    "details": {}
  }
}
```

### Standard Error Codes

``` text
INVALID_INPUT
PROJECT_NOT_FOUND
PATH_NOT_ALLOWED
FILE_NOT_FOUND
FILE_TOO_LARGE
GIT_ERROR
DATABASE_ERROR
DOCKER_ERROR
PERMISSION_DENIED
COMMAND_NOT_ALLOWED
RESOURCE_NOT_FOUND
```

------------------------------------------------------------------------

# 26. Observability

Log:

-   Tool invocation
-   Tool duration
-   Success/failure
-   Project ID
-   Operation type
-   Error code

Never log unnecessarily:

-   Passwords
-   API keys
-   Database credentials
-   Environment secrets
-   Private file contents

### Log Levels

``` text
DEBUG
INFO
WARN
ERROR
```

------------------------------------------------------------------------

# 27. Performance Requirements

  Operation               Target
  ------------------- ----------
  Project metadata      \<100 ms
  Git status            \<500 ms
  File read             \<200 ms
  File search              \<1 s
  Schema inspection        \<2 s
  Project analysis         \<5 s
  Docker inspection        \<2 s

Large operations should support:

-   Pagination
-   Result limits
-   Caching
-   Lazy loading

------------------------------------------------------------------------

# 28. Caching

Cache relatively static information:

``` text
TypeScript configuration
NestJS architecture
Database metadata
Docker configuration
Project tree
```

Invalidate cache when:

-   Files change
-   Git checkout occurs
-   Database schema changes
-   Docker Compose configuration changes

------------------------------------------------------------------------

# 29. Testing Requirements

## 29.1 Unit Tests

Test:

-   Path validation
-   Git parsing
-   SQL validation
-   Schema analysis
-   Docker parsing
-   TypeScript analysis
-   NestJS detection
-   Prompt rendering

------------------------------------------------------------------------

## 29.2 Integration Tests

Test against:

-   Real Git repositories
-   PostgreSQL
-   SQLite
-   Docker
-   Sample NestJS applications

------------------------------------------------------------------------

## 29.3 MCP Protocol Tests

Verify:

``` text
tools/list
tools/call
resources/list
resources/read
prompts/list
prompts/get
```

------------------------------------------------------------------------

# 30. MVP Scope

## Phase 1 --- Core

-   MCP server
-   stdio transport
-   Project registration
-   File listing
-   File reading
-   File searching
-   Git status
-   Git diff
-   Git log
-   Project resources
-   Custom prompts

## Phase 2 --- Developer Intelligence

-   TypeScript analysis
-   NestJS analysis
-   Dependency graph
-   Route extraction
-   Prisma analysis
-   Database schema inspection

## Phase 3 --- Infrastructure

-   Docker inspection
-   Docker Compose analysis
-   PostgreSQL read-only queries
-   Streamable HTTP
-   Authentication

## Phase 4 --- Controlled Mutation

-   File patching
-   Git operations
-   Docker lifecycle operations
-   Database migrations
-   Automated project modifications

------------------------------------------------------------------------

# 31. Complete Tool Inventory

``` text
PROJECT
project_list
project_register
project_remove
project_analyze

FILES
file_list
file_read
file_search
file_write
file_patch
directory_tree

GIT
git_status
git_diff
git_log
git_show
git_branches
git_blame
git_search
git_stage
git_unstage
git_commit
git_create_branch
git_checkout
git_merge
git_revert

DATABASE
db_connect
db_list_databases
db_list_tables
db_describe_table
db_schema
db_relationships
db_indexes
db_query_readonly
db_analyze

TYPESCRIPT
typescript_analyze
typescript_symbols
typescript_dependencies

NESTJS
nestjs_analyze
nestjs_modules
nestjs_routes
nestjs_dependency_graph

DOCKER
docker_status
docker_container_inspect
docker_logs
docker_compose_analyze
dockerfile_analyze
docker_start
docker_stop
docker_restart
docker_compose_up
docker_compose_down

PROMPTS
prompt_list
prompt_get
prompt_create
prompt_update
prompt_delete
```

------------------------------------------------------------------------

# 32. Complete Resource Inventory

``` text
project://{project}/metadata
project://{project}/tree
project://{project}/package
project://{project}/typescript
project://{project}/nestjs
project://{project}/git/status
project://{project}/git/diff
project://{project}/docker
project://{project}/database/schema
project://{project}/file/{path}
project://{project}/git/commit/{hash}
project://{project}/database/table/{schema}/{table}
```

------------------------------------------------------------------------

# 33. Recommended Design Boundary

The server should be designed as a **developer-control MCP server**, not
as a generic shell-access MCP server.

### Preferred

``` text
AI
 ↓
MCP
 ↓
Typed developer tools
 ↓
Validated service layer
 ↓
Filesystem / Git / DB / Docker
```

### Avoid

``` text
AI
 ↓
MCP
 ↓
arbitrary shell
 ↓
anything
```

This architecture provides:

-   Better security
-   Predictable tool behavior
-   Structured results
-   Easier auditing
-   Better permission control
-   Easier testing
-   Cleaner client integration
-   Framework-independent core services

------------------------------------------------------------------------

# 34. Recommended Technology Stack

  Layer                   Recommendation
  ----------------------- --------------------------------------------
  Runtime                 Node.js
  Language                TypeScript
  MCP                     Official MCP TypeScript SDK
  Application framework   NestJS-compatible
  Validation              Zod
  Git                     `simple-git` or controlled Git CLI wrapper
  PostgreSQL              `pg`
  MySQL                   `mysql2`
  SQLite                  `better-sqlite3`
  Prisma                  Prisma schema/parser integration
  TypeScript analysis     TypeScript Compiler API
  NestJS analysis         TypeScript AST + NestJS metadata patterns
  Docker                  Docker CLI/API integration
  Configuration           Environment + YAML/JSON
  Logging                 Pino
  Testing                 Vitest/Jest
  Packaging               npm/pnpm
  Deployment              Native Node.js + Docker

------------------------------------------------------------------------

# 35. Acceptance Criteria

The MVP is considered complete when an MCP client can:

-   Register a local TypeScript/NestJS project.
-   Browse its directory structure.
-   Read and search project files.
-   Inspect Git status, diff, history, and branches.
-   Detect TypeScript configuration.
-   Detect and analyze NestJS modules and routes.
-   Inspect Prisma/database schemas.
-   Read PostgreSQL metadata without modifying the database.
-   Analyze Dockerfiles and Docker Compose files.
-   Inspect Docker containers.
-   Load reusable project-specific prompts.
-   Expose project context through MCP resources.
-   Run through stdio reliably.
-   Run through Streamable HTTP when HTTP mode is enabled.
-   Prevent filesystem escape and accidental secret exposure.
-   Reject unauthorized destructive operations.
-   Return consistent structured errors.

------------------------------------------------------------------------

# 36. Reference Sources

-   [Model Context Protocol --- Official
    Specification](https://modelcontextprotocol.io/)
-   [MCP TypeScript SDK](https://ts.sdk.modelcontextprotocol.io/)
-   [MCP TypeScript SDK
    GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
-   [MCP Specification
    Repository](https://github.com/modelcontextprotocol/modelcontextprotocol)

------------------------------------------------------------------------

## Final Architecture Summary

``` text
                         ┌──────────────────────┐
                         │      MCP Client      │
                         │ IDE / Desktop / AI   │
                         └──────────┬───────────┘
                                    │
                              MCP Protocol
                                    │
                    ┌───────────────▼───────────────┐
                    │          MCP Server            │
                    │                                │
                    │  Tools     Resources  Prompts │
                    └───────────────┬────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
       ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
       │   Project   │       │ Developer   │       │Infrastructure│
       │   Context   │       │ Intelligence│       │   Services   │
       ├─────────────┤       ├─────────────┤       ├──────────────┤
       │ Files       │       │ TypeScript  │       │ Docker       │
       │ Git         │       │ NestJS      │       │ PostgreSQL   │
       │ Metadata    │       │ Prisma      │       │ MySQL        │
       └─────────────┘       └─────────────┘       └──────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │ Security / Policy   │
                         │ Validation / Audit  │
                         └─────────────────────┘
```

**End of specification.**
