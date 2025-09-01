"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const ProfessionalFooter: React.FC = () => {
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API', href: '#api' },
      { name: 'Documentation', href: '#docs' },
    ],
    Company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
    ],
    Resources: [
      { name: 'Help Center', href: '#help' },
      { name: 'Privacy', href: '#privacy' },
      { name: 'Terms', href: '#terms' },
      { name: 'Status', href: '#status' },
    ],
  };

  return (
    <footer className="relative bg-slate-900/80 border-t border-slate-700/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center space-x-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                PortReviewer
              </span>
            </motion.div>
            
            <motion.p
              className="text-slate-400 mb-6 max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Revolutionizing technical recruiting through AI-powered code analysis 
              and intelligent developer portfolios.
            </motion.p>
            
            <motion.div
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {['GitHub', 'Twitter', 'LinkedIn', 'Discord'].map((social, index) => (
                <motion.a
                  key={social}
                  href={`#${social.toLowerCase()}`}
                  className="w-10 h-10 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-lg">
                    {social === 'GitHub' && '🐙'}
                    {social === 'Twitter' && '🐦'}
                    {social === 'LinkedIn' && '💼'}
                    {social === 'Discord' && '💬'}
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (categoryIndex + 1) }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * linkIndex }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors duration-300 relative group"
                    >
                      {link.name}
                      <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-slate-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            © 2025 PortReviewer. All rights reserved. Built with ❤️ for developers.
          </p>
          
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>All systems operational</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
    </footer>
  );
};
