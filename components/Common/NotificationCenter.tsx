'use client';

import { useState, useRef, useEffect } from 'react';
import { BiBell, BiX, BiCheckDouble } from 'react-icons/bi';
import { useNotification, NotificationType } from '@/lib/notificationContext';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotification();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-l-4 border-emerald-500';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'warning':
        return 'bg-amber-50 border-l-4 border-amber-500';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-500';
    }
  };

  const getTypeIconColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'text-emerald-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
        return 'text-blue-600';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title="Notifications"
      >
        <BiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <BiCheckDouble size={16} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BiBell size={40} className="mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1 rounded-full ${getTypeIconColor(notification.type)} bg-opacity-10`}>
                            <span className={`text-sm font-bold ${getTypeIconColor(notification.type)}`}>
                              {notification.type[0].toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-snug">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(notification.timestamp)}</p>
                        {notification.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.action?.onClick();
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <BiX size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
