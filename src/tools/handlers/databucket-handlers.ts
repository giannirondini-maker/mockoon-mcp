/**
 * Handlers for data bucket-related tools
 */

import { readMockoonConfig } from '../../utils/config.js';

export async function handleListDataBuckets(args: { filePath: string; environmentId?: string }) {
  const { filePath, environmentId } = args;
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

  const buckets = (config.data || []).map(bucket => ({
    id: bucket.id,
    name: bucket.name,
    parsed: bucket.parsed,
  }));

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(buckets, null, 2),
      },
    ],
  };
}
