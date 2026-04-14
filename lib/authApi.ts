const BASE_URL = '/api/auth';

interface ApiResponseEnvelope<T> {
  code?: string;
  data: T;
  message?: string;
  status?: string;
}

interface RawApiResponse {
  json: unknown;
  requestId: string | null;
  status: number;
}

export class AuthApiError extends Error {
  code: string | null;
  status: number;
  requestId: string | null;
  body: unknown;

  constructor(message: string, options: { code: string | null; status: number; requestId: string | null; body: unknown }) {
    super(message);
    this.name = 'AuthApiError';
    this.code = options.code;
    this.status = options.status;
    this.requestId = options.requestId;
    this.body = options.body;
  }
}

const UNAUTHORIZED_CODE = '401000';

async function parseJsonSafely(res: Response): Promise<unknown> {
  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getErrorMessage(json: unknown): string {
  if (!json || typeof json !== 'object') {
    return '';
  }

  const errorBody = json as { message?: unknown; error?: unknown };

  if (typeof errorBody.message === 'string') {
    return errorBody.message;
  }

  if (typeof errorBody.error === 'string') {
    return errorBody.error;
  }

  return '';
}

function getEnvelopeCode(json: unknown): string | null {
  if (!json || typeof json !== 'object') {
    return null;
  }

  const code = (json as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

function isSuccessCode(code: string | null): boolean {
  return Boolean(code && code.startsWith('2'));
}

function requestHeaders(body?: unknown): HeadersInit {
  const headers: Record<string, string> = {
    'X-Request-Id': crypto.randomUUID(),
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

async function rawRequest(method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown): Promise<RawApiResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'same-origin',
    headers: requestHeaders(body),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const json = await parseJsonSafely(res);
  const requestId = res.headers.get('x-request-id');
  const code = getEnvelopeCode(json);

  if (!res.ok || !isSuccessCode(code)) {
    const message = getErrorMessage(json);
    const details = message ? ` - ${message}` : '';
    throw new AuthApiError(`Auth API error: ${res.status}${details} [request_id=${requestId}]`, {
      code,
      status: res.status,
      requestId,
      body: json,
    });
  }

  return { json, requestId, status: res.status };
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const { json } = await rawRequest('POST', path, body);
  return (json as ApiResponseEnvelope<T>).data;
}

async function get<T>(path: string): Promise<T> {
  const { json } = await rawRequest('GET', path);
  return (json as ApiResponseEnvelope<T>).data;
}

export function getAuthApiBaseUrl(): string {
  return BASE_URL;
}

export async function inquireProvider(provider: string): Promise<{ authUrl: string }> {
  return post('/provider/inquiry', { provider });
}

export async function inquireProviderRaw(provider: string): Promise<unknown> {
  return rawRequest('POST', '/provider/inquiry', { provider });
}

export interface TokenUser {
  id: string;
  email: string;
  name: string;
}

export async function generateToken(
  provider: string,
  code: string
): Promise<{ accessToken: string; expiresIn: number; user: TokenUser }> {
  return post('/token/generate', { provider, code });
}

export async function refreshSession(): Promise<{
  accessToken: string;
  expiresIn: number;
  user: TokenUser;
}> {
  return post('/token/refresh');
}

export async function revokeSession(): Promise<void> {
  await rawRequest('POST', '/token/revoke');
}

export async function fetchSession(): Promise<{
  accessToken: string;
  expiresIn: number;
  user: TokenUser;
}> {
  return get('/session');
}

export function isAuthUnauthorizedError(error: unknown): boolean {
  return (
    error instanceof AuthApiError &&
    (error.status === 401 || error.code === UNAUTHORIZED_CODE)
  );
}
