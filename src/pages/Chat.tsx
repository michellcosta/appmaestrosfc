import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceRecorder } from '@/components/chat/VoiceRecorder';

// Mock de mensagens
type Msg = {
  id: string;
  me?: boolean;
  type: 'text' | 'image' | 'video' | 'audio';
  content: string; // texto ou URL de mídia
  durationSec?: number;
};

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Msg[]>([
    { id: '1', me: false, type: 'text', content: 'Bem-vindo ao chat do Maestros FC!' },
  ]);
  const [text, setText] = useState('');

  const sendText = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), me: true, type: 'text', content: text.trim() }]);
    setText('');
  };

  const onAudioReady = async (blob: Blob) => {
    // TODO: upload para Storage (Supabase) e salvar URL
    const url = URL.createObjectURL(blob);
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), me: true, type: 'audio', content: url /*, durationSec: X (opcional) */ },
    ]);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-outfit font-bold">Chat</h1>

      <Card className="p-4 min-h-[50vh]">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.me ? 'text-right' : 'text-left'}
            >
              {msg.type === 'text' && (
                <div
                  className={
                    'inline-block px-3 py-2 rounded-2xl ' +
                    (msg.me ? 'bg-primary text-primary-foreground' : 'bg-muted')
                  }
                >
                  {msg.content}
                </div>
              )}

              {msg.type === 'audio' && (
                <div
                  className={
                    'inline-block px-3 py-2 rounded-2xl ' +
                    (msg.me ? 'bg-primary/10' : 'bg-muted')
                  }
                >
                  <audio controls src={msg.content} className="w-56" />
                </div>
              )}

              {msg.type === 'image' && (
                <img src={msg.content} alt="" className="inline-block max-w-[60%] rounded-xl" />
              )}

              {msg.type === 'video' && (
                <video src={msg.content} controls className="inline-block max-w-[60%] rounded-xl" />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Escreva uma mensagem…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendText(); }}
        />
        <Button onClick={sendText}>Enviar</Button>
        <VoiceRecorder onAudioReady={onAudioReady} />
      </div>

      <div className="text-xs text-muted-foreground">
        Dica: você pode silenciar o chat nas configurações do Perfil.
      </div>
    </div>
  );
};
