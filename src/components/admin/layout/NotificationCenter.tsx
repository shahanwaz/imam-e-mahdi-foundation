'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  HeartHandshake,
  FolderHeart,
  ShieldAlert,
  CalendarCheck,
  X,
  ArrowRight,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'DONATION' | 'BENEFICIARY' | 'COMPLIANCE' | 'SYSTEM';
  timestamp: string;
  isRead: boolean;
  isUrgent?: boolean;
  linkUrl: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Statutory 80G Renewal Verification',
    message: 'Form 10BD / 80G annual compliance filing requires organizational CA verification before due date.',
    category: 'COMPLIANCE',
    timestamp: '10 mins ago',
    isRead: false,
    isUrgent: true,
    linkUrl: '/admin/compliance',
  },
  {
    id: 'n2',
    title: 'New Emergency Medical Aid Intake',
    message: 'Household IMF/BEN-0042 submitted urgent cardiac medical sponsorship application.',
    category: 'BENEFICIARY',
    timestamp: '1 hour ago',
    isRead: false,
    isUrgent: true,
    linkUrl: '/admin/beneficiaries',
  },
  {
    id: 'n3',
    title: 'Zakat Contribution Captured',
    message: '₹1,50,000 Zakat received for Winter Ration Relief. 80G receipt queued for generation.',
    category: 'DONATION',
    timestamp: '3 hours ago',
    isRead: false,
    linkUrl: '/admin/donations',
  },
  {
    id: 'n4',
    title: 'Ramadan Relief Camp Voluteer Shift',
    message: '18 volunteers registered for the upcoming Hazratganj Ration Drive.',
    category: 'SYSTEM',
    timestamp: 'Yesterday',
    isRead: true,
    linkUrl: '/admin/volunteers',
  },
];

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'URGENT'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') return !n.isRead;
    if (activeFilter === 'URGENT') return n.isUrgent;
    return true;
  });

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'DONATION':
        return <HeartHandshake className="w-4 h-4 text-emerald-700" />;
      case 'BENEFICIARY':
        return <FolderHeart className="w-4 h-4 text-amber-700" />;
      case 'COMPLIANCE':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <CalendarCheck className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl transition-all focus:outline-none select-none"
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-gold-500 text-emerald-950 text-[10px] font-bold items-center justify-center border border-white">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-slate-200/90 overflow-hidden z-50 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-surface-bg/50">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-emerald-950 font-display">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-900 font-medium focus:outline-none"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50/50 text-xs">
            {(['ALL', 'UNREAD', 'URGENT'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-emerald-800 text-white font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter === 'UNREAD' ? 'Unread' : '⚠️ Urgent'}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications to display
              </div>
            ) : (
              filtered.map((item) => (
                <Link
                  key={item.id}
                  href={item.linkUrl}
                  onClick={() => {
                    markAsRead(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-start gap-3 p-3.5 hover:bg-emerald-50/40 transition-colors block ${
                    !item.isRead ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-soft shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${item.isRead ? 'text-slate-700' : 'text-emerald-950 font-bold'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.message}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 text-center border-t border-slate-100 bg-slate-50/50">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
            >
              <span>View all notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
