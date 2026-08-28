import { useState, useRef, useEffect } from 'react';
import Button from './Button';

interface SpeechInputProps {
  onTextReceived: (text: string) => void;
  placeholder?: string;
  language?: string;
}

export default function SpeechInput({
  onTextReceived,
  placeholder = "Click to speak...",
  language = "en-US"
}: SpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.language = language;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + ' ';
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        onTextReceived(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onTextReceived]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          ⚠️ Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={toggleListening}
        variant={isListening ? 'danger' : 'primary'}
        className="w-full"
      >
        {isListening ? '🛑 Stop Listening' : '🎤 Start Speaking'}
      </Button>

      {transcript && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Recognized Text:</p>
          <p className="text-lg font-medium text-gray-900">{transcript}</p>
          <p className="text-xs text-gray-500 mt-2">
            {isListening ? '🔴 Listening...' : '✓ Complete'}
          </p>
        </div>
      )}

      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
        <p className="font-semibold mb-1">💡 Tips:</p>
        <ul className="space-y-1">
          <li>• Click "Start Speaking" to begin</li>
          <li>• Speak clearly and at a normal pace</li>
          <li>• Click "Stop Listening" to finish or it will auto-stop after silence</li>
          <li>• Text appears automatically when you finish speaking</li>
        </ul>
      </div>
    </div>
  );
}
