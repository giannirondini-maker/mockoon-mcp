/**
 * Response utility functions
 */

import { Response } from '../types/mockoon.js';

/**
 * Helper function to find a response by ID or index
 */
export function findResponse(
  responses: Response[],
  responseId?: string,
  responseIndex?: number
): { response: Response | undefined; error?: string } {
  if (responseId) {
    const response = responses.find(r => r.uuid === responseId);
    if (!response) {
      return { response: undefined, error: `Response not found: ${responseId}` };
    }
    return { response };
  }

  if (responseIndex !== undefined) {
    if (responseIndex < 0 || responseIndex >= responses.length) {
      return {
        response: undefined,
        error: `Response index ${responseIndex} out of bounds (0-${responses.length - 1})`,
      };
    }
    return { response: responses[responseIndex] };
  }

  return { response: undefined, error: 'Either responseId or responseIndex must be provided' };
}
