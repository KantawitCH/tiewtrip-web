import { useAuthStore } from './authStore';

const BASE = '/api';
const UNAUTHORIZED_CODE = '401000';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requestHeaders(token = useAuthStore.getState().accessToken) {
  return {
    'X-Request-Id': crypto.randomUUID(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleUnauthorized(): Promise<never> {
  await useAuthStore.getState().logout();
  if (typeof window !== 'undefined') {
    window.location.replace('/auth/sign-in');
  }
  throw new Error('Session expired');
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = useAuthStore.getState().refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function parseResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isSuccessCode(code: unknown): boolean {
  if (typeof code === 'number') {
    return code >= 200 && code < 300;
  }

  if (typeof code === 'string') {
    return code.startsWith('2');
  }

  return false;
}

function getEnvelopeCode(body: unknown): string | null {
  if (!isRecord(body)) {
    return null;
  }

  return typeof body.code === 'string' ? body.code : null;
}

function isUnauthorizedBody(body: unknown): boolean {
  return getEnvelopeCode(body) === UNAUTHORIZED_CODE;
}

function getErrorMessage(body: unknown): string {
  if (typeof body === 'string') {
    return body;
  }

  if (!isRecord(body)) {
    return '';
  }

  if (typeof body.message === 'string') {
    return body.message;
  }

  if (typeof body.error === 'string') {
    return body.error;
  }

  if (isRecord(body.error)) {
    if (typeof body.error.message === 'string') {
      return body.error.message;
    }

    if (typeof body.error.error === 'string') {
      return body.error.error;
    }
  }

  if ('data' in body) {
    return getErrorMessage(body.data);
  }

  return '';
}

function unwrapResponseBody<T>(body: unknown): T {
  if (isRecord(body) && 'data' in body) {
    return body.data as T;
  }

  return body as T;
}

async function fetchWithAuthRetry(
  path: string,
  initFactory: (token: string | null) => RequestInit
): Promise<Response> {
  let response = await fetch(`${BASE}${path}`, initFactory(useAuthStore.getState().accessToken));

  const firstBody = await parseResponseBody(response.clone());

  if (response.status !== 401 && !isUnauthorizedBody(firstBody)) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    await handleUnauthorized();
  }

  response = await fetch(`${BASE}${path}`, initFactory(refreshedToken));

  const secondBody = await parseResponseBody(response.clone());

  if (response.status === 401 || isUnauthorizedBody(secondBody)) {
    await handleUnauthorized();
  }

  return response;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetchWithAuthRetry(path, (token) => ({
    headers: { ...requestHeaders(token) },
    cache: 'no-store',
  }));
  const body = await parseResponseBody(res);
  if (!res.ok) {
    throw new Error(getErrorMessage(body) || `API ${res.status}`);
  }
  if (isRecord(body) && 'code' in body && !isSuccessCode(body.code)) {
    throw new Error(getErrorMessage(body) || `API error: ${String(body.code)}`);
  }
  return unwrapResponseBody<T>(body);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithAuthRetry(path, (token) => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...requestHeaders(token) },
    body: JSON.stringify(body),
    cache: 'no-store',
  }));
  const responseBody = await parseResponseBody(res);
  if (!res.ok) {
    throw new Error(getErrorMessage(responseBody) || `API ${res.status}`);
  }
  if (isRecord(responseBody) && 'code' in responseBody && !isSuccessCode(responseBody.code)) {
    throw new Error(getErrorMessage(responseBody) || `API error: ${String(responseBody.code)}`);
  }
  return unwrapResponseBody<T>(responseBody);
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetchWithAuthRetry(path, (token) => ({
    method: 'POST',
    headers: { ...requestHeaders(token) },
    body: formData,
    cache: 'no-store',
  }));
  const body = await parseResponseBody(res);
  if (!res.ok) {
    throw new Error(getErrorMessage(body) || `API ${res.status}`);
  }
  if (isRecord(body) && 'code' in body && !isSuccessCode(body.code)) {
    throw new Error(getErrorMessage(body) || `API error: ${String(body.code)}`);
  }
  return unwrapResponseBody<T>(body);
}
