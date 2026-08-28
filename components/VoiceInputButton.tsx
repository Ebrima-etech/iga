'use client';

import { useSpeechInput } from '@/hooks/useSpeechInput';
import { BiMicrophone, BiX, BiCheckCircle } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { useState } from 'react';

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

  const [showError, setShowError] = useState(!!error);
  const [permissionDenied, setPermissionDenied] = useState(false);

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Speech recognition not supported in your browser"
        className="p-2 text-gray-300 cursor-not-allowed opacity-50"
      >
        <BiMicrophone size={20} />
      </button>
    );
  }

  const handleStart = () => {
    setShowError(false);
    setPermissionDenied(false);
    startListening();
  };

  const handleStop = () => {
    stopListening();
    if (transcript) {
      onTranscript(transcript);
      toast.success(`✓ Added to ${fieldName}`, {
        icon: '📝',
        duration: 2000,
      });
    }
  };

  const handleClear = () => {
    clearTranscript();
    setShowError(false);
    setPermissionDenied(false);
  };

  const handlePermissionRequest = () => {
    setPermissionDenied(false);
    handleStart();
  };

  // Handle not-allowed error
  if (error && error.includes('not-allowed')) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-300 rounded-lg p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎤</div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 mb-2">Microphone Permission Needed</p>
              <p className="text-sm text-gray-700 mb-4">
                Click below to allow microphone access for voice input
              </p>
              <button
                type="button"
                onClick={handlePermissionRequest}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition transform hover:scale-105 active:scale-95"
              >
                Enable Microphone
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="ml-2 text-gray-600 hover:text-gray-800 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle other errors
  if (error && showError) {
    const errorMessages: Record<string, string> = {
      'no-speech': '🤐 No speech detected. Please try speaking again.',
      'audio-capture': '🎧 Microphone not found. Check your connection.',
      'network': '🌐 Network error. Check your connection.',
      'aborted': '⏹️ Recording was cancelled.',
    };

    const displayError = Object.keys(errorMessages).find(key => error.includes(key))
      ? errorMessages[Object.keys(errorMessages).find(key => error.includes(key))!]
      : `🎤 ${error}`;

    return (
      <div className="w-full max-w-sm">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 shadow-md animate-pulse">
          <p className="text-sm font-medium text-red-700 mb-2">{displayError}</p>
          <button
            type="button"
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full">
      {!isListening ? (
        // Idle state - microphone button
        <button
          type="button"
          onClick={handleStart}
          title={`Click to start voice input for ${fieldName}`}
          className={`relative p-2.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 rounded-lg transition transform hover:scale-110 active:scale-95 group ${className}`}
        >
          <BiMicrophone size={22} />
          <div className="absolute inset-0 rounded-lg bg-indigo-400 opacity-0 group-hover:opacity-10 transition"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 rounded-full group-hover:animate-pulse"></div>
        </button>
      ) : (
        // Recording state - animated recording UI
        <div className="flex-1 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl p-3 shadow-lg animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 mb-2">
            {/* Animated recording pulse */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">🎤 Recording...</p>
              <p className="text-xs text-red-600 mt-0.5">
                Listening to {fieldName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition transform hover:scale-110 active:scale-95 shadow-md"
              title="Stop recording"
            >
              <BiCheckCircle size={18} />
            </button>
          </div>

          {/* Animated waveform */}
          <div className="flex items-center justify-center gap-1 h-6 bg-white bg-opacity-60 rounded-lg px-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-600 rounded-full"
                style={{
                  height: `${20 + Math.random() * 30}%`,
                  animation: `wave 0.6s ease-in-out ${i * 0.1}s infinite`,
                }}
              />
            ))}
            <style>{`
              @keyframes wave {
                0%, 100% { height: 20%; }
                50% { height: 100%; }
              }
            `}</style>
          </div>

          {/* Interim text while listening */}
          {(interimTranscript || transcript) && (
            <p className="text-sm text-gray-800 bg-white rounded-lg px-2 py-1.5 text-center">
              <span className="text-gray-700">
                {transcript || interimTranscript}
              </span>
              {interimTranscript && !transcript && (
                <span className="text-gray-400 italic ml-1 animate-pulse">
                  {interimTranscript}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Display completed transcript */}
      {transcript && !isListening && (
        <div className="flex-1 bg-green-50 border-2 border-green-300 rounded-xl p-3 shadow-md animate-in fade-in slide-in-from-bottom duration-500">
          <div className="flex items-start gap-2">
            <BiCheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700 mb-1">✓ Captured</p>
              <p className="text-sm text-gray-800 mb-2 line-clamp-2">{transcript}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  Confidence: <span className="font-semibold">{(confidence * 100).toFixed(0)}%</span>
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-gray-600 hover:text-gray-800 underline"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
