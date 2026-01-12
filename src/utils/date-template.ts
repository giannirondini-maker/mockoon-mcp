/**
 * Date pattern detection and template generation utilities
 */

export interface DatePattern {
  path: string;
  value: string;
  isDateTime: boolean;
  fieldName: string; // The actual field name (last part of path)
}

export type DateStrategy = 'relative' | 'offset' | 'manual';

export interface ReplacementResult {
  success: boolean;
  replacementsCount: number;
  skippedCount: number;
  details: {
    field: string;
    path: string;
    originalValue: string;
    newValue?: string;
    status: 'replaced' | 'skipped';
    reason?: string;
  }[];
}

/**
 * Check if a string value looks like a Mockoon template
 */
export function isAlreadyTemplated(value: string): boolean {
  // Check for common Mockoon template patterns
  // Using a non-greedy match to find any {{...}} pattern
  return /\{\{.*?\}\}/.test(value);
}

/**
 * Check if a field name matches the given filter criteria
 */
export function matchesFieldFilter(
  fieldName: string,
  path: string,
  fieldPattern?: string,
  fieldNames?: string[]
): boolean {
  // If no filter specified, match all fields
  if (!fieldPattern && (!fieldNames || fieldNames.length === 0)) {
    return true;
  }

  // Check explicit field names list
  if (fieldNames && fieldNames.length > 0) {
    return fieldNames.includes(fieldName);
  }

  // Check regex pattern against field name
  if (fieldPattern) {
    try {
      const regex = new RegExp(fieldPattern);
      // Match against field name or full path
      return regex.test(fieldName) || regex.test(path);
    } catch {
      // If regex is invalid, treat as literal match
      return fieldName.includes(fieldPattern) || path.includes(fieldPattern);
    }
  }

  return true;
}

/**
 * Find all date patterns in an object
 * Matches ISO 8601 date strings (with or without time)
 */
export function findDatePatterns(
  obj: unknown,
  path = '',
  options?: {
    fieldPattern?: string;
    fieldNames?: string[];
  }
): DatePattern[] {
  const dates: DatePattern[] = [];
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;

  const traverse = (current: unknown, currentPath: string): void => {
    if (typeof current === 'string') {
      // Skip already templated values
      if (isAlreadyTemplated(current)) {
        return;
      }

      if (dateRegex.test(current)) {
        // Extract field name (last part of path)
        const pathParts = currentPath.split('.');
        const fieldName = pathParts[pathParts.length - 1];

        // Check if this field matches the filter
        if (matchesFieldFilter(fieldName, currentPath, options?.fieldPattern, options?.fieldNames)) {
          dates.push({
            path: currentPath,
            value: current,
            isDateTime: current.includes('T'),
            fieldName,
          });
        }
      }
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
 * Returns detailed information about what was replaced and what was skipped
 */
export function replaceDatesWithTemplates(
  obj: unknown,
  datePatterns: DatePattern[],
  strategy: DateStrategy,
  options: {
    variableName?: string;
    offsetDays?: number;
  } = {}
): { templatedBody: unknown; result: ReplacementResult } {
  // Deep clone the object
  const templatedBody = JSON.parse(JSON.stringify(obj));
  const result: ReplacementResult = {
    success: true,
    replacementsCount: 0,
    skippedCount: 0,
    details: [],
  };

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

    // Generate and apply template (datePatterns already excludes templated values)
    const template = generateDateTemplate(dateInfo, strategy, options);

    if (Array.isArray(current)) {
      current[lastKey as number] = template;
    } else {
      (current as Record<string, unknown>)[lastKey as string] = template;
    }

    result.replacementsCount++;
    result.details.push({
      field: dateInfo.fieldName,
      path: dateInfo.path,
      originalValue: dateInfo.value,
      newValue: template,
      status: 'replaced',
    });
  });

  return { templatedBody, result };
}
