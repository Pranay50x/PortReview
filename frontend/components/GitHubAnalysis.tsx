import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitHubStats } from '@/types';

interface GitHubAnalysisProps {
  stats: GitHubStats;
  className?: string;
}

export default function GitHubAnalysis({ stats, className = '' }: GitHubAnalysisProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalRepos}</div>
            <div className="text-xs text-gray-600">Repositories</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalCommits.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Commits</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.followers}</div>
            <div className="text-xs text-gray-600">Followers</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.following}</div>
            <div className="text-xs text-gray-600">Following</div>
          </div>
        </div>

        {/* Language Distribution */}
        <div>
          <h4 className="font-semibold mb-3">Language Distribution</h4>
          <div className="space-y-2">
            {Object.entries(stats.languages).map(([language, percentage]) => (
              <div key={language} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{language}</span>
                  <span className="text-gray-500">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      language === 'JavaScript' ? 'bg-yellow-500' :
                      language === 'TypeScript' ? 'bg-blue-500' :
                      language === 'Python' ? 'bg-green-500' :
                      language === 'Go' ? 'bg-blue-400' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contribution Activity */}
        {stats.contributions && stats.contributions.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Contribution Activity</h4>
            <div className="grid grid-cols-7 gap-1">
              {stats.contributions.slice(0, 365).map((count, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-sm ${
                    count === 0 ? 'bg-gray-100' :
                    count <= 2 ? 'bg-green-200' :
                    count <= 5 ? 'bg-green-300' :
                    count <= 10 ? 'bg-green-400' :
                    'bg-green-500'
                  }`}
                  title={`${count} contributions`}
                ></div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        )}

        {/* Profile Views */}
        {stats.profileViews && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Profile Views</span>
            <Badge variant="secondary">{stats.profileViews.toLocaleString()}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
