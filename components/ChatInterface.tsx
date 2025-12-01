import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../rag/types';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isGenerating: boolean;
  hasKnowledge: boolean;
}
const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isGenerating, hasKnowledge }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 w-full relative">
      {!hasKnowledge && messages.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">需要設定</h2>
            <p className="text-gray-600">請在左側的「知識庫」面板中輸入您的參考文件以啟動 RAG 引擎。</p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && hasKnowledge && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p className="text-lg font-medium">準備好回答關於您資料的問題</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              ) : (
                <div className="prose prose-sm prose-blue max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>

            {msg.role === 'model' && msg.relatedChunks && msg.relatedChunks.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 max-w-[85%] bg-gray-100 p-2 rounded-lg border border-gray-200">
                <span className="font-semibold block mb-1 uppercase tracking-wide text-gray-400 text-[10px]">資料來源 (RAG 檢索)</span>
                <div className="flex flex-col gap-1">
                  {msg.relatedChunks.map((chunk, i) => (
                    <details key={i} className="group cursor-pointer">
                      <summary className="list-none hover:text-blue-600 truncate flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400 group-open:rotate-90 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M6 6L14 10L6 14V6Z" /></svg>
                        摘要片段 {i + 1}
                      </summary>
                      <p className="pl-4 mt-1 italic opacity-80 border-l-2 border-blue-200">{chunk}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            <span className="text-[10px] text-gray-400 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isGenerating && (
          <div className="flex items-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={hasKnowledge ? "詢問關於您上下文的問題..." : "正在處理知識庫..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating || !hasKnowledge}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating || !hasKnowledge}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-xs text-gray-400">Gemini 2.5 Flash • RAG 驅動</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;