import React, { useState, useEffect, useRef } from 'react';
import {
  Code,
  Users,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MessageSquare,
  Github,
  Instagram,
  Facebook,
  Menu,
  X,
  ArrowRight,
  Zap,
  Terminal,
  Database,
  Cpu,
  Mic,
  Rocket,
  BookOpen,
  Coins,
  Cloud,
  CloudLightning,
  Keyboard,
  ShoppingBag,
  Trophy,
  Building2,
  Brain,
  Minimize,
  Maximize,
  Square,
  Hash,
  Scan,
  HelpCircle,
  ChevronDown,
  Target,
  Share2,
  Lightbulb,
  ImageIcon,
  Award,
  MonitorPlay,
  History,
  Telescope,
  Crosshair,
  Radio,
  MapPin,
  Clock,
  Server,
  Activity
} from 'lucide-react';

// --- CUSTOM HOOKS ---
const useScrollReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }, { threshold });

    const currentElement = domRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  return [domRef, isVisible];
};

// --- BACKGROUND COMPONENTS ---
const FateWheelBackground = () => (
  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[80vw] md:h-[80vw] opacity-20 pointer-events-none z-0 select-none overflow-visible flex items-center justify-center">
    <svg viewBox="0 0 1000 1000" className="w-full h-full animate-[spin_60s_linear_infinite]">
      <defs>
        <linearGradient id="wheel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="500" cy="500" r="450" fill="none" stroke="url(#wheel-gradient)" strokeWidth="6" strokeDasharray="40 20" opacity="0.6" />
      <g className="origin-center animate-[spin_40s_linear_infinite_reverse]">
        <circle cx="500" cy="500" r="350" fill="none" stroke="#0891b2" strokeWidth="4" opacity="0.4" />
        {[...Array(8)].map((_, i) => (
          <rect key={i} x="492" y="140" width="16" height="40" fill="#06b6d4" transform={`rotate(${i * 45} 500 500)`} />
        ))}
      </g>
      <g className="origin-center animate-[spin_20s_linear_infinite]">
        <circle cx="500" cy="500" r="250" fill="none" stroke="#22d3ee" strokeWidth="12" strokeDasharray="100 250" opacity="0.7" />
        <circle cx="500" cy="500" r="230" fill="none" stroke="#fff" strokeWidth="2" opacity="0.2" />
        <path d="M 500 250 L 500 320 M 500 680 L 500 750 M 250 500 L 320 500 M 680 500 L 750 500" stroke="#06b6d4" strokeWidth="8" />
      </g>
      <circle cx="500" cy="500" r="100" fill="none" stroke="#06b6d4" strokeWidth="4" opacity="0.5" />
      <circle cx="500" cy="500" r="60" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="20 40" opacity="0.3" className="animate-pulse" />
    </svg>
  </div>
);

// --- UI COMPONENTS ---

const HoloDataPanel = ({ title, subtitle, bgText, icon: Icon, children, color = "cyan" }) => {
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

const TechInfoCard = ({ title, icon: Icon, desc, color }) => {
  const borderColor = color === 'cyan' ? 'border-cyan-500' : color === 'purple' ? 'border-purple-500' : 'border-green-500';
  const textColor = color === 'cyan' ? 'text-cyan-400' : color === 'purple' ? 'text-purple-400' : 'text-green-400';
  const glowColor = color === 'cyan' ? 'group-hover:shadow-cyan-500/20' : color === 'purple' ? 'group-hover:shadow-purple-500/20' : 'group-hover:shadow-green-500/20';

  return (
    <div className={`
      relative p-8 h-full bg-slate-900/60 border border-white/10 backdrop-blur-md overflow-hidden group transition-all duration-500
      hover:border-opacity-50 hover:translate-y-[-5px] ${glowColor} hover:shadow-2xl
    `}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-slate-800`}>
        <div className={`h-full w-1/3 bg-${color}-500 ${borderColor} transition-all duration-700 group-hover:w-full`}></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-lg bg-white/5 border border-white/10 group-hover:border-${color}-500/50 transition-colors`}>
            <Icon className={textColor} size={32} />
          </div>
          <div className="flex flex-col items-end">
            <div className={`text-xs font-mono font-bold ${textColor} opacity-70`}>SYS_MOD</div>
            <div className="flex gap-1 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${textColor === 'text-cyan-400' ? 'bg-cyan-500' : textColor === 'text-purple-400' ? 'bg-purple-500' : 'bg-green-500'} animate-pulse`}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-black text-white mb-4 tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
          {title}
        </h3>
        <div className="h-px w-12 bg-slate-700 mb-4 group-hover:w-full group-hover:bg-gradient-to-r group-hover:from-white/50 group-hover:to-transparent transition-all duration-500"></div>
        <p className="text-slate-400 leading-relaxed text-sm font-medium">
          {desc}
        </p>
      </div>

      <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-slate-700 group-hover:border-${color}-500 transition-colors`}></div>
    </div>
  );
};

const TechBadge = ({ children }) => (
  <div className="inline-flex items-center gap-3 px-5 py-2 bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest hover:bg-cyan-500/10 transition-all cursor-default group overflow-hidden relative" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 40%)' }}>
    <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transform skew-x-[-20deg] animate-[shimmer_3s_infinite]"></div>
    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_5px_cyan]"></span></span>
    <span className="relative z-10">{children}</span>
    <div className="h-3 w-[1px] bg-cyan-500/30"></div>
    <span className="text-[8px] opacity-50 font-mono">SYS.ON</span>
  </div>
);

const HeroTechButton = ({ children, primary = false, onClick }) => (
  <button onClick={onClick} className={`relative group px-12 py-6 font-bold tracking-[0.15em] text-xl transition-all duration-300 overflow-hidden ${primary ? 'text-black bg-cyan-500 hover:bg-white' : 'text-cyan-400 bg-transparent border border-cyan-500/50 hover:border-cyan-400 hover:text-cyan-300'}`} style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
    <span className="relative z-10 flex items-center gap-3">{children}</span>
    {primary && <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-[-20deg]"></div>}
    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
    {!primary && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px] opacity-0 group-hover:opacity-100 transition-opacity"></div>}
  </button>
);

const MinimalButton = ({ children, primary = false, className = "", onClick }) => (
  <button onClick={onClick} className={`relative px-6 py-2 font-mono font-bold tracking-widest text-sm transition-all duration-300 border bg-transparent ${primary ? 'border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-slate-600 text-slate-400 hover:border-white hover:text-white hover:bg-white/5'} ${className}`}>{children}</button>
);

const BrokenSciFiButton = ({ children, onClick, className = "" }) => (
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

const CyberButton = ({ children, primary = false, className = "", onClick }) => (
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

const TypewriterText = ({ text, speed = 50, startDelay = 0, className = "" }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setStarted(false);
    const startTimeout = setTimeout(() => { setStarted(true); }, startDelay);
    return () => clearTimeout(startTimeout);
  }, [startDelay, text]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i > text.length) clearInterval(intervalId);
    }, speed);
    return () => clearInterval(intervalId);
  }, [text, speed, started]);

  return (<span className={className}>{displayedText}<span className="animate-pulse inline-block w-2 h-[1em] bg-cyan-400 align-middle ml-1 shadow-[0_0_10px_cyan]"></span></span>);
};

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-800 bg-slate-900/30 overflow-hidden group hover:border-cyan-500/30 transition-all duration-300 mb-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 text-left">
        <div className="flex items-center gap-4"><span className="font-mono text-xs text-cyan-500 opacity-60">Q_0{index + 1}</span><span className={`font-bold text-slate-200 group-hover:text-cyan-400 transition-colors ${isOpen ? 'text-cyan-400' : ''}`}>{question}</span></div>
        <ChevronDown className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} size={20} />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-5 pt-0 pl-12 text-slate-400 leading-relaxed border-t border-slate-800/50 font-light text-sm"><div className="mb-2 text-[10px] font-mono text-cyan-700 flex items-center gap-2"><Terminal size={10} /> RESPONSE:</div>{answer}</div>
      </div>
    </div>
  );
};

const EventCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  const events = [
    {
      id: 1,
      title: "AWS DeepRacer 實戰工作坊",
      type: "LIVE_EVENT",
      status: "進行中",
      location: "綜合大樓 302",
      time: "19:00 - 21:00",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      color: "cyan"
    },
    {
      id: 2,
      title: "期末黑客松大賽",
      type: "UPCOMING",
      status: "報名倒數 3 天",
      location: "線上 Discord",
      time: "2023.12.15",
      image: "https://images.unsplash.com/photo-1504384308090-c54be3855091?auto=format&fit=crop&w=800&q=80",
      color: "purple"
    },
    {
      id: 3,
      title: "Google DeepMind 參訪",
      type: "RECRUITING",
      status: "開放登記",
      location: "Google Taipei",
      time: "2024.01.10",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
      color: "green"
    }
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
      {/* ADDED mx-auto for Center Alignment */}
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
                <div className={`relative h-64 md:h-48 flex flex-col md:flex-row transition-colors duration-500 border-transparent border ${borderColor}`}>
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
                      <div className="flex items-center gap-2 col-span-2">
                        <Radio size={14} className={iconColor} />
                        <span className="text-white font-bold">{event.status}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-[2px] bg-slate-800 w-full">
                      {index === activeIndex && (
                        <div className={`h-full ${bgTheme} animate-[load_5s_linear_forwards]`}></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 border border-white/20 text-white hover:bg-cyan-900/80 hover:border-cyan-400 flex items-center justify-center backdrop-blur-md transition-all rounded-full group/btn z-20"><ChevronLeft size={20} /></button>
        <button onClick={handleNext} className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 border border-white/20 text-white hover:bg-cyan-900/80 hover:border-cyan-400 flex items-center justify-center backdrop-blur-md transition-all rounded-full group/btn z-20"><ChevronRight size={20} /></button>
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => { setActiveIndex(index); resetTimer(); }}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-6 bg-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-slate-700 hover:bg-slate-400'
              }`}
          ></button>
        ))}
      </div>
      <style>{`@keyframes load { 0% { width: 0; } 100% { width: 100%; } }`}</style>
    </div>
  );
};

const AnimatedSection = ({ children, className = "", delay = 0 }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${className} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- PAGE CONTENT COMPONENTS ---

// 4. Events Page (Updated with Left-Aligned Carousel)
const EventsPage = ({ setPage }) => (
  <section id="events" className="py-32 relative font-main bg-[#0a0b10] min-h-screen">
    <div className="container mx-auto px-8 relative z-10">
      <AnimatedSection>
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="text-cyan-500 font-bold tracking-widest mb-2 text-sm">// LIVE OPERATIONS</div>
          <h2 className="text-4xl md:text-5xl font-black text-white">
            社團 <span className="text-cyan-400">活動回顧</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-6"></div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={100}>
        <EventCarousel />
      </AnimatedSection>

      <div className="mt-20">
        <div className="text-center mb-10">
          <div className="text-purple-500 font-bold tracking-widest mb-2 text-sm">// FIELD ARCHIVES</div>
          <h3 className="text-3xl font-black text-white">歷史活動檔案</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { img: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80", title: "Python 進階班結訓", date: "2023.05" },
            { img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", title: "資料結構駭客松", date: "2022.12" },
            { img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80", title: "雲端服務入門工作坊", date: "2023.10" },
            { img: "https://images.unsplash.com/photo-1549682522-d7b6b19a97d9?auto=format&fit=crop&w=600&q=80", title: "AI 倫理主題沙龍", date: "2023.11" },
          ].map((item, idx) => (
            <AnimatedSection key={idx} delay={idx * 100}>
              <div className="relative group overflow-hidden border border-white/10 bg-black/50 hover:shadow-cyan-500/50 hover:shadow-xl transition-all duration-300">
                <div className="h-40 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1e293b/a5f3fc?text=ARCHIVE"; }}
                  />
                </div>
                <div className="p-4 relative border-t border-white/10">
                  <div className="text-[10px] font-mono text-slate-500">{item.date}</div>
                  <h4 className="text-sm font-bold text-white mt-1 group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                </div>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-700 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// 4.5 Application Page (Arknights Style)
const ApplicationPage = ({ setPage }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    department: '',
    email: '',
    motivation: ''
  });
  const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, SUCCESS, ERROR
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('SUBMITTING');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('SUCCESS');
        setMessage('Application transmitted securely. Awaiting command.');
        setFormData({ fullName: '', studentId: '', department: '', email: '', motivation: '' });
      } else {
        setStatus('ERROR');
        setMessage(result.message || 'Transmission failed.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('ERROR');
      setMessage('Connection to server failed. Check network status.');
    }
  };

  return (
    <section className="py-32 relative font-main bg-[#121212] min-h-screen overflow-hidden">
      {/* Arknights Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1a1a1a] transform rotate-12 translate-y-1/2 translate-x-1/4 opacity-50"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-white/5"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-white/5"></div>
        {/* Slanted Lines */}
        <div className="absolute top-0 right-20 w-px h-full bg-white/5 transform -skew-x-12"></div>
        <div className="absolute top-0 right-24 w-px h-full bg-white/5 transform -skew-x-12"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-end gap-4 mb-12 border-b-2 border-white/10 pb-4 relative">
          <div className="absolute bottom-[-2px] left-0 w-20 h-[2px] bg-cyan-500"></div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            APPLICATION <span className="text-cyan-500">FORM</span>
          </h1>
          <div className="text-sm font-mono text-slate-500 mb-2 tracking-widest">
            // UNREGISTERED_PERSONNEL_ENTRY
          </div>
        </div>

        {/* Form Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Info Panel */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#1a1a1a] p-6 border-l-4 border-cyan-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <Activity size={48} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">注意事項</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                請填寫真實資料以利審核。<br />
                Please provide valid information for verification.
              </p>
              <div className="mt-4 text-xs font-mono text-cyan-600">
                &gt;&gt; WAITING_FOR_INPUT
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-4 border border-white/5">
              <div className="text-xs font-mono text-slate-500 mb-1">SYSTEM_STATUS</div>
              <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
                <span className={`w-2 h-2 rounded-full ${status === 'SUBMITTING' ? 'bg-yellow-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                {status === 'SUBMITTING' ? 'TRANSMITTING...' : 'ONLINE'}
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="md:col-span-2 bg-[#1a1a1a]/50 backdrop-blur-sm border border-white/10 p-8 relative">
            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>

            {status === 'SUCCESS' ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                  <Check size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white">Submission Confirmed</h3>
                <p className="text-slate-400">{message}</p>
                <button onClick={() => setStatus('IDLE')} className="mt-6 text-cyan-500 hover:text-cyan-400 text-sm font-mono underline">
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name / 姓名</label>
                    <input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="w-full bg-black/50 border border-white/20 p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono" placeholder="Ex: 王小明" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student ID / 學號</label>
                    <input required name="studentId" value={formData.studentId} onChange={handleChange} type="text" className="w-full bg-black/50 border border-white/20 p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono" placeholder="Ex: 11212345" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department / 系級</label>
                  <input required name="department" value={formData.department} onChange={handleChange} type="text" className="w-full bg-black/50 border border-white/20 p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono" placeholder="Ex: 資科二A" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Email / 電子郵件</label>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-black/50 border border-white/20 p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono" placeholder="example@scu.edu.tw" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Motivation / 申請動機</label>
                  <textarea required name="motivation" value={formData.motivation} onChange={handleChange} className="w-full bg-black/50 border border-white/20 p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono h-32 resize-none" placeholder="請簡述您想加入的原因..."></textarea>
                </div>

                {status === 'ERROR' && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-mono">
                    Error: {message}
                  </div>
                )}

                <button type="submit" disabled={status === 'SUBMITTING'} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 tracking-widest uppercase transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="relative z-10">{status === 'SUBMITTING' ? 'Transmitting...' : 'Submit Application'}</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// 5. FAQ Page
const FAQPage = ({ setPage }) => (
  <section id="faq" className="py-24 relative font-main bg-[#0a0b10] min-h-screen">
    <div className="container mx-auto px-8 relative z-10">
      <AnimatedSection>
        <div className="flex flex-col items-center mb-16">
          <div className="text-cyan-500 font-bold tracking-widest mb-2 text-sm">// DATABASE QUERY</div>
          <h2 className="text-4xl md:text-5xl font-black text-white text-center">常見 <span className="text-cyan-400">問答</span></h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-6"></div>
        </div>
      </AnimatedSection>

      <div className="max-w-3xl mx-auto">
        {[
          { q: "參加社團需要有程式基礎嗎？", a: "完全不需要！我們的課程設計從零開始，會有學長姐手把手帶你入門 Python 與 AI 基礎概念。" },
          { q: "社費是多少？", a: "本學期社費為 NT$ 500，包含所有課程講義、工作坊材料與期末披薩派對費用。" },
          { q: "非資工系的學生可以加入嗎？", a: "當然可以！AI 是跨領域的工具，我們非常歡迎來自人文、商管、藝術等不同背景的同學加入，激盪出更多火花。" },
          { q: "社課時間與地點？", a: "每週三晚上 19:00 - 21:00，地點位於綜合大樓 302 教室。若有變動會提前在 Discord 群組公告。" },
          { q: "需要自備電腦嗎？", a: "建議自備筆電（Windows/Mac/Linux 皆可），以便在課堂上進行實作練習。" }
        ].map((item, idx) => (
          <AnimatedSection key={idx} delay={idx * 100}>
            <FAQItem question={item.q} answer={item.a} index={idx} />
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

const JoinSection = ({ setPage }) => (
  <section id="join" className="relative py-32 overflow-hidden font-main bg-transparent">
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 cyber-grid"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-transparent to-[#0a0b10]"></div>
    </div>

    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>

    <div className="container mx-auto px-8 relative z-10 text-center">
      <AnimatedSection>
        <h2 className="text-5xl md:text-6xl font-black text-white mb-12">
          準備好 <span className="sci-fi-flicker inline-block">潛入</span> 了嗎？
        </h2>

        <div className="max-w-2xl mx-auto mb-12 relative group flex flex-col items-center">
          <div className="absolute bottom-0 w-full h-64 holo-beam pointer-events-none"></div>
          <div className="relative z-10 p-8 font-mono space-y-4 text-center transform group-hover:-translate-y-2 transition-transform duration-500">
            <div className="text-cyan-400 text-xs tracking-[0.3em] animate-pulse">
              SYSTEM_MESSAGE // INCOMING_TRANSMISSION
            </div>
            <div className="text-lg md:text-xl text-cyan-100 font-medium text-shadow-glow leading-relaxed">
              <TypewriterText text=">無需任何經驗。我們需要的是你的熱情與好奇心。" speed={40} />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white text-shadow-glow mt-2">
              <TypewriterText text=">加入 AISCU，開啟你的 AI 冒險篇章。" speed={40} startDelay={2500} />
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        </div>

        <div className="flex justify-center relative mt-8">
          <BrokenSciFiButton onClick={() => setPage('join_form')} className="px-12 py-5 text-lg">
            申請入社 <ArrowRight size={20} className="inline ml-2" />
          </BrokenSciFiButton>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

// 1. Home Page
const HomePage = ({ setPage }) => (
  <>
    <section id="hero" className="relative min-h-[90vh] flex items-center pt-20 font-main">
      {/* Decorative Sidebar */}
      <div className="absolute left-0 top-1/3 w-12 h-1/3 border-r border-white/10 hidden lg:flex flex-col items-center justify-center gap-8">
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
        <span className="vertical-rl text-xs text-slate-500 tracking-[0.5em] transform rotate-180" style={{ writingMode: 'vertical-rl' }}>SYSTEM ONLINE</span>
      </div>

      <div className="container mx-auto px-6 lg:pl-24 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7 space-y-8 relative">
          <div className="absolute -top-32 -left-6 md:-left-12 select-none pointer-events-none z-0 opacity-50">
            <div className="text-[6rem] md:text-[9rem] font-black font-tech text-[#1a1d24] leading-[0.85]">REWRITE</div>
            <div className="text-[6rem] md:text-[9rem] font-black font-tech text-stroke leading-[0.85] ml-16 md:ml-24">FUTURE</div>
          </div>

          <AnimatedSection>
            <TechBadge>狀態：熱烈招募中</TechBadge>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="relative z-10 py-4">
              <div className="flex flex-col items-start gap-4 pl-2">
                <div className="glitch-wrapper">
                  <h1 className="glitch-text text-8xl md:text-9xl font-black font-tech tracking-tighter leading-[0.9]" data-text="AISCU">AISCU</h1>
                  <div className="absolute top-1/2 -left-4 w-[110%] h-1 bg-cyan-500 mix-blend-overlay opacity-50 animate-pulse"></div>
                  <div className="absolute top-1/3 right-0 w-12 h-2 bg-red-500 mix-blend-exclusion opacity-60"></div>
                </div>
                <div className="flex items-center w-full">
                  <div className="holo-label clip-corner-tl">
                    <h2 className="text-2xl md:text-3xl font-bold font-main tracking-[0.2em] relative z-10">人工智慧應用社</h2>
                  </div>
                  <div className="h-px flex-grow bg-dashed border-b border-white/20 ml-4"></div>
                  <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap">ERR_CODE:0X9</div>
                </div>
              </div>
              <div className="mt-12 flex items-center gap-4 pl-4">
                <p className="text-lg text-cyan-500 font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <span className="bg-cyan-500 text-black px-1 text-sm font-black animate-pulse">_</span>
                  重寫你的未來方程式
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <div className="relative p-6 border-l-2 border-cyan-500/50 bg-gradient-to-r from-cyan-950/30 to-transparent backdrop-blur-sm mt-8 max-w-4xl group">
              <div className="absolute -top-3 left-0 text-[10px] font-mono text-cyan-400 bg-[#0a0b10] px-2 border border-cyan-500/30 tracking-widest">MISSION_OBJECTIVE</div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500 opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500 opacity-50"></div>
              <p className="text-lg text-slate-300 leading-relaxed font-light">
                這裡不只教你寫程式，更教你如何用 <span className="text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">AI 解決真實問題</span>。
                從基礎 Python 到最前沿的生成式 AI，透過專案實作，打造屬於你的<span className="text-white border-b border-cyan-500/50 pb-0.5 font-medium">技術武器庫</span>。
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={600}>
            <div className="flex flex-wrap gap-6 pt-8 relative z-10">
              <HeroTechButton primary onClick={() => setPage('join')}>立即啟動 <ArrowRight size={20} className="inline ml-1" /></HeroTechButton>
              <HeroTechButton onClick={() => setPage('curriculum')}>查看課程模組 <Scan size={18} className="inline ml-1" /></HeroTechButton>
            </div>
          </AnimatedSection>
        </div>

        {/* Right Visual - Background & Vision Panels */}
        <div className="lg:col-span-5 relative h-full flex flex-col justify-center gap-8 py-12">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

          {/* Panel 1: Background */}
          <AnimatedSection delay={800}>
            <HoloDataPanel
              title="成立背景"
              subtitle="ORIGIN_STORY"
              bgText="ORIGIN"
              icon={History}
              color="cyan"
            >
              <p className="mb-4">在 AI 浪潮席捲全球之際，我們觀察到傳統學術與業界實務間存在一道巨大的鴻溝。**AISCU** 於焉成立，旨在打破這個隔閡，成為一座專為學生打造的 **AI 實戰訓練場**。</p>
              <p>我們堅信，學習 AI 不應只停留在教科書，而應是動手實作、親身參與專案的過程。從創立之初，社團就以 **專案導向學習 (Project-Based Learning)** 為核心，引導成員將最新的 AI 模型和框架應用於真實世界的挑戰中。</p>
            </HoloDataPanel>
          </AnimatedSection>

          {/* Panel 2: Vision */}
          <AnimatedSection delay={1000}>
            <HoloDataPanel
              title="未來願景"
              subtitle="FUTURE_VISION"
              bgText="VISION"
              icon={Telescope}
              color="purple"
            >
              <p className="mb-4">我們的願景是成為 **校園 AI 領域的技術燈塔**。我們不僅要培育出具備扎實技術的開發者，更要激發成員的 **跨域協作能力** 與 **黑客精神**。</p>
              <p>未來，**AISCU** 將作為業界與學界間的交流樞紐，定期邀請頂尖企業專家分享經驗，並持續推動成員參與國際級的 AI 競賽。我們的最終目標是讓每一位成員都能在畢業前，擁有足以在國際舞台上競爭的 **個人技術組合 (Portfolio)**。</p>
            </HoloDataPanel>
          </AnimatedSection>
        </div>
      </div>
    </section>

    <JoinSection setPage={setPage} />
  </>
);

// 2. About Page
const AboutPage = ({ setPage }) => (
  <section className="py-32 relative font-main bg-[#0a0b10] min-h-screen">
    <div className="container mx-auto px-8 relative z-10">
      <AnimatedSection>
        <div className="flex flex-col items-center mb-16">
          <div className="text-cyan-500 font-bold tracking-widest mb-2 text-sm">// SYSTEM MODULES</div>
          <h2 className="text-4xl md:text-5xl font-black text-white text-center">關於 <span className="text-cyan-400">我們</span></h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-6"></div>
        </div>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          {
            title: "CORE: MISSION",
            icon: Target,
            desc: "我們的使命是降低 AI 學習門檻，讓每一位學生都能掌握未來科技。透過實作與專案，將理論轉化為解決問題的能力。",
            color: "cyan"
          },
          {
            title: "MODULE: CONNECT",
            icon: Share2,
            desc: "連結校園與產業界的橋樑。我們定期舉辦企業參訪、職涯講座，並建立跨校系的開發者社群網絡。",
            color: "purple"
          },
          {
            title: "OUTPUT: INNOVATE",
            icon: Lightbulb,
            desc: "鼓勵創新思維與黑客精神。這裡沒有標準答案，只有無限的可能性。我們提供資源，讓你實現瘋狂的點子。",
            color: "green"
          }
        ].map((item, idx) => (
          <AnimatedSection key={idx} delay={idx * 100}>
            <TechInfoCard
              title={item.title}
              icon={item.icon}
              desc={item.desc}
              color={item.color}
            />
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={400}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-white/10">
          {[
            { label: "活躍社團成員", value: "128+", icon: Users, color: "text-cyan-400" },
            { label: "完成實作專案", value: "42", icon: Code, color: "text-purple-400" },
            { label: "企業參訪 & 工作坊", value: "15", icon: Zap, color: "text-yellow-400" },
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center justify-center gap-6 group cursor-default">
              <div className={`p-4 bg-white/5 border border-white/10 transform rotate-45 transition-all duration-300 group-hover:bg-white/10 group-hover:scale-110 group-hover:border-${stat.color.split('-')[1]}-500`}>
                <stat.icon className={`${stat.color} transform -rotate-45`} size={28} />
              </div>
              <div>
                <div className="text-4xl font-black text-white font-tech">{stat.value}</div>
                <div className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>
    </div>
  </section>
);

// 3. Curriculum Page
const CurriculumPage = ({ setPage, onBuyTicket }) => {
  const events = [
    { id: "01", fullDate: "2025-09-17", date: "09/17 (三)", title: "錢老師美育全校演講", type: "演講", icon: Mic, desc: "美育系列講座，開啟學期新篇章。", color: "cyan" },
    { id: "02", fullDate: "2025-09-26", date: "09/26 (五)", title: "期初社大暨競賽說明會", type: "社務", icon: Rocket, desc: "介紹社團運作模式與本學期重點競賽資訊。", color: "blue" },
    { id: "03", fullDate: "2025-10-01", date: "10/01 (三)", title: "AI 初體驗 - 人工智慧入門", type: "課程", icon: Brain, desc: "帶領新手快速認識 AI 的基礎概念與應用。", color: "purple" },
    { id: "04", fullDate: "2025-10-08", date: "10/08 (三)", title: "機器學習入門", type: "課程", icon: Cpu, desc: "深入淺出解析機器學習 (Machine Learning) 核心原理。", color: "pink" },
    { id: "05", fullDate: "2025-10-15", date: "10/15 (三)", title: "交流暨讀書會", type: "交流", icon: BookOpen, desc: "社員分組交流，分享技術心得與學習資源。", color: "yellow" },
    { id: "06", fullDate: "2025-10-22", date: "10/22 (三)", title: "金融科技 (講座)", type: "講座", icon: Coins, desc: "探索 FinTech 領域中 AI 技術的實際應用案例。", color: "green" },
    { id: "07", fullDate: "2025-11-19", date: "11/19 (三)", title: "AWS 實戰工作坊", type: "工作坊", icon: Cloud, desc: "Hands-on Lab！實際操作 AWS 雲端服務平台。", color: "orange" },
    { id: "08", fullDate: "2025-11-26", date: "11/26 (三)", title: "AWS 實戰工作坊 (II)", type: "工作坊", icon: CloudLightning, desc: "進階雲端架構部署與服務串接實作。", color: "red" },
    { id: "09", fullDate: "2025-12-03", date: "12/03 (三)", title: "vibe coding 工作坊", type: "工作坊", icon: Keyboard, desc: "體驗 Vibe Coding，感受程式開發的律動與樂趣。", color: "indigo" },
    { id: "10", fullDate: "2025-12-10", date: "12/10 (三)", title: "統一集團 AI 零售與應用", type: "講座", icon: ShoppingBag, desc: "邀請業界專家分享 AI 在智慧零售的落地應用。", color: "teal" },
    { id: "11", fullDate: "2025-12-21", date: "12/21 (日)", title: "期末社大暨黑客松決賽", type: "競賽", icon: Trophy, desc: "學期成果發表，黑客松決賽與頒獎典禮。", color: "amber" },
    { id: "12", fullDate: "2026-01-03", date: "01/03 (六)", title: "AWS 企業參訪", type: "參訪", icon: Building2, desc: "實地走訪 AWS 辦公室，體驗雲端企業文化。", color: "sky" },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events.filter(e => new Date(e.fullDate) >= today).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  const expired = events.filter(e => new Date(e.fullDate) < today).sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));
  const sortedEvents = [...upcoming, ...expired];

  return (
    <section className="py-32 relative font-main overflow-hidden min-h-screen bg-transparent">
      <div className="absolute right-0 top-20 w-96 h-96 bg-gradient-to-b from-cyan-900/20 to-transparent opacity-30 transform skew-y-12 pointer-events-none"></div>

      <div className="container mx-auto px-8 relative z-10 backdrop-blur-xl bg-[#0a0b10]/80 p-8 border border-white/10">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
            <div>
              <div className="text-cyan-500 font-bold tracking-widest mb-2 text-sm">// TRAINING MODULES</div>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                本學期 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">課程規劃</span>
              </h2>
            </div>
            <div className="hidden md:block text-right opacity-60">
              <div className="text-3xl font-black font-tech text-white">2024-2025</div>
              <div className="text-xs text-white font-bold tracking-widest">FALL SEMESTER</div>
            </div>
          </div>
        </AnimatedSection>

        {/* Centered Container */}
        <div className="relative max-w-3xl mx-auto pl-4">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/0 via-cyan-500/30 to-cyan-500/0"></div>

          {sortedEvents.map((event, idx) => {
            const isExpired = new Date(event.fullDate) < today;
            const themeColor = event.color === 'cyan' ? '#06b6d4' : event.color === 'purple' ? '#a855f7' : '#22d3ee';
            const textColor = `text-${event.color}-400`;
            const borderColor = `border-${event.color}-400`;

            return (
              <AnimatedSection key={event.id} delay={idx * 50} className="mb-12 relative">
                <div className={`flex items-start group pl-12 relative ${isExpired ? 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500' : ''}`}>

                  {/* Timeline Node */}
                  <div className={`absolute left-4 top-8 w-3 h-3 bg-[#0a0b10] border z-20 transform -translate-x-1/2 rotate-45 flex items-center justify-center transition-all duration-300 ${isExpired ? 'border-slate-600' : 'border-cyan-500 shadow-[0_0_10px_cyan]'}`}>
                    <div className={`w-1 h-1 ${isExpired ? 'bg-slate-600' : 'bg-cyan-400'}`}></div>
                  </div>

                  {/* Connector */}
                  <div className={`absolute left-4 top-10 w-8 h-px ${isExpired ? 'bg-slate-700' : 'bg-cyan-500/30'}`}></div>

                  {/* Holo-Style Card */}
                  <div className="relative group/card w-full pt-4 pl-4 perspective-1000">
                    {/* Offset Border (Drift Animation) */}
                    <div
                      className="absolute inset-0 border-2 opacity-30 transform transition-transform duration-500 ease-out group-hover/card:translate-x-3 group-hover/card:translate-y-3"
                      style={{ borderColor: isExpired ? '#475569' : themeColor, clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}
                    ></div>

                    {/* Main Card Content */}
                    <div className={`
                        relative h-full backdrop-blur-xl border overflow-hidden flex flex-col transition-all duration-300 ease-out
                        ${isExpired
                        ? 'bg-slate-900/40 border-slate-700/50'
                        : 'bg-slate-800/60 border-white/20 hover:bg-slate-700/60 hover:border-white/40 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                      }
                      `}
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}>

                      {/* Background Decor (Simplified) */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-30">
                        <div className="absolute w-[150%] h-[1px] bg-white/5 rotate-45 transform translate-y-10"></div>
                      </div>

                      <div className="relative z-10 p-6 flex flex-col h-full">
                        {/* Header */}
                        <div className="mb-2 relative flex items-start justify-between">
                          <div>
                            <h3 className={`text-xl font-black tracking-wide flex items-center gap-3 ${isExpired ? 'text-slate-400' : 'text-white'}`}>
                              <span className="w-2 h-2 rotate-45 transition-transform duration-500 group-hover/card:rotate-90" style={{ backgroundColor: isExpired ? '#475569' : themeColor }}></span>
                              {event.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`text-[10px] font-medium tracking-wide opacity-70 ${isExpired ? 'text-slate-500' : textColor}`}>
                                {event.type}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`text-xl font-black font-tech transition-opacity duration-300 group-hover/card:opacity-80`} style={{ color: isExpired ? '#475569' : themeColor, opacity: 0.2 }}>
                              {event.id}
                            </div>
                          </div>
                        </div>

                        {/* Body */}
                        <div className={`leading-relaxed text-sm font-medium relative pl-4 border-l-2 flex-grow transition-colors duration-300 ${isExpired ? 'text-slate-500 border-slate-700' : 'text-slate-300 border-white/10 group-hover/card:border-white/30'}`}>
                          <div className="flex items-center gap-2 mb-1 font-mono text-[10px] opacity-60">
                            {event.date}
                          </div>
                          {event.desc}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 flex justify-between items-end opacity-50">
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-2 bg-slate-600 skew-x-[-20deg]"></div>)}
                          </div>
                          <Hash size={14} color={isExpired ? '#475569' : themeColor} />
                        </div>
                      </div>

                      {/* Hover Border Effect */}
                      <div className="absolute inset-0 border pointer-events-none transition-colors duration-300 group-hover/card:border-white/30 border-white/5"></div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// --- MAIN APP ---

const App = () => {
  const [activePage, setActivePage] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [bookingEvent, setBookingEvent] = useState(null);

  // Logo URL from user query
  const logoUrl = "https://instagram.ftpe7-3.fna.fbcdn.net/v/t51.2885-19/508617606_17842639005517088_3047133208499818472_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDI0LmMxIn0&_nc_ht=instagram.ftpe7-3.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QFtfMvQXYeQVIwF2SLujlAGIDZTGPi6U3Jrqdms8fN48RaUQuvlRRN57zj__7V9BwE&_nc_ohc=2LBfbdGoxKoQ7kNvwHzeqMR&_nc_gid=-yTisd_NnpKe_I8_VfUAMA&edm=AId3EpQBAAAA&ccb=7-5&oh=00_Afio1xQp4zB8mGfj9kHbqs6OF3NMVHSDhVv1l1TW-_qnvw&oe=69261D05&_nc_sid=f5838a";

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePageChange = (page) => {
    setActivePage(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyTicket = (event) => {
    setBookingEvent(event);
    handlePageChange('booking');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setPage={handlePageChange} />;
      case 'about':
        return <AboutPage setPage={handlePageChange} />;
      case 'curriculum':
        return <CurriculumPage setPage={handlePageChange} onBuyTicket={handleBuyTicket} />;
      case 'events':
        return <EventsPage setPage={handlePageChange} />;
      case 'faq':
        return <FAQPage setPage={handlePageChange} />;
      case 'join':
        return <JoinSection setPage={handlePageChange} />;
      case 'join_form':
        return <ApplicationPage setPage={handlePageChange} />;
      case 'booking':
        return <BookingPage event={bookingEvent} setPage={handlePageChange} />;
      default:
        return <HomePage setPage={handlePageChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-slate-200 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">

      {/* Custom Fonts & Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&family=Rajdhani:wght@500;700;900&display=swap');
        
        .font-tech { font-family: 'Rajdhani', sans-serif; }
        .font-main { font-family: 'Noto Sans TC', sans-serif; }
        
        .clip-tech-card { clip-path: polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%); }
        .clip-corner-tl { clip-path: polygon(15px 0, 100% 0, 100% 100%, 0 100%, 0 15px); }

        .glitch-wrapper { position: relative; display: inline-block; }
        .glitch-text { position: relative; color: white; letter-spacing: -0.05em; }
        .glitch-text::before, .glitch-text::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #0a0b10; }
        .glitch-text::before { left: 2px; text-shadow: -2px 0 #ff00c1; clip-path: inset(20% 0 30% 0); animation: glitch-anim-1 3s infinite linear alternate-reverse; }
        .glitch-text::after { left: -2px; text-shadow: -2px 0 #00fff9; clip-path: inset(40% 0 43% 0); animation: glitch-anim-2 2.5s infinite linear alternate-reverse; }
        @keyframes glitch-anim-1 { 0% { clip-path: inset(20% 0 30% 0); transform: translate(-2px, 1px); } 100% { clip-path: inset(30% 0 20% 0); transform: translate(1px, -1px); } }
        @keyframes glitch-anim-2 { 0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); } 100% { clip-path: inset(20% 0 40% 0); transform: translate(-2px, -1px); } }

        @keyframes text-flicker { 0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; text-shadow: 0 0 10px #06b6d4; } 20%, 24%, 55% { opacity: 0.1; text-shadow: none; } }
        .sci-fi-flicker { animation: text-flicker 4s infinite linear; color: #22d3ee; }

        .holo-label { position: relative; color: white; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.5); padding: 0.25em 1em; overflow: hidden; }
        .holo-label::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); animation: holo-scan 3s infinite ease-in-out; }
        @keyframes holo-scan { 0% { left: -100%; } 100% { left: 100%; } }

        .cyber-grid { background-image: linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px); background-size: 40px 40px; perspective: 300px; transform-style: preserve-3d; animation: cyber-move 2s linear infinite; opacity: 0.3; }
        @keyframes cyber-move { 0% { transform: perspective(300px) rotateX(60deg) translateY(0); } 100% { transform: perspective(300px) rotateX(60deg) translateY(40px); } }

        .clip-broken { clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%); }
        .clip-glitch-1 { clip-path: polygon(0 0, 100% 0, 100% 10%, 0 10%); }
        .clip-glitch-2 { clip-path: polygon(0 90%, 100% 90%, 100% 100%, 0 100%); }
        @keyframes glitch-1 { 0% { transform: translateX(0); opacity: 0; } 20% { transform: translateX(-5px); opacity: 1; } 40% { transform: translateX(5px); opacity: 0.5; } 60% { transform: translateX(-2px); opacity: 1; } 100% { transform: translateX(0); opacity: 0; } }
        @keyframes glitch-2 { 0% { transform: translateX(0); opacity: 0; } 25% { transform: translateX(5px); opacity: 1; } 50% { transform: translateX(-5px); opacity: 0.5; } 75% { transform: translateX(2px); opacity: 1; } 100% { transform: translateX(0); opacity: 0; } }
        @keyframes flicker-border { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } 20%, 80% { opacity: 0.8; } }
        @keyframes text-shake { 0% { transform: translate(0); } 25% { transform: translate(-1px, 1px); } 50% { transform: translate(1px, -1px); } 75% { transform: translate(-1px, -1px); } 100% { transform: translate(0); } }
        .animate-glitch-1 { animation: glitch-1 0.3s infinite steps(3); }
        .animate-glitch-2 { animation: glitch-2 0.4s infinite steps(3); }
        .animate-flicker-border { animation: flicker-border 0.2s infinite; }
        .animate-text-shake { animation: text-shake 0.2s infinite; }

        .footer-scan-line { position: absolute; top: 0; left: 0; height: 1px; width: 100%; background: rgba(255,255,255,0.1); overflow: hidden; }
        .footer-scan-line::after { content: ''; position: absolute; top: 0; left: -20%; width: 20%; height: 100%; background: linear-gradient(90deg, transparent, #06b6d4, transparent); animation: scan-move 4s linear infinite; }
        @keyframes scan-move { 0% { left: -20%; } 100% { left: 120%; } }

        @keyframes scan-fast { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-scan-fast { animation: scan-fast 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

        .text-stroke { -webkit-text-stroke: 2px rgba(255, 255, 255, 0.05); color: transparent; }
        .bg-grid-pattern { background-image: linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px); background-size: 50px 50px; }

        .nav-link { position: relative; color: #94a3b8; font-weight: 700; font-size: 0.875rem; padding: 0.5rem 1rem; transition: all 0.3s ease; clip-path: polygon(0 0, 100% 0, 90% 100%, 10% 100%); }
        .nav-link::before { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; background: #06b6d4; transform: scaleX(0); transform-origin: right; transition: transform 0.3s ease; }
        .nav-link:hover { color: #22d3ee; background: rgba(6, 182, 212, 0.1); }
        .nav-link:hover::before { transform: scaleX(1); transform-origin: left; }

        .mobile-menu-toggle { padding: 0.5rem; color: white; background: rgba(6, 182, 212, 0.2); border: 1px solid #06b6d4; clip-path: polygon(0 0, 100% 0, 90% 100%, 10% 100%); transition: all 0.3s ease; }
        .mobile-menu-toggle:hover { background: rgba(6, 182, 212, 0.4); box-shadow: 0 0 15px rgba(6, 182, 212, 0.6); }

        .holo-beam { background: linear-gradient(to top, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 40%, transparent 100%); clip-path: polygon(20% 100%, 80% 100%, 100% 0, 0 0); animation: beam-pulse 4s infinite ease-in-out; }
        @keyframes beam-pulse { 0%, 100% { opacity: 0.5; transform: scaleY(1); } 50% { opacity: 0.8; transform: scaleY(1.05); } }
        .text-shadow-glow { text-shadow: 0 0 10px rgba(6, 182, 212, 0.8), 0 0 20px rgba(6, 182, 212, 0.4); }

        /* --- NEW CYBERPUNK BUTTONS (REDEFINED for Navigation) --- */
        .cyber-btn {
          clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
        }
        .cyber-btn-bg { transition: all 0.3s ease; }
        .cyber-btn-primary-bg { background: linear-gradient(45deg, #06b6d4, #3b82f6); opacity: 0.8; }
        .cyber-btn-secondary-bg { background: rgba(6, 182, 212, 0.1); opacity: 0.6; }
        .cyber-btn:hover .cyber-btn-bg { opacity: 1; box-shadow: 0 0 25px rgba(6, 182, 212, 0.6); }
        .cyber-btn-border {
          border: 2px solid; clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%); transition: all 0.3s ease;
        }
        .cyber-btn-primary-border { border-color: #a5f3fc; }
        .cyber-btn-secondary-border { border-color: #06b6d4; }
        .cyber-btn:hover .cyber-btn-border { border-color: #fff; box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.5); }
        .cyber-btn-glitch {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          top: 0; left: -100%; width: 50%; height: 100%; transition: left 0.5s ease-in-out; transform: skewX(-20deg); opacity: 0.5;
        }
        .cyber-btn:hover .cyber-btn-glitch { left: 120%; animation: cyber-btn-glitch-anim 0.6s infinite linear; }
        @keyframes cyber-btn-glitch-anim {
          0% { transform: skewX(-20deg) translateX(0); } 25% { transform: skewX(-20deg) translateX(5px); } 50% { transform: skewX(-20deg) translateX(-5px); } 75% { transform: skewX(-20deg) translateX(5px); } 100% { transform: skewX(-20deg) translateX(0); }
        }
        .cyber-btn-scanline {
          background: linear-gradient(180deg, transparent, rgba(6, 182, 212, 0.3), transparent); top: -100%; left: 0; width: 100%; height: 20%; transition: top 0.5s ease-in-out; opacity: 0.3;
        }
        .cyber-btn:hover .cyber-btn-scanline { top: 120%; animation: cyber-btn-scanline-anim 1.5s infinite linear; }
        @keyframes cyber-btn-scanline-anim { 0% { top: -100%; } 100% { top: 120%; } }
        .cyber-btn-corner { clip-path: polygon(0 0, 100% 0, 0 100%); opacity: 0; transition: all 0.3s ease; }
        .cyber-btn:hover .cyber-btn-corner { opacity: 1; box-shadow: 0 0 10px currentColor; }
        .cyber-btn-corner:nth-child(6) { transform: rotate(90deg); }
        .cyber-btn-corner:nth-child(7) { transform: rotate(180deg); }
        .cyber-btn-corner:nth-child(8) { transform: rotate(270deg); }
      `}</style>

      {/* Background Layers (Global) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0b10]"></div>
        <FateWheelBackground />
        <div className="absolute inset-0 bg-grid-pattern"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay"></div>
      </div>

      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 font-main ${isScrolled ? 'py-0 bg-[#0a0b10]/90 backdrop-blur-md border-b border-cyan-900/30' : 'py-4 bg-transparent'
        }`}>
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => handlePageChange('home')}>
              <div className="relative w-12 h-12 flex items-center justify-center">

                <div className="relative w-full h-full flex items-center justify-center z-10 p-1">
                  <div className="w-10 h-10 relative">
                    <img src="/asc_logo.png" alt="ASC Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black text-white tracking-wider">AISCU</span>
                <span className="text-[10px] text-cyan-500 font-bold tracking-widest">人工智慧應用社</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {[
                { id: 'about', label: '關於我們' },
                { id: 'curriculum', label: '課程規劃' },
                { id: 'events', label: '社團活動' },
                { id: 'faq', label: '常見問答' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`nav-link ${activePage === item.id ? 'text-cyan-400' : ''}`}
                >
                  {item.label}
                </button>
              ))}
              <div className="ml-2 pl-6 border-l border-white/10 flex items-center gap-4">
                <span className="font-tech text-lg text-cyan-500">{currentTime}</span>
                <CyberButton primary onClick={() => handlePageChange('join_form')} className="px-6 py-2 text-xs">
                  未申請入社
                </CyberButton>
              </div>
            </div>

            <button className="md:hidden mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center gap-8 font-main">
          {[
            { id: 'about', label: '關於我們' },
            { id: 'curriculum', label: '課程規劃' },
            { id: 'events', label: '社團活動' },
            { id: 'faq', label: '常見問答' },
            { id: 'join', label: '加入我們' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className="text-2xl font-bold text-white hover:text-cyan-400 tracking-widest"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {renderPage()}

      <footer className="bg-[#050505] border-t border-white/10 pt-16 pb-8 font-main relative z-20">
        <div className="footer-scan-line"></div>
        <div className="container mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4 text-white font-black text-2xl">
                <img src={logoUrl} alt="AISCU Logo" className="w-10 h-10 object-contain opacity-80 mr-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                AISCU
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                人工智慧應用社<br />
                Empowering students through code and data.<br />
                致力於在校園推廣 AI 技術與實作精神。
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm tracking-wider border-l-2 border-cyan-500 pl-2">快速連結</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li onClick={() => handlePageChange('about')} className="hover:text-cyan-400 cursor-pointer transition-colors">關於我們</li>
                <li onClick={() => handlePageChange('curriculum')} className="hover:text-cyan-400 cursor-pointer transition-colors">課程規劃</li>
                <li onClick={() => handlePageChange('faq')} className="hover:text-cyan-400 cursor-pointer transition-colors">常見問答</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm tracking-wider border-l-2 border-cyan-500 pl-2">關注我們</h4>
              <div className="flex gap-4">
                {[
                  { Icon: Github, href: "#" },
                  { Icon: Instagram, href: "https://www.instagram.com/ai.scu.club/" },
                  { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61577297436819&notif_id=1763637390542900&notif_t=page_user_activity&ref=notif#" }
                ].map(({ Icon, href }, idx) => (
                  <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-cyan-600 hover:border-cyan-600 transition-all">
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 font-mono">
            <div>© 2024 AISCU. SYSTEM.ALL_RIGHTS_RESERVED</div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span>PRIVACY_PROTOCOL</span>
              <span>TERMS_OF_SERVICE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;