/**
 * MCP Tool definitions
 */

export const tools = [
  {
    name: 'read_mockoon_config',
    description: 'Read and parse a Mockoon configuration file',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'get_config_summary',
    description: 'Get a quick summary of the configuration without loading full details',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'find_route',
    description:
      'Find a route by endpoint path and method. Returns route UUID and response list for targeted operations. Supports partial endpoint matching.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        endpoint: {
          type: 'string',
          description: 'Endpoint path to search for (e.g., "/api/users"). Supports partial matching.',
        },
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, etc.). Optional - if omitted and multiple methods exist for the endpoint, returns disambiguation prompt.',
        },
      },
      required: ['filePath', 'endpoint'],
    },
  },
  {
    name: 'list_environments',
    description: 'List all environments in a Mockoon configuration file',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'get_environment',
    description: 'Get details of the environment (single environment per file)',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        identifier: {
          type: 'string',
          description:
            'Environment UUID or name (optional, uses the single environment if not provided)',
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'list_routes',
    description: 'List routes in the environment with pagination support',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        environmentId: {
          type: 'string',
          description:
            'Environment UUID or name (optional, uses the single environment if not provided)',
        },
        offset: {
          type: 'number',
          description: 'Number of routes to skip (default: 0)',
          default: 0,
        },
        limit: {
          type: 'number',
          description: 'Maximum number of routes to return (default: 10)',
          default: 10,
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'get_route',
    description: 'Get details of a specific route with optimized response metadata',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        environmentId: {
          type: 'string',
          description:
            'Environment UUID or name (optional, uses the single environment if not provided)',
        },
        routeId: {
          type: 'string',
          description: 'Route UUID',
        },
        includeBodies: {
          type: 'boolean',
          description: 'Include full response bodies (default: false, returns metadata only)',
          default: false,
        },
      },
      required: ['filePath', 'routeId'],
    },
  },
  {
    name: 'add_route',
    description: 'Add a new route to the environment',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        environmentId: {
          type: 'string',
          description:
            'Environment UUID or name (optional, uses the single environment if not provided)',
        },
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE, etc.)',
        },
        endpoint: {
          type: 'string',
          description: 'Route endpoint path',
        },
        responseBody: {
          type: 'string',
          description: 'Response body content',
        },
        statusCode: {
          type: 'number',
          description: 'HTTP status code',
          default: 200,
        },
        documentation: {
          type: 'string',
          description: 'Route documentation',
        },
      },
      required: ['filePath', 'method', 'endpoint', 'responseBody'],
    },
  },
  {
    name: 'update_route',
    description: 'Update an existing route',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        environmentId: {
          type: 'string',
          description:
            'Environment UUID or name (optional, uses the single environment if not provided)',
        },
        routeId: {
          type: 'string',
          description: 'Route UUID',
        },
        method: {
          type: 'string',
          description: 'HTTP method',
        },
        endpoint: {
          type: 'string',
          description: 'Route endpoint path',
        },
        enabled: {
          type: 'boolean',
          description: 'Whether the route is enabled',
        },
        documentation: {
          type: 'string',
          description: 'Route documentation',
        },
      },
      required: ['filePath', 'routeId'],
    },
  },
  {
    name: 'delete_route',
    description: 'Delete a route from the environment',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        environmentId: {
          type: 'string',
          description:
            'Environment UUID or name (optional, uses the single environment if not provided)',
        },
        routeId: {
          type: 'string',
          description: 'Route UUID',
        },
      },
      required: ['filePath', 'routeId'],
    },
  },
  {
    name: 'get_response_details',
    description:
      'Get full details of a specific response including body, headers, and rules. Use either responseId (UUID) or responseIndex (0-based position).',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        routeId: {
          type: 'string',
          description: 'Route UUID',
        },
        responseId: {
          type: 'string',
          description: 'Response UUID (alternative to responseIndex)',
        },
        responseIndex: {
          type: 'number',
          description: 'Response index (0-based position in the responses array, alternative to responseId)',
        },
      },
      required: ['filePath', 'routeId'],
    },
  },
  {
    name: 'update_response',
    description:
      'Update a route response. Use either responseId (UUID) or responseIndex (0-based position).',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        environmentId: {
          type: 'string',
          description:
            'Environment UUID or name (optional, uses the single environment if not provided)',
        },
        routeId: {
          type: 'string',
          description: 'Route UUID',
        },
        responseId: {
          type: 'string',
          description: 'Response UUID (alternative to responseIndex)',
        },
        responseIndex: {
          type: 'number',
          description: 'Response index (0-based position in the responses array, alternative to responseId)',
        },
        body: {
          type: 'string',
          description: 'Response body',
        },
        statusCode: {
          type: 'number',
          description: 'HTTP status code',
        },
        label: {
          type: 'string',
          description: 'Response label',
        },
      },
      required: ['filePath', 'routeId'],
    },
  },
  {
    name: 'list_data_buckets',
    description: 'List all data buckets in the environment',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        environmentId: {
          type: 'string',
          description:
            'Environment UUID or name (optional, uses the single environment if not provided)',
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'replace_dates_with_templates',
    description:
      'Find static dates in a response body and replace them with Mockoon template syntax. Supports three strategies: relative (dates relative to request parameters), offset (dates offset from current time), or manual (custom template variables). Use either responseId (UUID) or responseIndex (0-based position).',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the Mockoon configuration file',
        },
        routeId: {
          type: 'string',
          description: 'Route UUID',
        },
        responseId: {
          type: 'string',
          description: 'Response UUID (alternative to responseIndex)',
        },
        responseIndex: {
          type: 'number',
          description: 'Response index (0-based position in the responses array, alternative to responseId)',
        },
        strategy: {
          type: 'string',
          enum: ['relative', 'offset', 'manual'],
          description:
            'Date replacement strategy: relative=use request body dates as reference, offset=offset from current date, manual=custom template variable',
        },
        variableName: {
          type: 'string',
          description:
            'Template variable name (default: requestDate). For relative strategy, use path like "param_array.0.filters.search_date.0.string.gte"',
        },
        offsetDays: {
          type: 'number',
          description: 'Number of days to offset dates (used with offset strategy, default: 0)',
        },
      },
      required: ['filePath', 'routeId', 'strategy'],
    },
  },
];
