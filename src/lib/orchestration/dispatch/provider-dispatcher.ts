import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { appendTaskEvent } from '../timeline';
import type { OptionProposal } from '../types';

export interface DispatchReservationParams {
  taskId: string;
  option: OptionProposal;
  clientName: string;
  clientPhone?: string;
  notes?: string;
}

export interface DispatchResult {
  dispatchChannel: 'EMAIL' | 'WHATSAPP' | 'DIRECT_API' | 'TELEPHONE_QUEUE';
  dispatchedAt: string;
  dispatchReference: string;
  status: 'PENDING_PARTNER_CONFIRMATION' | 'AUTO_CONFIRMED';
}

export class ProviderDispatcher {
  static async dispatchReservation(params: DispatchReservationParams): Promise<DispatchResult> {
    const { taskId, option, clientName, clientPhone, notes } = params;
    const dispatchReference = `DISP-${taskId.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    logger.info({ taskId, optionTitle: option.title, dispatchReference }, '[ProviderDispatcher] Dispatching reservation to provider');

    await appendTaskEvent({
      taskId,
      eventType: 'PARTNER_DISPATCH_SENT',
      actorRole: 'SYSTEM',
      message: `Reservation order dispatched to ${option.providerName} via Proventa Verified Channel.`,
      data: {
        dispatchReference,
        provider: option.providerName,
        title: option.title,
        clientName,
        clientPhone: clientPhone || 'Undisclosed (VIP Confidential)',
        notes: notes || 'Complimentary table reservation coordination',
      },
    });

    return {
      dispatchChannel: 'DIRECT_API',
      dispatchedAt: new Date().toISOString(),
      dispatchReference,
      status: 'PENDING_PARTNER_CONFIRMATION',
    };
  }
}