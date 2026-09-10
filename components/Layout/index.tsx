import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Sidebar from './Sidebar';
import VoiceAssistant from '../Common/VoiceAssistant';

interface LayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export default function Layout({ children, hideSidebar = false }: LayoutProps) {
  const router = useRouter();
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Hide sidebar on settings page
  const isSettingsPage = router.pathname === '/dashboard/settings';
  const shouldHideSidebar = hideSidebar || isSettingsPage;

  return (
    <div className="min-h-screen bg-white">
      {!shouldHideSidebar && <Sidebar isCollapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${
        shouldHideSidebar ? '' : (sidebarCollapsed ? 'md:ml-20' : 'md:ml-64')
      }`}>
        <Header
          onVoiceAssistantToggle={() => setVoiceAssistantOpen(!voiceAssistantOpen)}
          voiceAssistantEnabled={voiceAssistantEnabled}
          onVoiceAssistantEnabledChange={setVoiceAssistantEnabled}
        />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
      <VoiceAssistant
        isOpen={voiceAssistantOpen}
        onOpenChange={setVoiceAssistantOpen}
        enabled={voiceAssistantEnabled}
        onEnabledChange={setVoiceAssistantEnabled}
      />
    </div>
  );
}
