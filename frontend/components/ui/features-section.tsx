"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

const features = [
  {
    icon: '🔍',
    title: 'AI-Powered Profile Analysis',
    description: 'Connects to GitHub and resume to perform comprehensive analysis of technical skills, most active languages, and project quality.',
    gradient: 'from-cyan-500/20 to-teal-500/20',
    glowColor: 'shadow-cyan-500/25',
  },
  {
    icon: '🎨',
    title: 'Automated Portfolio Generation',
    description: 'AI generates complete, customizable, professionally designed portfolio websites with AI-written descriptions and bios.',
    gradient: 'from-teal-500/20 to-emerald-500/20',
    glowColor: 'shadow-teal-500/25',
  },
  {
    icon: '📊',
    title: 'Code Craftsmanship Score',
    description: 'Quantifiable score based on code quality, documentation, testing practices, and project structure analysis.',
    gradient: 'from-sky-500/20 to-cyan-500/20',
    glowColor: 'shadow-sky-500/25',
  },
  {
    icon: '�',
    title: 'Holistic Candidate Dashboard',
    description: 'Centralized view combining resume data with in-depth GitHub analysis, showing what candidates have actually built.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    glowColor: 'shadow-emerald-500/25',
  },
  {
    icon: '🤖',
    title: 'AI Candidate Summary',
    description: 'Concise AI-generated summaries highlighting core strengths, impressive projects, and potential red flags.',
    gradient: 'from-teal-500/20 to-cyan-500/20',
    glowColor: 'shadow-teal-500/25',
  },
  {
    icon: '❓',
    title: 'Contextual Interview Questions',
    description: 'AI creates personalized technical interview questions based on specific projects and code, not generic algorithms.',
    gradient: 'from-cyan-500/20 to-sky-500/20',
    glowColor: 'shadow-cyan-500/25',
  },
];

export const FeaturesSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-800/50" />
      
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
              Powerful Features for
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Modern Recruiting
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Discover how our cutting-edge platform transforms the way developers showcase their skills
            and how companies find their next great hire.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className={`group relative overflow-hidden border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-500 hover:scale-105 hover:${feature.glowColor} hover:shadow-xl`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-700/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-white group-hover:text-cyan-200 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
