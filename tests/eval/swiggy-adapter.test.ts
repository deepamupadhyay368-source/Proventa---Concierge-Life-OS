import { describe, it, expect, beforeEach } from 'vitest';
import { SwiggyAdapter } from '@/lib/orchestration/adapters/swiggy.adapter';
import { AdapterRegistry } from '@/lib/orchestration/adapters';

describe('Swiggy / Dineout Adapter Suite', () => {
  let adapter: SwiggyAdapter;

  beforeEach(() => {
    delete process.env.SWIGGY_API_KEY;
    delete process.env.SWIGGY_PARTNER_ID;
    adapter = new SwiggyAdapter();
  });

  it('correctly operates in SANDBOX mode when API keys are unconfigured', async () => {
    expect(adapter.environment).toBe('SANDBOX');

    const options = await adapter.search({
      category: 'dining',
      rawInput: 'Order private dining from Swiggy Gourmet in Ahmedabad',
    });

    expect(options.length).toBeGreaterThanOrEqual(1);
    const first = options[0];
    expect(first.environment).toBe('SANDBOX');
    expect(first.isMock).toBe(true);
    expect(first.title).toContain('[SANDBOX]');
    expect(first.priceAmount).toBeGreaterThan(0);
  });

  it('executes sandbox booking with explicit non-fabricated reference tag', async () => {
    const options = await adapter.search({
      category: 'dining',
      rawInput: 'Swiggy Dineout table',
    });

    const execution = await adapter.execute(options[0], {
      scheduledTime: '20:00',
      guests: 2,
    });

    expect(execution.success).toBe(true);
    expect(execution.environment).toBe('SANDBOX');
    expect(execution.isMock).toBe(true);
    expect(execution.externalReferenceId).toContain('[SANDBOX]-SWIGGY-');

    const verification = await adapter.verify(execution);
    expect(verification.verified).toBe(true);
    expect(verification.environment).toBe('SANDBOX');
    expect(verification.auditTrail).toContain('[SANDBOX]');
  });

  it('registers properly inside AdapterRegistry for dining and food categories', () => {
    const diningAdapters = AdapterRegistry.getAdaptersForCategory('dining');
    const hasSwiggy = diningAdapters.some((a) => a.name.includes('Swiggy'));
    expect(hasSwiggy).toBe(true);
  });
});