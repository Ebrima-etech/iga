'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Card from '@/components/Common/Card';
import { BiTrash, BiCheckDouble } from 'react-icons/bi';
import { useNotification, NotificationType } from '@/lib/notificationContext';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = useNotification();

  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50',
          border: 'border-l-4 border-emerald-500',
          text: 'text-emerald-900',
          label: 'bg-emerald-100 text-emerald-800',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-l-4 border-red-500',
          text: 'text-red-900',
          label: 'bg-red-100 text-red-800',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-l-4 border-amber-500',
          text: 'text-amber-900',
          label: 'bg-amber-100 text-amber-800',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-l-4 border-blue-500',
          text: 'text-blue-900',
          label: 'bg-blue-100 text-blue-800',
        };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-GM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <PageHeader description="View and manage all notifications" title="Notifications" />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card padding="lg" shadow="none">
            <p className="text-sm font-medium text-gray-600">Total Notifications</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{notifications.length}</p>
          </Card>
          <Card padding="lg" shadow="none">
            <p className="text-sm font-medium text-gray-600">Unread</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{unreadCount}</p>
          </Card>
          <Card padding="lg" shadow="none">
            <p className="text-sm font-medium text-gray-600">Read</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{notifications.length - unreadCount}</p>
          </Card>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="mb-6 flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <BiCheckDouble size={16} />
                Mark All as Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => clearAllNotifications()}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <BiTrash size={16} />
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Notifications List */}
        <Card padding="none" shadow="none">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-2">When important things happen, they'll show up here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification, index) => {
                const styles = getTypeStyles(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-6 ${styles?.bg} ${styles?.border} ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${styles?.label}`}>
                            {notification.type.toUpperCase()}
                          </span>
                          {!notification.read && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              Unread
                            </span>
                          )}
                        </div>
                        <h3 className={`text-lg font-semibold ${styles?.text} mb-1`}>{notification.title}</h3>
                        <p className="text-gray-700 mb-3">{notification.message}</p>
                        <p className="text-sm text-gray-500">{formatTime(notification.timestamp)}</p>

                        {notification.action && (
                          <button
                            onClick={notification.action.onClick}
                            className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Mark as read"
                          >
                            <BiCheckDouble size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <BiTrash size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
