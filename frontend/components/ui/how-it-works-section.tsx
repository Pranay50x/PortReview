'use client';
import { motion } from 'framer-motion';
import { GitBranch, BrainCircuit, FileText, Briefcase } from 'lucide-react';
import React from 'react';

const steps = [
  {
    icon: GitBranch,
    title: 'Connect GitHub',
    description: 'Link your GitHub account to let our AI securely analyze your public repository data.',
  },
  {
    icon: BrainCircuit,
    title: 'AI-Powered Analysis',
    description: 'Our engine performs a deep-dive analysis of your code, commits, and project structure.',
  },
  {
    icon: FileText,
    title: 'Generate Portfolio',
    description: 'Receive a professionally crafted, data-driven portfolio and your unique craftsmanship score.',
  },
  {
    icon: Briefcase,
    title: 'Find Opportunities',
    description: 'Unlock access to exclusive internships and projects based on your verified skills.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
            A Clear Path to Success
          </h2>
          <p className="text-lg text-slate-400">
            From code to career opportunities in four simple steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
              className="relative p-6 text-center bg-slate-800/50 border border-slate-700/50 rounded-2xl group hover:bg-slate-800/80 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-slate-900 border-2 border-slate-700 rounded-full group-hover:border-cyan-400 transition-colors duration-300">
                <step.icon className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};