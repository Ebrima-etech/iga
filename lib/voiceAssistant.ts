/**
 * Voice Assistant - Speech Recognition & Text-to-Speech Integration
 * Handles voice commands for search, read aloud, analytics, and navigation
 */

export interface VoiceCommand {
  intent: 'search' | 'read' | 'analytics' | 'navigate' | 'create' | 'unknown';
  entity?: string; // what to search for
  location?: string; // page to navigate to
  action?: string; // specific action
  rawText: string;
}

// Intent detection patterns
const INTENT_PATTERNS = {
  search: [
    /(?:find|search|look for|find me|get me|show me)\s+(.+)/i,
    /(?:who is|where is)\s+(.+)/i,
  ],
  read: [
    /(?:read|tell me|read me|read out|read aloud)\s+(?:the\s+)?(.+)/i,
    /(?:what is|give me)\s+(?:the\s+)?(.+)/i,
  ],
  analytics: [
    /(?:total|how many|count|how much)\s+(.+)/i,
    /(?:statistics|stats|analysis|report)\s+(?:for\s+)?(.+)/i,
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

const NAVIGATION_ALIASES: Record<string, string> = {
  pilgrims: '/dashboard/pilgrims',
  'pilgrim list': '/dashboard/pilgrims',
  payments: '/dashboard/payments',
  'payment list': '/dashboard/payments',
  banks: '/dashboard/banks',
  'bank list': '/dashboard/banks',
  submissions: '/dashboard/bank-submissions',
  'bank submissions': '/dashboard/bank-submissions',
  dashboard: '/dashboard',
  home: '/dashboard',
};

export function detectIntent(text: string): VoiceCommand {
  const lowerText = text.toLowerCase().trim();

  // Try each intent pattern
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const entity = match[1]?.trim();
        const location = NAVIGATION_ALIASES[entity?.toLowerCase()] || entity;

        return {
          intent: intent as VoiceCommand['intent'],
          entity,
          location,
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
  language: string = 'en-US'
): () => void {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech Recognition not supported in your browser');
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.language = language;
  recognition.continuous = false;
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
