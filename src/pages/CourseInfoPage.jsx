import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Terminal, Cpu, Clock, MapPin, ChevronRight, Check, Calendar, User, Mail, Hash, Layers,
    Mic, Rocket, Brain, BookOpen, Coins, Cloud, CloudLightning, Keyboard, ShoppingBag, Trophy, Building2,
    Menu, X, ExternalLink, Image as ImageIcon, Zap, ShieldCheck, Sparkles, Layout
} from 'lucide-react';
import { courses } from '../data/courses';
import { FateWheelBackground } from '../components/FateWheelBackground';
import { CyberButton } from '../components/CyberButton';
import ascLogo from '../assets/asc_logo.png';

// Icon mapping helper
const iconMap = {
    Terminal, Cpu, Clock, MapPin, ChevronRight, Check, Calendar, User, Mail, Hash, Layers,
    Mic, Rocket, Brain, BookOpen, Coins, Cloud, CloudLightning, Keyboard, ShoppingBag, Trophy, Building2
};

// Helper: Generate Google Calendar URL
const generateGoogleCalendarUrl = (course) => {
    if (!course.fullDate || !course.time) return null;

    const title = encodeURIComponent(course.title);
    const description = encodeURIComponent(course.description || '');
    const location = encodeURIComponent(course.location || '');

    const dateStr = course.fullDate;
    const timeParts = course.time.split(' - ');

    if (timeParts.length < 2) return null;

    const startTime = timeParts[0].replace(':', '');
    const endTime = timeParts[1].replace(':', '');
    const dateFormatted = dateStr.replace(/-/g, '');

    const startDateTime = `${dateFormatted}T${startTime}00`;
    const endDateTime = `${dateFormatted}T${endTime}00`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${description}&location=${location}&ctz=Asia/Taipei`;
};

// Helper: Generate Google Maps URL
const generateGoogleMapsUrl = (location) => {
    if (!location) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
};

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80';

const CourseInfoPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    const course = courses.find(c => c.id === courseId) || courses[0];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const timer = setInterval(() => {
            const d = new Date();
            setCurrentTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
        }, 1000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(timer);
        };
    }, []);

    if (!course) return <div className="min-h-screen bg-[#06080e] text-white flex items-center justify-center">課程未找到</div>;

    const themeColor = course.color || 'cyan';
    const ThemeIcon = iconMap[course.icon] || Layers;
    const googleCalendarUrl = generateGoogleCalendarUrl(course);
    const googleMapsUrl = generateGoogleMapsUrl(course.location);

    const eventImage = (course.image && !imageError) ? course.image : PLACEHOLDER_IMAGE;
    const isPlaceholder = !course.image || imageError;

    const handleNavToHome = () => {
        navigate('/');
    };

    return (
        <div className={`min-h-screen bg-[#06080e] text-slate-300 font-sans selection:bg-${themeColor}-500/30 selection:text-${themeColor}-200 overflow-x-hidden relative`}>
            {/* Background Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[#06080e]"></div>
                <FateWheelBackground />
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                <div className={`absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-${themeColor}-900/10 rounded-full blur-[140px]`}></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay"></div>
            </div>

            {/* Navigation Bar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 font-main ${scrolled ? 'py-0 bg-[#06080e]/90 backdrop-blur-md border-b border-white/5' : 'py-4 bg-transparent'}`}>
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4 cursor-pointer group" onClick={handleNavToHome}>
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <img src={ascLogo} alt="ASC Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-lg font-black text-white tracking-wider">AISCU</span>
                                <span className="text-[9px] text-cyan-500 font-bold tracking-widest uppercase">人工智慧應用社</span>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {[
                                { id: 'about', label: '關於我們' },
                                { id: 'curriculum', label: '課程規劃' },
                                { id: 'events', label: '社團活動' },
                                { id: 'faq', label: '常見問答' }
                            ].map((item) => (
                                <button key={item.id} onClick={handleNavToHome} className="nav-link text-sm">
                                    {item.label}
                                </button>
                            ))}
                            <div className="ml-2 pl-4 border-l border-white/10 flex items-center gap-4">
                                <span className="font-tech text-base text-cyan-500">{currentTime}</span>
                                <CyberButton primary onClick={handleNavToHome} className="px-5 py-1.5 text-[11px]">
                                    申請入社
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
                <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center gap-8 font-main animate-fadeIn">
                    {[
                        { id: 'about', label: '關於我們' },
                        { id: 'curriculum', label: '課程規劃' },
                        { id: 'events', label: '社團活動' },
                        { id: 'faq', label: '常見問答' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setIsMenuOpen(false); handleNavToHome(); }}
                            className="text-2xl font-bold text-white hover:text-cyan-400 tracking-widest transition-colors"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-6 z-10">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-12 gap-10 items-center">

                        {/* Left: Title & Main Info */}
                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                            <div>
                                <div className={`inline-flex items-center gap-2 px-2 py-0.5 bg-${themeColor}-500/10 border-l-2 border-${themeColor}-500 mb-6`}>
                                    <Zap className={`w-3 h-3 text-${themeColor}-400 fill-${themeColor}-400`} />
                                    <span className={`text-[11px] font-bold text-${themeColor}-400 tracking-widest uppercase`}>
                                        {course.subtitle || course.type || '社團活動'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <h1 className="text-4xl md:text-5xl lg:text-5xl font-black leading-[1.1] tracking-tighter">
                                        {course.title.split(' ').map((word, i) => (
                                            <div key={i} className="glitch-wrapper block italic transform -skew-x-12">
                                                <span
                                                    className={`glitch-text inline-block ${i === 0
                                                        ? `text-white text-shadow-glow`
                                                        : `text-transparent bg-clip-text bg-gradient-to-r from-white via-${themeColor}-100 to-${themeColor}-400`
                                                        }`}
                                                    data-text={word}
                                                >
                                                    {word}
                                                </span>
                                            </div>
                                        ))}
                                    </h1>
                                    <div className={`h-1.5 w-24 bg-${themeColor}-500 mt-4`}></div>
                                </div>
                            </div>

                            <p className="text-lg text-slate-400 leading-relaxed font-light border-l border-white/10 pl-5 max-w-lg">
                                {course.description}
                            </p>

                            {/* Minimal Info Cards - Darker contrast */}
                            <div className="flex flex-wrap gap-3 text-sm font-sans pt-2">
                                {googleCalendarUrl ? (
                                    <a
                                        href={googleCalendarUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 bg-[#0a0f1a] border border-white/10 px-5 py-3 hover:border-cyan-500/40 transition-all group rounded-sm"
                                    >
                                        <Calendar className={`w-5 h-5 text-${themeColor}-400`} />
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-white font-bold text-base">{course.date}</span>
                                            {course.time && <span className="text-slate-500 text-xs">{course.time}</span>}
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-white transition-colors ml-1" />
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-4 bg-[#0a0f1a] border border-white/10 px-5 py-3 rounded-sm">
                                        <Calendar className={`w-5 h-5 text-${themeColor}-400`} />
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-white font-bold text-base">{course.date}</span>
                                            {course.time && <span className="text-slate-500 text-xs">{course.time}</span>}
                                        </div>
                                    </div>
                                )}

                                {googleMapsUrl ? (
                                    <a
                                        href={googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 bg-[#0a0f1a] border border-white/10 px-5 py-3 hover:border-cyan-500/40 transition-all group rounded-sm"
                                    >
                                        <MapPin className={`w-5 h-5 text-${themeColor}-400`} />
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-white font-bold text-base">{course.location || '地點待定'}</span>
                                            <span className="text-slate-600 text-[10px] uppercase font-bold">查看地圖</span>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-white transition-colors ml-1" />
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-4 bg-[#0a0f1a] border border-white/10 px-5 py-3 rounded-sm">
                                        <MapPin className={`w-5 h-5 text-${themeColor}-400`} />
                                        <span className="text-white font-bold text-base">{course.location || '地點待定'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Small Poster */}
                        <div className="lg:col-span-12 xl:col-span-4 xl:col-start-9 relative mt-8 xl:mt-0">
                            <div className="relative group max-w-[300px] mx-auto xl:ml-auto">
                                <div className={`absolute -inset-1 bg-gradient-to-br from-${themeColor}-500/20 to-transparent blur-lg opacity-40`}></div>
                                <div className="relative bg-[#0d121c] border border-white/10 overflow-hidden shadow-2xl rounded-sm">
                                    <div className="aspect-[3/4] relative overflow-hidden">
                                        <img
                                            src={eventImage}
                                            alt={course.title}
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isPlaceholder ? 'opacity-20 saturate-50' : 'opacity-100'}`}
                                            onError={() => setImageError(true)}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#06080e] via-transparent to-transparent opacity-80"></div>

                                        {!course.image && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ThemeIcon className={`w-14 h-14 text-${themeColor}-500/10`} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-4 py-3 bg-[#0a0f1a] border-t border-white/5 flex justify-between items-center text-[10px]">
                                        <span className="font-mono text-slate-600 uppercase tracking-widest leading-none">活動資訊</span>
                                        <span className={`font-bold text-${themeColor}-500 tracking-widest`}>
                                            SIGNAL_ACTIVE
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Sections */}
            <section className="py-20 px-6 relative border-t border-white/5">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-12 gap-16">

                        {/* Left Side: Course Content */}
                        <div className="lg:col-span-7 space-y-16">
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className={`w-1.5 h-7 bg-${themeColor}-500`}></div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">課程簡介</h2>
                                </div>
                                <div className="bg-[#0a0f1a] border border-white/5 p-8 rounded-sm">
                                    <p className="text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
                                        {course.longDescription || course.description}
                                    </p>
                                </div>
                            </div>

                            {course.requirements && (
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className={`w-1.5 h-7 bg-${themeColor}-500`}></div>
                                        <h2 className="text-2xl font-bold text-white tracking-tight">先備知識</h2>
                                    </div>
                                    <div className="grid gap-4">
                                        {course.requirements.map((req, idx) => (
                                            <div key={idx} className="flex items-center gap-5 p-5 bg-[#0a0f1a] border border-white/5 rounded-sm group hover:border-white/10 transition-colors">
                                                <div className={`w-2 h-2 rounded-full bg-${themeColor}-500 shadow-[0_0_8px_${themeColor === 'cyan' ? '#06b6d4' : themeColor}]`}></div>
                                                <span className="text-slate-300 text-sm font-medium">{req}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {course.agenda && (
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className={`w-1.5 h-7 bg-${themeColor}-500`}></div>
                                        <h2 className="text-2xl font-bold text-white tracking-tight">活動流程</h2>
                                    </div>
                                    <div className="space-y-6">
                                        {course.agenda.map((item, idx) => (
                                            <div key={idx} className="flex gap-6 relative group">
                                                <div className="w-20 pt-1 shrink-0">
                                                    <span className={`font-mono text-base font-bold text-${themeColor}-500 opacity-80 group-hover:opacity-100 transition-opacity`}>{item.time}</span>
                                                </div>
                                                <div className="flex-grow pb-6 border-b border-white/5">
                                                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{item.title}</h4>
                                                    <p className="text-slate-500 text-xs font-light leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Registration Module */}
                        <div className="lg:col-span-12 xl:col-span-5 relative mt-12 xl:mt-0">
                            <div className="sticky top-32">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className={`w-1.5 h-7 bg-${themeColor}-500`}></div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">線上報名</h2>
                                </div>
                                <div className="relative p-[1px] rounded-2xl overflow-hidden shadow-2xl">
                                    <div className={`absolute -inset-2 bg-${themeColor}-500/10 blur-xl opacity-20`}></div>
                                    <div className="relative bg-[#0d121c] border border-white/10 rounded-2xl overflow-hidden ring-1 ring-white/5">
                                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                        <div className="px-6 py-5 border-b border-white/10 bg-[#0a0f1a] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl bg-${themeColor}-500/10 border border-${themeColor}-500/30`}>
                                                    <ShieldCheck size={18} className={`text-${themeColor}-400`} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white tracking-widest uppercase">活動報名中心</span>
                                                    <span className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">SECURED REGISTRATION</span>
                                                </div>
                                            </div>
                                            <Sparkles size={16} className={`text-${themeColor}-400/50`} />
                                        </div>
                                        <BookingTerminal price={course.price} themeColor={themeColor} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

// --- Booking Terminal Component ---
const BookingTerminal = ({ price = { student: 150, general: 300 }, themeColor = 'cyan' }) => {
    const [step, setStep] = useState(1);
    const [ticketType, setTicketType] = useState('student');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', org: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentPrice = ticketType === 'student' ? price.student : price.general;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setStep(3);
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="p-7 font-main min-h-[440px] relative bg-[#0d121c] flex flex-col justify-between">
            {step === 1 && (
                <div className="space-y-8 animate-fadeIn flex flex-col h-full">
                    <div className="space-y-5 flex-grow">
                        <p className="text-[10px] text-slate-600 font-black px-1 uppercase tracking-[0.2em] border-l-2 border-slate-800 pl-3">身份類別</p>
                        <div className="grid gap-3">
                            {['student', 'general'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTicketType(type)}
                                    className={`w-full p-5 text-left transition-all relative rounded-xl border-2 ${ticketType === type
                                            ? `border-${themeColor}-500 bg-${themeColor}-500/5 shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)]`
                                            : 'border-white/5 bg-[#0a0f1a] hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${ticketType === type
                                                    ? `bg-${themeColor}-500 text-black border-${themeColor}-400`
                                                    : 'bg-[#151c2a] text-slate-600 border-white/5'
                                                }`}>
                                                {type === 'student' ? <User size={18} /> : <Building2 size={18} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-base font-bold leading-none mb-1 ${ticketType === type ? 'text-white' : 'text-slate-400'}`}>
                                                    {type === 'student' ? '校內學生' : '社會人士'}
                                                </span>
                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                                                    {type === 'student' ? 'Student' : 'General'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xl font-black ${ticketType === type ? `text-${themeColor}-400` : 'text-slate-800'}`}>
                                                ${type === 'student' ? price.student : price.general}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        className={`w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-sm transition-all flex items-center justify-center gap-3 rounded-xl group uppercase tracking-widest`}
                    >
                        <span>下一步</span>
                        <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 text-${themeColor}-400`} />
                    </button>
                </div>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-slate-600 font-black px-1 uppercase tracking-[0.2em] border-l-2 border-slate-800 pl-3">資料填寫</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border border-${themeColor}-500/30 text-${themeColor}-400 uppercase tracking-tighter`}>
                            {ticketType === 'student' ? '學生' : '一般'}
                        </span>
                    </div>

                    <div className="space-y-5 flex-grow">
                        <div className="relative group">
                            <label className="text-[10px] font-bold text-slate-500 mb-2 ml-1 block uppercase tracking-tighter">姓名</label>
                            <input required type="text" className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-cyan-500 transition-all placeholder:text-slate-800"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="請輸入姓名" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <label className="text-[10px] font-bold text-slate-500 mb-2 ml-1 block uppercase tracking-tighter">連絡電話</label>
                                <input required type="tel" className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-cyan-500 transition-all placeholder:text-slate-800"
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="手機號碼" />
                            </div>
                            <div className="relative group">
                                <label className="text-[10px] font-bold text-slate-500 mb-2 ml-1 block uppercase tracking-tighter">電子郵件</label>
                                <input required type="email" className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-cyan-500 transition-all placeholder:text-slate-800"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
                            </div>
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] font-bold text-slate-500 mb-2 ml-1 block uppercase tracking-tighter">系級 / 服務單位</label>
                            <input required type="text" className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-cyan-500 transition-all placeholder:text-slate-800"
                                value={formData.org} onChange={e => setFormData({ ...formData, org: e.target.value })} placeholder="例：資管二甲" />
                        </div>
                    </div>

                    <div className="pt-2 flex items-center gap-4">
                        <button type="button" onClick={() => setStep(1)} className="px-5 py-4 text-xs font-bold text-slate-600 hover:text-white transition-colors">返回</button>
                        <button type="submit" disabled={isSubmitting} className={`flex-grow py-4 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-black font-black text-sm transition-all rounded-xl shadow-lg disabled:opacity-50`}>
                            {isSubmitting ? '處理中...' : `確認支付 NT$${currentPrice}`}
                        </button>
                    </div>
                </form>
            )}

            {step === 3 && (
                <div className="flex flex-col items-center justify-center text-center space-y-7 animate-fadeIn py-16 flex-grow">
                    <div className="relative">
                        <div className={`absolute -inset-4 bg-${themeColor}-500/20 blur-xl rounded-full animate-pulse`}></div>
                        <div className={`w-24 h-24 rounded-full border-2 border-${themeColor}-500 flex items-center justify-center bg-[#0a0f1a] relative`}>
                            <Check className={`w-12 h-12 text-${themeColor}-400`} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">完成報名</h3>
                        <p className="text-sm text-slate-400 font-medium px-4 leading-relaxed">
                            報名成功！憑證已寄送至信箱，活動當天請出示手機電子票券。
                        </p>
                    </div>
                    <button onClick={() => { setStep(1); setFormData({ name: '', email: '', phone: '', org: '' }); }}
                        className={`text-xs font-bold text-${themeColor}-400 hover:text-white transition-all underline underline-offset-8 decoration-white/10 hover:decoration-current pt-8`}>
                        重新報名
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourseInfoPage;
