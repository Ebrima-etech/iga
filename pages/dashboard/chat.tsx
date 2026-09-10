'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import ChatSection from '@/components/Dashboard/ChatSection';

export default function ChatPage() {
  return (
    <Layout>
      <div className="relative">
        <div className="min-h-screen bg-white/95 relative z-10">
          {/* Page Header */}
          <div className="px-8 py-8 border-b border-gray-200 bg-white">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Team Chat</h1>
              <p className="text-sm text-gray-600 mt-2 font-medium">Communicate with your team in real-time</p>
            </div>
          </div>

          {/* Chat Container */}
          <div className="p-8">
            <div style={{ height: '600px' }}>
              <ChatSection />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
