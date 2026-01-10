/**
 * Handlers for route-related tools
 */

import {
  readMockoonConfig,
  writeMockoonConfig,
  getBodySize,
  getBodyPreview,
  hasTemplating,
  countTemplates,
} from '../../utils/config.js';
import {
  Route,
  OptimizedResponseMetadata,
  OptimizedResponseFull,
} from '../../types/mockoon.js';

export async function handleListRoutes(args: {
  filePath: string;
  environmentId?: string;
  offset?: number;
  limit?: number;
}) {
  const { filePath, environmentId, offset = 0, limit = 10 } = args;
  const config = await readMockoonConfig(filePath);

  if (environmentId && config.uuid !== environmentId && config.name !== environmentId) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Environment not found: ${environmentId}`,
        },
      ],
      isError: true,
    };
  }

  const total = config.routes.length;
  const paginatedRoutes = config.routes.slice(offset, offset + limit);

  const routes = paginatedRoutes.map(route => ({
    uuid: route.uuid,
    method: route.method,
    endpoint: route.endpoint,
    enabled: route.enabled,
    responseCount: route.responses.length,
    documentation: route.documentation,
  }));

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            routes,
            total,
            offset,
            limit,
            hasMore: offset + limit < total,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGetRoute(args: {
  filePath: string;
  environmentId?: string;
  routeId: string;
  includeBodies?: boolean;
}) {
  const { filePath, environmentId, routeId, includeBodies = false } = args;
  const config = await readMockoonConfig(filePath);

  if (environmentId && config.uuid !== environmentId && config.name !== environmentId) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Environment not found: ${environmentId}`,
        },
      ],
      isError: true,
    };
  }

  const route = config.routes.find(r => r.uuid === routeId);

  if (!route) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Route not found: ${routeId}`,
        },
      ],
      isError: true,
    };
  }

  // Optimize response data based on includeBodies flag
  const optimizedRoute = {
    uuid: route.uuid,
    method: route.method,
    endpoint: route.endpoint,
    enabled: route.enabled,
    documentation: route.documentation,
    responseCount: route.responses.length,
    responses: route.responses.map(
      (response): OptimizedResponseMetadata | OptimizedResponseFull => {
        const baseResponse: OptimizedResponseMetadata = {
          uuid: response.uuid,
          label: response.label,
          statusCode: response.statusCode,
          default: response.default,
          bodySize: getBodySize(response.body || ''),
          bodyPreview: getBodyPreview(response.body || ''),
          hasTemplating: hasTemplating(response.body || ''),
          templateCount: countTemplates(response.body || ''),
          hasRules: !!(response.rules && response.rules.length > 0),
          ruleCount: response.rules?.length || 0,
        };

        // Only include full body if explicitly requested
        if (includeBodies) {
          return {
            ...baseResponse,
            body: response.body,
            headers: response.headers,
            rules: response.rules,
          } as OptimizedResponseFull;
        }

        return baseResponse;
      }
    ),
  };

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(optimizedRoute, null, 2),
      },
    ],
  };
}

export async function handleAddRoute(args: {
  filePath: string;
  environmentId?: string;
  method: string;
  endpoint: string;
  responseBody: string;
  statusCode?: number;
  documentation?: string;
}) {
  const {
    filePath,
    environmentId,
    method,
    endpoint,
    responseBody,
    statusCode = 200,
    documentation,
  } = args;

  const config = await readMockoonConfig(filePath);

  if (environmentId && config.uuid !== environmentId && config.name !== environmentId) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Environment not found: ${environmentId}`,
        },
      ],
      isError: true,
    };
  }

  const newRoute: Route = {
    uuid: crypto.randomUUID(),
    method: method.toUpperCase(),
    endpoint,
    enabled: true,
    documentation,
    responses: [
      {
        uuid: crypto.randomUUID(),
        body: responseBody,
        statusCode,
        default: true,
        label: 'Default response',
      },
    ],
  };

  config.routes.push(newRoute);
  await writeMockoonConfig(filePath, config);

  return {
    content: [
      {
        type: 'text' as const,
        text: `Route added successfully: ${method} ${endpoint} (UUID: ${newRoute.uuid})`,
      },
    ],
  };
}

export async function handleUpdateRoute(args: {
  filePath: string;
  environmentId?: string;
  routeId: string;
  method?: string;
  endpoint?: string;
  enabled?: boolean;
  documentation?: string;
}) {
  const { filePath, environmentId, routeId, method, endpoint, enabled, documentation } = args;

  const config = await readMockoonConfig(filePath);

  if (environmentId && config.uuid !== environmentId && config.name !== environmentId) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Environment not found: ${environmentId}`,
        },
      ],
      isError: true,
    };
  }

  const route = config.routes.find(r => r.uuid === routeId);

  if (!route) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Route not found: ${routeId}`,
        },
      ],
      isError: true,
    };
  }

  if (method) route.method = method.toUpperCase();
  if (endpoint) route.endpoint = endpoint;
  if (enabled !== undefined) route.enabled = enabled;
  if (documentation !== undefined) route.documentation = documentation;

  await writeMockoonConfig(filePath, config);

  return {
    content: [
      {
        type: 'text' as const,
        text: `Route updated successfully: ${route.method} ${route.endpoint}`,
      },
    ],
  };
}

export async function handleDeleteRoute(args: {
  filePath: string;
  environmentId?: string;
  routeId: string;
}) {
  const { filePath, environmentId, routeId } = args;

  const config = await readMockoonConfig(filePath);

  if (environmentId && config.uuid !== environmentId && config.name !== environmentId) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Environment not found: ${environmentId}`,
        },
      ],
      isError: true,
    };
  }

  const routeIndex = config.routes.findIndex(r => r.uuid === routeId);

  if (routeIndex === -1) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Route not found: ${routeId}`,
        },
      ],
      isError: true,
    };
  }

  const deletedRoute = config.routes[routeIndex];
  config.routes.splice(routeIndex, 1);
  await writeMockoonConfig(filePath, config);

  return {
    content: [
      {
        type: 'text' as const,
        text: `Route deleted successfully: ${deletedRoute.method} ${deletedRoute.endpoint}`,
      },
    ],
  };
}

export async function handleFindRoute(args: {
  filePath: string;
  endpoint: string;
  method?: string;
}) {
  const { filePath, endpoint, method } = args;
  const config = await readMockoonConfig(filePath);

  // Normalize the search endpoint once before filtering
  const normalizedSearch = endpoint.toLowerCase();

  // Helper to find all matching routes using the matching hierarchy
  const findMatchingRoutes = (): typeof config.routes => {
    // 1. Check for exact matches first
    const exactMatches = config.routes.filter(
      r => r.endpoint.toLowerCase() === normalizedSearch
    );
    if (exactMatches.length > 0) return exactMatches;

    // 2. Look for prefix matches (e.g., "/api" matches "/api/users")
    const prefixMatches = config.routes.filter(r =>
      r.endpoint.toLowerCase().startsWith(normalizedSearch + '/')
    );
    if (prefixMatches.length > 0) return prefixMatches;

    // 3. Fallback to substring matches
    const substringMatches = config.routes.filter(r =>
      r.endpoint.toLowerCase().includes(normalizedSearch)
    );
    return substringMatches;
  };

  const matchingRoutes = findMatchingRoutes();

  // No matches found
  if (matchingRoutes.length === 0) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              found: false,
              message: `No route found matching endpoint: ${endpoint}`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // If method is specified, filter by it
  if (method) {
    const methodFiltered = matchingRoutes.filter(
      r => r.method.toUpperCase() === method.toUpperCase()
    );

    if (methodFiltered.length === 0) {
      // No route with that method, show available methods
      const availableChoices = matchingRoutes.map(r => ({
        method: r.method.toUpperCase(),
        uuid: r.uuid,
        endpoint: r.endpoint,
      }));

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                success: false,
                error_code: 'METHOD_NOT_FOUND',
                requires_user_clarification: true,
                blocking: true,
                instruction_to_llm: `STOP: Do not proceed. The method '${method.toUpperCase()}' does not exist for endpoint '${endpoint}'. Present the available methods below and wait for user response.`,
                user_prompt: `The endpoint '${endpoint}' does not have a ${method.toUpperCase()} method. Which HTTP method should I use instead?`,
                available_choices: availableChoices,
                next_action: 'resubmit_find_route_with_correct_method',
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }

    // Return the first match when method is specified
    const route = methodFiltered[0];
    const alternatives =
      methodFiltered.length > 1
        ? methodFiltered.slice(1).map(r => ({
            uuid: r.uuid,
            method: r.method,
            endpoint: r.endpoint,
          }))
        : undefined;

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              found: true,
              route: {
                uuid: route.uuid,
                method: route.method,
                endpoint: route.endpoint,
                enabled: route.enabled,
                documentation: route.documentation,
              },
              responses: route.responses.map((r, index) => ({
                index,
                uuid: r.uuid,
                label: r.label,
                statusCode: r.statusCode,
                default: r.default,
              })),
              alternatives,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // Method not specified - check for ambiguity
  // Group by endpoint to find routes with same endpoint but different methods
  const uniqueMethods = [...new Set(matchingRoutes.map(r => r.method))];

  // If only one route matches, or all matching routes have the same method, return the first one
  if (matchingRoutes.length === 1 || uniqueMethods.length === 1) {
    const route = matchingRoutes[0];
    const alternatives =
      matchingRoutes.length > 1
        ? matchingRoutes.slice(1).map(r => ({
            uuid: r.uuid,
            method: r.method,
            endpoint: r.endpoint,
          }))
        : undefined;

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              found: true,
              route: {
                uuid: route.uuid,
                method: route.method,
                endpoint: route.endpoint,
                enabled: route.enabled,
                documentation: route.documentation,
              },
              responses: route.responses.map((r, index) => ({
                index,
                uuid: r.uuid,
                label: r.label,
                statusCode: r.statusCode,
                default: r.default,
              })),
              alternatives,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // Multiple routes with different methods - request disambiguation
  const availableChoices = matchingRoutes.map(r => ({
    method: r.method.toUpperCase(),
    uuid: r.uuid,
    endpoint: r.endpoint,
  }));

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            success: false,
            error_code: 'USER_INPUT_REQUIRED',
            requires_user_clarification: true,
            blocking: true,
            instruction_to_llm: `STOP: Do not proceed without user input. Multiple routes found for endpoint '${endpoint}' with different HTTP methods. Present the options below and wait for user response. DO NOT make assumptions about which method to use.`,
            user_prompt: `Multiple routes found for endpoint '${endpoint}'. Which HTTP method should I use?`,
            available_choices: availableChoices,
            next_action: 'resubmit_find_route_with_method_parameter',
          },
          null,
          2
        ),
      },
    ],
    isError: true,
  };
}
