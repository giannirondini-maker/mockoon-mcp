/**
 * MCP Server setup and request handlers
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { tools } from './tools/definitions.js';
import {
  handleReadConfig,
  handleGetConfigSummary,
  handleListEnvironments,
  handleGetEnvironment,
  handleListRoutes,
  handleGetRoute,
  handleAddRoute,
  handleUpdateRoute,
  handleDeleteRoute,
  handleFindRoute,
  handleUpdateResponse,
  handleGetResponseDetails,
  handleListDataBuckets,
  handleReplaceDatesWithTemplates,
} from './tools/handlers/index.js';

/**
 * Create and configure the MCP server
 */
export function createServer(): Server {
  const server = new Server(
    {
      name: 'mockoon-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'read_mockoon_config':
          return await handleReadConfig(args as { filePath: string });

        case 'get_config_summary':
          return await handleGetConfigSummary(args as { filePath: string });

        case 'list_environments':
          return await handleListEnvironments(args as { filePath: string });

        case 'get_environment':
          return await handleGetEnvironment(args as { filePath: string; identifier?: string });

        case 'list_routes':
          return await handleListRoutes(
            args as {
              filePath: string;
              environmentId?: string;
              offset?: number;
              limit?: number;
            }
          );

        case 'get_route':
          return await handleGetRoute(
            args as {
              filePath: string;
              environmentId?: string;
              routeId: string;
              includeBodies?: boolean;
            }
          );

        case 'add_route':
          return await handleAddRoute(
            args as {
              filePath: string;
              environmentId?: string;
              method: string;
              endpoint: string;
              responseBody: string;
              statusCode?: number;
              documentation?: string;
            }
          );

        case 'update_route':
          return await handleUpdateRoute(
            args as {
              filePath: string;
              environmentId?: string;
              routeId: string;
              method?: string;
              endpoint?: string;
              enabled?: boolean;
              documentation?: string;
            }
          );

        case 'delete_route':
          return await handleDeleteRoute(
            args as {
              filePath: string;
              environmentId?: string;
              routeId: string;
            }
          );

        case 'find_route':
          return await handleFindRoute(
            args as {
              filePath: string;
              endpoint: string;
              method?: string;
            }
          );

        case 'update_response':
          return await handleUpdateResponse(
            args as {
              filePath: string;
              environmentId?: string;
              routeId: string;
              responseId?: string;
              responseIndex?: number;
              body?: string;
              statusCode?: number;
              label?: string;
            }
          );

        case 'get_response_details':
          return await handleGetResponseDetails(
            args as {
              filePath: string;
              routeId: string;
              responseId?: string;
              responseIndex?: number;
            }
          );

        case 'list_data_buckets':
          return await handleListDataBuckets(args as { filePath: string; environmentId?: string });

        case 'replace_dates_with_templates':
          return await handleReplaceDatesWithTemplates(
            args as {
              filePath: string;
              routeId: string;
              responseId?: string;
              responseIndex?: number;
              strategy: 'relative' | 'offset' | 'manual';
              variableName?: string;
              offsetDays?: number;
            }
          );

        default:
          return {
            content: [
              {
                type: 'text',
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
