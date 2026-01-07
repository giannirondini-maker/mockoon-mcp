/**
 * Handlers for environment-related tools
 */

import { readMockoonConfig } from '../../utils/config.js';

export async function handleListEnvironments(args: { filePath: string }) {
  const { filePath } = args;
  const config = await readMockoonConfig(filePath);
  const environments = [config].map(env => ({
    uuid: env.uuid,
    name: env.name,
    port: env.port,
    hostname: env.hostname,
    routeCount: env.routes.length,
  }));

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(environments, null, 2),
      },
    ],
  };
}

export async function handleGetEnvironment(args: { filePath: string; identifier?: string }) {
  const { filePath, identifier } = args;
  const config = await readMockoonConfig(filePath);

  if (identifier && config.uuid !== identifier && config.name !== identifier) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Environment not found: ${identifier}`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(config, null, 2),
      },
    ],
  };
}
