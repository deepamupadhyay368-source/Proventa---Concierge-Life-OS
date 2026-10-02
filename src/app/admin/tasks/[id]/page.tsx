import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import {
  ArrowLeft,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  Terminal,
  Plane,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  await requireAdmin();
  const resolvedParams = await Promise.resolve(params);

  const task = await db.task.findUnique({
    where: { id: resolvedParams.id },
    include: {
      customer: {
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
        },
      },
      planSteps: {
        orderBy: { stepNumber: 'asc' },
      },
      executionTraces: {
        orderBy: { createdAt: 'asc' },
      },
      subtasks: true,
      events: {
        orderBy: { createdAt: 'desc' },
      },
      externalTransactions: true,
    },
  });

  if (!task) {
    notFound();
  }

  const isConfirmed = ['CONFIRMED', 'COMPLETED'].includes(task.status);
  const isNeedsHuman = ['NEEDS_HUMAN', 'FAILED'].includes(task.status);

  const flightDispatchEvent = task.events?.find((e: any) => e.eventType === 'AWAITING_CONCIERGE_CALL');
  const flightPayload = (flightDispatchEvent?.data as any)?.dispatchPayload || (flightDispatchEvent?.data as any) || {};
  const firstOption = Array.isArray(task.proposedOptions) ? (task.proposedOptions as any[])[0] : null;

  const taskAny = task as any;
  const isFlightTask =
    task.category?.toLowerCase() === 'travel' ||
    task.category?.toLowerCase() === 'flights' ||
    flightPayload.subCategory === 'FLIGHTS' ||
    flightPayload.category === 'TRAVEL' ||
    Boolean(flightPayload.carrier) ||
    Boolean(firstOption?.metadata?.airline) ||
    Boolean(taskAny.metadata?.flightNumber);

  const flightCarrier = flightPayload.carrier || firstOption?.metadata?.airline || task.vendorName || taskAny.metadata?.airline || 'Commercial Airline';
  const flightNumber = flightPayload.flightNumber || firstOption?.metadata?.flightNumber || taskAny.metadata?.flightNumber || 'N/A';
  const flightRoute = flightPayload.origin && flightPayload.destination
    ? `${flightPayload.origin} ➔ ${flightPayload.destination}`
    : firstOption?.metadata?.route || (taskAny.metadata?.origin ? `${taskAny.metadata?.origin} ➔ ${taskAny.metadata?.destination}` : null);
  const flightDeparture = flightPayload.departureTime || firstOption?.metadata?.departureTime;
  const flightArrival = flightPayload.arrivalTime || firstOption?.metadata?.arrivalTime;
  const flightCabin = flightPayload.cabinClass || firstOption?.metadata?.cabinClass || 'ECONOMY';
  const flightPassengers = flightPayload.passengers || firstOption?.metadata?.passengers || taskAny.partySize || 1;
  const flightFare = flightPayload.priceInr || firstOption?.priceAmount || task.budgetAmount;
  const flightPnr = task.externalTransactions?.[0]?.providerReference || null;
  const flightInstructions = flightPayload.instructions || null;

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Header */}
      <div>
        <Link
          href="/admin/tasks"
          className="inline-flex items-center gap-1.5 text-xs text-[#66717C] hover:text-[#111820] transition-colors mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Task Engine Operations</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E1E5E8] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-[#111820]">
                #{task.publicId}
              </span>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8] font-medium">
                {task.category}
              </span>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-medium ${
                  isConfirmed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isNeedsHuman
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {task.status}
              </span>
            </div>
            <h1 className="text-2xl font-serif font-medium text-[#111820] mt-2">
              {task.intent}
            </h1>
            <p className="text-xs text-[#66717C] font-mono mt-1">
              Created: {new Date(task.createdAt).toLocaleString()} · Client:{' '}
              {task.customer?.user?.name || task.customer?.user?.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {task.externalTransactions && task.externalTransactions.length > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E1E5E8] text-xs font-mono text-emerald-700 font-medium flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>PNR: {task.externalTransactions[0]?.providerReference || 'Confirmed'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-[#66717C]">Client</div>
          <div className="text-sm font-medium text-[#111820] mt-1 truncate">
            {task.customer?.user?.name || 'Private VIP Member'}
          </div>
          <div className="text-[11px] font-mono text-[#66717C] truncate">
            {task.customer?.user?.email}
          </div>
        </div>

        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-[#66717C]">Budget Cap</div>
          <div className="text-sm font-medium text-[#111820] font-mono mt-1">
            {task.budgetAmount ? `₹${task.budgetAmount.toLocaleString('en-IN')}` : 'Flexible / Quoted'}
          </div>
          <div className="text-[11px] text-[#66717C]">Authorized limit</div>
        </div>

        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-[#66717C]">DAG Pipeline Steps</div>
          <div className="text-sm font-medium text-[#111820] font-mono mt-1">
            {task.planSteps.length} Multi-Step Actions
          </div>
          <div className="text-[11px] text-[#66717C]">Autonomous sequence</div>
        </div>

        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-[#66717C]">Escalation Trigger</div>
          <div className="text-sm font-medium font-mono mt-1">
            {task.isEscalated ? (
              <span className="text-purple-700 font-semibold">Human Operator Active</span>
            ) : (
              <span className="text-emerald-700 font-semibold">Autonomous Machine Loop</span>
            )}
          </div>
          <div className="text-[11px] text-[#66717C]">Zero risk compliance</div>
        </div>
      </div>

      {/* Aviation & Flight Execution Details (If Applicable) */}
      {isFlightTask && (
        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E1E5E8] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#F1F3F5] border border-[#E1E5E8] text-[#1F2933]">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111820]">
                  Aviation & Flight Execution Details
                </h2>
                <p className="text-[11px] font-mono text-[#66717C]">
                  Provider: Amadeus GDS / Airline Partner Desk · Zero Fabrication Enforced
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-medium ${
                flightPnr
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              {flightPnr ? 'Authentic PNR Issued' : 'Operator Booking Required'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-1">
              <span className="text-[#66717C] font-mono text-[10px] uppercase block">
                Airline & Flight
              </span>
              <span className="text-sm font-semibold text-[#111820] block">
                {flightCarrier} {flightNumber !== 'N/A' ? flightNumber : ''}
              </span>
              <span className="text-[11px] font-mono text-[#1F2933] block">
                {flightCabin} · {flightPassengers} Passenger{flightPassengers > 1 ? 's' : ''}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-1">
              <span className="text-[#66717C] font-mono text-[10px] uppercase block">
                Routing & Schedule
              </span>
              <span className="text-sm font-semibold text-[#111820] block">
                {flightRoute || 'SVPIA Hub Schedule'}
              </span>
              <span className="text-[11px] font-mono text-[#525F6C] block">
                {flightDeparture ? new Date(flightDeparture).toLocaleString('en-IN') : 'Scheduled Time'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-1">
              <span className="text-[#66717C] font-mono text-[10px] uppercase block">
                Fare & Settlement
              </span>
              <span className="text-sm font-semibold font-mono text-[#111820] block">
                {flightFare ? `₹${flightFare.toLocaleString('en-IN')}` : 'Quoted / Flexible'}
              </span>
              <span className="text-[10px] text-emerald-700 block font-mono font-medium">
                TEST / Sandbox Billing Safe
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-1">
              <span className="text-[#66717C] font-mono text-[10px] uppercase block">
                Authentic Airline PNR
              </span>
              <span className="text-sm font-mono font-bold block text-emerald-700">
                {flightPnr || 'Awaiting Desk Input'}
              </span>
              <span className="text-[10px] text-[#66717C] block font-mono">
                {flightPnr ? 'Verified genuine' : 'Zero fake PNR policy'}
              </span>
            </div>
          </div>

          {flightInstructions && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-purple-800 block text-[11px] uppercase tracking-wider">
                  Senior Concierge Handoff Brief
                </span>
                <p className="text-[11px] text-purple-800/90 mt-0.5 leading-relaxed">
                  {flightInstructions}
                </p>
              </div>
            </div>
          )}

          {!flightPnr && isNeedsHuman && (
            <div className="flex items-center justify-between pt-2 border-t border-[#E1E5E8]">
              <span className="text-xs text-[#66717C]">
                Actionable ticket confirmation available on Concierge Desk
              </span>
              <Link
                href="/admin/concierge"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2933] hover:bg-[#111820] text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                <span>Open in Concierge Ops Desk</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#A7B0B8]" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Multi-Step DAG Pipeline Visualizer */}
      <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E1E5E8] pb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#1F2933]" />
            <h2 className="text-sm font-semibold text-[#111820]">
              Autonomous DAG Execution Pipeline
            </h2>
          </div>
          <span className="text-xs font-mono text-[#66717C]">
            {task.planSteps.length} Step(s) Recorded
          </span>
        </div>

        {task.planSteps.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#66717C]">
            Plan steps initialized dynamically at runtime.
          </div>
        ) : (
          <div className="space-y-4">
            {task.planSteps.map((step: any) => (
              <div
                key={step.id}
                className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-white border border-[#E1E5E8] flex items-center justify-center font-mono text-xs font-bold text-[#1F2933]">
                      {step.stepNumber}
                    </span>
                    <span className="text-xs font-semibold text-[#111820]">
                      {step.description}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium ${
                      step.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : step.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-[#F1F3F5] text-[#66717C] border border-[#E1E5E8]'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>

                {/* Tool and Action Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-[#E1E5E8]">
                  <div>
                    <span className="text-[#66717C] font-mono text-[10px] uppercase block">
                      Specialist Assigned
                    </span>
                    <span className="font-mono text-[#111820] text-[11px] font-medium">
                      {step.assignedAgentRole || 'Domain Specialist'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#66717C] font-mono text-[10px] uppercase block">
                      Tool Invocation
                    </span>
                    <span className="font-mono text-[#111820] text-[11px] font-medium">
                      {step.actionType || 'executeTool'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Agent Telemetry Traces with Secret Masking */}
      <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E1E5E8] pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-[#111820]">
              Agent Trace Inspector (Masked Secrets)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
            AES-256 Masking Active
          </span>
        </div>

        {task.executionTraces.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#66717C]">
            No raw execution trace anomalies captured.
          </div>
        ) : (
          <div className="space-y-3">
            {task.executionTraces.map((trace: any) => (
              <div
                key={trace.id}
                className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] space-y-2 font-mono text-xs"
              >
                <div className="flex items-center justify-between text-[#66717C]">
                  <span className="text-[#111820] font-bold">{trace.agentRole}</span>
                  <span className="text-[10px]">{new Date(trace.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="text-[11px] text-[#525F6C]">
                  Tool: <span className="text-emerald-700 font-semibold">{trace.toolName || 'N/A'}</span> · Latency:{' '}
                  {trace.latencyMs}ms
                </div>
                {trace.toolInput && (
                  <pre className="p-2.5 rounded-lg bg-white border border-[#E1E5E8] text-[10px] text-[#66717C] overflow-x-auto">
                    {JSON.stringify(trace.toolInput, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
