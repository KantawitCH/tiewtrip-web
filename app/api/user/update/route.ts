import { NextRequest, NextResponse } from 'next/server';

const backendBase = process.env.API_URL ?? 'http://localhost:8080';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const body = await req.text();
  const res = await fetch(`${backendBase}/v1/user/profile/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': req.headers.get('x-request-id') ?? crypto.randomUUID(),
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return NextResponse.json(data, { status: res.status });
}
