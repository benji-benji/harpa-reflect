import { useState, useRef } from 'react';
import { transcribeAudio } from '../services/api';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

function pickSupportedMimeType(): string | undefined {
  const candidates = [
    'audio/mp4',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
  ];
  const MR: typeof MediaRecorder | undefined =
    typeof window !== 'undefined' ? window.MediaRecorder : undefined;
  if (!MR || typeof MR.isTypeSupported !== 'function') return undefined;
  for (const mime of candidates) {
    if (MR.isTypeSupported(mime)) return mime;
  }
  return undefined;
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError('');
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Recording not supported in this browser.');
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Microphone permission denied';
      setError(msg);
      return;
    }
    const mimeType = pickSupportedMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const type = recorder.mimeType || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type });
      setIsTranscribing(true);
      try {
        const result = await transcribeAudio(blob);
        onTranscript(result.text);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Transcription failed');
      } finally {
        setIsTranscribing(false);
        stream.getTracks().forEach((t) => t.stop());
      }
    };

    mediaRecorderRef.current = recorder;
    // Timeslice forces data to be flushed every 250ms. Without this, Safari
    // on iOS buffers everything and can drop early audio if stop() fires fast.
    recorder.start(250);
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <>
      {isTranscribing ? (
        <button type="button" disabled aria-label="Transcribing">Transcribing...</button>
      ) : isRecording ? (
        <button type="button" onClick={stopRecording} aria-label="Stop">
          <span className="recording-dot" /> Stop
        </button>
      ) : (
        <button type="button" onClick={startRecording} aria-label="Record">
          Record
        </button>
      )}
      {isRecording && (
        <div className="recording-indicator" role="status" aria-live="polite">
          <span className="recording-dot" />
          Recording...
        </div>
      )}
      {error && (
        <p className="error" style={{ marginTop: 8 }}>{error}</p>
      )}
    </>
  );
}
