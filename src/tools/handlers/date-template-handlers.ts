/**
 * Handlers for date templating tools
 */

import { readMockoonConfig, writeMockoonConfig } from '../../utils/config.js';
import {
  findDatePatterns,
  replaceDatesWithTemplates,
  DateStrategy,
  ReplacementResult,
} from '../../utils/date-template.js';
import { findResponse } from '../../utils/response.js';

export async function handleReplaceDatesWithTemplates(args: {
  filePath: string;
  routeId: string;
  responseId?: string;
  responseIndex?: number;
  strategy: DateStrategy;
  variableName?: string;
  offsetDays?: number;
  fieldPattern?: string;
  fieldNames?: string[];
}) {
  const {
    filePath,
    routeId,
    responseId,
    responseIndex,
    strategy,
    variableName: rawVariableName,
    offsetDays = 0,
    fieldPattern,
    fieldNames,
  } = args;

  // Validate strategy-specific parameters
  // For relative strategy, variableName must be explicitly provided
  if (strategy === 'relative' && !rawVariableName) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: false,
              error: 'Missing required parameter for relative strategy',
              suggestion:
                'Provide variableName parameter with the request body path (e.g., "params.search_date")',
              example: 'variableName: "params.param_array.0.booking_date"',
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Set default variableName for non-relative strategies
  const variableName = rawVariableName || (strategy === 'relative' ? '' : 'requestDate');

  // Read config (which is the environment itself)
  let config;
  try {
    config = await readMockoonConfig(filePath);
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: false,
              error: 'Failed to read configuration file',
              details: error instanceof Error ? error.message : String(error),
              suggestion: 'Check that the file path is correct and the file contains valid JSON',
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Find route in the environment
  const route = config.routes.find(r => r.uuid === routeId);
  if (!route) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: false,
              error: `Route not found: ${routeId}`,
              suggestion: 'Use find_route tool to get the correct routeId',
              availableRoutes: config.routes.slice(0, 5).map(r => ({
                uuid: r.uuid,
                endpoint: r.endpoint,
                method: r.method,
              })),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Find response using helper
  const { response, error } = findResponse(route.responses, responseId, responseIndex);
  if (!response || error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: false,
              error: error || 'Response not found',
              suggestion: 'Use responseIndex (0-based) or responseId. Available responses:',
              availableResponses: route.responses.map((r, idx) => ({
                index: idx,
                uuid: r.uuid,
                label: r.label || 'Unnamed',
                statusCode: r.statusCode,
              })),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Validate response body is not empty
  if (!response.body || response.body.trim() === '') {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: false,
              error: 'Response body is empty',
              suggestion: 'The response has no body content to process',
              route: `${route.method} ${route.endpoint}`,
              response: response.label || 'Unnamed',
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Parse response body
  let responseBody;
  try {
    responseBody = JSON.parse(response.body);
  } catch (parseError) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: false,
              error: 'Failed to parse response body as JSON',
              details: parseError instanceof Error ? parseError.message : String(parseError),
              suggestion:
                'The response body must be valid JSON. Check for syntax errors or use a JSON validator.',
              bodyPreview: response.body.substring(0, 200) + (response.body.length > 200 ? '...' : ''),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Store original body for rollback if needed
  const originalBody = response.body;

  // Find date patterns with field filtering
  const datePatterns = findDatePatterns(responseBody, '', {
    fieldPattern,
    fieldNames,
  });

  if (datePatterns.length === 0) {
    // Provide helpful message based on whether filtering was used
    const filterInfo = fieldPattern || fieldNames ? {
      fieldPattern,
      fieldNames,
      suggestion: 'No dates found matching the specified filter. Try:',
      tips: [
        'Remove fieldPattern/fieldNames to see all available date fields',
        'Use a less restrictive pattern (e.g., "date" instead of "creation_date")',
        'Verify field names in the response body match your filter',
      ],
    } : {
      suggestion: 'No ISO 8601 date patterns found in the response body',
      tips: [
        'Dates must be in ISO 8601 format (e.g., "2024-01-15" or "2024-01-15T10:30:00Z")',
        'Check if dates already have Mockoon templates applied',
        'Verify the response body contains date fields',
      ],
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: true,
              operationPerformed: false,
              message: 'No date patterns found to replace',
              route: `${route.method} ${route.endpoint}`,
              response: response.label || 'Unnamed',
              ...filterInfo,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // Replace dates with templates
  let result: ReplacementResult;
  let templatedBody: unknown;
  
  try {
    const replacement = replaceDatesWithTemplates(responseBody, datePatterns, strategy, {
      variableName,
      offsetDays,
    });
    templatedBody = replacement.templatedBody;
    result = replacement.result;
  } catch (replaceError) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: false,
              error: 'Failed to replace dates with templates',
              details: replaceError instanceof Error ? replaceError.message : String(replaceError),
              suggestion: 'This may be due to an invalid strategy or template configuration',
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Validate the templated body is valid JSON
  let newBody: string;
  try {
    newBody = JSON.stringify(templatedBody);
    // Verify it can be parsed back
    JSON.parse(newBody);
  } catch (validationError) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: false,
              error: 'Validation failed: generated body is not valid JSON',
              details: validationError instanceof Error ? validationError.message : String(validationError),
              suggestion: 'This is an internal error. The original response was not modified.',
              rollback: 'No changes were made to the file',
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Update response
  response.body = newBody;

  // Write config with error handling
  try {
    await writeMockoonConfig(filePath, config);
  } catch (writeError) {
    // Rollback the in-memory change
    response.body = originalBody;
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: false,
              error: 'Failed to write configuration file',
              details: writeError instanceof Error ? writeError.message : String(writeError),
              suggestion: 'Check file permissions and disk space. No changes were persisted.',
              rollback: 'In-memory changes were rolled back',
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Prepare detailed summary
  const summary = {
    success: true,
    operationPerformed: true,
    route: `${route.method} ${route.endpoint}`,
    response: response.label || 'Unnamed',
    responseIndex: route.responses.indexOf(response),
    strategy,
    ...(strategy === 'offset' && { offsetDays }),
    ...(strategy === 'relative' && { variableName }),
    ...(strategy === 'manual' && { variableName }),
    ...(fieldPattern && { fieldPattern }),
    ...(fieldNames && { fieldNames }),
    statistics: {
      datesFound: datePatterns.length,
      datesReplaced: result.replacementsCount,
      datesSkipped: result.skippedCount,
    },
    details: result.details.map(d => ({
      field: d.field,
      path: d.path,
      status: d.status,
      ...(d.status === 'replaced' ? {
        originalValue: d.originalValue,
        template: d.newValue,
      } : {
        reason: d.reason,
      }),
    })),
  };

  // Add warning if some dates were skipped
  if (result.skippedCount > 0) {
    Object.assign(summary, {
      warning: `${result.skippedCount} date(s) were already templated and were skipped`,
    });
  }

  // Add success message
  if (result.replacementsCount > 0) {
    Object.assign(summary, {
      message: `✅ Successfully replaced ${result.replacementsCount} date(s) with ${strategy} strategy`,
    });
  } else if (result.skippedCount > 0) {
    Object.assign(summary, {
      message: `ℹ️ All ${result.skippedCount} date(s) were already templated - no changes needed`,
    });
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(summary, null, 2),
      },
    ],
  };
}
