import * as React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  maxMs?: number; // default 90000
  onAudioReady: (blob: Blob) => void; // parent uploads and creates message
}

export function VoiceRecorder({ maxMs = 90000, onAudioReady }: Props) {
  const [rec, setRec] = React.useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = React.useState<BlobPart[]>([]);
  const [recording, setRecording] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      setRec(mr); setChunks([]); setRecording(true);
      mr.ondataavailable = (e) => setChunks((p) => [...p, e.data]);
      mr.onstop = async () => {
        setRecording(false);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        onAudioReady(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      timerRef.current = window.setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, maxMs) as unknown as number;
    } catch (err) {
      alert('Permita o microfone para enviar áudio.');
    }
  };
  const stop = () => {
    if (rec && rec.state === 'recording') rec.stop();
    if (timerRef.current) window.clearTimeout(timerRef.current);
  };

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <Button variant="secondary" onClick={start} aria-label="Gravar mensagem de voz">🎤 Gravar</Button>
      ) : (
        <Button variant="destructive" onClick={stop} aria-label="Parar gravação">■ Parar</Button>
      )}
    </div>
  );
}
