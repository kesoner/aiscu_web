import React from 'react';

export const FateWheelBackground = () => (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 select-none">
        <svg
            viewBox="0 0 1000 1000"
            className="w-[150vmin] h-[150vmin] md:w-[120vmin] md:h-[120vmin] opacity-20 animate-[spin_60s_linear_infinite]"
        >
            <defs>
                <linearGradient id="wheel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
            </defs>

            <circle
                cx="500"
                cy="500"
                r="450"
                fill="none"
                stroke="url(#wheel-gradient)"
                strokeWidth="6"
                strokeDasharray="40 20"
                opacity="0.6"
            />

            <g className="animate-[spin_40s_linear_infinite_reverse]" style={{ transformOrigin: '500px 500px' }}>
                <circle cx="500" cy="500" r="350" fill="none" stroke="#0891b2" strokeWidth="4" opacity="0.4" />
                {[...Array(8)].map((_, i) => (
                    <rect
                        key={i}
                        x="492"
                        y="140"
                        width="16"
                        height="40"
                        fill="#06b6d4"
                        transform={`rotate(${i * 45} 500 500)`}
                    />
                ))}
            </g>

            <g className="animate-[spin_20s_linear_infinite]" style={{ transformOrigin: '500px 500px' }}>
                <circle cx="500" cy="500" r="250" fill="none" stroke="#22d3ee" strokeWidth="12" strokeDasharray="100 250" opacity="0.7" />
                <circle cx="500" cy="500" r="230" fill="none" stroke="#fff" strokeWidth="2" opacity="0.2" />
                <path
                    d="M 500 250 L 500 320 M 500 680 L 500 750 M 250 500 L 320 500 M 680 500 L 750 500"
                    stroke="#06b6d4"
                    strokeWidth="8"
                />
            </g>

            <circle cx="500" cy="500" r="100" fill="none" stroke="#06b6d4" strokeWidth="4" opacity="0.5" />
            <circle
                cx="500"
                cy="500"
                r="60"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeDasharray="20 40"
                opacity="0.3"
                className="animate-pulse"
            />
        </svg>
    </div>
);
