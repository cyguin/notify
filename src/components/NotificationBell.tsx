'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  href?: string;
  readAt?: number;
  createdAt: number;
}

export interface NotificationBellProps {
  userId?: string;
  pollInterval?: number;
  maxVisible?: number;
  className?: string;
  onToggle?: (open: boolean) => void;
}

interface FetchNotificationsResponse {
  notifications: Notification[];
  total?: number;
}

export function NotificationBell({
  userId,
  pollInterval = 30000,
  maxVisible = 10,
  className = '',
  onToggle,
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notify?userId=${encodeURIComponent(userId)}&limit=${maxVisible}`);
      const data: FetchNotificationsResponse = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.notifications?.filter(n => !n.readAt).length ?? 0);
    } catch (err) {
      console.error('[NotificationBell] fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, maxVisible]);

  useEffect(() => {
    fetchNotifications();
    if (pollInterval > 0) {
      const id = setInterval(fetchNotifications, pollInterval);
      return () => clearInterval(id);
    }
  }, [fetchNotifications, pollInterval]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onToggle?.(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggle]);

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.href) {
      window.location.href = notification.href;
    }
    if (!notification.readAt && userId) {
      try {
        await fetch(`/api/notify/${notification.id}/read?userId=${encodeURIComponent(userId)}`, {
          method: 'PATCH',
        });
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, readAt: Date.now() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('[NotificationBell] mark read failed:', err);
      }
    }
    setIsOpen(false);
    onToggle?.(false);
  };

  const handleBellClick = () => {
    setIsOpen(prev => {
      onToggle?.(!prev);
      return !prev;
    });
  };

  const badgeDisplay = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <>
      <style>{`
        @keyframes cyguin-notify-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes cyguin-notify-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cyguin-notify-bell {
          --cyguin-bg: #ffffff;
          --cyguin-bg-subtle: #f1f3f6;
          --cyguin-border: #e5e5e5;
          --cyguin-border-focus: #ffd21f;
          --cyguin-fg: #0a0d17;
          --cyguin-fg-muted: #858b98;
          --cyguin-accent: #ffd21f;
          --cyguin-accent-dark: #e0a900;
          --cyguin-accent-fg: #0a0d17;
          --cyguin-radius: 6px;
          --cyguin-shadow: 0 1px 4px rgba(0,0,0,0.08);
          position: relative;
          display: inline-flex;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .cyguin-notify-bell[data-theme="dark"] {
          --cyguin-bg: #0a0d17;
          --cyguin-bg-subtle: #101521;
          --cyguin-border: #252b3a;
          --cyguin-fg: #f1f3f6;
          --cyguin-fg-muted: #858b98;
          --cyguin-shadow: 0 1px 4px rgba(0,0,0,0.32);
        }
        .cyguin-notify-bell-btn {
          background: transparent;
          border: 1px solid var(--cyguin-border);
          border-radius: var(--cyguin-radius);
          padding: 8px 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cyguin-fg);
          transition: border-color 0.15s, background-color 0.15s;
          position: relative;
        }
        .cyguin-notify-bell-btn:hover {
          border-color: var(--cyguin-border-focus);
          background-color: var(--cyguin-bg-subtle);
        }
        .cyguin-notify-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: var(--cyguin-accent);
          color: var(--cyguin-accent-fg);
          font-size: 10px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          box-sizing: border-box;
        }
        .cyguin-notify-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 320px;
          max-height: 420px;
          overflow-y: auto;
          background-color: var(--cyguin-bg);
          border: 1px solid var(--cyguin-border);
          border-radius: var(--cyguin-radius);
          box-shadow: var(--cyguin-shadow);
          animation: cyguin-notify-fade-in 0.15s ease-out;
          z-index: 1000;
        }
        .cyguin-notify-dropdown-header {
          padding: 10px 14px;
          border-bottom: 1px solid var(--cyguin-border);
          font-size: 13px;
          font-weight: 600;
          color: var(--cyguin-fg);
        }
        .cyguin-notify-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 10px 14px;
          border-bottom: 1px solid var(--cyguin-border);
          cursor: pointer;
          transition: background-color 0.1s;
        }
        .cyguin-notify-item:last-child {
          border-bottom: none;
        }
        .cyguin-notify-item:hover {
          background-color: var(--cyguin-bg-subtle);
        }
        .cyguin-notify-item.unread {
          background-color: color-mix(in srgb, var(--cyguin-accent) 8%, transparent);
        }
        .cyguin-notify-item.unread:hover {
          background-color: color-mix(in srgb, var(--cyguin-accent) 12%, transparent);
        }
        .cyguin-notify-item-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--cyguin-fg);
        }
        .cyguin-notify-item-body {
          font-size: 12px;
          color: var(--cyguin-fg-muted);
          line-height: 1.4;
        }
        .cyguin-notify-empty {
          padding: 24px 14px;
          text-align: center;
          font-size: 13px;
          color: var(--cyguin-fg-muted);
        }
        .cyguin-notify-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--cyguin-border);
          border-top-color: var(--cyguin-accent);
          border-radius: 50%;
          animation: cyguin-notify-spin 0.6s linear infinite;
        }
        .cyguin-notify-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
      `}</style>
      <div className={`cyguin-notify-bell ${className}`} data-theme="light" ref={dropdownRef}>
        <button
          className="cyguin-notify-bell-btn"
          onClick={handleBellClick}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span className="cyguin-notify-badge">{badgeDisplay}</span>
          )}
        </button>
        {isOpen && (
          <div className="cyguin-notify-dropdown" role="menu">
            {loading ? (
              <div className="cyguin-notify-loading">
                <div className="cyguin-notify-spinner" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="cyguin-notify-empty">No notifications</div>
            ) : (
              <>
                <div className="cyguin-notify-dropdown-header">Notifications</div>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`cyguin-notify-item${!n.readAt ? ' unread' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                    role="menuitem"
                  >
                    <span className="cyguin-notify-item-title">{n.title}</span>
                    <span className="cyguin-notify-item-body">{n.body}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
