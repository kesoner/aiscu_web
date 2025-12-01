import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Send,
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    Search,
    Bot,
    User,
    RefreshCw,
    LogOut,
    BookOpen,
    Minimize2,
    Terminal,
    Cpu,
    Activity,
    FileJson,
    Table,
    Check,
    AlertTriangle,
    Upload,
    Link,
    FileText,
    UploadCloud,
    Loader
} from 'lucide-react';
import { runAgenticRag, processImportedFile, processWebUrl, checkApiKey } from '../services/geminiService';
import { ingestChunksToChroma, retrieveFromChroma } from '../services/chromaService';
import { simpleChunker } from '../services/ragEngine';
import { DocumentChunk } from '../types/rag';
import ascLogo from '../assets/asc_logo.png'; // Import Logo

// --- Types ---
interface Notification {
    id: number;
    type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';
    message: string;
}



/**
 * 模擬後端資料庫初始資料
 */
const INITIAL_KNOWLEDGE_BASE = [
    {
        id: 1,
        category: 'PROTOCOL_FEE',
        title: '2025 春季社費公告',
        content: '本學期社費為新台幣 500 元，包含教材費與期末聚餐補助。繳費期限至 3/15 止。',
        updatedAt: '2025-02-20'
    },
    {
        id: 2,
        category: 'LOC_DATA',
        title: '社課教室位置',
        content: '每週二、四的社課地點位於「活動中心 305 教室」。若遇國定假日則暫停一次。',
        updatedAt: '2025-01-10'
    },
    {
        id: 3,
        category: 'REGULATION',
        title: '缺席與請假規定',
        content: '一學期無故缺席超過 3 次將取消幹部參選資格。請假請提前 24 小時於 Discord 頻道告知。',
        updatedAt: '2024-12-05'
    },
    {
        id: 4,
        category: 'ACCESS_CTRL',
        title: '非本系參加資格',
        content: '本社團歡迎全校各系同學參加，非本系生無需額外審核，直接填寫報名表即可。',
        updatedAt: '2025-02-01'
    }
];

// Project Moon 風格主題色配置
const PM_THEME = {
    bg: 'bg-slate-950',
    bgPanel: 'bg-slate-900',
    textMain: 'text-slate-300',
    accentGold: 'text-amber-500',
    borderGold: 'border-amber-600',
    bgGold: 'bg-amber-600',
    accentCyan: 'text-cyan-400',
    borderCyan: 'border-cyan-500',
    bgCyan: 'bg-cyan-900',
    borderDim: 'border-slate-700',
};

export default function ClubTerminal() {
    const [isOpen, setIsOpen] = useState(false); // Default to closed in main app
    const [activeTab, setActiveTab] = useState('chat');
    const [knowledgeBase, setKnowledgeBase] = useState(INITIAL_KNOWLEDGE_BASE);

    // RAG Vector Store State
    // RAG State
    // const [vectorStore, setVectorStore] = useState<DocumentChunk[]>([]); // Removed in favor of Chroma
    const [isReindexing, setIsReindexing] = useState(false);

    // --- Chat State ---
    const [messages, setMessages] = useState<any[]>([
        { id: 1, role: 'bot', text: 'SYSTEM ONLINE.\nGreetings. 我是社團資訊終端。請輸入您的查詢指令。' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    // Current logs for the active generation
    const [agentLogs, setAgentLogs] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- Admin State ---
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // GUI Editor State
    const [adminViewMode, setAdminViewMode] = useState<'gui' | 'json'>('gui');
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ category: '', title: '', content: '' });

    // JSON Editor State
    const [jsonContent, setJsonContent] = useState('');
    const [jsonError, setJsonError] = useState('');

    // --- Import/Injection Modal State ---
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importTab, setImportTab] = useState<'MEDIA' | 'WEB' | 'JSON'>('MEDIA');
    const [importStatus, setImportStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [importLog, setImportLog] = useState('');
    const [importPreview, setImportPreview] = useState<{ title: string, category: string, content: string } | null>(null);
    const [webUrlInput, setWebUrlInput] = useState('');

    // --- System Status ---
    const [systemStatus, setSystemStatus] = useState<'ONLINE' | 'OFFLINE' | 'ERROR'>('ONLINE');

    // --- Notifications ---
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = (type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING', message: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    };

    useEffect(() => {
        if (isOpen && activeTab === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, isOpen, activeTab, agentLogs]);

    // Initial Indexing on Mount
    useEffect(() => {
        const hasKey = checkApiKey();
        console.log("API Key Check:", hasKey, "Value:", import.meta.env.VITE_API_KEY);
        if (!hasKey) {
            setSystemStatus('OFFLINE');
            setMessages(prev => [
                ...prev,
                { id: Date.now(), role: 'bot', text: `SYSTEM ALERT: API Key missing. (Read: ${import.meta.env.VITE_API_KEY}) Please configure VITE_API_KEY in .env.local.` }
            ]);
            return;
        }

        // if (knowledgeBase.length > 0 && vectorStore.length === 0) {
        //     handleReindex();
        // }
    }, []);

    // --- Logic ---
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', text: inputMessage };
        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsTyping(true);
        setAgentLogs([]); // Clear previous logs

        if (systemStatus === 'OFFLINE') {
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'bot',
                text: "SYSTEM ERROR: API Key missing. Cannot process request."
            }]);
            setIsTyping(false);
            return;
        }

        try {
            // Run the Agentic Flow Generator
            // Pass the retrieval function instead of static store
            const generator = runAgenticRag(userMsg.text, (q) => retrieveFromChroma(q, 3));
            let finalResponse = "";
            let finalSource = "";

            for await (const step of generator) {
                if (step.type === 'log') {
                    setAgentLogs(prev => [...prev, step.message]);
                } else if (step.type === 'answer') {
                    finalResponse = step.message;
                    finalSource = step.source || "";
                }
            }

            const botResponse = {
                id: Date.now() + 1,
                role: 'bot',
                text: finalResponse,
                source: finalSource && finalSource !== "UNKNOWN_SOURCE" ? finalSource : undefined,
                logs: [...agentLogs] // snapshot logs if we wanted to save them (currently just clearing visual state next turn)
            };

            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                text: "SYSTEM_CRITICAL: Agent 流程發生致命錯誤。"
            }]);
        } finally {
            setIsTyping(false);
            setAgentLogs([]);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPassword === 'admin') {
            setIsAdminLoggedIn(true);
            setLoginError('');
            setJsonContent(JSON.stringify(knowledgeBase, null, 2));
        } else {
            setLoginError('ACCESS DENIED: Invalid Credentials');
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('WARNING: Deleting archive entry. Confirm?')) {
            const newData = knowledgeBase.filter(item => item.id !== id);
            setKnowledgeBase(newData);
            setJsonContent(JSON.stringify(newData, null, 2));
        }
    };

    const handleEditStart = (item: any) => {
        setIsEditing(item.id);
        setEditForm({ ...item });
    };

    const handleAddNew = () => {
        const newItem = {
            id: Date.now(),
            category: 'UNKNOWN',
            title: 'NEW_ENTRY',
            content: 'Input data...',
            updatedAt: new Date().toISOString().split('T')[0]
        };
        const newData = [newItem, ...knowledgeBase];
        setKnowledgeBase(newData);
        setJsonContent(JSON.stringify(newData, null, 2));
        handleEditStart(newItem);
    };

    const handleSave = (id: number) => {
        const newData = knowledgeBase.map(item =>
            item.id === id ? { ...editForm, id, updatedAt: new Date().toISOString().split('T')[0] } : item
        );
        setKnowledgeBase(newData);
        setJsonContent(JSON.stringify(newData, null, 2));
        setIsEditing(null);
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonContent(e.target.value);
        setJsonError('');
    };

    const handleJsonSave = () => {
        try {
            const parsed = JSON.parse(jsonContent);
            if (!Array.isArray(parsed)) throw new Error("Root must be an array");
            setKnowledgeBase(parsed);
            setJsonError('');
            showNotification('SUCCESS', "DATABASE UPDATED SUCCESSFULLY");
        } catch (e: any) {
            setJsonError(e.message);
        }
    };

    const handleReindex = async () => {
        if (systemStatus === 'OFFLINE') {
            console.warn("Skipping reindex: API Key missing");
            return;
        }
        setIsReindexing(true);
        try {
            const docs = knowledgeBase.map(item => ({
                text: `[${item.category}] ${item.title}\n${item.content}`,
                metadata: { title: item.title, category: item.category }
            }));

            const texts = docs.map(d => d.text);
            const metadatas = docs.map(d => d.metadata);
            if (texts.length === 0) return;

            // Ingest to Chroma
            await ingestChunksToChroma(texts, metadatas, "club_kb");

            showNotification('SUCCESS', "Knowledge Base Indexed to ChromaDB Successfully.");
        } catch (e: any) {
            console.error("Reindexing failed", e);
            showNotification('ERROR', `Reindexing Failed: ${e.message || e}`);
        } finally {
            setIsReindexing(false);
        }
    };

    // --- Import Logic ---

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportStatus('PROCESSING');
        setImportLog('INIT_ANALYSIS_PROTOCOL...');
        setImportPreview(null);

        try {
            // If JSON
            if (file.type === 'application/json') {
                const text = await file.text();
                const parsed = JSON.parse(text);
                // Batch insert logic not fully implemented for preview, just replacing KB logic
                // For now let's treat it as a single entry import or fail
                setImportLog('DETECTED_JSON_BATCH. SWAPPING TO JSON_EDITOR MODE...');
                setImportStatus('SUCCESS');
                setAdminViewMode('json');
                setJsonContent(JSON.stringify(parsed, null, 2));
                setIsImportModalOpen(false);
                showNotification('INFO', "JSON Loaded into Editor. Review and Commit.");
                return;
            }

            // If Media (PDF, Image, Video, Audio)
            setImportLog(`UPLOADING ${file.name.toUpperCase()} TO GEMINI CORE...`);
            const result = await processImportedFile(file);

            setImportLog('DATA_EXTRACTION_COMPLETE. GENERATING PREVIEW...');
            setImportPreview(result);
            setImportStatus('SUCCESS');
        } catch (err) {
            console.error(err);
            setImportStatus('ERROR');
            setImportLog('FATAL: UNRECOGNIZED_FORMAT_OR_API_FAIL');
        }
    };

    const handleUrlScrape = async () => {
        if (!webUrlInput) return;
        setImportStatus('PROCESSING');
        setImportLog(`CONNECTING TO NEURAL NET: ${webUrlInput}...`);
        setImportPreview(null);

        try {
            const result = await processWebUrl(webUrlInput);
            setImportLog('SCRAPING_COMPLETE. PARSING CONTENT...');
            setImportPreview(result);
            setImportStatus('SUCCESS');
        } catch (err) {
            console.error(err);
            setImportStatus('ERROR');
            setImportLog('FATAL: LINK_BROKEN_OR_ACCESS_DENIED');
        }
    };

    const confirmImport = () => {
        if (importPreview) {
            const newItem = {
                id: Date.now(),
                category: importPreview.category || 'IMPORTED',
                title: importPreview.title || 'Untitled Import',
                content: importPreview.content || 'No content extracted.',
                updatedAt: new Date().toISOString().split('T')[0]
            };
            const newData = [newItem, ...knowledgeBase];
            setKnowledgeBase(newData);
            setJsonContent(JSON.stringify(newData, null, 2));
            setIsImportModalOpen(false);
            setImportPreview(null);
            setImportStatus('IDLE');
            setWebUrlInput('');
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] font-mono text-slate-200 flex flex-col items-end pointer-events-none">
            {/* Pointer events set to none on container to allow clicking through, 
                but children (widget/button) need pointer-events-auto */}

            {/* Notifications Layer */}
            <div className="absolute bottom-full right-0 mb-4 flex flex-col gap-2 items-end w-80 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`
                        pointer-events-auto
                        flex items-center gap-3 px-4 py-3 
                        backdrop-blur-md border-l-4 shadow-lg
                        animate-in slide-in-from-right-10 fade-in duration-300
                        ${n.type === 'SUCCESS' ? 'bg-green-950/80 border-green-500 text-green-100' : ''}
                        ${n.type === 'ERROR' ? 'bg-red-950/80 border-red-500 text-red-100' : ''}
                        ${n.type === 'INFO' ? 'bg-cyan-950/80 border-cyan-500 text-cyan-100' : ''}
                        ${n.type === 'WARNING' ? 'bg-amber-950/80 border-amber-500 text-amber-100' : ''}
                    `}>
                        {n.type === 'SUCCESS' && <Check size={16} />}
                        {n.type === 'ERROR' && <AlertTriangle size={16} />}
                        {n.type === 'INFO' && <Terminal size={16} />}
                        {n.type === 'WARNING' && <AlertTriangle size={16} />}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold opacity-70 tracking-widest">{n.type}</span>
                            <span className="text-xs font-medium">{n.message}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toggle Button (When Closed) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto w-16 h-16 relative group transition-transform hover:scale-105 active:scale-95"
                >
                    {/* Hexagon Shape / Tech Border */}
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur border border-amber-500/50 rotate-45 group-hover:border-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)]"></div>
                    <div className="absolute inset-1 bg-slate-950 rotate-45 flex items-center justify-center border border-slate-700 group-hover:border-amber-500/30">
                        <img src={ascLogo} alt="Logo" className="w-8 h-8 -rotate-45 opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {/* Notification Dot */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
                </button>
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm pointer-events-auto">
                    <div className="w-[500px] bg-slate-900 border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
                        {/* Decorative Scanline */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                        {/* Header */}
                        <div className="p-3 border-b border-cyan-900 flex justify-between items-center bg-cyan-950/30">
                            <div className="flex items-center gap-2 text-cyan-400">
                                <UploadCloud size={18} />
                                <span className="font-bold tracking-widest text-xs">DATA_INJECTION_PROTOCOL // VER.2.5</span>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-slate-500 hover:text-red-500">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex text-xs font-bold border-b border-cyan-900">
                            <button
                                onClick={() => setImportTab('MEDIA')}
                                className={`flex-1 py-2 text-center transition-colors ${importTab === 'MEDIA' ? 'bg-cyan-900/50 text-cyan-300' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                MEDIA_SOURCE
                            </button>
                            <button
                                onClick={() => setImportTab('WEB')}
                                className={`flex-1 py-2 text-center transition-colors ${importTab === 'WEB' ? 'bg-cyan-900/50 text-cyan-300' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                NEURAL_LINK
                            </button>
                            <button
                                onClick={() => setImportTab('JSON')}
                                className={`flex-1 py-2 text-center transition-colors ${importTab === 'JSON' ? 'bg-cyan-900/50 text-cyan-300' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                BATCH_JSON
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 min-h-[300px] flex flex-col">
                            {importStatus === 'PROCESSING' ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-cyan-500">
                                    <div className="relative">
                                        <Loader size={48} className="animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-xs tracking-widest font-bold animate-pulse">ANALYZING_DATA_STRUCTURE...</p>
                                        <p className="text-[10px] text-cyan-700">{importLog}</p>
                                    </div>
                                </div>
                            ) : importPreview ? (
                                <div className="flex-1 flex flex-col gap-3 animate-in slide-in-from-bottom-5">
                                    <div className="flex items-center gap-2 text-green-400 border-b border-green-900 pb-2 mb-2">
                                        <Check size={16} />
                                        <span className="text-xs font-bold tracking-wider">EXTRACTION_SUCCESSFUL</span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase font-bold">Category_Code</label>
                                            <div className="text-cyan-300 bg-slate-950 p-2 border border-slate-800">{importPreview.category}</div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase font-bold">Ident_Title</label>
                                            <div className="text-white bg-slate-950 p-2 border border-slate-800 font-bold">{importPreview.title}</div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase font-bold">Extracted_Payload</label>
                                            <div className="text-slate-400 bg-slate-950 p-2 border border-slate-800 h-24 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-cyan-900">
                                                {importPreview.content}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex gap-2 pt-4">
                                        <button onClick={() => { setImportPreview(null); setImportStatus('IDLE'); }} className="flex-1 py-2 text-[10px] border border-slate-700 hover:bg-slate-800 text-slate-400 uppercase">
                                            Discard
                                        </button>
                                        <button onClick={confirmImport} className="flex-1 py-2 text-[10px] bg-cyan-900/30 border border-cyan-500 text-cyan-300 hover:bg-cyan-900/60 uppercase font-bold tracking-widest">
                                            Confirm_Write
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // IDLE STATE - INPUTS
                                <div className="flex-1 flex flex-col justify-center animate-in fade-in">
                                    {importTab === 'MEDIA' && (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800/30 transition-all group">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-10 h-10 mb-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                                <p className="mb-2 text-sm text-slate-500 group-hover:text-cyan-200 font-bold">DROP_FILE_OR_CLICK</p>
                                                <p className="text-[10px] text-slate-600">SUPPORTED: PDF, IMG, MP3, MP4</p>
                                            </div>
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf,audio/*,video/*" />
                                        </label>
                                    )}

                                    {importTab === 'WEB' && (
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold text-cyan-500 uppercase">Target_Url</label>
                                                <input
                                                    type="text"
                                                    value={webUrlInput}
                                                    onChange={(e) => setWebUrlInput(e.target.value)}
                                                    placeholder="https://..."
                                                    className="w-full bg-slate-950 border border-slate-700 p-3 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                                                />
                                            </div>
                                            <button
                                                onClick={handleUrlScrape}
                                                disabled={!webUrlInput}
                                                className="w-full py-3 bg-cyan-900/20 border border-cyan-600 text-cyan-400 font-bold text-xs uppercase hover:bg-cyan-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                INITIATE_SCRAPING_PROTOCOL
                                            </button>
                                        </div>
                                    )}

                                    {importTab === 'JSON' && (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-amber-500/50 hover:bg-slate-800/30 transition-all group">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FileJson className="w-10 h-10 mb-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                                                <p className="mb-2 text-sm text-slate-500 group-hover:text-amber-200 font-bold">LOAD_BACKUP_JSON</p>
                                                <p className="text-[10px] text-slate-600">WARNING: REPLACES CURRENT DB EDITOR CONTENT</p>
                                            </div>
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="application/json" />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Widget Window */}
            {/* Widget Window */}
            <div
                className={`
          pointer-events-auto
          bg-slate-950/95 backdrop-blur-xl border border-slate-700
          shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 origin-bottom-right
          flex flex-col mb-6 relative
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none h-0 w-0'}
        `}
                style={{
                    width: isOpen ? '360px' : '0px',
                    height: isOpen ? '500px' : '0px',
                    clipPath: isOpen ? 'polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px))' : 'none'
                }}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-amber-500/20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-cyan-500/20 pointer-events-none"></div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(transparent 50%, rgba(255, 255, 255, 0.1) 50%)', backgroundSize: '100% 3px' }}>
                </div>

                {/* Header */}
                <header className="flex-shrink-0 h-12 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <img src={ascLogo} alt="ASC" className="w-6 h-6 object-contain opacity-90" />
                        <div className="flex flex-col">
                            <span className={`font-bold tracking-wider text-xs ${activeTab === 'chat' ? 'text-amber-500' : 'text-cyan-400'}`}>
                                {activeTab === 'chat' ? '社團小幫手' : '系統核心'}
                            </span>
                            <span className="text-[8px] text-slate-500 tracking-widest">ONLINE</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-950 border border-slate-800 rounded-sm p-0.5">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`px-2 py-1 text-[10px] font-bold transition-all flex items-center gap-1 ${activeTab === 'chat' ? 'bg-amber-900/40 text-amber-500 border border-amber-900/50' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                對話
                            </button>
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`px-2 py-1 text-[10px] font-bold transition-all flex items-center gap-1 ${activeTab === 'admin' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-900/50' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                管理
                            </button>
                        </div>

                        <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-950/30 transition-colors border border-transparent hover:border-red-900/50">
                            <Minimize2 size={16} />
                        </button>
                    </div>
                </header>

                {/* --- CHAT VIEW --- */}
                {activeTab === 'chat' && (
                    <div className="flex-1 flex flex-col min-h-0 z-10 relative bg-slate-950/50">
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-amber-900/50 scrollbar-track-transparent">
                            {messages.map((msg: any) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-[90%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 flex-shrink-0 border flex items-center justify-center relative
                      ${msg.role === 'user'
                                                ? `border-cyan-500/50 bg-cyan-950/30`
                                                : `border-amber-500/50 bg-amber-950/30`
                                            }`}>
                                            {/* Corner Accents */}
                                            <div className="absolute top-0 left-0 w-1 h-1 bg-current opacity-50"></div>
                                            <div className="absolute bottom-0 right-0 w-1 h-1 bg-current opacity-50"></div>

                                            {msg.role === 'user' ? <User size={14} className="text-cyan-400" /> : <Bot size={14} className="text-amber-500" />}
                                        </div>

                                        {/* Message */}
                                        <div className="flex flex-col gap-1 w-full">
                                            <div className="flex items-center gap-2 text-[8px] font-bold tracking-widest opacity-50 uppercase">
                                                <span>{msg.role === 'user' ? 'YOU' : 'HELPER'}</span>
                                                <span>//</span>
                                                <span>{new Date(msg.id).toLocaleTimeString([], { hour12: false })}</span>
                                            </div>
                                            <div className={`p-3 border text-xs leading-relaxed shadow-lg whitespace-pre-wrap relative
                        ${msg.role === 'user'
                                                    ? `border-cyan-500/30 bg-cyan-950/20 text-cyan-50 rounded-bl-lg`
                                                    : `border-amber-500/30 bg-amber-950/20 text-amber-50 rounded-br-lg`
                                                }`}>
                                                {/* Decorative Line */}
                                                <div className={`absolute top-0 w-1/3 h-[1px] ${msg.role === 'user' ? 'right-0 bg-cyan-500/50' : 'left-0 bg-amber-500/50'}`}></div>

                                                {msg.text}
                                            </div>
                                            {msg.source && (
                                                <div className="flex items-center gap-2 text-[9px] text-amber-500/70 pl-2 border-l border-amber-900/50 mt-1">
                                                    <BookOpen size={10} />
                                                    <span className="uppercase tracking-wide">REF: {msg.source}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Agent Thinking Logs */}
                            {(isTyping || agentLogs.length > 0) && (
                                <div className="flex justify-start">
                                    <div className="flex max-w-[90%] gap-3">
                                        <div className={`w-8 h-8 flex-shrink-0 border border-slate-800 bg-slate-900/50 flex items-center justify-center`}>
                                            <Activity size={14} className="text-amber-500 animate-pulse" />
                                        </div>
                                        <div className="flex flex-col gap-1 w-full">
                                            <div className="text-[9px] font-mono space-y-1 opacity-80 bg-black/40 p-2 border-l border-amber-900/30">
                                                {agentLogs.map((log, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-amber-500/60 animate-in fade-in slide-in-from-left-2 duration-300">
                                                        <span className="text-[8px]">&gt;&gt;</span> {log}
                                                    </div>
                                                ))}
                                                {isTyping && (
                                                    <div className="flex items-center gap-2 text-amber-500/40 animate-pulse">
                                                        <div className="w-1 h-3 bg-amber-500/50"></div>
                                                        PROCESSING...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-slate-900/80 border-t border-slate-800 backdrop-blur-sm">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 bg-slate-950 border border-slate-700 p-1 pl-3 focus-within:border-amber-500/50 transition-colors">
                                <div className="text-amber-500 text-[10px] animate-pulse">▶</div>
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="請輸入問題..."
                                    className="w-full bg-transparent border-none outline-none text-xs text-amber-50 py-2 placeholder:text-slate-600 font-sans"
                                    disabled={isTyping}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputMessage.trim() || isTyping}
                                    className={`p-2 bg-amber-900/20 text-amber-500 hover:bg-amber-500 hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
                                >
                                    <Send size={14} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- ADMIN VIEW (Backend Database GUI) --- */}
                {
                    activeTab === 'admin' && (
                        <div className="flex-1 flex flex-col min-h-0 z-10 relative bg-slate-950/50">
                            {!isAdminLoggedIn ? (
                                // Login
                                <div className="h-full flex flex-col items-center justify-center space-y-6 overflow-y-auto">
                                    <div className="p-8 border border-cyan-500/30 w-full max-w-[280px] text-center bg-slate-900/80 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative backdrop-blur-sm">
                                        {/* Tech Corners */}
                                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
                                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
                                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>

                                        <div className="mb-4 flex justify-center text-cyan-500 animate-pulse">
                                            <Cpu size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-cyan-400 mb-2 tracking-widest">ROOT_ACCESS</h3>

                                        <form onSubmit={handleLogin} className="space-y-4">
                                            <input
                                                type="password"
                                                value={adminPassword}
                                                onChange={(e) => setAdminPassword(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-500 outline-none text-center text-cyan-100 placeholder:text-slate-600 text-xs tracking-widest"
                                                placeholder="PASSWORD"
                                            />
                                            {loginError && <p className="text-red-500 text-[10px] tracking-wide bg-red-950/30 p-1 border border-red-900/50">{loginError}</p>}
                                            <button className="w-full border border-cyan-500/50 text-cyan-400 py-2 hover:bg-cyan-500 hover:text-slate-900 font-bold tracking-widest transition-all text-xs uppercase">
                                                [ Authenticate ]
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                // Dashboard / GUI
                                <div className="flex flex-col h-full">
                                    {/* Control Panel Header */}
                                    <div className="p-2 border-b border-cyan-900/30 bg-cyan-950/10 flex items-center justify-between backdrop-blur-sm">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setAdminViewMode('gui')}
                                                className={`p-1.5 rounded-sm transition-colors border ${adminViewMode === 'gui' ? 'bg-cyan-900/40 border-cyan-500/50 text-cyan-300' : 'border-transparent text-slate-500 hover:text-cyan-300'}`}
                                                title="Visual Editor"
                                            >
                                                <Table size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAdminViewMode('json');
                                                    setJsonContent(JSON.stringify(knowledgeBase, null, 2));
                                                }}
                                                className={`p-1.5 rounded-sm transition-colors border ${adminViewMode === 'json' ? 'bg-cyan-900/40 border-cyan-500/50 text-cyan-300' : 'border-transparent text-slate-500 hover:text-cyan-300'}`}
                                                title="Raw JSON Editor"
                                            >
                                                <FileJson size={14} />
                                            </button>
                                            <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
                                            <button
                                                onClick={() => setIsImportModalOpen(true)}
                                                className="p-1.5 border border-cyan-700/50 bg-cyan-900/20 hover:bg-cyan-900/50 text-cyan-400 transition-colors flex items-center gap-1"
                                                title="Data Injection (Import)"
                                            >
                                                <Upload size={12} />
                                                <span className="text-[9px] font-bold hidden sm:inline">IMPORT</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] px-2 py-0.5 border flex items-center gap-1 text-green-400 border-green-900/50 bg-green-900/10`}>
                                                <Check size={10} />
                                                ONLINE
                                            </span>
                                            <button
                                                onClick={handleReindex}
                                                disabled={isReindexing}
                                                className={`p-1.5 border border-slate-700 hover:border-cyan-500 text-cyan-400 transition-colors ${isReindexing ? 'animate-spin' : ''}`}
                                                title="Rebuild RAG Index"
                                            >
                                                <RefreshCw size={12} />
                                            </button>
                                            <button
                                                onClick={() => setIsAdminLoggedIn(false)}
                                                className="p-1.5 border border-slate-700 hover:border-red-500 text-slate-500 hover:text-red-500 transition-colors"
                                                title="Logout"
                                            >
                                                <LogOut size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-slate-900 bg-slate-950 p-4">
                                        {/* --- VIEW MODE: GUI (Visual) --- */}
                                        {adminViewMode === 'gui' && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">DATABASE_ENTRIES ({knowledgeBase.length})</h4>
                                                    <button
                                                        onClick={handleAddNew}
                                                        className="flex items-center gap-1 text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-2 py-1 hover:bg-cyan-900 transition-colors"
                                                    >
                                                        <Plus size={10} /> INSERT ROW
                                                    </button>
                                                </div>

                                                {knowledgeBase.map((item) => (
                                                    <div key={item.id} className="group relative bg-slate-900 p-3 border border-slate-800 hover:border-cyan-500/50 transition-all">
                                                        {isEditing === item.id ? (
                                                            <div className="space-y-2 animate-in fade-in duration-300">
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <input
                                                                        className="col-span-1 p-1.5 text-[10px] border border-cyan-800 bg-black text-cyan-200 focus:border-cyan-500 outline-none font-bold uppercase"
                                                                        value={editForm.category}
                                                                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                                                        placeholder="CATEGORY"
                                                                    />
                                                                    <input
                                                                        className="col-span-2 p-1.5 text-xs font-bold border border-cyan-800 bg-black text-white focus:border-cyan-500 outline-none"
                                                                        value={editForm.title}
                                                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                                        placeholder="TITLE"
                                                                    />
                                                                </div>
                                                                <textarea
                                                                    className="w-full p-2 text-xs border border-cyan-800 bg-black text-slate-300 h-24 resize-none focus:border-cyan-500 outline-none font-sans leading-relaxed"
                                                                    value={editForm.content}
                                                                    onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                                                                    placeholder="CONTENT_DATA"
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <button onClick={() => setIsEditing(null)} className="px-2 py-1 text-[10px] text-slate-500 hover:text-white uppercase">Cancel</button>
                                                                    <button onClick={() => handleSave(item.id)} className="px-3 py-1 text-[10px] border border-green-600 bg-green-900/20 text-green-400 hover:bg-green-900/40 flex items-center gap-1 font-bold uppercase">
                                                                        <Save size={10} /> COMMIT
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex justify-between items-start">
                                                                    <span className="text-[9px] font-bold text-slate-900 bg-cyan-700/80 px-1.5 py-0.5">
                                                                        {item.category}
                                                                    </span>
                                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={() => handleEditStart(item)} className="text-slate-500 hover:text-cyan-400"><Edit2 size={12} /></button>
                                                                        <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-500"><Trash2 size={12} /></button>
                                                                    </div>
                                                                </div>
                                                                <h4 className="font-bold text-cyan-100 text-xs truncate">{item.title}</h4>
                                                                <p className="text-[10px] text-slate-400 line-clamp-2 font-sans opacity-80">{item.content}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* --- VIEW MODE: JSON (Raw) --- */}
                                        {adminViewMode === 'json' && (
                                            <div className="h-full flex flex-col">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] text-slate-500">RAW_DATA_EDITOR // JSON</span>
                                                    {jsonError && <span className="text-[10px] text-red-500 animate-pulse">{jsonError}</span>}
                                                </div>
                                                <textarea
                                                    className="flex-1 bg-black border border-slate-800 text-green-500 font-mono text-[10px] p-3 resize-none focus:border-cyan-500 outline-none leading-relaxed"
                                                    value={jsonContent}
                                                    onChange={handleJsonChange}
                                                />
                                                <div className="flex justify-end mt-2">
                                                    <button onClick={handleJsonSave} className="px-4 py-2 bg-cyan-900/30 border border-cyan-500 text-cyan-400 text-xs font-bold hover:bg-cyan-900/50 transition-colors uppercase">
                                                        Commit_Changes
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    );
}
