'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInput({ onTranscript, disabled = false, className = '' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
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
      recognition.lang = 'en-IN'; // Optimized for Indian English accent & regional terms

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('[VoiceInput] Recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          // No speech detected, ignore or reset
        } else {
          setErrorMessage(`Voice recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
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

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        title={isListening ? 'Stop listening' : 'Dictate request with microphone'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          isListening
            ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
            : 'bg-[#F7F8FA] hover:bg-[#E1E5E8] text-[#1F2933] border border-[#E1E5E8]'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="h-3.5 w-3.5 text-rose-600" />
            <span className="text-[11px] font-semibold text-rose-700">Listening...</span>
          </>
        ) : (
          <>
            <Mic className="h-3.5 w-3.5 text-[#66717C]" />
            <span className="text-[11px] text-[#66717C]">Voice Input</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="absolute left-0 bottom-full mb-2 w-64 p-2.5 bg-white border border-rose-200 rounded-xl shadow-lg text-[11px] text-rose-700 z-30 flex items-start gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="block mt-1 text-[10px] underline font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
