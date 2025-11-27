import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import nextwaveImg from '../assets/nextwave.jpg';
import awsImg from '../assets/aws.png';

export const EventCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const timerRef = useRef(null);

    const events = [
        {
            id: 1,
            title: "NextWave: AI法創黑客松",
            type: "RECRUITING",
            status: "全面徵件中",
            location: "線上+實體",
            time: "2025.09.03",
            image: nextwaveImg,
            color: "cyan",
            link: "https://aiscuclub.github.io/NEXTWAVE/"
        },
        {
            id: 2,
            title: "AWS企業參訪",
            type: "UPCOMING",
            status: "開放報名",
            location: "台北微風南山辦公室",
            time: "2024.12.20",
            image: awsImg,
            color: "purple"
        },
    ];

    const resetTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % events.length);
        }, 5000);
    };

    useEffect(() => {
        resetTimer();
        return () => clearInterval(timerRef.current);
    }, [events.length]);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + events.length) % events.length);
        resetTimer();
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % events.length);
        resetTimer();
    };

    return (
        <div className="w-full max-w-5xl mb-12 relative group mx-auto">
            <div className="relative overflow-hidden rounded-none bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <div
                    className="flex transition-transform duration-700 ease-in-out will-change-transform"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {events.map((event, index) => {
                        const isCyan = event.color === 'cyan';
                        const isPurple = event.color === 'purple';
                        const textColor = isCyan ? 'text-cyan-400' : isPurple ? 'text-purple-400' : 'text-green-400';
                        const iconColor = isCyan ? 'text-cyan-500' : isPurple ? 'text-purple-500' : 'text-green-500';
                        const bgTheme = isCyan ? 'bg-cyan-500' : isPurple ? 'bg-purple-500' : 'bg-green-500';
                        const borderColor = isCyan ? 'group-hover:border-cyan-500/30' : isPurple ? 'group-hover:border-purple-500/30' : 'group-hover:border-green-500/30';

                        return (
                            <div key={event.id} className="w-full flex-shrink-0">
                                <div
                                    className={`relative h-64 md:h-48 flex flex-col md:flex-row transition-colors duration-500 border-transparent border ${borderColor} ${event.link ? 'cursor-pointer' : ''}`}
                                    onClick={() => event.link && window.open(event.link, '_blank')}
                                >
                                    <div className="w-full md:w-1/3 h-full relative overflow-hidden">
                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/90 md:bg-gradient-to-r md:from-transparent md:to-slate-900/90"></div>
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur text-[10px] font-mono text-white border border-white/20">
                                            IMG_SRC: {event.id}
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-center relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2 w-2">
                                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${bgTheme} opacity-75`}></span>
                                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${bgTheme}`}></span>
                                                </span>
                                                <span className={`font-mono text-xs font-bold tracking-widest ${textColor}`}>
                                                    {event.type}
                                                </span>
                                            </div>
                                            <div className="font-mono text-slate-500 text-xs">
                                                0{index + 1} / 0{events.length}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-4 tracking-wide">
                                            {event.title}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm font-mono text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className={iconColor} />
                                                {event.location}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className={iconColor} />
                                                {event.time}
                                            </div>
                                        </div>
                                        <div className={`mt-4 px-4 py-2 ${bgTheme} text-white text-xs font-bold tracking-wide inline-block`}>
                                            {event.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 border border-white/20 text-white hover:bg-cyan-900/80 hover:border-cyan-400 flex items-center justify-center backdrop-blur-md transition-all rounded-full group/btn z-20"><ChevronLeft size={20} /></button>
                <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 border border-white/20 text-white hover:bg-cyan-900/80 hover:border-cyan-400 flex items-center justify-center backdrop-blur-md transition-all rounded-full group/btn z-20"><ChevronRight size={20} /></button>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
                {events.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => { setActiveIndex(index); resetTimer(); }}
                        className={`h-1 transition-all duration-300 ${activeIndex === index ? 'w-8 bg-cyan-500' : 'w-2 bg-slate-600 hover:bg-slate-500'}`}
                    />
                ))}
            </div>
        </div>
    );
};
