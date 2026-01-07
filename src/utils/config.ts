/**
 * Configuration file I/O utilities
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { MockoonConfig } from '../types/mockoon.js';

/**
 * Regex pattern to match Mockoon template expressions: {{...}}
 * Supports nested braces and handles edge cases
 */
const MOCKOON_TEMPLATE_PATTERN = /\{\{(?:[^}]|\}(?!\}))+\}\}/;

/**
 * Read and parse a Mockoon configuration file
 */
export async function readMockoonConfig(filePath: string): Promise<MockoonConfig> {
  const absolutePath = path.resolve(filePath);
  const content = await fs.readFile(absolutePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Write a Mockoon configuration to file
 */
export async function writeMockoonConfig(filePath: string, config: MockoonConfig): Promise<void> {
  const absolutePath = path.resolve(filePath);
  await fs.writeFile(absolutePath, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Calculate the size of a string in bytes and format as human-readable
 */
export function getBodySize(body: string): string {
  const bytes = Buffer.byteLength(body, 'utf-8');
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get a preview of the body (first 100 characters)
 */
export function getBodyPreview(body: string, maxLength: number = 100): string {
  if (body.length <= maxLength) return body;
  return body.substring(0, maxLength) + '...';
}

/**
 * Detect if body contains Mockoon templating syntax
 */
export function hasTemplating(body: string): boolean {
  return MOCKOON_TEMPLATE_PATTERN.test(body);
}

/**
 * Count the number of template expressions in the body
 */
export function countTemplates(body: string): number {
  const matches = body.match(new RegExp(MOCKOON_TEMPLATE_PATTERN.source, 'g'));
  return matches ? matches.length : 0;
}
