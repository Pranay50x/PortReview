'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Chrome, Code, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginChooser() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Portal</h1>
          <p className="text-xl text-slate-300">Select your account type to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Developer Card */}
          <Card className="group bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-600/20 rounded-full group-hover:bg-blue-600/30 transition-colors">
                  <Code className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">I'm a Developer</CardTitle>
              <CardDescription className="text-slate-300">
                Showcase your GitHub projects and generate AI-powered portfolios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <span>GitHub integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Auto-portfolio generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>AI code analysis</span>
                </div>
              </div>
              <Button 
                asChild
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/auth/developer/login">
                  <Github className="w-4 h-4 mr-2" />
                  Sign in with GitHub
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recruiter Card */}
          <Card className="group bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 cursor-pointer">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-600/20 rounded-full group-hover:bg-green-600/30 transition-colors">
                  <Search className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">I'm a Recruiter</CardTitle>
              <CardDescription className="text-slate-300">
                Find and assess developers with AI-powered insights and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Chrome className="w-4 h-4" />
                  <span>Google OAuth login</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Advanced candidate search</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>AI-powered assessments</span>
                </div>
              </div>
              <Button 
                asChild
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Link href="/auth/recruiter/login">
                  <Chrome className="w-4 h-4 mr-2" />
                  Sign in with Google
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
