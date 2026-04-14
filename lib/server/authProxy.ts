const AUTH_PROXY_TARGETS = {
  'provider/inquiry': '/v1/auth/provider/inquiry',
  'token/generate': '/v1/auth/token/generate',
  'token/refresh': '/v1/auth/token/refresh',
  'token/revoke': '/v1/auth/token/revoke',
  'session': '/v1/auth/session',
} as const;

type AuthProxyTargetKey = keyof typeof AUTH_PROXY_TARGETS;

const DEFAULT_BACKEND_BASE_URL = 'http://localhost:8080';

function getBackendBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_BACKEND_BASE_URL
  ).replace(/\/$/, '');
}

function createRequestId(): string {
  return crypto.randomUUID();
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, init);
}

function getSetCookieHeaders(upstream: Response): string[] {
  const headersWithCookies = upstream.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersWithCookies.getSetCookie === 'function') {
    return headersWithCookies.getSetCookie();
  }

  const single = upstream.headers.get('set-cookie');
  return single ? [single] : [];
}

function buildProxyResponse(upstream: Response, body: string, requestId: string): Response {
  const headers = new Headers();

  for (const headerName of ['content-type', 'cache-control', 'pragma']) {
    const value = upstream.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  headers.set('x-request-id', upstream.headers.get('x-request-id') ?? requestId);

  for (const cookie of getSetCookieHeaders(upstream)) {
    headers.append('set-cookie', cookie);
  }

  return new Response(body, {
    status: upstream.status,
    headers,
  });
}

export function resolveAuthProxyTarget(segments: string[]): string | null {
  const key = segments.join('/') as AuthProxyTargetKey;
  return AUTH_PROXY_TARGETS[key] ?? null;
}

async function proxyAuthRequest(request: Request, upstreamPath: string): Promise<Response> {
  const requestId = request.headers.get('x-request-id') || createRequestId();
  const cookieHeader = request.headers.get('cookie');
  const contentType = request.headers.get('content-type');
  const method = request.method.toUpperCase();
  const headers = new Headers({
    'X-Request-Id': requestId,
  });

  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }

  let body: string | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const rawBody = await request.text();
    if (rawBody) {
      body = rawBody;
    }
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
  }

  try {
    const upstream = await fetch(`${getBackendBaseUrl()}${upstreamPath}`, {
      method,
      headers,
      body,
      cache: 'no-store',
    });

    const responseBody = await upstream.text();
    return buildProxyResponse(upstream, responseBody, requestId);
  } catch {
    return jsonResponse(
      {
        message: 'Unable to reach auth backend.',
        request_id: requestId,
      },
      {
        status: 502,
        headers: {
          'x-request-id': requestId,
          'cache-control': 'no-store',
        },
      }
    );
  }
}

export async function proxyAuthPost(request: Request, upstreamPath: string): Promise<Response> {
  return proxyAuthRequest(request, upstreamPath);
}

export async function proxyAuthGet(request: Request, upstreamPath: string): Promise<Response> {
  return proxyAuthRequest(request, upstreamPath);
}
