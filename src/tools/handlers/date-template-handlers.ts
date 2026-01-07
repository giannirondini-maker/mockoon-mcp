/**
 * Handlers for date templating tools
 */

import { readMockoonConfig, writeMockoonConfig } from '../../utils/config.js';
import {
  findDatePatterns,
  replaceDatesWithTemplates,
  DateStrategy,
} from '../../utils/date-template.js';

export async function handleReplaceDatesWithTemplates(args: {
  filePath: string;
  routeId: string;
  responseId: string;
  strategy: DateStrategy;
  variableName?: string;
  offsetDays?: number;
}) {
  const {
    filePath,
    routeId,
    responseId,
    strategy,
    variableName = 'requestDate',
    offsetDays = 0,
  } = args;

  // Read config (which is the environment itself)
  const config = await readMockoonConfig(filePath);

  // Find route in the environment
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

  // Find response
  const response = route.responses.find(r => r.uuid === responseId);
  if (!response) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Response not found: ${responseId}`,
        },
      ],
      isError: true,
    };
  }

  // Parse response body
  let responseBody;
  try {
    responseBody = JSON.parse(response.body);
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Failed to parse response body as JSON: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }

  // Find date patterns
  const datePatterns = findDatePatterns(responseBody);

  if (datePatterns.length === 0) {
    return {
      content: [
        {
          type: 'text' as const,
          text: 'No date patterns found in response body',
        },
      ],
    };
  }

  // Replace dates with templates
  const templatedBody = replaceDatesWithTemplates(responseBody, datePatterns, strategy, {
    variableName,
    offsetDays,
  });

  // Update response
  response.body = JSON.stringify(templatedBody);
  await writeMockoonConfig(filePath, config);

  // Prepare summary
  const summary = {
    route: `${route.method} ${route.endpoint}`,
    response: response.label || 'Unnamed',
    datesReplaced: datePatterns.length,
    dateLocations: datePatterns.map(d => ({
      path: d.path,
      originalValue: d.value,
      type: d.isDateTime ? 'datetime' : 'date',
    })),
    strategy,
    variableName,
    offsetDays,
  };

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(summary, null, 2),
      },
    ],
  };
}
