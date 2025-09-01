"use client";

import React from 'react';

export const AnimatedGridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-20 grid-pattern" />
      
      {/* Smaller grid overlay */}
      <div className="absolute inset-0 opacity-10 grid-pattern-small" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse animate-delay-1" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-cyan-400/20 rotate-45 animate-float" />
      <div className="absolute top-40 right-32 w-3 h-3 bg-teal-400/20 rounded-full animate-float animate-delay-1" />
      <div className="absolute bottom-32 left-32 w-5 h-5 bg-sky-400/20 rotate-12 animate-float animate-delay-2" />
      <div className="absolute bottom-20 right-20 w-2 h-2 bg-cyan-300/30 rounded-full animate-float animate-delay-3" />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient opacity-50" />
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-soft-light bg-dot-pattern" />
    </div>
  );
};
