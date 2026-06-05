import React from 'react';
import { Bell, BellRing, Mail, CheckCheck, Trash2, Calendar, ClipboardCheck, ArrowRight, ShieldCheck, Milestone } from 'lucide-react';
import { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onClearRead?: () => void;
  onClose?: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAllRead,
  onClose
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'email_verification':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'otp_verification':
        return <Mail className="w-4 h-4 text-amber-600" />;
      case 'application_update':
        return <ClipboardCheck className="w-4 h-4 text-violet-600" />;
      case 'interview_notification':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'recruiter_alert':
        return <Milestone className="w-4 h-4 text-sky-600" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-600" />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'email_verification':
        return 'bg-emerald-50 border-emerald-100';
      case 'otp_verification':
        return 'bg-amber-50 border-amber-100';
      case 'application_update':
        return 'bg-violet-50 border-violet-100';
      case 'interview_notification':
        return 'bg-blue-50 border-blue-100';
      case 'recruiter_alert':
        return 'bg-sky-50 border-sky-100';
      default:
        return 'bg-zinc-50 border-zinc-100';
    }
  };

  return (
    <div id="notification_center_card" className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div id="notif_header" className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5 text-amber-500 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5 text-zinc-400" />
          )}
          <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Active Workflows</h3>
          {unreadCount > 0 && (
            <span className="bg-zinc-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            id="mark_all_read_btn"
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 font-bold transition cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Clear items
          </button>
        )}
      </div>

      <div id="notif_list" className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-zinc-450 text-xs">
            No system notifications generated yet. Take some actions such as creating jobs or applying to see real-time triggers!
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 border rounded-xl text-xs flex gap-3 transition-all relative ${getStyle(notif.type)} ${
                notif.read ? 'opacity-65' : 'shadow-sm border-l-4 border-l-zinc-900'
              }`}
            >
              <div className="mt-0.5 shrink-0 bg-white p-1.5 rounded-lg h-fit border border-zinc-200/50">
                {getIcon(notif.type)}
              </div>
              <div className="space-y-1">
                <div className="font-bold text-zinc-900 flex items-center justify-between">
                  <span>{notif.title}</span>
                  {!notif.read && (
                    <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full inline-block shrink-0"></span>
                  )}
                </div>
                <p className="text-zinc-600 leading-normal font-medium">{notif.message}</p>
                <div className="text-[9px] text-zinc-400 font-mono">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
