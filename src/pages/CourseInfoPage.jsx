import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Terminal, Cpu, Clock, MapPin, ChevronRight, Check, Calendar, User, Mail, Hash, Layers,
    Mic, Rocket, Brain, BookOpen, Coins, Cloud, CloudLightning, Keyboard, ShoppingBag, Trophy, Building2,
    ArrowLeft
} from 'lucide-react';
import { courses } from '../data/courses';

import { FateWheelBackground } from '../components/FateWheelBackground';

// Icon mapping helper
const iconMap = {
    Terminal, Cpu, Clock, MapPin, ChevronRight, Check, Calendar, User, Mail, Hash, Layers,
    Mic, Rocket, Brain, BookOpen, Coins, Cloud, CloudLightning, Keyboard, ShoppingBag, Trophy, Building2
};

const CourseInfoPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    // Find course data
    const course = courses.find(c => c.id === courseId) || courses[0]; // Fallback to first course or handle 404

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!course) return <div className="min-h-screen bg-[#050b14] text-white flex items-center justify-center">Course Not Found</div>;

    return (
        <div className="min-h-screen bg-[#0a0b10] text-slate-300 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative">
            {/* Background Layers (Global) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[#0a0b10]"></div>
                <FateWheelBackground />
                <div className="absolute inset-0 bg-grid-pattern"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay"></div>
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/5 ${scrolled ? 'bg-[#050b14]/90 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500 flex items-center justify-center relative group">
                            <ArrowLeft className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400" />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tighter">AISCU</h1>
                            <p className="text-[10px] text-cyan-500 font-mono tracking-widest">WORKSHOP_EVENT</p>
                        </div>
                    </div>
                    <div className="flex gap-6 text-sm font-mono text-cyan-200/70">
                        <a href="#info" className="hover:text-cyan-400 transition-colors hidden md:block"><span className="text-cyan-500/40 mr-1">//</span>INFO</a>
                        <a href="#agenda" className="hover:text-cyan-400 transition-colors hidden md:block"><span className="text-cyan-500/40 mr-1">//</span>AGENDA</a>
                        <a href="#register" className="px-4 py-1 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
                            REGISTER_NOW
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-6 z-10">
                <div className="container mx-auto text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-mono mb-6">
                        <span className={`w-2 h-2 rounded-full ${course.status === 'OPEN FOR REGISTRATION' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                        EVENT STATUS: {course.status || 'UPCOMING'}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                        {course.subtitle || 'WORKSHOP'}: <br />
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${course.color || 'cyan'}-400 to-white`}>
                            {course.title}
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 font-light">
                        {course.description}
                    </p>

                    <div className="flex justify-center gap-4 text-sm font-mono text-cyan-300/80">
                        <div className="flex items-center gap-2 bg-[#0a1120] border border-slate-800 px-4 py-2 rounded">
                            <Calendar className="w-4 h-4" /> {course.date}
                        </div>
                        {course.time && (
                            <div className="flex items-center gap-2 bg-[#0a1120] border border-slate-800 px-4 py-2 rounded">
                                <Clock className="w-4 h-4" /> {course.time}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Workshop Info Section */}
            <section id="info" className="py-12 px-6 relative">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-12 gap-12 bg-[#0a1120]/50 border border-slate-800 p-1 md:p-8 rounded-xl backdrop-blur-sm">

                        {/* Left: Image / Visual Area */}
                        <div className="md:col-span-5 relative group min-h-[300px]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            {/* Placeholder for Event Image */}
                            <div className="w-full h-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)'
                                }}></div>
                                {(() => {
                                    const Icon = iconMap[course.icon] || Layers;
                                    return <Icon className="w-24 h-24 text-slate-700 mb-4 group-hover:text-cyan-500/50 transition-colors duration-500" />;
                                })()}
                                <div className="text-center z-10">
                                    <span className="text-xs font-mono text-cyan-500 border border-cyan-500/30 px-2 py-1 mb-2 inline-block">SESSION_VISUAL</span>
                                    <p className="text-slate-500 text-sm mt-2">[ 課程宣傳圖 / 海報區域 ]</p>
                                </div>
                                {/* Corner Decorations */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50" />
                            </div>
                        </div>

                        {/* Right: Info & Location */}
                        <div className="md:col-span-7 space-y-8 py-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                                    <Terminal className="text-cyan-500" /> 課程資訊
                                </h2>
                                <p className="text-slate-400 leading-relaxed">
                                    {course.longDescription || course.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-cyan-400 font-mono text-sm border-b border-slate-800 pb-2 mb-3">/// TIME_LOCALE</h3>
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-slate-500 mt-1" />
                                        <div>
                                            <div className="text-white font-bold">{course.date}</div>
                                            <div className="text-slate-500 text-sm">{course.time ? `準時開始: ${course.time.split(' - ')[0]}` : '時間待定'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-slate-500 mt-1" />
                                        <div>
                                            <div className="text-white font-bold">{course.location || '地點待定'}</div>
                                            <div className="text-slate-500 text-sm">{course.locationNote || '國立範例大學校區'}</div>
                                        </div>
                                    </div>
                                </div>

                                {course.requirements && (
                                    <div className="space-y-4">
                                        <h3 className="text-cyan-400 font-mono text-sm border-b border-slate-800 pb-2 mb-3">/// REQUIREMENTS</h3>
                                        <ul className="space-y-2 text-sm text-slate-400">
                                            {course.requirements.map((req, idx) => (
                                                <li key={idx} className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> {req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agenda Section */}
            {course.agenda && (
                <section id="agenda" className="py-12 px-6">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-cyan-500 pl-4">當日流程</h2>
                        <div className="space-y-0 relative border-l border-slate-800 ml-3">
                            {course.agenda.map((item, idx) => (
                                <AgendaItem key={idx} time={item.time} title={item.title} desc={item.desc} active={item.active} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Booking/Terminal Section */}
            <section id="register" className="py-20 px-6 relative overflow-hidden bg-gradient-to-b from-transparent to-[#02060a]">
                <div className="container mx-auto max-w-3xl">
                    <BookingTerminal price={course.price} />
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#02060a] border-t border-slate-800 py-8 px-6 font-mono text-xs text-center">
                <div className="text-slate-500">
                    AISCU WORKSHOP SYSTEM © 2024. ALL RIGHTS RESERVED.
                </div>
            </footer>
        </div>
    );
};

// --- Sub Components ---

const AgendaItem = ({ time, title, desc, active }) => (
    <div className="relative pl-8 pb-8 group">
        {/* Timeline Dot */}
        <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 ${active ? 'bg-cyan-500 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'bg-[#050b14] border-slate-600 group-hover:border-cyan-500'} transition-colors`} />

        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
            <span className="font-mono text-cyan-500 font-bold text-lg">{time}</span>
            <h3 className={`text-lg font-bold ${active ? 'text-white' : 'text-slate-300'}`}>{title}</h3>
        </div>
        <p className="text-slate-500 text-sm">{desc}</p>
    </div>
);

const BookingTerminal = ({ price = { student: 150, general: 300 } }) => {
    const [step, setStep] = useState(1);
    const [ticketType, setTicketType] = useState('student');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', org: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentPrice = ticketType === 'student' ? price.student : price.general;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setStep(3);
            setIsSubmitting(false);
        }, 2000);
    };

    return (
        <div className="w-full bg-[#0d1526] border border-cyan-500/30 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            {/* Terminal Header */}
            <div className="bg-[#1e293b] px-4 py-2 flex items-center justify-between border-b border-slate-700">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-xs font-mono text-slate-400">guest@aiscu-event:~/registration</div>
            </div>

            {/* Terminal Content */}
            <div className="p-8 min-h-[450px] font-mono relative">
                {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-cyan-500 mb-6">
                            {'>'} EXECUTE REGISTRATION_SCRIPT<br />
                            {'>'} SELECT TICKET_CATEGORY...
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setTicketType('student')}
                                className={`p-5 border text-left transition-all relative ${ticketType === 'student' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 text-slate-500 hover:border-slate-500'}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold">學生票 (Student)</span>
                                    {ticketType === 'student' && <Check className="w-4 h-4 text-cyan-500" />}
                                </div>
                                <div className="text-xl font-bold mb-1 text-white">NT$ {price.student}</div>
                                <div className="text-xs opacity-70">需驗證學生證件</div>
                            </button>

                            <button
                                onClick={() => setTicketType('general')}
                                className={`p-5 border text-left transition-all relative ${ticketType === 'general' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 text-slate-500 hover:border-slate-500'}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold">一般票 (General)</span>
                                    {ticketType === 'general' && <Check className="w-4 h-4 text-cyan-500" />}
                                </div>
                                <div className="text-xl font-bold mb-1 text-white">NT$ {price.general}</div>
                                <div className="text-xs opacity-70">校外人士/已畢業校友</div>
                            </button>
                        </div>

                        <div className="bg-slate-800/50 p-4 text-xs text-slate-400 border-l-2 border-yellow-500 mt-4">
                            注意：本次課程名額限制 40 人，將依報名順序錄取。
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="mt-8 px-6 py-3 w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-black font-bold flex items-center justify-center gap-2 transition-colors ml-auto"
                        >
                            NEXT_STEP <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto animate-fadeIn">
                        <div className="text-cyan-500 mb-2">
                            {'>'} INPUT PARTICIPANT DATA...
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1 group">
                                <label className="text-[10px] text-cyan-500/70 mb-1 block tracking-wider">NAME</label>
                                <div className="flex items-center border-b border-slate-700 focus-within:border-cyan-500 transition-colors">
                                    <User className="w-4 h-4 text-slate-500 mr-2" />
                                    <input required type="text" className="w-full bg-transparent text-white py-2 outline-none placeholder-slate-600" placeholder="王小明"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                            </div>

                            <div className="col-span-2 md:col-span-1 group">
                                <label className="text-[10px] text-cyan-500/70 mb-1 block tracking-wider">PHONE</label>
                                <div className="flex items-center border-b border-slate-700 focus-within:border-cyan-500 transition-colors">
                                    <Hash className="w-4 h-4 text-slate-500 mr-2" />
                                    <input required type="tel" className="w-full bg-transparent text-white py-2 outline-none placeholder-slate-600" placeholder="0912-345-678"
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="col-span-2 group">
                                <label className="text-[10px] text-cyan-500/70 mb-1 block tracking-wider">EMAIL</label>
                                <div className="flex items-center border-b border-slate-700 focus-within:border-cyan-500 transition-colors">
                                    <Mail className="w-4 h-4 text-slate-500 mr-2" />
                                    <input required type="email" className="w-full bg-transparent text-white py-2 outline-none placeholder-slate-600" placeholder="student@university.edu.tw"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>

                            <div className="col-span-2 group">
                                <label className="text-[10px] text-cyan-500/70 mb-1 block tracking-wider">DEPARTMENT / ORGANIZATION</label>
                                <div className="flex items-center border-b border-slate-700 focus-within:border-cyan-500 transition-colors">
                                    <input required type="text" className="w-full bg-transparent text-white py-2 outline-none placeholder-slate-600" placeholder="資工系三年級 / XX 科技公司"
                                        value={formData.org} onChange={e => setFormData({ ...formData, org: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 mt-2">
                            <button type="button" onClick={() => setStep(1)} className="text-slate-500 hover:text-white text-sm">
                                &lt; BACK
                            </button>
                            <div className="text-right">
                                <span className="text-xs text-slate-500 block">PAYMENT DUE</span>
                                <span className="text-xl font-bold text-cyan-400">NT$ {currentPrice}</span>
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold transition-colors flex justify-center items-center gap-2 mt-4">
                            {isSubmitting ? 'UPLOADING...' : 'CONFIRM & SUBMIT'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn py-8">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">REGISTRATION SUCCESSFUL</h3>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                報名資料已傳送至伺服器。確認信件將在 5 分鐘內寄送至您的信箱。
                            </p>
                        </div>

                        <div className="w-full max-w-sm bg-black/40 border border-slate-800 p-4 font-mono text-xs text-left space-y-2">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">REF_ID:</span>
                                <span className="text-cyan-400">#{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <span className="text-slate-500">EVENT:</span> <span className="text-white">GenAI Workshop</span>
                                <span className="text-slate-500">DATE:</span> <span className="text-white">2024.12.15</span>
                                <span className="text-slate-500">ATTENDEE:</span> <span className="text-white">{formData.name}</span>
                            </div>
                        </div>

                        <button onClick={() => { setStep(1); setFormData({ name: '', email: '', phone: '', org: '' }); }} className="text-cyan-500 hover:text-cyan-300 text-sm hover:underline">
                            Register Another Person
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseInfoPage;
