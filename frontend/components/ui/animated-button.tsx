"use client";

import React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  shimmer?: boolean;
  glow?: boolean;
  pulse?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  shimmer = false,
  glow = false,
  pulse = false,
  asChild = false,
  ...props
}) => {
  // If asChild is true, we need to handle the structure differently
  if (asChild) {
    return (
      <Button
        className={cn(
          'relative overflow-hidden transition-all duration-300 transform hover:scale-105',
          shimmer && 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800',
          glow && 'shadow-lg hover:shadow-xl hover:shadow-blue-500/25',
          pulse && 'animate-pulse',
          'group',
          className
        )}
        asChild
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      className={cn(
        'relative overflow-hidden transition-all duration-300 transform hover:scale-105',
        shimmer && 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800',
        glow && 'shadow-lg hover:shadow-xl hover:shadow-blue-500/25',
        pulse && 'animate-pulse',
        'group',
        className
      )}
      {...props}
    >
      {shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}
      <span className="relative z-10">{children}</span>
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </Button>
  );
};
