'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Check, RotateCcw, X, Globe, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInput({ onTranscript, disabled = false, className = '' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'hi-IN' | 'gu-IN'>('en-IN');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [reviewTranscript, setReviewTranscript] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const startListening = () => {
    if (disabled || isListening) return;
    setErrorMessage(null);
    setLiveTranscript('');
    setReviewTranscript(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const combined = (final + interim).trim();
        setLiveTranscript(combined);
      };

      recognition.onerror = (event: any) => {
        console.error('[VoiceInput] Recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser settings.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech was detected. Please try speaking again clearly.');
        } else if (event.error === 'network') {
          setErrorMessage('Speech service network error. Please check your internet connection.');
        } else {
          setErrorMessage(`Voice recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If we captured speech, open the review card
        setLiveTranscript((current) => {
          if (current.trim()) {
            setReviewTranscript(current.trim());
          }
          return current;
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('[VoiceInput] Failed to start:', err);
      setErrorMessage(err?.message || 'Could not access microphone');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignored
      }
      setIsListening(false);
    }
  };

  const handleUseRequest = () => {
    if (reviewTranscript && reviewTranscript.trim()) {
      onTranscript(reviewTranscript.trim());
      setReviewTranscript(null);
      setLiveTranscript('');
      setErrorMessage(null);
    }
  };

  const handleRecordAgain = () => {
    setReviewTranscript(null);
    setLiveTranscript('');
    startListening();
  };

  const handleCancel = () => {
    setReviewTranscript(null);
    setLiveTranscript('');
    setErrorMessage(null);
    if (isListening) {
      stopListening();
    }
  };

  if (!isSupported) {
    return (
      <div className={`inline-flex items-center text-[11px] text-[#66717C] ${className}`}>
        <MicOff className="h-3.5 w-3.5 mr-1 text-[#A7B0B8]" />
        <span>Voice unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {/* Primary Speak / Stop Button */}
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        title={isListening ? 'Stop listening' : 'Dictate request with microphone'}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse border border-rose-700 shadow-md'
            : 'bg-[#F1F3F5] hover:bg-[#E1E5E8] text-[#1F2933] border border-[#E1E5E8]'
        }`}
      >
        {isListening ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <MicOff className="h-3.5 w-3.5" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Mic className="h-3.5 w-3.5 text-[#66717C]" />
            <span>Speak</span>
          </>
        )}
      </button>

      {/* Language Selector */}
      <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#66717C] bg-white border border-[#E1E5E8] rounded-lg px-2 py-1">
        <Globe className="h-3 w-3 text-[#A7B0B8]" />
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value as any)}
          disabled={isListening}
          className="bg-transparent text-[11px] font-medium text-[#1F2933] focus:outline-none cursor-pointer"
        >
          <option value="en-IN">English (India)</option>
          <option value="hi-IN">Hindi (हिंदी)</option>
          <option value="gu-IN">Gujarati (ગુજરાતી)</option>
        </select>
      </div>

      {/* Listening Live Floating Bar */}
      {isListening && (
        <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 p-3 bg-white border border-[#1F2933]/30 rounded-xl shadow-xl z-50 animate-fade-in space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-xs font-semibold text-[#1F2933]">Listening...</span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
            >
              Stop recording
            </button>
          </div>
          <div className="p-2 bg-[#F7F8FA] rounded-lg text-xs font-mono text-[#1F2933] min-h-[36px] max-h-24 overflow-y-auto">
            {liveTranscript || 'Speak your request clearly...'}
          </div>
        </div>
      )}

      {/* Post-Speech Review & Editable Transcript Card (Section 13 UX) */}
      {reviewTranscript !== null && !isListening && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E1E5E8] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5E8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F1F3F5] flex items-center justify-center text-[#1F2933]">
                  <Volume2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2933]">I heard:</h3>
                  <p className="text-[11px] text-[#66717C]">Review and edit your voice transcript before submitting.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 rounded-lg hover:bg-[#F1F3F5] text-[#66717C] hover:text-[#1F2933] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Editable Transcript
              </label>
              <textarea
                rows={4}
                value={reviewTranscript}
                onChange={(e) => setReviewTranscript(e.target.value)}
                className="w-full p-3.5 border border-[#E1E5E8] bg-[#F7F8FA] focus:bg-white focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none placeholder:text-[#A7B0B8] resize-none transition-colors"
                placeholder="Transcribed request text..."
                autoFocus
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleRecordAgain}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-[#E1E5E8] rounded-xl text-xs font-semibold text-[#66717C] hover:text-[#1F2933] hover:bg-[#F1F3F5] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Record Again</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-[#66717C] hover:text-[#1F2933] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUseRequest}
                  disabled={!reviewTranscript?.trim()}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1F2933] hover:bg-[#111820] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40 shadow-xs cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Use This Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="absolute left-0 top-full mt-2 w-72 p-2.5 bg-white border border-rose-200 rounded-xl shadow-lg text-[11px] text-rose-700 z-50 flex items-start gap-1.5 animate-fade-in">
          <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="block mt-1 text-[10px] underline font-semibold cursor-pointer text-rose-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
