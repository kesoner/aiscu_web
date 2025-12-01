import React, { useState } from 'react';
import { runAgenticRag } from '../services/geminiService';
import { ingestChunksToChroma, retrieveFromChroma } from '../services/chromaService';
import { simpleChunker } from '../services/ragEngine';

const RagDebug = () => {
    const [kbText, setKbText] = useState<string>('The secret code is 12345. The capital of France is Paris. AI is the future.');
    const [query, setQuery] = useState<string>('What is the secret code?');
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isIndexed, setIsIndexed] = useState(false);

    const handleIndex = async () => {
        setLoading(true);
        setLogs(prev => [...prev, 'Starting indexing...']);
        try {
            const chunks = simpleChunker(kbText);
            const metadatas = chunks.map(() => ({ title: 'Debug Doc', category: 'DEBUG' }));
            await ingestChunksToChroma(chunks, metadatas, "debug_kb");
            setIsIndexed(true);
            setLogs(prev => [...prev, `Indexed ${chunks.length} chunks successfully to ChromaDB.`]);
        } catch (error) {
            console.error(error);
            setLogs(prev => [...prev, `Indexing failed: ${error}`]);
        } finally {
            setLoading(false);
        }
    };

    const handleRunRag = async () => {
        setLoading(true);
        setLogs([]); // Clear previous logs

        try {
            // Pass retrieval function
            const generator = runAgenticRag(query, (q) => retrieveFromChroma(q, 3));

            for await (const step of generator) {
                if (step.type === 'log') {
                    setLogs(prev => [...prev, step.message]);
                } else if (step.type === 'answer') {
                    setLogs(prev => [...prev, `ANSWER: ${step.message}`]);
                    if (step.source) {
                        setLogs(prev => [...prev, `SOURCE: ${step.source}`]);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setLogs(prev => [...prev, `RAG failed: ${error}`]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
            <h1 className="text-3xl font-bold mb-6 text-cyan-400">RAG Debug Console (ChromaDB)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-purple-400">1. Knowledge Base</h2>
                        <textarea
                            className="w-full h-40 bg-gray-900 border border-gray-600 p-3 rounded text-sm focus:border-cyan-500 outline-none"
                            value={kbText}
                            onChange={(e) => setKbText(e.target.value)}
                            placeholder="Enter text to index..."
                        />
                        <button
                            onClick={handleIndex}
                            disabled={loading}
                            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Index to Chroma'}
                        </button>
                        {isIndexed && <span className="ml-4 text-green-400">✓ Indexed</span>}
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-cyan-400">2. Query</h2>
                        <input
                            type="text"
                            className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-sm focus:border-cyan-500 outline-none"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask a question..."
                        />
                        <button
                            onClick={handleRunRag}
                            disabled={loading}
                            className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Running...' : 'Run RAG Agent'}
                        </button>
                    </div>
                </div>

                <div className="bg-black p-6 rounded-lg border border-gray-700 h-[600px] overflow-y-auto font-mono text-sm">
                    <h2 className="text-xl font-bold mb-4 text-green-400">System Logs</h2>
                    <div className="space-y-2">
                        {logs.map((log, index) => (
                            <div key={index} className="border-l-2 border-gray-600 pl-3">
                                <span className="text-gray-300">{log}</span>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="text-gray-600 italic">Waiting for input...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RagDebug;
