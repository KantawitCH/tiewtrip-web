import {
  proxyAuthGet,
  proxyAuthPost,
  resolveAuthProxyTarget,
} from '@/lib/server/authProxy';

interface RouteContext {
  params: Promise<{ segments: string[] }>;
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const { segments } = await context.params;
  const upstreamPath = resolveAuthProxyTarget(segments);

  if (!upstreamPath) {
    return Response.json({ message: 'Auth proxy route not found.' }, { status: 404 });
  }

  return proxyAuthPost(request, upstreamPath);
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const { segments } = await context.params;
  const upstreamPath = resolveAuthProxyTarget(segments);

  if (!upstreamPath) {
    return Response.json({ message: 'Auth proxy route not found.' }, { status: 404 });
  }

  return proxyAuthGet(request, upstreamPath);
}
