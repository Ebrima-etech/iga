import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import VoiceAssistant from '../Common/VoiceAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar isCollapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header onVoiceAssistantToggle={() => setVoiceAssistantOpen(!voiceAssistantOpen)} />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
      <VoiceAssistant isOpen={voiceAssistantOpen} onOpenChange={setVoiceAssistantOpen} />
    </div>
  );
}
