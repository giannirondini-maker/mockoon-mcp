# Mockoon MCP Server

[![Open in VS Code](https://img.shields.io/badge/Open%20in-VS%20Code-blue?logo=visual-studio-code&logoColor=white)](https://vscode.dev/github/giannirondini-maker/mockoon-mcp)
[![Open in GitHub.dev](https://img.shields.io/badge/Open%20in-GitHub.dev-181717?logo=github&logoColor=white)](https://github.dev/giannirondini-maker/mockoon-mcp)

Open this repository in a web-based editor (vscode.dev or GitHub.dev).

A Model Context Protocol (MCP) server for managing Mockoon configuration files. This server provides tools to read, create, update, and manage Mockoon mock API configurations programmatically.

## Features

- Read and parse Mockoon configuration files
- List and manage environments
- Create, read, update, and delete routes
- Manage route responses
- Replace static dates with Mockoon templates
- List data buckets
- Full TypeScript support
- **Context-optimized tools** - Reduces LLM context usage by 90%+ with:
  - Pagination for large route lists
  - Metadata-only responses (bodies loaded on-demand)
  - Quick config summaries for discovery
  - Efficient workflows for browsing and editing

## Installation

```bash
npm install
npm run build
```

## Usage

### With Claude Desktop

Add this to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

### With Other MCP Clients

Run the server using stdio transport:

```bash
npm start
```

Or for development:

```bash
npm run dev
```

## Project Structure

The codebase is organized into a modular structure for maintainability. See [ARCHITECTURE.md](doc/ARCHITECTURE.md) for detailed documentation.

- `/src/types/` - TypeScript interfaces
- `/src/utils/` - Utility functions
- `/src/tools/` - Tool definitions and handlers
- `/src/server.ts` - Server configuration
- `/src/index.ts` - Entry point

## Development Commands

```bash
npm run build      # Compile TypeScript
npm run dev        # Development mode with auto-reload
npm run lint       # Check code quality
npm run lint:fix   # Auto-fix linting issues
```

## Available Tools

### read_mockoon_config

Read and parse a Mockoon configuration file.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file

### get_config_summary

Get a quick summary of the configuration without loading full details. **Use this first** to understand config scope.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file

**Returns:** Summary with route count, response statistics, and complexity metrics.

**Example Response:**
```json
{
  "name": "My API",
  "port": 3001,
  "routeCount": 127,
  "totalResponses": 312,
  "largestResponse": "42 KB",
  "templatesUsed": 18,
  "dataBucketCount": 3,
  "dataDepth": "deep"
}
```

### list_environments

List all environments in a Mockoon configuration file.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file

### get_environment

Get details of a specific environment by UUID or name.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file
- `identifier` (string): Environment UUID or name

### list_routes

List routes in an environment with pagination support.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file
- `environmentId` (string, optional): Environment UUID or name
- `offset` (number, optional): Number of routes to skip (default: 0)
- `limit` (number, optional): Maximum number of routes to return (default: 10)

**Returns:** Paginated response with `routes`, `total`, `offset`, `limit`, `hasMore` fields.

**Example Response:**
```json
{
  "routes": [/* first 10 routes */],
  "total": 127,
  "offset": 0,
  "limit": 10,
  "hasMore": true
}
```

### get_route

Get details of a specific route with optimized response metadata.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file
- `environmentId` (string, optional): Environment UUID or name
- `routeId` (string): Route UUID
- `includeBodies` (boolean, optional): Include full response bodies (default: false)

**Returns:** Route details with response metadata including `bodySize`, `bodyPreview`, `hasTemplating`, `templateCount`, `hasRules`, `ruleCount`. Full bodies only included if `includeBodies=true`.

**Example Response (default):**
```json
{
  "uuid": "abc-123",
  "method": "POST",
  "endpoint": "api/users",
  "responseCount": 1,
  "responses": [{
    "uuid": "xyz-456",
    "statusCode": 200,
    "bodySize": "1.8 KB",
    "bodyPreview": "{\"users\":[{...truncated...}]}",
    "hasTemplating": true,
    "templateCount": 3
  }]
}
```

### add_route

Add a new route to an environment.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file
- `environmentId` (string): Environment UUID or name
- `method` (string): HTTP method (GET, POST, PUT, DELETE, etc.)
- `endpoint` (string): Route endpoint path
- `responseBody` (string): Response body content
- `statusCode` (number, optional): HTTP status code (default: 200)
- `documentation` (string, optional): Route documentation

### update_route

Update an existing route.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file
- `environmentId` (string): Environment UUID or name
- `routeId` (string): Route UUID
- `method` (string, optional): HTTP method
- `endpoint` (string, optional): Route endpoint path
- `enabled` (boolean, optional): Whether the route is enabled
- `documentation` (string, optional): Route documentation

### delete_route

Delete a route from an environment.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file
- `environmentId` (string): Environment UUID or name
- `routeId` (string): Route UUID

### get_response_details

Get full details of a specific response including body, headers, and rules. **Use only when you need to edit or analyze the full response body.**

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file
- `routeId` (string): Route UUID
- `responseId` (string): Response UUID

**Returns:** Complete response details including full body content.

### update_response

Update a route response.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file
- `environmentId` (string, optional): Environment UUID or name
- `routeId` (string): Route UUID
- `responseId` (string): Response UUID
- `body` (string, optional): Response body
- `statusCode` (number, optional): HTTP status code
- `label` (string, optional): Response label

### replace_dates_with_templates

Find static dates in a response body and replace them with Mockoon template syntax.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file
- `routeId` (string): Route UUID
- `responseId` (string): Response UUID
- `strategy` (string): Date replacement strategy - `relative` (dates relative to request), `offset` (dates offset from now), or `manual` (custom variable)
- `variableName` (string, optional): Template variable name (default: requestDate)
- `offsetDays` (number, optional): Days to offset dates (for offset strategy)

**Strategies:**

- **relative**: Generates templates like `{{dateTimeShift (bodyRaw 'requestDate') days=0}}` - dates relative to request body values
- **offset**: Generates templates like `{{date (dateTimeShift (now) days=5) 'yyyy-MM-dd'}}` - dates offset from current time
- **manual**: Generates templates like `{{customVariable}}` - custom template variable names

### list_data_buckets

List all data buckets in the environment.

**Parameters:**

- `filePath` (string): Path to the Mockoon configuration file

## Project Structure

The codebase is organized into a modular structure for maintainability. See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed documentation.

- `/src/types/` - TypeScript interfaces
- `/src/utils/` - Utility functions
- `/src/tools/` - Tool definitions and handlers
- `/src/server.ts` - Server configuration
- `/src/index.ts` - Entry point

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode with auto-reload
npm run dev
```

## Example Usage

Once connected to Claude Desktop or another MCP client, you can use natural language commands like:

- "List all environments in my Mockoon config at /path/to/config.json"
- "Add a new GET route to the 'API' environment at /users with a 200 response"
- "Show me all routes in the 'Development' environment"
- "Update the response body for route xyz to include user data"
- "Delete the route with UUID abc123"

## Mockoon Configuration Format

This server works with standard Mockoon configuration files (typically `.json` files exported from Mockoon). The configuration includes:

- **Environments**: Mock API server instances with their own port and hostname
- **Routes**: API endpoints with HTTP methods and responses
- **Responses**: Response configurations including status codes, headers, and bodies
- **Data Buckets**: Reusable data templates
- **Callbacks**: Webhook configurations

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
