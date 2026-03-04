import React from "react";

const Logo = ({ className = "h-8 w-auto", showText = true }) => {
  return (
    <div
      className={`flex items-center gap-3 group cursor-pointer ${className}`}
    >
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full opacity-0 group-hover:opacity-40 blur transition-opacity duration-500"></div>

        <svg
          viewBox="0 0 100 100"
          className="relative h-10 w-10 drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="prism-grad-main"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>

            <linearGradient id="prism-grad-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>

            <filter
              id="logo-shadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="2" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Premium Prism Glass Heart */}
          <g transform="translate(5, 5) scale(0.9)">
            {/* Main Heart Base with breathing animation */}
            <path 
              d="M50 90 C20 65 5 45 5 25 C5 10 20 5 35 15 C42 20 47 28 50 35 C53 28 58 20 65 15 C80 5 95 10 95 25 C95 45 80 65 50 90 Z" 
              fill="url(#prism-grad-main)"
              className="drop-shadow-xl"
            >
              <animate 
                attributeName="opacity" 
                values="0.9;1;0.9" 
                dur="3s" 
                repeatCount="indefinite" 
              />
              <animateTransform 
                attributeName="transform" 
                type="scale" 
                values="1;1.02;1" 
                dur="3s" 
                repeatCount="indefinite" 
                additive="sum"
                transform-origin="center"
              />
            </path>

            {/* Glass Facet Overlay with shimmer effect */}
            <path 
              d="M50 35 C53 28 58 20 65 15 C80 5 95 10 95 25 C95 40 85 55 70 68 L50 35 Z" 
              fill="url(#prism-grad-highlight)" 
              opacity="0.3"
            >
               <animate 
                attributeName="opacity" 
                values="0.2;0.4;0.2" 
                dur="4s" 
                repeatCount="indefinite" 
              />
            </path>

            {/* Moving Inner Glow */}
            <circle cx="35" cy="30" r="10" fill="white" opacity="0.2">
              <animate 
                attributeName="cx" 
                values="32;38;32" 
                dur="5s" 
                repeatCount="indefinite" 
              />
              <animate 
                attributeName="cy" 
                values="28;32;28" 
                dur="5s" 
                repeatCount="indefinite" 
              />
            </circle>

            {/* Subtle Orbiting Sparkles (for that extra premium touch) */}
            <circle r="2" fill="white">
              <animateMotion 
                dur="6s" 
                repeatCount="indefinite" 
                path="M50 90 C20 65 5 45 5 25 C5 10 20 5 35 15 C42 20 47 28 50 35 C53 28 58 20 65 15 C80 5 95 10 95 25 C95 45 80 65 50 90 Z"
              />
              <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>

      {showText && (
        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-[length:200%_auto] bg-clip-text text-transparent group-hover:animate-[gradient_3s_linear_infinite]">
          Couplify
        </span>
      )}
    </div>
  );
};

export default Logo;
