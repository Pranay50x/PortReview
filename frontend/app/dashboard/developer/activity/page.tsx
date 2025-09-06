"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserActivity } from "@/lib/github-analytics";
import { Clock, GitCommit, Eye, Lightbulb, User, RefreshCw } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'github_commit':
      return <GitCommit className="h-4 w-4" />;
    case 'portfolio_view':
      return <Eye className="h-4 w-4" />;
    case 'ai_suggestion':
      return <Lightbulb className="h-4 w-4" />;
    case 'profile_update':
      return <User className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'github_commit':
      return 'bg-green-100 text-green-800';
    case 'portfolio_view':
      return 'bg-blue-100 text-blue-800';
    case 'ai_suggestion':
      return 'bg-purple-100 text-purple-800';
    case 'profile_update':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return time.toLocaleDateString();
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const data = await getUserActivity();
      setActivities(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load activity data');
      console.error('Error fetching activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (activeTab === "all") return true;
    return activity.type === activeTab;
  });

  const tabs = [
    { id: "all", label: "All" },
    { id: "github_commit", label: "Commits" },
    { id: "portfolio_view", label: "Views" },
    { id: "ai_suggestion", label: "AI Tips" },
    { id: "profile_update", label: "Updates" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-white">Activity Feed</h1>
          <div className="flex space-x-2">
            <div className="h-10 w-24 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="h-8 w-8 bg-slate-700 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-slate-700 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-white">Activity Feed</h1>
          <Button onClick={fetchActivity} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-400 mb-2">⚠️</div>
              <p className="text-slate-300">{error}</p>
              <Button 
                onClick={fetchActivity} 
                variant="outline" 
                className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Activity Feed</h1>
        <Button onClick={fetchActivity} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Simple tab implementation */}
      <div className="w-full">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-slate-800 p-1 text-slate-400 border border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === tab.id
                  ? 'bg-slate-700 text-white shadow-sm border border-slate-600'
                  : 'hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-4">
          {filteredActivities.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center text-slate-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                  <p>No activity found for this filter.</p>
                  <p className="text-sm mt-2">Check back later for updates!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredActivities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">
                          {activity.description}
                        </p>
                        <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                          {formatTimeAgo(activity.timestamp)}
                        </Badge>
                      </div>
                      
                      {activity.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activity.type === 'portfolio_view' && activity.metadata.company && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {activity.metadata.company}
                            </Badge>
                          )}
                          {activity.type === 'github_commit' && activity.metadata.commits && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {activity.metadata.commits} commits
                            </Badge>
                          )}
                          {activity.type === 'ai_suggestion' && activity.metadata.skill && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {activity.metadata.skill}
                            </Badge>
                          )}
                          {activity.type === 'profile_update' && activity.metadata.skills_added && (
                            activity.metadata.skills_added.map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs border-slate-600 text-slate-300">
                                +{skill}
                              </Badge>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Activity Summary */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Activity Summary</CardTitle>
          <CardDescription className="text-slate-400">
            Your activity overview for the past 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {activities.filter(a => a.type === 'github_commit').length}
              </div>
              <div className="text-sm text-slate-400">Commits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {activities.filter(a => a.type === 'portfolio_view').length}
              </div>
              <div className="text-sm text-slate-400">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {activities.filter(a => a.type === 'ai_suggestion').length}
              </div>
              <div className="text-sm text-slate-400">AI Tips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {activities.filter(a => a.type === 'profile_update').length}
              </div>
              <div className="text-sm text-slate-400">Updates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
