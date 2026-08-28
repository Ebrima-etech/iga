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
    console.log('🛑 handleStop called, calling stopListening()');
    const finalText = stopListening();

    console.log('📝 finalText from stopListening():', finalText);
    console.log('📝 typeof finalText:', typeof finalText);
    console.log('📝 fieldName:', fieldName);
    console.log('📝 onTranscript callback:', onTranscript);

    if (finalText && finalText.trim()) {
      console.log('✅ Text is valid, calling onTranscript with:', finalText);
      // Use the returned transcript immediately (don't wait for state update)
      onTranscript(finalText);

      toast.success(`✓ Text added to ${fieldName}`, {
        icon: '✍️',
        duration: 1500,
      });

      console.log('✅ Voice input captured and passed:', finalText);

      // Clear the voice UI after a short delay so user can see the input field
      setTimeout(() => {
        clearTranscript();
      }, 800);
    } else {
      console.warn('❌ No text to capture');
      toast.error('No speech detected. Please try again.', {
        duration: 2000,
      });
    }
  };

  const handleClear = () => {
    clearTranscript();
    setShowError(false);
    setPermissionDenied(false);
  };

  const handlePermissionRequest = async () => {
    const toastId = toast.loading('🎤 Requesting microphone access...');

    try {
      console.log('Requesting microphone permission...');

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.dismiss(toastId);
        toast.error('❌ Your browser does not support microphone access', {
          duration: 3000,
        });
        return;
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Stop the stream - we just needed permission
      stream.getTracks().forEach(track => {
        console.log('Stopping audio track:', track.label);
        track.stop();
      });

      setPermissionDenied(false);
      setShowError(false);
      clearTranscript();

      toast.dismiss(toastId);
      toast.success('✅ Microphone enabled! Ready to record.', {
        duration: 2000,
      });

      // Start listening after a short delay
      setTimeout(() => {
        console.log('Starting speech recognition...');
        startListening();
      }, 300);

    } catch (err: any) {
      toast.dismiss(toastId);
      console.error('Permission error:', err.name, err.message);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error(
          '❌ Microphone permission was blocked by your browser.\n\nTo fix this:\n1. Click the lock icon in your address bar\n2. Find "Microphone" and set to "Allow"\n3. Refresh the page',
          {
            duration: 5000,
            style: {
              background: '#fee2e2',
              color: '#991b1b',
              border: '2px solid #dc2626',
            },
          }
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast.error('🎧 No microphone found. Please connect a microphone to your device.', {
          duration: 3000,
        });
      } else if (err.name === 'NotReadableError' || err.name === 'OverconstrainedError') {
        toast.error('🎤 Microphone is being used by another application. Please close other apps and try again.', {
          duration: 3000,
        });
      } else if (err.name === 'SecurityError') {
        toast.error('🔒 Security error: This site may not have permission to access microphone.', {
          duration: 3000,
        });
      } else {
        toast.error(`❌ Error: ${err.name || 'Failed to access microphone'}`, {
          duration: 3000,
        });
      }
    }
  };

  // Handle not-allowed error
  if (error && error.includes('not-allowed')) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-2 border-red-400 rounded-xl p-5 shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">🎤</div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Microphone Permission Blocked</p>
              <p className="text-xs text-gray-700 mt-1">
                Your browser is blocking microphone access
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 mb-4 border border-orange-200">
            <p className="text-xs font-semibold text-gray-900 mb-2">📍 How to Fix:</p>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Click the <strong>lock icon</strong> in the address bar</li>
              <li>Find <strong>&quot;Microphone&quot;</strong> in the popup</li>
              <li>Change it to <strong>&quot;Allow&quot;</strong></li>
              <li><strong>Refresh</strong> this page (F5)</li>
              <li>Click <strong>&quot;Enable Microphone&quot;</strong> button again</li>
            </ol>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handlePermissionRequest}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition transform hover:scale-105 active:scale-95 shadow-md"
            >
              🎤 Enable Microphone
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-full text-gray-600 hover:text-gray-800 text-xs underline py-1"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-gray-600 text-center mt-3">
            💡 Make sure your microphone is connected and not being used by another app
          </p>
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
