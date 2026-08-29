'use client';

import React, { useState, useRef } from 'react';
import { BiMicrophone, BiX, BiVolume2, BiVolumeX } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { detectIntent, startSpeechRecognition, speak, stopSpeaking } from '@/lib/voiceAssistant';
import { useRouter } from 'next/router';
import api from '@/lib/api';

export default function VoiceAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  // Only show in GIA dashboard (not in bank portal)
  if (router.pathname.startsWith('/bank') || router.pathname.startsWith('/bank-portal')) {
    return null;
  }

  const handleStartListening = async () => {
    try {
      setIsListening(true);
      stopRecordingRef.current = startSpeechRecognition(
        async (recognizedText) => {
          setTranscript(recognizedText);
          setIsListening(false);
          await processCommand(recognizedText);
        },
        (error) => {
          toast.error(error);
          setIsListening(false);
        }
      );
    } catch (error) {
      toast.error('Microphone access denied');
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (stopRecordingRef.current) {
      stopRecordingRef.current();
      setIsListening(false);
    }
  };

  const processCommand = async (text: string) => {
    try {
      const command = detectIntent(text);
      let response = '';

      switch (command.intent) {
        case 'search':
          response = await handleSearch(command.entity || '');
          break;

        case 'read':
          response = await handleRead(command.entity || '');
          break;

        case 'analytics':
          response = await handleAnalytics(command.entity || '');
          break;

        case 'navigate':
          response = await handleNavigate(command.location || command.entity || '');
          break;

        case 'create':
          response = await handleCreate(command.entity || '');
          break;

        default:
          response = `Sorry, I didn't understand. You can say things like "search for Hassan", "read pilgrim records", "total payments", or "go to dashboard".`;
      }

      setIsSpeaking(true);
      await speak(response);
      setIsSpeaking(false);
    } catch (error) {
      toast.error('Error processing command');
      console.error(error);
    }
  };

  const handleSearch = async (query: string): Promise<string> => {
    try {
      // Search across pilgrims, payments, and banks
      const [pilgrims, payments, banks] = await Promise.all([
        api.get('/pilgrims/', { params: { search: query } }).catch(() => ({ data: { results: [] } })),
        api.get('/bank-payment-submissions/', { params: { search: query } }).catch(() => ({ data: { results: [] } })),
        api.get('/banks/', { params: { search: query } }).catch(() => ({ data: { results: [] } })),
      ]);

      const totalResults = (pilgrims.data.results?.length || 0) + (payments.data.results?.length || 0) + (banks.data.results?.length || 0);

      if (totalResults === 0) {
        return `No results found for "${query}".`;
      }

      let response = `Found ${totalResults} results. `;
      if (pilgrims.data.results?.length) {
        response += `${pilgrims.data.results.length} pilgrim${pilgrims.data.results.length > 1 ? 's' : ''}. `;
      }
      if (payments.data.results?.length) {
        response += `${payments.data.results.length} payment${payments.data.results.length > 1 ? 's' : ''}. `;
      }
      if (banks.data.results?.length) {
        response += `${banks.data.results.length} bank${banks.data.results.length > 1 ? 's' : ''}.`;
      }

      return response;
    } catch {
      return 'Could not search records.';
    }
  };

  const handleRead = async (entity: string): Promise<string> => {
    return `Reading ${entity}. Opening the records for you.`;
  };

  const handleAnalytics = async (query: string): Promise<string> => {
    try {
      const pilgrims = await api.get('/pilgrims/').catch(() => ({ data: { results: [] } }));
      const payments = await api.get('/bank-payment-submissions/').catch(() => ({ data: { results: [] } }));

      if (query.includes('pilgrim')) {
        return `Total pilgrims registered: ${pilgrims.data.results?.length || 0}.`;
      } else if (query.includes('payment')) {
        const totalAmount = (payments.data.results || []).reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);
        return `Total payments: ${payments.data.results?.length || 0} transactions, totaling approximately ${Math.round(totalAmount).toLocaleString()} GMD.`;
      } else {
        return `Pilgrims: ${pilgrims.data.results?.length || 0}. Payments: ${payments.data.results?.length || 0}.`;
      }
    } catch {
      return 'Could not retrieve analytics.';
    }
  };

  const handleNavigate = async (location: string): Promise<string> => {
    const navigationMap: Record<string, string> = {
      'pilgrims': '/dashboard/pilgrims',
      'pilgrim': '/dashboard/pilgrims',
      'payments': '/dashboard/payments',
      'payment': '/dashboard/payments',
      'banks': '/dashboard/banks',
      'bank': '/dashboard/banks',
      'submissions': '/dashboard/bank-submissions',
      'submission': '/dashboard/bank-submissions',
      'dashboard': '/dashboard',
      'home': '/dashboard',
    };

    const path = navigationMap[location.toLowerCase()] || '/dashboard';
    router.push(path);
    return `Taking you to ${location}.`;
  };

  const handleCreate = async (entity: string): Promise<string> => {
    if (entity.includes('pilgrim')) {
      router.push('/dashboard/pilgrims');
      return 'Opening pilgrim registration form.';
    } else if (entity.includes('bank')) {
      router.push('/dashboard/banks');
      return 'Opening bank management.';
    }
    return 'Opening records for you.';
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-110"
        title="Open voice assistant"
      >
        <BiMicrophone size={24} />
      </button>

      {/* Floating panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Voice Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <BiX size={20} />
            </button>
          </div>

          {/* Microphone status */}
          <div className={`p-4 rounded-lg ${isListening ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium text-gray-700">
                {isListening ? 'Listening...' : 'Ready to listen'}
              </span>
            </div>
            {transcript && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="text-gray-400">Heard: </span>"{transcript}"
              </p>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleStartListening}
              disabled={isListening || isSpeaking}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors text-sm"
            >
              {isListening ? 'Listening...' : 'Start Recording'}
            </button>
            {isListening && (
              <button
                onClick={handleStopListening}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Stop
              </button>
            )}
          </div>

          {/* Speaker control */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
                setIsSpeaking(false);
              }
            }}
            disabled={!isSpeaking}
            className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
          >
            {isSpeaking ? <BiVolumeX size={18} /> : <BiVolume2 size={18} />}
            {isSpeaking ? 'Stop Speaking' : 'Volume On'}
          </button>

          {/* Help text */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-600">Try saying:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>"Search for Hassan"</li>
              <li>"Total payments"</li>
              <li>"Go to banks"</li>
              <li>"Create new pilgrim"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
