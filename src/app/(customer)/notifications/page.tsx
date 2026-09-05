'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/customer/notifications');
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllAsRead = async () => {
    await fetch('/api/customer/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'all' }),
    });
    loadNotifications();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Notifications</h1>
          <p className="text-xs text-neutral-500 mt-1">Updates on your concierge requests, proposals, and confirmations.</p>
        </div>

        {notifications.some((n) => !n.readAt) && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-neutral-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 bg-white border border-neutral-200 rounded-2xl text-center">
          <Bell className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-800">All caught up</p>
          <p className="text-xs text-neutral-500 mt-1">You have no new notifications right now.</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-100 overflow-hidden shadow-sm">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-4 transition-colors ${
                n.readAt ? 'bg-white' : 'bg-neutral-50/70'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-semibold text-neutral-900">{n.title}</h3>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">{n.body}</p>
                {n.actionUrl && (
                  <Link href={n.actionUrl} className="inline-block text-xs text-brand-700 font-medium mt-2 hover:underline">
                    View details →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
