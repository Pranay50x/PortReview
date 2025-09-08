"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from './animated-button';
import { Menu, X, ChevronDown, Sparkles, Code, Target, Users, BarChart3, BrainCircuit } from 'lucide-react';

export const ProfessionalNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuresDropdown = [
    { icon: BrainCircuit, label: 'AI Profile Analysis', href: '#features' },
    { icon: BarChart3, label: 'Craftsmanship Score', href: '#features' },
    { icon: Users, label: 'Candidate Dashboard', href: '#features' },
    { icon: Target, label: 'Smart Recruiting', href: '#features' },
  ];

  // UPDATED: Removed the "Technology" link
  const navItems = [
    { href: '#features', label: 'Features', hasDropdown: true },
    { href: '#solutions', label: 'Solutions' },
    { href: '#how-it-works', label: 'How It Works' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/30 shadow-2xl shadow-cyan-500/5'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-teal-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                PortReviewer
              </span>
              <span className="text-xs text-slate-400 -mt-1 group-hover:text-cyan-400 transition-colors duration-300">
                AI-Powered Recruiting
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <div key={item.href} className="relative">
                {item.hasDropdown ? (
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center space-x-1 px-4 py-2 text-slate-300 hover:text-white transition-colors duration-300 rounded-lg hover:bg-slate-800/30"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </Link>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          className="absolute top-full left-0 mt-2 w-72 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2">
                            {featuresDropdown.map((feature, idx) => (
                              <Link
                                key={idx}
                                href={feature.href}
                                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 group"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-lg group-hover:from-cyan-500/30 group-hover:to-teal-500/30 transition-colors duration-200">
                                  <feature.icon className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors duration-200">
                                  {feature.label}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors duration-300 rounded-lg hover:bg-slate-800/30 relative group"
                  >
                    {item.label}
                    <span className="absolute inset-x-2 -bottom-1 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <AnimatedButton variant="ghost" className="text-slate-300 hover:text-white" asChild>
              <Link href="/auth/login">Sign In</Link>
            </AnimatedButton>
            <AnimatedButton className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white" asChild>
              <Link href="/auth/login">Get Started</Link>
            </AnimatedButton>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 text-slate-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="py-6 space-y-2 border-t border-slate-700/30">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-3 px-4 text-slate-300 hover:bg-slate-800/50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-6 space-y-3">
                  <AnimatedButton variant="ghost" className="w-full" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </AnimatedButton>
                  <AnimatedButton className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white" asChild>
                    <Link href="/auth/login">Get Started</Link>
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};