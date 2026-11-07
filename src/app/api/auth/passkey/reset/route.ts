import { NextRequest } from 'next/server';
import { handlePassKeyRecovery } from '@/app/api/auth/recover-passkey/route';

export async function POST(req: NextRequest) {
  return handlePassKeyRecovery(req);
}
