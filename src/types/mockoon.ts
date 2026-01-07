/**
 * Mockoon configuration type definitions
 */

export interface MockoonEnvironment {
  uuid: string;
  name: string;
  port: number;
  hostname: string;
  routes: Route[];
  proxyMode?: boolean;
  proxyHost?: string;
  cors?: boolean;
  headers?: Header[];
  data?: DataBucket[];
}

export interface Route {
  uuid: string;
  method: string;
  endpoint: string;
  responses: Response[];
  enabled: boolean;
  documentation?: string;
}

export interface Response {
  uuid: string;
  body: string;
  statusCode: number;
  label?: string;
  headers?: Header[];
  filePath?: string;
  sendFileAsBody?: boolean;
  rules?: ResponseRule[];
  default?: boolean;
  databucketID?: string;
  callbacks?: Callback[];
}

export interface Header {
  key: string;
  value: string;
}

export interface ResponseRule {
  target: string;
  modifier: string;
  value: string;
  operator: string;
}

export interface DataBucket {
  id: string;
  name: string;
  value: string;
  parsed?: boolean;
}

export interface Callback {
  name: string;
  method: string;
  uri: string;
  body?: string;
  headers?: Header[];
}

/**
 * Optimized response metadata (without full body)
 */
export interface OptimizedResponseMetadata {
  uuid: string;
  label?: string;
  statusCode: number;
  default?: boolean;
  bodySize: string;
  bodyPreview: string;
  hasTemplating: boolean;
  templateCount: number;
  hasRules: boolean;
  ruleCount: number;
}

/**
 * Full optimized response (includes body, headers, and rules)
 */
export interface OptimizedResponseFull extends OptimizedResponseMetadata {
  body: string;
  headers?: Header[];
  rules?: ResponseRule[];
}

export type MockoonConfig = MockoonEnvironment;
