'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import { BiSend, BiPlus, BiGroup } from 'react-icons/bi';
import api from '@/lib/api';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Message {
  id: number;
  sender: number;
  sender_username: string;
  recipient: number;
  message: string;
  read: boolean;
  created_at: string;
}

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const [conversations, setConversations] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchStaffList();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      const interval = setInterval(() => fetchMessages(selectedUser.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat-messages/conversations/');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchStaffList = async () => {
    try {
      const response = await api.get('/users/staff_list/');
      setStaffList(response.data);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      const response = await api.get(`/chat-messages/with_user/?user_id=${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await api.post('/chat-messages/', {
        recipient: selectedUser.id,
        message: newMessage,
      });
      setNewMessage('');
      fetchMessages(selectedUser.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <PageHeader title="Chat" description="Direct messaging and group chat" />

        <div className="flex gap-6 h-[calc(100vh-200px)] px-8 pb-8">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 pr-6 flex flex-col">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
              <button
                onClick={() => setActiveTab('direct')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'direct'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Direct Messages
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'groups'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <BiGroup className="inline mr-2" size={18} />
                Groups
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'direct' ? (
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <p className="text-gray-500 text-sm">No conversations yet</p>
                  ) : (
                    conversations.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedUser?.id === user.id
                            ? 'bg-primary-50 border border-primary-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">
                          {user.first_name} {user.last_name}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">Group chats coming soon</div>
              )}
            </div>

            {/* New Conversation Button */}
            {activeTab === 'direct' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-600 mb-3">Available Staff</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {staffList
                    .filter((s) => !conversations.find((c) => c.id === s.id))
                    .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="w-full text-left p-2 text-sm rounded-lg hover:bg-gray-50 border border-gray-200"
                      >
                        {user.username}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="font-semibold text-gray-900">{selectedUser.username}</div>
                  <div className="text-sm text-gray-500">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      No messages yet. Start a conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === selectedUser.id ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                            msg.sender === selectedUser.id
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-primary-600 text-white'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === selectedUser.id
                                ? 'text-gray-500'
                                : 'text-primary-100'
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <BiSend size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  {activeTab === 'direct' ? 'Select a user to start chatting' : 'Select or create a group'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
