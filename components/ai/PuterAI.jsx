'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Minus, Send, Loader2, Sparkles, Trash2, Copy, Check } from 'lucide-react';
import Script from 'next/script';

export default function PuterAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [puterReady, setPuterReady] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.puter) {
      setPuterReady(true);
    }
  }, []);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (!window.puter) {
        throw new Error('Puter.js not loaded');
      }

      const systemPrompt = 'You are a helpful AI assistant for EduManage Nigeria School Management System. Help users with questions about students, teachers, attendance, classes, subjects, parents, billing, and system navigation. Be concise and friendly.';
      
      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
        userMessage
      ];

      const response = await window.puter.ai.chat(chatMessages);
      const aiResponse = response.message?.content || 'Sorry, I could not generate a response.';

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse
      }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <>
        <Script 
          src="https://js.puter.com/v2/" 
          onLoad={() => setPuterReady(true)}
        />
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
        >
          <Bot size={24} className="text-white" />
        </button>
      </>
    );
  }

  return (
    <>
      <Script 
        src="https://js.puter.com/v2/" 
        onLoad={() => setPuterReady(true)}
      />
      <div className="fixed bottom-6 right-6 z-50 w-[420px]">
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">AI Assistant</h3>
                  <p className="text-xs text-white/80">Powered by Puter.js</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])} 
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    title="Clear history"
                  >
                    <Trash2 size={18} className="text-white" />
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Minus size={18} className="text-white" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          {!isMinimized && (
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center mt-32">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot size={32} className="text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                      Hello! I'm your AI Assistant
                    </h4>
                    <p className="text-sm text-gray-500">
                      Ask me questions about the school system!
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Powered by Puter.js
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div className={`max-w-[85%] ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      } p-3 rounded-2xl shadow-sm relative group`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => copyToClipboard(msg.content, idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy response"
                          >
                            {copiedIndex === idx ? (
                              <Check size={14} className="text-green-600" />
                            ) : (
                              <Copy size={14} className="text-gray-600" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {loading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin text-purple-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={loading || !puterReady}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim() || !puterReady}
                    className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
      </div>
    </>
  );
}
