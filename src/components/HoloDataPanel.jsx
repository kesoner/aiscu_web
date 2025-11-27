import React from 'react';
import { Crosshair, Hash } from 'lucide-react';

export const HoloDataPanel = ({ title, subtitle, bgText, icon: Icon, children, color = "cyan" }) => {
    const themeColor = color === 'cyan' ? '#06b6d4' : '#a855f7';

    return (
        <div className="relative group h-full pt-4 pl-4">
            <div
                className="absolute inset-0 border-2 opacity-30 transform transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"
                style={{ borderColor: themeColor, clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}
            ></div>

            <div className="relative h-full bg-slate-900/90 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="absolute opacity-10 transform group-hover:scale-110 transition-transform duration-700 ease-out">
                        <Icon size={240} strokeWidth={0.5} color={themeColor} />
                    </div>

                    <div className="absolute z-0 flex items-center justify-center w-full">
                        <span
                            className="text-[5rem] font-black font-tech tracking-widest opacity-10 select-none"
                            style={{
                                WebkitTextStroke: `2px ${themeColor}`,
                                color: 'transparent'
                            }}
                        >
                            {bgText || subtitle.split('_')[0]}
                        </span>
                    </div>

                    <div className="absolute w-[120%] h-[1px] bg-white/5 rotate-45"></div>
                    <div className="absolute w-[120%] h-[1px] bg-white/5 -rotate-45"></div>
                    <Crosshair size={300} strokeWidth={0.5} className="text-white/5 absolute" />
                </div>

                <div className="relative z-10 p-8 flex flex-col h-full">
                    <div className="mb-6 relative flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-wide flex items-center gap-3">
                                <span className="w-3 h-3 rotate-45" style={{ backgroundColor: themeColor }}></span>
                                {title}
                            </h3>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="h-px w-8 bg-slate-500"></span>
                                <span className="text-xs font-mono tracking-[0.2em] uppercase" style={{ color: themeColor }}>
                                    {subtitle}
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-[10px] font-mono text-slate-500">SYS.VER.2.0</div>
                            <div className={`text-3xl font-black font-tech`} style={{ color: themeColor, opacity: 0.3 }}>
                                0{title === "成立背景" ? "1" : "2"}
                            </div>
                        </div>
                    </div>

                    <div className="text-slate-300 leading-relaxed text-sm font-medium relative bg-slate-950/40 p-4 border-l-2 border-white/10 rounded-r-lg backdrop-blur-sm flex-grow">
                        {children}
                    </div>

                    <div className="mt-6 flex justify-between items-end opacity-50">
                        <div className="flex gap-1">
                            {[...Array(4)].map((_, i) => <div key={i} className="w-1 h-3 bg-slate-600 skew-x-[-20deg]"></div>)}
                        </div>
                        <Hash size={16} color={themeColor} />
                    </div>
                </div>

                <div className="absolute inset-0 border pointer-events-none transition-colors duration-300 group-hover:border-white/20 border-white/5"></div>
            </div>
        </div>
    );
};
