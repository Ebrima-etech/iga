import { useState, useRef, useEffect } from 'react';
import Button from './Button';

interface TextToSpeechProps {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export default function TextToSpeech({
  text,
  rate = 1,
  pitch = 1,
  volume = 1
}: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;

    if (!synth) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = synth.getVoices();
      setAvailableVoices(voices);

      // Find a voice matching the current language
      const matchingVoice = voices.findIndex(v => v.lang.startsWith(currentLanguage.split('-')[0]));
      if (matchingVoice >= 0) {
        setSelectedVoice(matchingVoice);
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, [currentLanguage]);

  const speak = () => {
    if (!text.trim()) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.rate = rate;
    utteranceRef.current.pitch = pitch;
    utteranceRef.current.volume = volume;

    if (availableVoices.length > 0 && selectedVoice >= 0) {
      utteranceRef.current.voice = availableVoices[selectedVoice];
    }

    utteranceRef.current.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    synth.speak(utteranceRef.current);
  };

  const pause = () => {
    const synth = window.speechSynthesis;
    if (synth.speaking && !isPaused) {
      synth.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    const synth = window.speechSynthesis;
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          ⚠️ Text-to-speech is not supported in your browser. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Text Display */}
      <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg max-h-32 overflow-y-auto">
        <p className="text-gray-900">{text || 'No text to speak...'}</p>
      </div>

      {/* Voice Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Voice
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(parseInt(e.target.value))}
            disabled={isSpeaking}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100"
          >
            {availableVoices.map((voice, idx) => (
              <option key={idx} value={idx}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Speed: {rate}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => {
              // For demo purposes, you can pass rate as prop
              // In production, you'd need to make this a controlled component
            }}
            disabled={isSpeaking}
            className="w-full disabled:opacity-50"
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 flex-wrap">
        {!isSpeaking ? (
          <Button onClick={speak} variant="primary" size="sm">
            🔊 Speak
          </Button>
        ) : (
          <>
            {!isPaused ? (
              <Button onClick={pause} variant="secondary" size="sm">
                ⏸️ Pause
              </Button>
            ) : (
              <Button onClick={resume} variant="secondary" size="sm">
                ▶️ Resume
              </Button>
            )}
            <Button onClick={stop} variant="danger" size="sm">
              ⏹️ Stop
            </Button>
          </>
        )}
      </div>

      {/* Status Indicator */}
      {isSpeaking && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            {isPaused ? '⏸️ Paused' : '🔊 Speaking...'}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
        <p className="font-semibold mb-1">💡 Tips:</p>
        <ul className="space-y-1">
          <li>• Click "Speak" to hear the text read aloud</li>
          <li>• Select different voices for variety</li>
          <li>• Use pause/resume to control playback</li>
          <li>• Different browsers have different voice options</li>
        </ul>
      </div>
    </div>
  );
}
