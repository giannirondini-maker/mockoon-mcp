/**
 * Handlers for configuration-related tools
 */

import { readMockoonConfig, getBodySize, hasTemplating } from '../../utils/config.js';

export async function handleReadConfig(args: { filePath: string }) {
  const { filePath } = args;
  const config = await readMockoonConfig(filePath);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(config, null, 2),
      },
    ],
  };
}

export async function handleGetConfigSummary(args: { filePath: string }) {
  const { filePath } = args;
  const config = await readMockoonConfig(filePath);

  // Calculate response statistics
  let totalResponses = 0;
  let largestResponseSize = 0;
  let largestResponseBody = '';
  let templatesUsed = 0;

  for (const route of config.routes) {
    totalResponses += route.responses.length;
    for (const response of route.responses) {
      const body = response.body || '';
      const bodyLength = Buffer.byteLength(body, 'utf-8');
      if (bodyLength > largestResponseSize) {
        largestResponseSize = bodyLength;
        largestResponseBody = body;
      }
      if (hasTemplating(body)) {
        templatesUsed++;
      }
    }
  }

  // Determine data complexity
  let dataDepth = 'shallow';
  if (config.routes.length > 50 || totalResponses > 100) {
    dataDepth = 'medium';
  }
  if (config.routes.length > 100 || totalResponses > 200 || largestResponseSize > 10240) {
    dataDepth = 'deep';
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            name: config.name,
            port: config.port,
            hostname: config.hostname,
            routeCount: config.routes.length,
            totalResponses,
            largestResponse: getBodySize(largestResponseBody),
            templatesUsed,
            dataBucketCount: config.data?.length || 0,
            dataDepth,
          },
          null,
          2
        ),
      },
    ],
  };
}
