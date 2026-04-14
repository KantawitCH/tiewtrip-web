import { proxyTripPost } from '@/lib/server/tripProxy';

export function POST(req: Request) {
  return proxyTripPost(req, '/v1/trip/overview/inquiry');
}
