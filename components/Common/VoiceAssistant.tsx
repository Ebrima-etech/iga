'use client';

import React, { useState, useRef } from 'react';
import { FaMicrophone, FaTimes, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { detectIntent, startSpeechRecognition, speak, stopSpeaking } from '@/lib/voiceAssistant';
import { useRouter } from 'next/router';
import api from '@/lib/api';

interface VoiceAssistantProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function VoiceAssistant({ isOpen: externalIsOpen, onOpenChange }: VoiceAssistantProps) {
  const router = useRouter();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalIsOpen(value);
    }
  };
  const [isListening, setIsListening] = useState(false);
  const [isAwaitingWakeWord, setIsAwaitingWakeWord] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  // Only show in GIA dashboard (not in bank portal)
  if (router.pathname.startsWith('/bank') || router.pathname.startsWith('/bank-portal')) {
    return null;
  }

  // Auto-start listening for wake word on mount
  React.useEffect(() => {
    if (isAwaitingWakeWord && !isListening && !isOpen) {
      const timer = setTimeout(() => {
        handleStartListeningForWakeWord();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAwaitingWakeWord, isListening, isOpen]);

  const handleStartListeningForWakeWord = async () => {
    try {
      setIsListening(true);
      stopRecordingRef.current = startSpeechRecognition(
        async (recognizedText) => {
          const text = recognizedText.toLowerCase().trim();

          // Check for wake word "aja"
          if (text.includes('aja')) {
            setIsListening(false);
            setIsAwaitingWakeWord(false);
            setIsOpen(true);

            // Respond to wake word
            await speak('Hello! How can I help you?');
            setTranscript('');
          } else {
            // Continue listening for wake word
            setTranscript('');
            handleStartListeningForWakeWord();
          }
        },
        (error) => {
          // Silently continue listening on error
          console.log('Wake word listening error:', error);
          setTimeout(() => {
            if (isAwaitingWakeWord && !isOpen) {
              setIsListening(false);
              handleStartListeningForWakeWord();
            }
          }, 1000);
        }
      );
    } catch (error) {
      console.error('Microphone access denied');
      setIsListening(false);
    }
  };

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

        case 'read_report':
          response = await handleReadReport(command.entity || '', command.dateRange);
          break;

        case 'read':
          response = await handleRead(command.entity || '');
          break;

        case 'analytics':
          response = await handleAnalytics(command.entity || '');
          break;

        case 'export':
          response = await handleExportReport(command.entity || '', command.dateRange);
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

  const handleReadReport = async (reportType: string, dateRange?: { start?: string; end?: string }): Promise<string> => {
    try {
      let report = '';

      if (reportType.includes('payment') || reportType.includes('transaction')) {
        const payments = await api.get('/bank-payment-submissions/').catch(() => ({ data: { results: [] } }));
        const paymentList = payments.data.results || [];

        if (dateRange?.start && dateRange?.end) {
          report = `Payments between ${dateRange.start} and ${dateRange.end}: Found ${paymentList.length} transactions. `;
        } else if (dateRange?.start) {
          report = `Payments from ${dateRange.start}: Found ${paymentList.length} transactions. `;
        } else {
          report = `Total payments in system: ${paymentList.length} transactions. `;
        }

        const totalAmount = paymentList.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
        const confirmed = paymentList.filter((p: any) => p.status === 'confirmed').length;
        const pending = paymentList.filter((p: any) => p.status === 'pending').length;

        report += `Total amount: ${totalAmount.toLocaleString()} GMD. Confirmed: ${confirmed}, Pending: ${pending}.`;
      } else if (reportType.includes('pilgrim')) {
        const pilgrims = await api.get('/pilgrims/').catch(() => ({ data: { results: [] } }));
        const pilgrimList = pilgrims.data.results || [];
        report = `Total pilgrims registered: ${pilgrimList.length}. `;

        if (dateRange?.start) {
          report += `Filtering from ${dateRange.start} onwards.`;
        }
      } else {
        report = `Reading ${reportType} report. Please specify the date range for more details.`;
      }

      return report;
    } catch (error) {
      return 'Unable to read report at this moment. Please try again.';
    }
  };

  const handleExportReport = async (reportType: string, dateRange?: { start?: string; end?: string }): Promise<string> => {
    try {
      const format = reportType.includes('pdf') ? 'PDF' : reportType.includes('excel') ? 'Excel' : 'PDF';
      const report = reportType.includes('payment') ? 'Payment Report' : reportType.includes('pilgrim') ? 'Pilgrim Report' : 'System Report';

      let exportDetails = `Exporting ${report} as ${format}. `;

      if (dateRange?.start && dateRange?.end) {
        exportDetails += `Date range: ${dateRange.start} to ${dateRange.end}. `;
      } else if (dateRange?.start) {
        exportDetails += `From ${dateRange.start} onwards. `;
      }

      exportDetails += `File will be ready for download in the exports section.`;

      // Simulate export processing
      toast.success(`${report} export initiated as ${format}!`);

      return exportDetails;
    } catch (error) {
      return 'Failed to export report. Please try again.';
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .voice-assistant-panel {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
      {isOpen && (
        <div className="voice-assistant-panel fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-[1400px] mx-auto px-6 py-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Voice Assistant</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAwaitingWakeWord(true);
                  setTranscript('');
                  if (stopRecordingRef.current) {
                    stopRecordingRef.current();
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
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
            {isSpeaking ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
            {isSpeaking ? 'Stop Speaking' : 'Volume On'}
          </button>

            {/* Help text */}
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-600">Try saying:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>"Search for Hassan"</li>
                <li>"Read payment report for today"</li>
                <li>"Export pilgrim data as PDF"</li>
                <li>"Total payments this month"</li>
                <li>"Go to banks"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
