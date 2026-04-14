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

function buildProxyResponse(upstream: Response, body: string, requestId: string): Response {
  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');

  if (contentType) {
    headers.set('content-type', contentType);
  }

  headers.set('x-request-id', requestId);
  headers.set('cache-control', 'no-store');

  return new Response(body, {
    status: upstream.status,
    headers,
  });
}

function buildTripProxyError(requestId: string): Response {
  return Response.json(
    {
      message: 'Unable to reach trip backend.',
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

export async function proxyTripPost(request: Request, upstreamPath: string): Promise<Response> {
  const requestId = request.headers.get('x-request-id') || createRequestId();
  const authHeader = request.headers.get('authorization');
  const body = await request.text();

  try {
    const upstream = await fetch(`${getBackendBaseUrl()}${upstreamPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') ?? 'application/json',
        'X-Request-Id': requestId,
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
      cache: 'no-store',
    });

    const responseBody = await upstream.text();
    return buildProxyResponse(upstream, responseBody, requestId);
  } catch {
    return buildTripProxyError(requestId);
  }
}

export async function proxyTripFormDataPost(request: Request, upstreamPath: string): Promise<Response> {
  const requestId = request.headers.get('x-request-id') || createRequestId();
  const authHeader = request.headers.get('authorization');
  const body = await request.formData();

  try {
    const upstream = await fetch(`${getBackendBaseUrl()}${upstreamPath}`, {
      method: 'POST',
      headers: {
        'X-Request-Id': requestId,
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
      cache: 'no-store',
    });

    const responseBody = await upstream.text();
    return buildProxyResponse(upstream, responseBody, requestId);
  } catch {
    return buildTripProxyError(requestId);
  }
}
