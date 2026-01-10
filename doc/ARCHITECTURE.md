# Project Structure

## Directory Layout

```
src/
├── index.ts                    # Entry point - starts the MCP server
├── server.ts                   # Server configuration and request routing
├── types/
│   └── mockoon.ts             # TypeScript interfaces for Mockoon data structures
├── utils/
│   └── config.ts              # File I/O utilities for reading/writing configs
└── tools/
    ├── definitions.ts         # MCP tool definitions (schemas)
    └── handlers/              # Tool implementation handlers
        ├── index.ts           # Handler exports
        ├── config-handlers.ts     # Configuration reading tools
        ├── environment-handlers.ts # Environment management tools
        ├── route-handlers.ts      # Route CRUD operations
        ├── response-handlers.ts   # Response modification tools
        ├── databucket-handlers.ts # Data bucket tools
        └── date-template-handlers.ts # Date template replacement tools
```

## Module Responsibilities

### Entry Point (`index.ts`)

- Minimal entry point that bootstraps the server
- Handles transport setup (stdio)
- Error handling for server startup

### Server Setup (`server.ts`)

- Creates and configures the MCP server
- Registers request handlers
- Routes tool calls to appropriate handlers

### Types (`types/mockoon.ts`)

- All TypeScript interfaces for Mockoon configuration structures
- Centralized type definitions used throughout the codebase

### Utilities (`utils/`)

- **config.ts**: File I/O operations, configuration reading and writing, path resolution, and body metadata utilities (size calculation, previews, templating detection)
- **date-template.ts**: Date pattern detection and Mockoon template generation utilities

### Tool Definitions (`tools/definitions.ts`)

- MCP tool schemas with JSON Schema validation
- Tool metadata (name, description, parameters)

### Tool Handlers (`tools/handlers/`)

Organized by functional area:

- **config-handlers**: Read configuration files, get config summaries
- **environment-handlers**: List and get environments
- **route-handlers**: CRUD operations for routes, find route by endpoint
- **response-handlers**: Update route responses, get response details
- **date-template-handlers**: Replace static dates with Mockoon templates
- **databucket-handlers**: List data buckets

## Code Quality

### ESLint Configuration

The project uses ESLint with TypeScript support:

- Detects unused variables and imports
- Warns about `any` types
- Enforces consistent code style
- Configured in `eslint.config.mjs`

### Development Commands

```bash
npm run build      # Compile TypeScript
npm run dev        # Development mode with auto-reload
npm run lint       # Check code quality
npm run lint:fix   # Auto-fix linting issues
npm run prettier   # Format code with Prettier
```

## Context Optimization Architecture

The server implements several optimizations to reduce LLM context pollution:

### Direct Endpoint Lookup
- New `find_route` tool for direct route discovery by endpoint path and method
- Returns route UUID and response list with indices
- Supports partial endpoint matching
- Eliminates need to paginate through routes for common operations

### Response Index Support
- Tools `get_response_details`, `update_response`, and `replace_dates_with_templates` support `responseIndex`
- Use 0-based index as alternative to UUID
- Enables quick access: `find_route` → `replace_dates_with_templates(responseIndex=0)`

### Pagination System
- `list_routes` supports `offset` and `limit` parameters
- Default page size: 10 routes
- Returns metadata: `total`, `offset`, `limit`, `hasMore`
- Reduces context by ~90% for large configs

### Metadata-First Approach
- `get_route` returns response metadata by default
- Includes: `bodySize`, `bodyPreview` (100 chars), `hasTemplating`, `templateCount`, `hasRules`, `ruleCount`
- Full bodies loaded only when `includeBodies=true`
- Reduces context by ~85% per route

### On-Demand Body Loading
- `get_response_details` tool for explicit body retrieval
- Separates route structure exploration from body editing
- Only fetches full bodies when necessary

### Quick Summaries
- `get_config_summary` tool for config overview
- Returns aggregate stats without loading full config
- Helps LLM decide which detailed tools to call
- Reduces initial context by ~99%

### Utility Functions
The `config.ts` module provides:
- `getBodySize()`: Human-readable size formatting
- `getBodyPreview()`: Truncated body preview
- `hasTemplating()`: Mockoon template detection
- `countTemplates()`: Template expression counting

See [CONTEXT_OPTIMIZATION_IMPLEMENTATION.md](CONTEXT_OPTIMIZATION_IMPLEMENTATION.md) for detailed metrics.

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a single, clear responsibility
2. **Maintainability**: Easy to find and modify specific functionality
3. **Testability**: Handlers can be unit tested independently
4. **Scalability**: New tools can be added by creating new handler files
5. **Type Safety**: Centralized types prevent duplication and inconsistencies
6. **Code Quality**: ESLint catches common issues during development
7. **Context Efficiency**: Optimized tools reduce LLM context usage by 90%+
