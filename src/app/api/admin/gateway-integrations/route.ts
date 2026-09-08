import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { ProventaProviderGateway } from '@/lib/providers/gateway';
import { initializeStandardProviders } from '@/lib/providers/standard-connectors';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    initializeStandardProviders();

    // Fetch integrations from DB
    const dbIntegrations = await db.providerIntegration.findMany({
      orderBy: [{ serviceCategory: 'asc' }, { priority: 'asc' }],
    });

    // Fetch memory gateway routes
    const gatewayProviders = ProventaProviderGateway.getAllProviders().map((p) => ({
      providerKey: p.providerKey,
      name: p.name,
      priority: p.priority,
      status: p.status,
      isSandbox: p.isSandbox,
      category: p.instance.category,
    }));

    // Fetch recent transactions
    const transactions = await db.externalTransaction.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });

    // Fetch webhook logs
    const webhookLogs = await db.webhookEventLog.findMany({
      take: 15,
      orderBy: { receivedAt: 'desc' },
    });

    return NextResponse.json({
      dbIntegrations,
      gatewayProviders,
      transactions,
      webhookLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const integration = await db.providerIntegration.upsert({
      where: { providerKey: body.providerKey },
      update: {
        name: body.name,
        serviceCategory: body.serviceCategory,
        apiEndpoint: body.apiEndpoint,
        authMethod: body.authMethod || 'API_KEY',
        encryptedCredentials: body.encryptedCredentials || '{}',
        isSandbox: body.isSandbox ?? true,
        supportedOperations: body.supportedOperations || [],
        rateLimitPerMin: body.rateLimitPerMin || 60,
        commissionPercent: body.commissionPercent || 0,
        priority: body.priority || 1,
        status: body.status || 'NOT_CONNECTED',
      },
      create: {
        providerKey: body.providerKey,
        name: body.name,
        serviceCategory: body.serviceCategory,
        apiEndpoint: body.apiEndpoint,
        authMethod: body.authMethod || 'API_KEY',
        encryptedCredentials: body.encryptedCredentials || '{}',
        isSandbox: body.isSandbox ?? true,
        supportedOperations: body.supportedOperations || [],
        rateLimitPerMin: body.rateLimitPerMin || 60,
        commissionPercent: body.commissionPercent || 0,
        priority: body.priority || 1,
        status: body.status || 'NOT_CONNECTED',
      },
    });

    return NextResponse.json({ success: true, integration });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
