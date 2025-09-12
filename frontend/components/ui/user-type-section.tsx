"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { AnimatedButton } from './animated-button';
import { 
  Search, 
  Palette, 
  BarChart3, 
  Rocket, 
  Users, 
  Bot, 
  MessageSquare,
  Target,
  Code,
  Filter
} from 'lucide-react';
import Link from 'next/link';

const developerFeatures = [
  { icon: Search, title: 'AI Profile Analysis', desc: 'Deep GitHub & resume insights' },
  { icon: Palette, title: 'Auto Portfolio', desc: 'AI-generated showcase' },
  { icon: BarChart3, title: 'Craftsmanship Score', desc: 'Quantified code quality' },
  { icon: Rocket, title: 'Professional Bio', desc: 'AI-written descriptions' },
];

const recruiterFeatures = [
  { icon: Users, title: 'Candidate Dashboard', desc: 'Holistic developer view' },
  { icon: Bot, title: 'AI Summaries', desc: 'Instant candidate insights' },
  { icon: MessageSquare, title: 'Smart Questions', desc: 'Contextual interviews' },
  { icon: Filter, title: 'Advanced Search', desc: 'Nuanced candidate filtering' },
];

export const UserTypeSection: React.FC = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <section id="solutions" className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 to-slate-900/30" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Built for Everyone
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Whether you're a developer looking to showcase your skills or a recruiter seeking top talent,
            we've got you covered.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Developers Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <Card className="group relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-500 h-full">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10 text-center pb-6">
                <motion.div
                  className="mb-4 flex justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Code className="w-16 h-16 text-cyan-400" />
                </motion.div>
                <CardTitle className="text-3xl font-bold text-cyan-400 mb-3">
                  For Developers
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Connect your GitHub and resume for AI-powered portfolio generation with craftsmanship scoring
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {developerFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30 hover:bg-slate-700/50 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-2">
                        <feature.icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="font-semibold text-cyan-300 text-sm">{feature.title}</div>
                      <div className="text-slate-400 text-xs">{feature.desc}</div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="pt-4">
                  <AnimatedButton
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-4 text-lg font-semibold"
                    asChild
                  >
                    <Link href="/auth/login">
                      <Rocket className="w-5 h-5 mr-2" />
                      Create My Portfolio
                    </Link>
                  </AnimatedButton>
                </div>
              </CardContent>

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Card>
          </motion.div>

          {/* Recruiters Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
          >
            <Card className="group relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-500 h-full">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10 text-center pb-6">
                <motion.div
                  className="mb-4 flex justify-center"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Target className="w-16 h-16 text-emerald-400" />
                </motion.div>
                <CardTitle className="text-3xl font-bold text-emerald-400 mb-3">
                  For Recruiters
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Access holistic candidate views with AI summaries, craftsmanship scores, and contextual interview questions
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {recruiterFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30 hover:bg-slate-700/50 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-2">
                        <feature.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="font-semibold text-emerald-300 text-sm">{feature.title}</div>
                      <div className="text-slate-400 text-xs">{feature.desc}</div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="pt-4">
                  <AnimatedButton
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 text-lg font-semibold"
                    asChild
                  >
                    <Link href="/auth/login">
                      <Search className="w-5 h-5 mr-2" />
                      Start Smart Recruiting
                    </Link>
                  </AnimatedButton>
                </div>
              </CardContent>

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
