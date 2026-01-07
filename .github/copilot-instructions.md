# Mockoon MCP Server

## Project Overview

This is a Model Context Protocol (MCP) server for manipulating Mockoon configuration files. It provides tools to read, modify, and manage Mockoon environments, routes, responses, and data buckets programmatically.

## Technology Stack

- TypeScript 5.6.0
- MCP SDK 1.0.4
- Zod 3.25.0 for schema validation
- Node.js 22+

## Available Tools

### Configuration Tools
1. **read_mockoon_config** - Read and parse Mockoon configuration files
2. **get_config_summary** - Get quick config overview (route count, response stats, complexity) ⚡ *Optimized - use first*

### Environment Tools
3. **list_environments** - List all environments in a configuration
4. **get_environment** - Get details of a specific environment

### Route Tools
5. **list_routes** - List routes with pagination support (offset, limit) ⚡ *Optimized - 10 routes default*
6. **get_route** - Get route details with metadata only (no bodies by default) ⚡ *Optimized*
7. **add_route** - Add a new route to an environment
8. **update_route** - Update an existing route
9. **delete_route** - Delete a route from an environment

### Response Tools
10. **get_response_details** - Get full response body, headers, rules ⚡ *Use only when editing*
11. **update_response** - Update a route response

### Template & Data Tools
12. **replace_dates_with_templates** - Replace static dates with Mockoon template syntax
13. **list_data_buckets** - List data buckets in an environment

## Context Optimization Guidelines

⚡ **Important**: This server is optimized to reduce LLM context pollution:

- **Discovery Phase**: Use `get_config_summary` → `list_routes` (paginated) → `get_route` (metadata)
- **Editing Phase**: Use `get_response_details` only when you need full body content
- **Avoid**: Loading full configs or all routes at once unless necessary

### Tool Usage Pattern:
```
1. get_config_summary → Understand scope (127 routes, 312 responses)
2. list_routes(offset=0, limit=10) → Browse first 10 routes
3. get_route(routeId) → See metadata (bodySize: 1.8KB, templateCount: 3)
4. get_response_details(routeId, responseId) → Get full body when editing
```

See [doc/CONTEXT_OPTIMIZATION_IMPLEMENTATION.md](../doc/CONTEXT_OPTIMIZATION_IMPLEMENTATION.md) for details.

## Development Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with auto-reload
- `npm start` - Run the compiled server
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Auto-fix linting issues

## Documentation Maintenance

⚠️ **Important**: When making major changes to the codebase, always update:

1. **README.md** - User-facing documentation, features, usage
2. **doc/ARCHITECTURE.md** - Technical architecture, structure, design decisions
3. **.github/copilot-instructions.md** - This file, project context for AI assistants

Major changes include: new features, structural refactoring, API changes, new tools, or significant architectural decisions.

## Configuration

Configure this server in Claude Desktop by adding to your MCP settings:

```json
{
  "mcpServers": {
    "mockoon": {
      "command": "node",
      "args": ["/absolute/path/to/mockoon-mcp/build/index.js"]
    }
  }
}
```

## Project Structure

- `/src/` - Source code organized by functionality
  - `/types/` - TypeScript type definitions
  - `/utils/` - Utility functions
  - `/tools/` - MCP tool definitions and handlers
  - `index.ts` - Entry point
  - `server.ts` - Server configuration
- `/build/` - Compiled JavaScript output
- `/doc/` - Project documentation
  - `ARCHITECTURE.md` - Detailed architecture documentation
- `/.vscode/mcp.json` - VS Code MCP configuration

For detailed architecture information, see [doc/ARCHITECTURE.md](../doc/ARCHITECTURE.md).
