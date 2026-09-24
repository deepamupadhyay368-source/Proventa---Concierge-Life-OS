import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireConcierge } from '@/lib/auth/session';
import { geminiClient, getGeminiModel, isAIAvailable } from '@/lib/ai/client';
import { logger } from '@/lib/logger';
import { isAppError } from '@/lib/errors';
import { ConciergeOperationsService } from '@/lib/concierge/service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireConcierge();
    const body = await req.json();
    const { action, taskId, customPrompt, parameters } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    let task: any = null;
    if (taskId) {
      task = await db.task.findUnique({
        where: { id: taskId },
        include: {
          customer: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
            },
          },
          events: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      });
    }

    const customerName = task?.customer?.user?.name || task?.customer?.user?.email?.split('@')[0] || 'Member';
    const customerPhone = task?.customer?.user?.phone || 'Not on file';
    const category = task?.category || 'Concierge Request';
    const originalRequest = task?.originalRequest || '';
    const prefs = (task?.customer?.preferences as any) || (task?.clientPreferences as any) || {};
    const notesList = ((task?.clientPreferences as any)?.internalNotes as any[]) || [];

    let systemInstruction = `You are the AI Copilot for Proventa Concierge Operators.
Proventa is India's premium human+AI lifestyle concierge.
Your job is to assist human concierge employees with real execution.
STRICT RULES:
1. NEVER fabricate booking reference codes (PNR, voucher numbers, booking IDs). 
2. Only real providers and realistic operational phone scripts.
3. Be concise, polite, professional, and operational.`;

    let prompt = '';

    switch (action) {
      case 'SUMMARIZE_TASK': {
        prompt = `Summarize this concierge task for a fast operator briefing:
Customer: ${customerName} (Phone: ${customerPhone})
Category: ${category}
Request: "${originalRequest}"
Budget: ${task?.budgetAmount ? `₹${task.budgetAmount}` : 'Flexible'}
Preferences: ${JSON.stringify(prefs)}
Current Status: ${task?.status}
Recent Events: ${task?.events?.map((e: any) => `${e.eventType}: ${e.description}`).join('; ') || 'None'}
Recent Notes: ${task?.internalNotes?.map((n: any) => n.content).join('; ') || 'None'}

Provide:
1. One-sentence core intent
2. Key constraints (party size, date, budget, dietary)
3. Action needed right now`;
        break;
      }

      case 'DRAFT_CALL_SCRIPT': {
        const venueName = parameters?.venueName || 'the venue';
        const targetTime = parameters?.targetTime || 'the requested time';
        const partySize = parameters?.partySize || 'the requested party size';
        const specialNotes = parameters?.specialNotes || 'no special requests';

        prompt = `Draft a concise, high-polish phone call script for a Proventa Concierge calling ${venueName}.
Member: ${customerName}
Party Size: ${partySize}
Target Date/Time: ${targetTime}
Category: ${category}
Special Notes/Dietary: ${specialNotes}

Format the response as:
- Greeting & Introduction
- Explicit Booking / Ingestion Request
- Key Questions to Ask the Host/Manager (deposit required, dress code, confirmation method)
- Closing and obtaining Host Name & Confirmation Ref`;
        break;
      }

      case 'DRAFT_CUSTOMER_MESSAGE': {
        const purpose = parameters?.purpose || 'STATUS_UPDATE';
        const extraDetails = parameters?.details || '';

        prompt = `Draft a WhatsApp/Email message to member ${customerName} regarding their request "${originalRequest}".
Purpose: ${purpose} (e.g. asking for missing info, confirming human desk is calling, or sharing updates)
Extra Context from Operator: ${extraDetails}
Tone: Warm, executive, reassuring, refined. Keep under 100 words.`;
        break;
      }

      case 'DRAFT_PROVIDER_EMAIL': {
        const providerName = parameters?.providerName || 'Partner Desk';
        const requestDetails = parameters?.details || originalRequest;

        prompt = `Draft a formal booking inquiry email to ${providerName} on behalf of Proventa Concierge.
Client Name / Reference: ${customerName} (Proventa Member)
Details: ${requestDetails}
Urgency: ${task?.priority || 'HIGH'}
Include fields for: Date/Time, Guest Count, Special Requirements, Invoicing / Payment instructions.`;
        break;
      }

      case 'CHECK_CONSTRAINTS': {
        prompt = `Analyze this task and member preferences for operational risks or hidden constraints:
Task Request: "${originalRequest}"
Member Profile Preferences: ${JSON.stringify(prefs)}
Category: ${category}

Highlight:
1. Dietary restrictions vs cuisine type
2. Timing / advance notice bottlenecks
3. Deposit or cancellation policies to watch out for`;
        break;
      }

      case 'GENERAL_QUERY':
      default: {
        prompt = customPrompt || `Provide advice on how to fulfill this concierge task: "${originalRequest}"`;
        break;
      }
    }

    let responseText = '';

    if (isAIAvailable) {
      try {
        const model = getGeminiModel();
        const fullPrompt = `${systemInstruction}\n\nTask Context:\n${prompt}`;
        const result = await model.generateContent(fullPrompt);
        responseText = result.response.text();
      } catch (aiErr) {
        logger.warn({ err: aiErr }, 'Gemini AI assist failed, falling back to deterministic template');
        responseText = generateDeterministicFallback(action, { customerName, category, originalRequest, parameters });
      }
    } else {
      responseText = generateDeterministicFallback(action, { customerName, category, originalRequest, parameters });
    }

    return NextResponse.json({
      success: true,
      action,
      result: responseText,
      generatedAt: new Date().toISOString(),
      operator: sessionUser.email,
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    logger.error({ err: error }, 'AI assist endpoint error');
    return NextResponse.json({ error: 'Failed to process AI assist request' }, { status: 500 });
  }
}

function generateDeterministicFallback(action: string, ctx: any): string {
  const { customerName, category, originalRequest, parameters } = ctx;
  switch (action) {
    case 'SUMMARIZE_TASK':
      return `Core Request: ${originalRequest || 'Member concierge service request'}\nMember: ${customerName} | Category: ${category}\nAction: Contact verified provider desk and secure availability according to member preferences.`;
    case 'DRAFT_CALL_SCRIPT':
      return `Hello, this is the Proventa Executive Concierge desk calling on behalf of our member, ${customerName}.\nWe are looking to secure a VIP booking for ${parameters?.partySize || 'their party'} on ${parameters?.targetTime || 'their requested date'}.\nCould you kindly confirm current availability and table placement? Also, please let me know who I have the pleasure of speaking with for our confirmation record.`;
    case 'DRAFT_CUSTOMER_MESSAGE':
      return `Dear ${customerName},\n\nOur concierge team is actively managing your request: "${originalRequest}". We are coordinating directly with the provider to ensure all your preferences are met. We will share your verified confirmation shortly.\n\nWarm regards,\nProventa Concierge Desk`;
    case 'DRAFT_PROVIDER_EMAIL':
      return `Subject: VIP Concierge Request — Proventa Private Clients / ${customerName}\n\nDear Reservations Team,\n\nWe are reaching out from Proventa Concierge on behalf of our member, ${customerName}.\n\nDetails:\n- Request: ${originalRequest}\n- Notes: ${parameters?.details || 'Standard VIP hospitality service'}\n\nPlease confirm availability and payment terms at your earliest convenience.\n\nKind regards,\nProventa Concierge Operations`;
    case 'CHECK_CONSTRAINTS':
      return `Operational Checklist:\n1. Verify provider advance reservation requirements.\n2. Confirm any dietary or seating preferences directly with the host.\n3. Verify cancellation terms before finalizing deposit.`;
    default:
      return `Task: ${originalRequest}. Please proceed with standard human concierge verification protocols.`;
  }
}
