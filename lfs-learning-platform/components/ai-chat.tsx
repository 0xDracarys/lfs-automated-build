'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, MessageSquare, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/lib/services/ai-service';
import { getRealAnswer } from '@/lib/services/ai-enhanced';

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
      content: `Hello! 👋 I'm your Linux learning assistant. I can help you with:\n\n• Questions about Linux concepts\n• FAQs from your lessons\n• Command explanations\n• Troubleshooting and tips\n\nWhat would you like to learn about?`,
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

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRealAnswer(input);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMessage);
      
      const errorAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm having trouble connecting. Try asking about specific Linux topics like "chmod", "sudo", "bash", or "networking".`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorAIMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickQuestions = [
    'What is Linux?',
    'How do I use bash?',
    'Explain package managers',
    'What are permissions?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    // Trigger send after setting input
    setTimeout(() => {
      const form = inputRef.current?.form;
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Linux AI Assistant</h3>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-100 rounded-bl-none'
              }`}
            >
              {message.sender === 'user' ? (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              ) : (
                <div className="text-sm markdown-content">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      code: (props: any) => 
                        props.inline ? (
                          <code className="bg-slate-900 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                        ) : (
                          <code className="block bg-slate-900 px-3 py-2 rounded text-xs font-mono my-2 overflow-x-auto" {...props} />
                        ),
                      pre: ({node, ...props}) => (
                        <pre className="bg-slate-900 px-3 py-2 rounded text-xs font-mono my-2 overflow-x-auto" {...props} />
                      ),
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              <span
                className={`text-xs ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                } mt-1 block`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-100 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-2 rounded-lg flex items-gap gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions (show when no messages yet) */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-900/50">
          <p className="text-xs text-slate-400 mb-2">Quick questions:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="text-left text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-700 p-3 bg-slate-950">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Linux..."
            className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
