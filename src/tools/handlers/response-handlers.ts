/**
 * Handlers for response-related tools
 */

import { readMockoonConfig, writeMockoonConfig, getBodySize } from '../../utils/config.js';
import { findResponse } from '../../utils/response.js';

export async function handleUpdateResponse(args: {
  filePath: string;
  environmentId?: string;
  routeId: string;
  responseId?: string;
  responseIndex?: number;
  body?: string;
  statusCode?: number;
  label?: string;
}) {
  const { filePath, environmentId, routeId, responseId, responseIndex, body, statusCode, label } =
    args;

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

  const { response, error } = findResponse(route.responses, responseId, responseIndex);

  if (!response || error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: error || 'Response not found',
        },
      ],
      isError: true,
    };
  }

  if (body !== undefined) response.body = body;
  if (statusCode !== undefined) response.statusCode = statusCode;
  if (label !== undefined) response.label = label;

  await writeMockoonConfig(filePath, config);

  return {
    content: [
      {
        type: 'text' as const,
        text: `Response updated successfully for route: ${route.method} ${route.endpoint}`,
      },
    ],
  };
}

export async function handleGetResponseDetails(args: {
  filePath: string;
  routeId: string;
  responseId?: string;
  responseIndex?: number;
}) {
  const { filePath, routeId, responseId, responseIndex } = args;
  const config = await readMockoonConfig(filePath);

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

  const { response, error } = findResponse(route.responses, responseId, responseIndex);

  if (!response || error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: error || 'Response not found',
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            uuid: response.uuid,
            label: response.label,
            statusCode: response.statusCode,
            body: response.body,
            bodySize: getBodySize(response.body || ''),
            headers: response.headers,
            rules: response.rules,
            default: response.default,
          },
          null,
          2
        ),
      },
    ],
  };
}
