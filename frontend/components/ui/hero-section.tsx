"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedButton } from './animated-button';
import { Rocket, Code, Target } from 'lucide-react';
import Link from 'next/link';

export const HeroSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 to-teal-500/5 rounded-full blur-3xl animate-spin slow-spin" />
      </div>

      <motion.div
        className="relative z-10 container mx-auto px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="inline-flex items-center px-4 py-2 mb-8 text-sm font-medium bg-slate-800/50 border border-slate-700/50 rounded-full backdrop-blur-sm"
          variants={itemVariants}
        >
          <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" />
          <Rocket className="w-4 h-4 mr-2 text-cyan-400" />
          Revolutionizing Technical Recruiting
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Beyond Traditional
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-sky-400 bg-clip-text text-transparent">
            Resumes
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          PortReviewer analyzes GitHub profiles and resumes with{' '}
          <span className="text-cyan-400 font-semibold">AI-powered insights</span>{' '}
          to generate professional portfolios and provide{' '}
          <span className="text-teal-400 font-semibold">data-driven candidate assessments</span> for recruiters.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          variants={itemVariants}
        >
          <AnimatedButton
            size="lg"
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold min-w-[200px]"
            asChild
          >
            <Link href="/auth/login?type=developer">
              <Code className="w-5 h-5 mr-2" />
              Create Portfolio
            </Link>
          </AnimatedButton>

          <AnimatedButton
            size="lg"
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-800/50 px-8 py-4 text-lg font-semibold min-w-[200px]"
            asChild
          >
            <Link href="/auth/login?type=recruiter">
              <Target className="w-5 h-5 mr-2" />
              Start Recruiting
            </Link>
          </AnimatedButton>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          {[
            { number: '5K+', label: 'Portfolios Generated', color: 'text-cyan-400' },
            { number: '200+', label: 'Companies', color: 'text-emerald-400' },
            { number: '50K+', label: 'GitHub Analyses', color: 'text-teal-400' },
            { number: '92%', label: 'Hiring Success', color: 'text-sky-400' },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                {stat.number}
              </div>
              <div className="text-slate-400 text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
