'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { BiSend, BiRefresh } from 'react-icons/bi';
import { useChatNotificationStore } from '@/lib/stores/chatNotificationStore';
import { getMe } from '@/lib/auth';

interface ChatMessage {
  id: number;
  user_id: number;
  username: string;
  message: string;
  created_at: string;
}

interface ChatUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export default function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userList, setUserList] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { incrementUnread, markChatAsRead } = useChatNotificationStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUserList();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const user = await getMe();
      setCurrentUserId(user.id);
    } catch (err) {
      console.warn('Failed to fetch current user:', err);
    }
  };

  const fetchUserList = async () => {
    try {
      const response = await api.get('/users/?limit=100');
      const allUsers = response.data.results || response.data || [];
      // Filter out current user
      const otherUsers = allUsers.filter((u: ChatUser) => u.id !== currentUserId);
      setUserList(otherUsers);
      if (otherUsers.length > 0) {
        setSelectedUser(otherUsers[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch user list:', err);
    }
  };

  const fetchMessages = async () => {
    if (!selectedUser || !currentUserId) return;
    try {
      setRefreshing(true);
      const response = await api.get(
        `/chat-messages/?user_id=${currentUserId}&recipient_id=${selectedUser}&limit=50`
      );
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setMessages(data.reverse());
      setError(null);
    } catch (err: any) {
      console.warn('Failed to fetch chat messages:', err);
      setError('Unable to load chat history');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedUser && currentUserId) {
      fetchMessages();
      const interval = setInterval(() => fetchMessages(), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, currentUserId]);

  // Track window focus for unread notifications
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Detect new messages and send notifications
  useEffect(() => {
    scrollToBottom();

    // Check for new messages when not focused
    if (!isFocused && messages.length > previousMessageCount && selectedUser) {
      const user = userList.find(u => u.id === selectedUser);
      if (user) {
        const lastMsg = messages[messages.length - 1];
        incrementUnread(selectedUser, user.username, lastMsg.message);
      }
    }

    setPreviousMessageCount(messages.length);
  }, [messages, isFocused, selectedUser, previousMessageCount, userList, incrementUnread]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUserId) return;

    try {
      setLoading(true);
      await api.post('/chat-messages/', {
        user_id: currentUserId,
        recipient_id: selectedUser,
        message: newMessage
      });
      setNewMessage('');
      await fetchMessages();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error?.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={fetchMessages}
            disabled={refreshing || !selectedUser}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            title="Refresh messages"
          >
            <BiRefresh size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        {/* User Selector */}
        <select
          value={selectedUser || ''}
          onChange={(e) => {
            const userId = Number(e.target.value) || null;
            setSelectedUser(userId);
            // Mark notifications as read when switching to this user
            if (userId) {
              markChatAsRead(userId);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a user to chat...</option>
          {userList.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
            </option>
          ))}
        </select>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!selectedUser ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-center">
            <p>Select a user to start chatting</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-gray-600 font-semibold mb-2">No chat history yet</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-gray-900 text-sm">{msg.username}</span>
                <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
              </div>
              <p className="text-gray-700 mt-1 break-words">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={selectedUser ? "Type a message..." : "Select a user first..."}
            disabled={loading || !selectedUser}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim() || !selectedUser}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <BiSend size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
