'use client';

import { useSpeechInput } from '@/hooks/useSpeechInput';
import { BiMicrophone, BiX } from 'react-icons/bi';
import toast from 'react-hot-toast';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
  className?: string;
  fieldName?: string;
}

export default function VoiceInputButton({
  onTranscript,
  language = 'en-US',
  className = '',
  fieldName = 'field',
}: VoiceInputButtonProps) {
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    confidence,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechInput(language);

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Speech recognition not supported"
        className="p-2 text-gray-300 cursor-not-allowed opacity-50"
      >
        <BiMicrophone size={20} />
      </button>
    );
  }

  const handleStart = () => {
    startListening();
    toast.loading(`🎤 Listening to ${fieldName}...`);
  };

  const handleStop = () => {
    stopListening();
    if (transcript) {
      onTranscript(transcript);
      toast.success(`✓ Voice input added to ${fieldName}`);
    }
  };

  const handleClear = () => {
    clearTranscript();
    toast.success('Voice input cleared');
  };

  if (error) {
    return (
      <div className="text-red-500 text-xs p-2 bg-red-50 rounded">
        <p className="font-medium">🎤 Error: {error}</p>
        <button
          type="button"
          onClick={handleClear}
          className="text-red-600 hover:text-red-800 mt-1 text-xs underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isListening ? (
        <button
          type="button"
          onClick={handleStart}
          title="Click to start voice input"
          className={`p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition ${className}`}
        >
          <BiMicrophone size={20} />
        </button>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-red-700">Recording...</span>
          </div>
          <button
            type="button"
            onClick={handleStop}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition"
            title="Stop recording"
          >
            <BiX size={16} />
          </button>
        </div>
      )}

      {/* Show transcript preview */}
      {transcript && (
        <div className="flex-1">
          <p className="text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded border border-blue-200">
            <span className="text-xs text-gray-600">📝 </span>
            {transcript}
            {interimTranscript && (
              <span className="text-gray-400 italic ml-1">{interimTranscript}</span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence: {(confidence * 100).toFixed(0)}%
          </p>
        </div>
      )}

      {/* Interim transcript while listening */}
      {isListening && interimTranscript && !transcript && (
        <p className="text-sm text-gray-500 italic flex-1">
          🎙️ Listening: <span className="text-gray-400">{interimTranscript}</span>
        </p>
      )}
    </div>
  );
}
