'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, MessageSquare, AlertCircle, BookOpen } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatProps {
  lessonContext?: string;
  lessonTitle?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

export default function AIChat({
  lessonContext,
  lessonTitle = 'Linux Learning',
  onClose,
  isOpen = true,
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `👋 Hello! I'm your Linux Learning AI Assistant powered by Google Vertex AI.\n\nI can help you with:\n📚 Linux fundamentals\n⚙️ Command explanations\n🔐 File permissions\n👥 User & group management\n🔗 Networking concepts\n⚡ Shell scripting\n📂 File system navigation\n🔄 Process management\n\nWhat would you like to learn about?`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context: lessonContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || 'No response from AI.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reach AI service';
      setError(errorMessage);

      const errorAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `⚠️ Could not connect to AI: ${errorMessage}\n\nPlease try again in a moment.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorAIMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickQuestions = [
    'What is Linux?',
    'Explain chmod command',
    'How do I create a user?',
    'What are file permissions?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    // Trigger submit on next tick after state update
    setTimeout(() => {
      const form = inputRef.current?.closest('form');
      if (form) {
        form.requestSubmit();
      }
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">Linux AI Assistant</h3>
            <p className="text-xs text-blue-100">{lessonTitle}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-950/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none shadow-lg'
                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
              }`}
            >
              <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none border border-slate-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-900/50">
          <p className="text-xs text-slate-400 mb-2">Try asking:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q)}
                className="text-left text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-700 p-3 bg-slate-900/50"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Linux..."
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
