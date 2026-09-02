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
  const isInBankPortal = router.pathname.startsWith('/bank') || router.pathname.startsWith('/bank-portal');

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

            // First activation: speak greeting, subsequent calls: just say "Yes"
            if (isFirstActivation) {
              await speak('Yes boss how can I help you?');
              setIsFirstActivation(false);
            } else {
              await speak('Yes');
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
              // Process the command with full response
              await processCommand(recognizedText);
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
              // Process the command with full response
              await processCommand(recognizedText);
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
          response = await handleNavigate(command.location || command.entity || '', command.label);
          break;

        case 'create':
          response = await handleCreate(command.entity || '');
          break;

        case 'todays_report':
          response = await handleTodaysReport();
          break;

        default:
          response = 'Pardon';
      }

      // Stop listening before speaking to avoid picking up own voice
      if (stopRecordingRef.current) {
        stopRecordingRef.current();
        setIsListening(false);
      }

      // Speak response
      setIsSpeaking(true);
      await speak(response);
      setIsSpeaking(false);

      // Resume listening after speaking
      if (isOpen && enabled) {
        setTimeout(() => {
          handleStartListening();
        }, 100);
      }
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
    const lowerEntity = entity.toLowerCase();

    if (lowerEntity.includes('pilgrim')) {
      router.push('/dashboard/pilgrims?showCreateForm=true');
      return 'Opening pilgrim registration form.';
    } else if (lowerEntity.includes('payment')) {
      router.push('/dashboard/payments?showCreateForm=true');
      return 'Opening payment submission form.';
    } else if (lowerEntity.includes('bank')) {
      router.push('/dashboard/banks?showCreateForm=true');
      return 'Opening bank creation form.';
    } else if (lowerEntity.includes('hotel') || lowerEntity.includes('accommodation')) {
      router.push('/dashboard/accommodations/hotels?showCreateForm=true');
      return 'Opening hotel management form.';
    } else if (lowerEntity.includes('flight')) {
      router.push('/dashboard/accommodations/flights?showCreateForm=true');
      return 'Opening flight management form.';
    } else if (lowerEntity.includes('room')) {
      router.push('/dashboard/accommodations/room-assignments?showCreateForm=true');
      return 'Opening room assignment form.';
    } else if (lowerEntity.includes('report')) {
      router.push('/dashboard/reports');
      return 'Opening reports section.';
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
      const format = reportType.includes('pdf') ? 'pdf' : reportType.includes('csv') ? 'csv' : 'excel';
      const reportName = reportType.includes('payment') ? 'Payment Report' : reportType.includes('pilgrim') ? 'Pilgrim Report' : 'System Report';

      // Fetch data based on report type
      let data: any[] = [];
      if (reportType.includes('payment')) {
        const response = await api.get('/bank-payment-submissions/');
        data = response.data.results || response.data;
      } else if (reportType.includes('pilgrim')) {
        const response = await api.get('/pilgrims/');
        data = response.data.results || response.data;
      }

      // Filter by date range if provided
      if (dateRange?.start) {
        const startDate = new Date(dateRange.start);
        data = data.filter((item: any) => {
          const itemDate = new Date(item.created_at || item.submitted_at);
          return itemDate >= startDate;
        });
      }

      // Generate file based on format
      if (format === 'pdf') {
        await generatePDFReport(reportName, data);
      } else if (format === 'excel') {
        await generateExcelReport(reportName, data);
      } else {
        await generateCSVReport(reportName, data);
      }

      const formatName = format.toUpperCase();
      toast.success(`${reportName} exported as ${formatName}!`);
      return `Exported ${reportName} as ${formatName}. File download started.`;
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
      return 'Failed to export report. Please try again.';
    }
  };

  const generatePDFReport = async (reportName: string, data: any[]) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(reportName, 20, 20);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    let yPosition = 45;
    doc.setFontSize(11);

    if (data.length === 0) {
      doc.text('No data available', 20, yPosition);
    } else {
      const headers = Object.keys(data[0]).filter(key => !key.startsWith('_'));
      doc.text(headers.join(' | '), 20, yPosition);
      yPosition += 10;

      data.slice(0, 50).forEach((row: any) => {
        const values = headers.map(header => String(row[header] || '').substring(0, 15));
        doc.setFontSize(8);
        doc.text(values.join(' | '), 20, yPosition);
        yPosition += 5;
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }

    doc.save(`${reportName}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateExcelReport = async (reportName: string, data: any[]) => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${reportName}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const generateCSVReport = async (reportName: string, data: any[]) => {
    if (data.length === 0) {
      console.log('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportName}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleTodaysReport = async (): Promise<string> => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch pilgrims and payments for today
      const [pilgrims, payments] = await Promise.all([
        api.get('/pilgrims/').catch(() => ({ data: { results: [] } })),
        api.get('/bank-payment-submissions/').catch(() => ({ data: { results: [] } })),
      ]);

      const pilgrimList = pilgrims.data.results || [];
      const paymentList = payments.data.results || [];

      // Filter today's data
      const todaysPilgrims = pilgrimList.filter((p: any) => {
        const createdDate = new Date(p.created_at).toISOString().split('T')[0];
        return createdDate === today;
      });

      const todaysPayments = paymentList.filter((p: any) => {
        const submittedDate = new Date(p.submitted_at).toISOString().split('T')[0];
        return submittedDate === today;
      });

      // Calculate payment stats
      const totalAmount = todaysPayments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

      // Build report
      let report = `Today's Report for ${new Date().toLocaleDateString()}. `;

      report += `Pilgrims registered: ${todaysPilgrims.length}. `;
      report += `Payment submissions: ${todaysPayments.length}. `;
      report += `Total amount: ${totalAmount.toLocaleString()} GMD.`;

      if (todaysPilgrims.length === 0 && todaysPayments.length === 0) {
        report = `Today's Report for ${new Date().toLocaleDateString()}. No new pilgrims or payments recorded today.`;
      }

      return report;
    } catch (error) {
      return 'Unable to retrieve today\'s report. Please try again.';
    }
  };

  // Only show in GIA dashboard (not in bank portal)
  if (isInBankPortal) {
    return null;
  }

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
                &quot;{transcript}&quot;
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
