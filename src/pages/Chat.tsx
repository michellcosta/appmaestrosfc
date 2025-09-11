import React, { useState } from 'react';
import { Send, Paperclip, Image, MoreVertical, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/illustrations/empty-state';
import { pt } from '@/i18n/pt';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  attachments?: any[];
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const currentUserId = 'user1'; // Mock - será obtido do contexto de auth

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: 'João Silva',
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Salvar preferência no localStorage ou banco
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--tabbar-height))]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-outfit font-bold text-foreground">
              {pt.navigation.chat}
            </h1>
            <p className="text-sm text-muted-foreground">
              Grupo Maestros FC
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="relative"
          >
            {isMuted ? (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <EmptyState type="messages" className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {pt.messages.noMessages}
            </p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Seja o primeiro a enviar uma mensagem!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.userId === currentUserId;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  isOwnMessage && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] space-y-1",
                    isOwnMessage && "items-end"
                  )}
                >
                  {!isOwnMessage && (
                    <p className="text-xs text-muted-foreground font-medium px-1">
                      {message.userName}
                    </p>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 shadow-sm",
                      isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                  </div>
                  <p className={cn(
                    "text-xs text-muted-foreground px-1",
                    isOwnMessage && "text-right"
                  )}>
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <Image className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Muted Indicator */}
      {isMuted && (
        <div className="absolute top-20 right-4 bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs animate-fade-in">
          Chat silenciado
        </div>
      )}
    </div>
  );
};