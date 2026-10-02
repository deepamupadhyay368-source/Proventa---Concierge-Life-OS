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

  const handleUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/requests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      if (res.ok) {
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-mono text-emerald-700 font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          <span>Mark Completed</span>
        </button>
      )}

      {currentStatus !== 'NEEDS_HUMAN' && (
        <button
          onClick={() => handleUpdate('NEEDS_HUMAN')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 text-xs font-mono text-purple-700 font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />}
          <span>Escalate</span>
        </button>
      )}

      {currentStatus !== 'CANCELLED' && (
        <button
          onClick={() => handleUpdate('CANCELLED')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-xs font-mono text-red-700 font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
          <span>Cancel</span>
        </button>
      )}
    </div>
  );
}
