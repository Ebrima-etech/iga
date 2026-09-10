'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { BiSend, BiRefresh } from 'react-icons/bi';

interface ChatMessage {
  id: number;
  user_id: number;
  username: string;
  message: string;
  created_at: string;
}

interface Staff {
  id: number;
  username: string;
  email: string;
}

export default function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      const response = await api.get('/users/?is_staff=true');
      setStaffList(response.data.results || response.data || []);
      if (response.data.results?.length > 0 || response.data?.length > 0) {
        const staff = response.data.results?.[0] || response.data?.[0];
        setSelectedStaff(staff?.id);
      }
    } catch (err) {
      console.warn('Failed to fetch staff list:', err);
    }
  };

  const fetchMessages = async () => {
    if (!selectedStaff) return;
    try {
      setRefreshing(true);
      const response = await api.get(`/chat-messages/?staff_id=${selectedStaff}&limit=50`);
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
    if (selectedStaff) {
      fetchMessages();
      const interval = setInterval(() => fetchMessages(), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedStaff]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStaff) return;

    try {
      setLoading(true);
      await api.post('/chat-messages/', {
        staff_id: selectedStaff,
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
          <h2 className="text-lg font-semibold text-gray-900">Chat with Staff</h2>
          <button
            onClick={fetchMessages}
            disabled={refreshing || !selectedStaff}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            title="Refresh messages"
          >
            <BiRefresh size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        {/* Staff Selector */}
        <select
          value={selectedStaff || ''}
          onChange={(e) => setSelectedStaff(Number(e.target.value) || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select staff member...</option>
          {staffList.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.username}
            </option>
          ))}
        </select>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!selectedStaff ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-center">
            <p>Select a staff member to start chatting</p>
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
            placeholder={selectedStaff ? "Type a message..." : "Select staff member first..."}
            disabled={loading || !selectedStaff}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim() || !selectedStaff}
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
