'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

export function TaskOperatorActions({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/requests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      if (res.ok) {
        setSelectedAction(null);
        router.refresh();
      } else {
        alert('Failed to update task status.');
      }
    } catch (e) {
      alert('Network error updating task status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentStatus !== 'COMPLETED' && currentStatus !== 'CONFIRMED' && (
        <button
          onClick={() => handleUpdate('COMPLETED')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/50 text-xs font-mono text-emerald-300 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>Mark Completed</span>
        </button>
      )}

      {currentStatus !== 'NEEDS_HUMAN' && (
        <button
          onClick={() => handleUpdate('NEEDS_HUMAN')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/60 hover:bg-purple-900/50 text-xs font-mono text-purple-300 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          <span>Escalate</span>
        </button>
      )}

      {currentStatus !== 'CANCELLED' && (
        <button
          onClick={() => handleUpdate('CANCELLED')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-900/50 hover:bg-red-900/50 text-xs font-mono text-red-400 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
          <span>Cancel</span>
        </button>
      )}
    </div>
  );
}
