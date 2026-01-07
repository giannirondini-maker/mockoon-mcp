/**
 * Date pattern detection and template generation utilities
 */

export interface DatePattern {
  path: string;
  value: string;
  isDateTime: boolean;
}

export type DateStrategy = 'relative' | 'offset' | 'manual';

/**
 * Find all date patterns in an object
 * Matches ISO 8601 date strings (with or without time)
 */
export function findDatePatterns(obj: unknown, path = ''): DatePattern[] {
  const dates: DatePattern[] = [];
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;

  const traverse = (current: unknown, currentPath: string): void => {
    if (typeof current === 'string' && dateRegex.test(current)) {
      dates.push({
        path: currentPath,
        value: current,
        isDateTime: current.includes('T'),
      });
    } else if (Array.isArray(current)) {
      current.forEach((item, index) => {
        // Use dot notation for arrays (Mockoon style: array.0.field)
        const arrayPath = currentPath ? `${currentPath}.${index}` : `${index}`;
        traverse(item, arrayPath);
      });
    } else if (typeof current === 'object' && current !== null) {
      Object.keys(current).forEach(key => {
        traverse(
          (current as Record<string, unknown>)[key],
          currentPath ? `${currentPath}.${key}` : key
        );
      });
    }
  };

  traverse(obj, path);
  return dates;
}

/**
 * Generate Mockoon template for a date based on strategy
 */
export function generateDateTemplate(
  dateInfo: DatePattern,
  strategy: DateStrategy,
  options: {
    variableName?: string;
    offsetDays?: number;
  } = {}
): string {
  const { variableName = 'requestDate', offsetDays = 0 } = options;

  switch (strategy) {
    case 'relative':
      // Relative to request dates
      if (dateInfo.isDateTime) {
        return `{{dateTimeShift (bodyRaw '${variableName}') days=${offsetDays}}}`;
      } else {
        return `{{date (bodyRaw '${variableName}') 'yyyy-MM-dd'}}`;
      }

    case 'offset':
      // Offset from today
      if (dateInfo.isDateTime) {
        return `{{dateTimeShift (now) days=${offsetDays}}}`;
      } else {
        return `{{date (dateTimeShift (now) days=${offsetDays}) 'yyyy-MM-dd'}}`;
      }

    case 'manual':
      // Manual template specification
      return `{{${variableName}}}`;

    default:
      throw new Error(`Unknown date strategy: ${strategy}`);
  }
}

/**
 * Replace dates in an object with templates
 */
export function replaceDatesWithTemplates(
  obj: unknown,
  datePatterns: DatePattern[],
  strategy: DateStrategy,
  options: {
    variableName?: string;
    offsetDays?: number;
  } = {}
): unknown {
  // Deep clone the object
  const templatedBody = JSON.parse(JSON.stringify(obj));

  datePatterns.forEach(dateInfo => {
    // Split by dots for Mockoon-style path (array.0.field)
    const pathParts = dateInfo.path.split('.');
    let current: Record<string, unknown> | unknown[] = templatedBody;

    // Navigate to the parent
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      // Handle array indices as integers
      const key = isNaN(Number(part)) ? part : parseInt(part);

      if (Array.isArray(current)) {
        current = current[key as number] as Record<string, unknown> | unknown[];
      } else {
        current = (current as Record<string, unknown>)[key as string] as
          | Record<string, unknown>
          | unknown[];
      }
    }

    const lastPart = pathParts[pathParts.length - 1];
    const lastKey = isNaN(Number(lastPart)) ? lastPart : parseInt(lastPart);
    const template = generateDateTemplate(dateInfo, strategy, options);

    if (Array.isArray(current)) {
      current[lastKey as number] = template;
    } else {
      (current as Record<string, unknown>)[lastKey as string] = template;
    }
  });

  return templatedBody;
}
