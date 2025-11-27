import React, { useState } from 'react';
import { Terminal, ChevronDown } from 'lucide-react';

export const FAQItem = ({ question, answer, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative border border-slate-800 bg-slate-900/30 overflow-hidden group hover:border-cyan-500/50 transition-all duration-500 mb-4">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Scan line effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none"></div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left relative z-10"
            >
                <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity">
                        Q_0{index + 1}
                    </span>
                    <span className={`font-bold text-slate-200 group-hover:text-cyan-400 transition-colors duration-300 ${isOpen ? 'text-cyan-400' : ''}`}>
                        {question}
                    </span>
                </div>
                <ChevronDown
                    className={`text-slate-500 transition-all duration-500 ${isOpen ? 'rotate-180 text-cyan-500' : 'group-hover:text-cyan-400'}`}
                    size={20}
                />
            </button>

            {/* Answer section with smooth height transition */}
            <div
                className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-5 pt-0 pl-12 text-slate-400 leading-relaxed border-t border-slate-800/50 font-light text-sm relative">
                    {/* Response header with pulsing indicator */}
                    <div className="mb-2 text-[10px] font-mono text-cyan-700 flex items-center gap-2">
                        <Terminal size={10} />
                        <span>RESPONSE:</span>
                        <span className={`w-1.5 h-1.5 bg-cyan-500 rounded-full ${isOpen ? 'animate-pulse' : ''}`}></span>
                    </div>

                    {/* Answer text with fade-in animation */}
                    <div className={`transition-opacity duration-500 delay-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                        {answer}
                    </div>

                    {/* Decorative line */}
                    <div className={`mt-3 h-px bg-gradient-to-r from-cyan-500/50 via-cyan-500/20 to-transparent transition-all duration-700 ${isOpen ? 'w-full' : 'w-0'}`}></div>
                </div>
            </div>
        </div>
    );
};
