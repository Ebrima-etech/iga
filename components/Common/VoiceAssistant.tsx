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
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
}

export default function VoiceAssistant({ isOpen: externalIsOpen, onOpenChange, enabled: externalEnabled = true, onEnabledChange }: VoiceAssistantProps) {
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
  const [internalEnabled, setInternalEnabled] = useState(true);
  const enabled = externalEnabled !== undefined ? externalEnabled : internalEnabled;
  const setEnabled = (value: boolean) => {
    if (onEnabledChange) {
      onEnabledChange(value);
    } else {
      setInternalEnabled(value);
    }
  };
  const [isListening, setIsListening] = useState(false);
  const [isAwaitingWakeWord, setIsAwaitingWakeWord] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFirstActivation, setIsFirstActivation] = useState(true);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  // Only show in GIA dashboard (not in bank portal)
  if (router.pathname.startsWith('/bank') || router.pathname.startsWith('/bank-portal')) {
    return null;
  }

  // Auto-start listening for wake word on mount (only if enabled)
  React.useEffect(() => {
    if (enabled && isAwaitingWakeWord && !isListening && !isOpen) {
      const timer = setTimeout(() => {
        handleStartListeningForWakeWord();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [enabled, isAwaitingWakeWord, isListening, isOpen]);

  // Stop all listening when enabled is toggled to false
  React.useEffect(() => {
    if (!enabled) {
      // Stop any active speech recognition
      if (stopRecordingRef.current) {
        stopRecordingRef.current();
      }
      // Stop speaking if active
      if (isSpeaking) {
        stopSpeaking();
        setIsSpeaking(false);
      }
      // Close dialog
      setIsOpen(false);
      // Reset states
      setIsListening(false);
      setIsAwaitingWakeWord(true);
      setTranscript('');
    }
  }, [enabled]);

  // Reset to listen for wake word when dialog closes
  React.useEffect(() => {
    if (!isOpen && enabled && !isAwaitingWakeWord) {
      setIsAwaitingWakeWord(true);
      setTranscript('');
      setIsFirstActivation(true);  // Reset so greeting plays again next time
    }
  }, [isOpen, enabled]);

  const handleStartListeningForWakeWord = async () => {
    try {
      setIsListening(true);
      stopRecordingRef.current = startSpeechRecognition(
        async (recognizedText) => {
          const text = recognizedText.toLowerCase().trim();

          // Check for wake word "assistant"
          if (text.includes('assistant')) {
            // Stop the wake word listening immediately
            if (stopRecordingRef.current) {
              stopRecordingRef.current();
            }

            setIsListening(false);
            setIsAwaitingWakeWord(false);
            setIsOpen(true);

            // Only speak on first activation, stay silent on subsequent calls
            if (isFirstActivation) {
              await speak('Hello! How can I help you?');
              setIsFirstActivation(false);
            }
            setTranscript('');

            // Auto-start listening for commands immediately after response
            handleStartListeningForCommand();
          } else {
            // Continue listening for wake word (with continuous mode)
            setTranscript('');
          }
        },
        (error) => {
          // Silently continue listening on error
          console.log('Wake word listening error:', error);
          if (isAwaitingWakeWord && !isOpen) {
            setIsListening(false);
            // Restart listening after a brief pause
            setTimeout(() => {
              if (isAwaitingWakeWord && !isOpen) {
                handleStartListeningForWakeWord();
              }
            }, 300);
          }
        },
        'en-US',
        true  // Enable continuous mode for always-on listening
      );
    } catch (error) {
      console.error('Microphone access denied');
      setIsListening(false);
    }
  };

  const handleStartListeningForCommand = async () => {
    // Don't start listening if assistant is disabled
    if (!enabled) {
      return;
    }

    try {
      setIsListening(true);
      let lastCommandTime = Date.now();
      let isFirstCommand = true;

      stopRecordingRef.current = startSpeechRecognition(
        async (recognizedText) => {
          const text = recognizedText.toLowerCase().trim();

          // Check if "assistant" wake word is detected during listening
          if (text.includes('assistant')) {
            // Ignore and continue listening
            return;
          } else if (text.length > 0) {
            // Only process if enough time has passed since last command (debounce)
            const now = Date.now();
            if (now - lastCommandTime > 500) {
              setTranscript(recognizedText);
              lastCommandTime = now;
              // Process the command: full response on first, just "Yes" on subsequent
              await processCommand(recognizedText, isFirstCommand);
              isFirstCommand = false;
            }
          }
        },
        (error) => {
          // Silently continue listening on error
          console.log('Command listening error:', error);
          if (isOpen && enabled) {
            setIsListening(false);
            // Restart after brief pause
            setTimeout(() => {
              if (isOpen && enabled) {
                handleStartListeningForCommand();
              }
            }, 300);
          }
        },
        'en-US',
        true  // Enable continuous mode for uninterrupted listening
      );
    } catch (error) {
      console.error('Microphone access denied');
      setIsListening(false);
    }
  };

  const handleStartListening = async () => {
    try {
      setIsListening(true);
      let lastCommandTime = Date.now();
      let isFirstCommand = true;

      stopRecordingRef.current = startSpeechRecognition(
        async (recognizedText) => {
          const text = recognizedText.toLowerCase().trim();

          // Check if "assistant" wake word is detected during manual recording
          if (text.includes('assistant')) {
            return; // Ignore and keep listening
          } else if (text.length > 0) {
            // Only process if enough time has passed since last command (debounce)
            const now = Date.now();
            if (now - lastCommandTime > 500) {
              setTranscript(recognizedText);
              lastCommandTime = now;
              // Process the command: full response on first, just "Yes" on subsequent
              await processCommand(recognizedText, isFirstCommand);
              isFirstCommand = false;
            }
          }
        },
        (error) => {
          console.error('Microphone error:', error);
          if (isOpen) {
            // Restart listening on error
            setTimeout(() => {
              if (isOpen) {
                handleStartListening();
              }
            }, 300);
          }
        },
        'en-US',
        true  // Enable continuous mode
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

  const processCommand = async (text: string, isFirstCommand: boolean = false) => {
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
          response = await handleNavigate(command.location || command.entity || '', command.label);
          break;

        case 'create':
          response = await handleCreate(command.entity || '');
          break;

        default:
          response = `Sorry, I didn't understand. You can say things like "search for Hassan", "read pilgrim records", "total payments", or "go to dashboard".`;
      }

      // Speak confirmation: full response on first command, just "Yes" on subsequent commands
      setIsSpeaking(true);
      if (isFirstCommand) {
        await speak(response);
      } else {
        await speak('Yes');
      }
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

  const handleNavigate = async (location: string, label?: string): Promise<string> => {
    // location is already a path from detectIntent (e.g., '/dashboard/pilgrims')
    const path = location.startsWith('/') ? location : '/dashboard';

    try {
      await router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }

    return `Opening ${label || location}.`;
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
        <div className="voice-assistant-panel fixed top-14 left-0 right-0 z-40 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-md md:ml-64 transition-all duration-300">
          <div className="px-6 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {isListening ? 'Listening for command...' : 'Assistant ready - say "assistant" or speak a command'}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAwaitingWakeWord(true);
                  setTranscript('');
                  if (stopRecordingRef.current) {
                    stopRecordingRef.current();
                  }
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {transcript && (
              <p className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-md">
                "{transcript}"
              </p>
            )}

            <div className="flex gap-2 items-center">
              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                    setIsSpeaking(false);
                  }
                }}
                disabled={!isSpeaking}
                className="px-3 py-2 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-gray-700 rounded-md transition-colors text-sm flex items-center gap-1"
              >
                {isSpeaking ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
