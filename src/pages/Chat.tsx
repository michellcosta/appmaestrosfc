// ===============================
// src/pages/Chat.tsx — ATUALIZADO (sem VoiceRecorder)
// ===============================
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


// Tipagem local para manter compatibilidade com mensagens antigas (inclui 'audio', mas sem gravador)
type Msg = {
id: string;
me?: boolean;
type: 'text' | 'image' | 'video' | 'audio';
content: string;
durationSec?: number;
};


export const Chat: React.FC = () => {
const [messages, setMessages] = useState<Msg[]>([
{ id: '1', type: 'text', content: 'Bem-vindo ao chat do jogo! 👍' },
{ id: '2', me: true, type: 'text', content: 'Bora marcar 19h?' },
]);
const [text, setText] = useState('');


const sendText = () => {
const v = text.trim();
if (!v) return;
setMessages((prev) => [
...prev,
{ id: Math.random().toString(36).slice(2), me: true, type: 'text', content: v },
]);
setText('');
};


return (
<div className="max-w-2xl mx-auto p-4 space-y-3">
<h1 className="text-xl font-semibold">Chat</h1>


<Card className="p-4 h-[50vh] overflow-y-auto space-y-3">
{messages.map((msg) => (
<div key={msg.id} className={
'flex ' + (msg.me ? 'justify-end' : 'justify-start')
}>
{msg.type === 'text' && (
<div className={'inline-block px-3 py-2 rounded-2xl ' + (msg.me ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
{msg.content}
</div>
)}
{msg.type === 'audio' && (
<div className={'inline-block px-3 py-2 rounded-2xl ' + (msg.me ? 'bg-primary/10' : 'bg-muted')}>
<audio controls src={msg.content} className="w-56" />
</div>
)}
{msg.type === 'image' && (
<img src={msg.content} alt="" className="inline-block max-w-[60%] rounded-xl" />
)}
};
