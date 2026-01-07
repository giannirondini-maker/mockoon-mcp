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
