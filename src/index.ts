#!/usr/bin/env node
/**
 * Mockoon MCP Server
 *
 * Entry point for the Model Context Protocol server.
 * Manages Mockoon configuration files programmatically.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Mockoon MCP Server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
