import { useEffect, useRef, useState, useCallback } from "react";

type SR = any;

export function useSpeechRecognition(lang = "ar-SA") {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SR | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const rec: SR = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 3;
    rec.onresult = (e: any) => {
      const res = e.results[0];
      const best = res[0].transcript as string;
      setTranscript(best);
    };
    rec.onerror = (e: any) => setError(e.error || "recognition_error");
    rec.onend = () => setListening(false);
    recRef.current = rec;
    return () => {
      try { rec.stop(); } catch {}
    };
  }, [lang]);

  const start = useCallback(() => {
    setError(null);
    setTranscript("");
    try {
      recRef.current?.start();
      setListening(true);
    } catch (e: any) {
      setError(e?.message || "start_failed");
    }
  }, []);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  return { supported, listening, transcript, error, start, stop, reset: () => setTranscript("") };
}