import { NextRequest, NextResponse } from 'next/server';

const backendBase = process.env.API_URL ?? 'http://localhost:8080';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const formData = await req.formData();
  const res = await fetch(`${backendBase}/v1/user/profile/image/update`, {
    method: 'POST',
    headers: {
      'X-Request-Id': req.headers.get('x-request-id') ?? crypto.randomUUID(),
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: formData,
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
