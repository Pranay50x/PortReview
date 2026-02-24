import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Portfolio } from '@/types';
import { FolderOpen, GitCommit, CheckCircle } from 'lucide-react';

interface PortfolioCardProps {
  portfolio: Portfolio;
  showActions?: boolean;
}

export default function PortfolioCard({ portfolio, showActions = true }: PortfolioCardProps) {
  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 text-white group-hover:text-cyan-400 transition-colors">
              {portfolio.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-slate-300">
              {portfolio.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2 bg-cyan-900/50 text-cyan-300 border-cyan-700/50">
            {portfolio.aiInsights.codeQualityScore}/100
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {portfolio.skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
              {skill.name}
              {skill.verified && <CheckCircle className="ml-1 w-3 h-3 text-green-400" />}
            </Badge>
          ))}
          {portfolio.skills.length > 3 && (
            <span className="text-sm text-slate-400">
              +{portfolio.skills.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <FolderOpen className="w-4 h-4" />
              {portfolio.projects.length} projects
            </span>
            <span className="flex items-center gap-1">
              <GitCommit className="w-4 h-4" />
              {portfolio.githubStats.totalCommits} commits
            </span>
          </div>
          <span className="text-xs">
            {new Date(portfolio.updatedAt).toLocaleDateString()}
          </span>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button asChild className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white">
              <Link href={`/portfolio/${portfolio.id}`}>
                View Portfolio
              </Link>
            </Button>
            <Button variant="outline" size="icon" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700" asChild>
              <Link href={`https://github.com/${portfolio.developerId}`} target="_blank">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
