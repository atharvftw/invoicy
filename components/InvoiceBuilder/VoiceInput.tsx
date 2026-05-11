"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Web Speech API types (not in standard TS lib)
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionConstructor {
  new (): {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
  };
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface VoiceInputProps {
  onParsed: (data: {
    invoice_number?: string | null;
    client_name?: string;
    client_email?: string | null;
    line_items?: { name: string; quantity: number; amount: number }[];
    subtotal?: number;
    tax_rate?: number | null;
    tax_amount?: number;
    total?: number;
    currency?: string;
    due_date?: string | null;
    payment_terms?: string | null;
    notes?: string | null;
  }) => void;
}

export default function VoiceInput({ onParsed }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsing, setParsing] = useState(false);
  const recognitionRef = useRef<{ stop(): void } | null>(null);

  const startListening = useCallback(() => {
    const SR =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SR) {
      alert("Speech recognition not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        }
      }
      if (final) setTranscript((prev) => prev + final);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please allow microphone access.");
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  async function handleParse() {
    if (!transcript.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/voice-to-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onParsed(data.data);
        setTranscript("");
      } else {
        alert(data.error || "Failed to parse voice input");
      }
    } catch {
      alert("Network error parsing voice input");
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-indigo-900">Voice-to-Invoice</h3>
        <span className="ml-auto text-[10px] text-indigo-400 font-medium px-1.5 py-0.5 rounded bg-indigo-100">AI</span>
      </div>

      <p className="text-xs text-indigo-600/70 mb-3">
        Speak naturally: &quot;Invoice Acme for website design 50,000 rupees plus 18% GST due in 15 days&quot;
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={listening ? stopListening : startListening}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            listening
              ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          )}
        >
          {listening ? <MicOff size={14} /> : <Mic size={14} />}
          {listening ? "Stop Listening" : "Start Speaking"}
        </button>

        {transcript && (
          <button
            onClick={handleParse}
            disabled={parsing}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all",
              parsing
                ? "bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100"
                : "bg-white text-indigo-700 hover:bg-indigo-50 border-indigo-200"
            )}
          >
            {parsing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {parsing ? "Parsing…" : "Generate Invoice"}
          </button>
        )}
      </div>

      {listening && (
        <div className="mt-3 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <span className="text-xs text-rose-600 font-medium">Listening… speak now</span>
        </div>
      )}

      {transcript && (
        <div className="mt-3 p-3 rounded-lg bg-white border border-indigo-100">
          <p className="text-xs text-gray-400 mb-1">Transcript</p>
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}
    </div>
  );
}
