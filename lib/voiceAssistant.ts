/**
 * Voice Assistant - Speech Recognition & Text-to-Speech Integration
 * Handles voice commands for search, read aloud, analytics, and navigation
 */

export interface VoiceCommand {
  intent: 'search' | 'read' | 'analytics' | 'navigate' | 'create' | 'export' | 'read_report' | 'todays_report' | 'unknown';
  entity?: string; // what to search for
  location?: string; // page to navigate to
  label?: string; // user-friendly label for navigation
  action?: string; // specific action
  reportType?: string; // type of report to read/export
  dateRange?: { start?: string; end?: string }; // date range for reports
  rawText: string;
}

// Intent detection patterns
const INTENT_PATTERNS = {
  todays_report: [
    /(?:give me|show me|get|display)\s+(?:todays?|today's)\s+(?:reports?|data)/i,
    /(?:todays?|today's)\s+(?:reports?|data)/i,
    /(?:reports?|data)\s+(?:for\s+)?today/i,
    /report\s+today/i,
  ],
  search: [
    /(?:find|search|look for|find me|get me|show me)\s+(.+)/i,
    /(?:who is|where is)\s+(.+)/i,
  ],
  read_report: [
    /(?:read|show|display|tell me about)\s+(?:the\s+)?(?:pilgrim|payment|transaction|bank)\s+(?:report|data|records?)(?:\s+for\s+(.+))?/i,
    /(?:read|show)\s+(?:me\s+)?(?:transactions|payments)\s+(?:from|for|between)?(?:\s+(.+))?/i,
    /read\s+(?:all\s+)?(?:transactions|payments)\s+(?:on|from|dated)\s+(.+)/i,
  ],
  read: [
    /(?:read|tell me|read me|read out|read aloud)\s+(?:the\s+)?(.+)/i,
    /(?:what is|give me)\s+(?:the\s+)?(.+)/i,
  ],
  analytics: [
    /(?:total|how many|count|how much)\s+(.+)/i,
    /(?:statistics|stats|analysis|report)\s+(?:for\s+)?(.+)/i,
  ],
  export: [
    /(?:export|download|save|generate)\s+(?:a\s+)?(?:report|data)\s+(?:as\s+)?(?:pdf|excel|csv)?(?:\s+(?:for|from|between)\s+(.+))?/i,
    /(?:export|download)\s+(?:pilgrim|payment|bank|transaction)\s+(?:report)?(?:\s+(?:in|as|to)\s+(.+))?/i,
  ],
  navigate: [
    /(?:go to|open|show me|take me to)\s+(.+)/i,
    /(?:show|display)\s+(.+)/i,
  ],
  create: [
    /(?:create|add|new|make)\s+(?:a\s+)?(.+)/i,
    /(?:register|add)\s+(?:new\s+)?(.+)/i,
  ],
};

const NAVIGATION_ALIASES: Record<string, { path: string; label: string }> = {
  // Operations
  dashboard: { path: '/dashboard', label: 'Dashboard' },
  home: { path: '/dashboard', label: 'Dashboard' },
  overview: { path: '/dashboard', label: 'Dashboard' },
  analytics: { path: '/dashboard/analytics', label: 'Analytics' },
  'hajj universe': { path: '/dashboard/hajj-universe', label: 'Hajj Universe' },
  universe: { path: '/dashboard/hajj-universe', label: 'Hajj Universe' },
  pilgrims: { path: '/dashboard/pilgrims', label: 'Pilgrims' },
  'pilgrim list': { path: '/dashboard/pilgrims', label: 'Pilgrims' },
  'pilgrim management': { path: '/dashboard/pilgrims', label: 'Pilgrims' },
  payments: { path: '/dashboard/payments', label: 'Payments' },
  'payment list': { path: '/dashboard/payments', label: 'Payments' },
  'payment tracking': { path: '/dashboard/payments', label: 'Payments' },
  banks: { path: '/dashboard/banks', label: 'Banks' },
  'bank list': { path: '/dashboard/banks', label: 'Banks' },
  'bank management': { path: '/dashboard/banks', label: 'Banks' },
  submissions: { path: '/dashboard/bank-submissions', label: 'Bank Submissions' },
  'bank submissions': { path: '/dashboard/bank-submissions', label: 'Bank Submissions' },
  reports: { path: '/dashboard/reports', label: 'Reports' },
  'report section': { path: '/dashboard/reports', label: 'Reports' },

  // Accommodations
  hotels: { path: '/dashboard/accommodations/hotels', label: 'Hotels' },
  hotel: { path: '/dashboard/accommodations/hotels', label: 'Hotels' },
  'room assignments': { path: '/dashboard/accommodations/room-assignments', label: 'Room Assignments' },
  rooms: { path: '/dashboard/accommodations/room-assignments', label: 'Room Assignments' },
  'room management': { path: '/dashboard/accommodations/room-assignments', label: 'Room Assignments' },
  flights: { path: '/dashboard/accommodations/flights', label: 'Flights' },
  'flight list': { path: '/dashboard/accommodations/flights', label: 'Flights' },
  'flight management': { path: '/dashboard/accommodations/flights', label: 'Flights' },
  'flight assignments': { path: '/dashboard/accommodations/flight-assignments', label: 'Flight Assignments' },
  'flight assignment': { path: '/dashboard/accommodations/flight-assignments', label: 'Flight Assignments' },

  // System
  settings: { path: '/dashboard/settings', label: 'Settings' },
  preferences: { path: '/dashboard/settings', label: 'Settings' },
};

export function detectIntent(text: string): VoiceCommand {
  const lowerText = text.toLowerCase().trim();

  // Try each intent pattern
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const entity = match[1]?.trim();
        const entityLower = entity?.toLowerCase() || '';
        const navigationData = NAVIGATION_ALIASES[entityLower];

        const location = navigationData?.path || entity;
        const label = navigationData?.label || entity;

        return {
          intent: intent as VoiceCommand['intent'],
          entity,
          location,
          label,
          rawText: text,
        };
      }
    }
  }

  return {
    intent: 'unknown',
    rawText: text,
  };
}

export async function executeVoiceCommand(command: VoiceCommand): Promise<string> {
  switch (command.intent) {
    case 'search':
      return `Searching for ${command.entity}...`;

    case 'read':
      return `Reading ${command.entity}...`;

    case 'analytics':
      return `Getting analytics for ${command.entity}...`;

    case 'navigate':
      return `Taking you to ${command.entity}...`;

    case 'create':
      return `Creating new ${command.entity}...`;

    default:
      return `I didn't understand that. Try saying "search", "read", "navigate", or "analyze".`;
  }
}

export function startSpeechRecognition(
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  language: string = 'en-US',
  continuous: boolean = false
): () => void {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech Recognition not supported in your browser');
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.language = language;
  recognition.continuous = continuous;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log('Voice recording started...');
  };

  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const isFinal = event.results[i].isFinal;
      transcript += event.results[i][0].transcript;

      if (isFinal) {
        onResult(transcript);
      }
    }
  };

  recognition.onerror = (event: any) => {
    onError(`Error: ${event.error}`);
  };

  recognition.onend = () => {
    console.log('Voice recording ended');
  };

  // Start recording
  recognition.start();

  // Return stop function
  return () => recognition.stop();
}

export function speak(text: string, rate: number = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel();
}
