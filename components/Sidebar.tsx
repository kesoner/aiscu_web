import React, { useState } from 'react';
import { ProcessingStatus } from '../rag/types';

interface SidebarProps {
  onProcess: (text: string) => Promise<void>;
  status: ProcessingStatus;
  chunkCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ onProcess, status, chunkCount }) => {
  const [inputText, setInputText] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const handleProcess = () => {
    if (!inputText.trim()) return;
    onProcess(inputText);
  };

  const isProcessing = status === ProcessingStatus.PROCESSING;

  return (
    <div className={`flex flex-col bg-white border-r border-gray-200 h-full transition-all duration-300 ${isOpen ? 'w-full md:w-96' : 'w-0 md:w-0 overflow-hidden'}`}>
      <div className={`p-6 flex flex-col h-full ${!isOpen ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 4.168 6.253v13C4.168 19.125 5.754 19.5 7.5 19.5S10.832 19.125 12 18.25m0-12.003c1.168-.777 2.754-1.253 4.5-1.253 1.746 0 3.332.476 4.5 1.253v13C19.832 19.125 18.246 19.5 16.5 19.5c-1.746 0-3.332-.477-4.5-1.253" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">知識庫</h1>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            請在此處貼上您的參考資料。機器人將依據此內容回答問題。
          </p>
          <textarea
            className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            placeholder="例如：退貨政策：商品可在 30 天內退貨..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={isProcessing || !inputText.trim()}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2
            ${isProcessing || !inputText.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              建立索引中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              處理知識庫
            </>
          )}
        </button>

        {status === ProcessingStatus.COMPLETED && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            成功建立索引，共 {chunkCount} 個片段。
          </div>
        )}

        <div className="mt-auto border-t border-gray-200 pt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">索引狀態</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">向量數量：</span>
              <span className="font-mono font-medium text-gray-900">{chunkCount}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">模型：</span>
              <span className="font-mono font-medium text-gray-900">text-embedding-004</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Handle (Only visible on small screens usually, but we keep it inside logic) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden absolute top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
    </div>
  );
};

export default Sidebar;