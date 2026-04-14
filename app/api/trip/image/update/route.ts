import { proxyTripFormDataPost } from '@/lib/server/tripProxy';

export function POST(req: Request) {
  return proxyTripFormDataPost(req, '/v1/trip/image/update');
}
