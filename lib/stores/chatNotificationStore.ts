import { create } from 'zustand';

interface ChatNotification {
  staffId: number;
  staffName: string;
  unreadCount: number;
  lastMessage: string;
  timestamp: Date;
}

interface ChatNotificationState {
  chatNotifications: Map<number, ChatNotification>;
  totalUnreadChats: number;
  addChatNotification: (notification: ChatNotification) => void;
  incrementUnread: (staffId: number, staffName: string, lastMessage: string) => void;
  markChatAsRead: (staffId: number) => void;
  markAllChatsAsRead: () => void;
  clearChatNotification: (staffId: number) => void;
}

export const useChatNotificationStore = create<ChatNotificationState>((set) => ({
  chatNotifications: new Map(),
  totalUnreadChats: 0,

  addChatNotification: (notification: ChatNotification) => {
    set((state) => {
      const newNotifications = new Map(state.chatNotifications);
      newNotifications.set(notification.staffId, notification);
      const total = Array.from(newNotifications.values()).reduce(
        (sum, n) => sum + n.unreadCount,
        0
      );
      return {
        chatNotifications: newNotifications,
        totalUnreadChats: total,
      };
    });
  },

  incrementUnread: (staffId: number, staffName: string, lastMessage: string) => {
    set((state) => {
      const newNotifications = new Map(state.chatNotifications);
      const existing = newNotifications.get(staffId);

      const updated: ChatNotification = {
        staffId,
        staffName,
        unreadCount: (existing?.unreadCount || 0) + 1,
        lastMessage,
        timestamp: new Date(),
      };

      newNotifications.set(staffId, updated);
      const total = Array.from(newNotifications.values()).reduce(
        (sum, n) => sum + n.unreadCount,
        0
      );

      return {
        chatNotifications: newNotifications,
        totalUnreadChats: total,
      };
    });
  },

  markChatAsRead: (staffId: number) => {
    set((state) => {
      const newNotifications = new Map(state.chatNotifications);
      newNotifications.delete(staffId);
      const total = Array.from(newNotifications.values()).reduce(
        (sum, n) => sum + n.unreadCount,
        0
      );
      return {
        chatNotifications: newNotifications,
        totalUnreadChats: total,
      };
    });
  },

  markAllChatsAsRead: () => {
    set({
      chatNotifications: new Map(),
      totalUnreadChats: 0,
    });
  },

  clearChatNotification: (staffId: number) => {
    set((state) => {
      const newNotifications = new Map(state.chatNotifications);
      newNotifications.delete(staffId);
      const total = Array.from(newNotifications.values()).reduce(
        (sum, n) => sum + n.unreadCount,
        0
      );
      return {
        chatNotifications: newNotifications,
        totalUnreadChats: total,
      };
    });
  },
}));
