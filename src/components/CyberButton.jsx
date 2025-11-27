import React from 'react';

export const CyberButton = ({ children, primary = false, className = "", onClick }) => (
    <button onClick={onClick} className={`relative group px-8 py-4 font-bold tracking-widest text-sm transition-all duration-300 ${className} cyber-btn`}>
        <div className={`absolute inset-0 cyber-btn-bg ${primary ? 'cyber-btn-primary-bg' : 'cyber-btn-secondary-bg'}`}></div>
        <div className={`absolute inset-0 cyber-btn-border ${primary ? 'cyber-btn-primary-border' : 'cyber-btn-secondary-border'}`}></div>
        <div className="absolute inset-0 cyber-btn-glitch"></div>
        <div className="absolute inset-0 cyber-btn-scanline"></div>
        <span className={`relative z-10 flex items-center gap-2 ${primary ? 'text-cyan-950 group-hover:text-cyan-950' : 'text-cyan-400 group-hover:text-cyan-300'}`}>{children}</span>
        <div className={`absolute top-0 left-0 w-2 h-2 cyber-btn-corner ${primary ? 'bg-cyan-950' : 'bg-cyan-400'}`}></div>
        <div className={`absolute top-0 right-0 w-2 h-2 cyber-btn-corner ${primary ? 'bg-cyan-950' : 'bg-cyan-400'}`}></div>
        <div className={`absolute bottom-0 left-0 w-2 h-2 cyber-btn-corner ${primary ? 'bg-cyan-950' : 'bg-cyan-400'}`}></div>
        <div className={`absolute bottom-0 right-0 w-2 h-2 cyber-btn-corner ${primary ? 'bg-cyan-950' : 'bg-cyan-400'}`}></div>
    </button>
);

export const BrokenSciFiButton = ({ children, onClick, className = "" }) => (
    <button onClick={onClick} className={`relative group font-black tracking-[0.3em] text-xl uppercase text-cyan-400 transition-all duration-100 ${className}`}>
        <div className="absolute inset-0 bg-cyan-950/30 border border-cyan-500/50 clip-broken transition-all duration-100 group-hover:bg-cyan-500 group-hover:border-cyan-400 group-hover:text-black"></div>
        <div className="absolute inset-0 bg-red-500/20 clip-glitch-1 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-1 pointer-events-none"></div>
        <div className="absolute inset-0 bg-blue-500/20 clip-glitch-2 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-2 pointer-events-none"></div>
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/80 group-hover:animate-flicker-border pointer-events-none"></div>
        <span className="relative z-10 flex items-center gap-3 group-hover:text-black group-hover:animate-text-shake"><span className="text-xs bg-cyan-500 text-black px-1 animate-pulse mr-2">///</span>{children}</span>
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500 group-hover:border-white"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500 group-hover:border-white"></div>
    </button>
);
