'use client'

import { useState } from 'react'
import { recruitmentAI } from '@/lib/ai-agents'

export default function TestAIPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testCandidateAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const analysis = await recruitmentAI.analyzeCandidateProfile({
        githubUsername: 'jordan-rivera',
        resumeText: 'Full-stack developer with 3 years of experience'
      })
      setResult(analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testTalentInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const insights = await recruitmentAI.generateTalentPoolInsights({
        skills: ['React', 'TypeScript', 'Node.js'],
        experience: '3-5 years',
        location: 'San Francisco',
        role: 'Frontend Developer'
      })
      setResult(insights)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testJobDescription = async () => {
    setLoading(true)
    setError(null)
    try {
      const jobDesc = await recruitmentAI.generateJobDescription({
        role: 'Senior Frontend Developer',
        skills: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
        experience: '5+ years',
        company: 'TechCorp',
        location: 'Remote'
      })
      setResult(jobDesc)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Integration Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testCandidateAnalysis}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Candidate Analysis'}
          </button>
          
          <button
            onClick={testTalentInsights}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Talent Insights'}
          </button>
          
          <button
            onClick={testJobDescription}
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Job Description'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
