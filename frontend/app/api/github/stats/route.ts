import { NextRequest, NextResponse } from 'next/server';

// GitHub Analytics API proxy to backend
export async function GET(request: NextRequest) {
  try {
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
    
    // Get user from headers or session
    const userEmail = request.headers.get('x-user-email');
    const githubUsername = request.headers.get('x-github-username');
    
    // Also try to get from URL params
    const { searchParams } = new URL(request.url);
    const usernameParam = searchParams.get('username');
    
    const targetUsername = githubUsername || usernameParam;
    
    if (!targetUsername) {
      return NextResponse.json(
        { error: 'GitHub username not provided' },
        { status: 400 }
      );
    }

    // Call backend GitHub service
    const response = await fetch(`${backendUrl}/api/github/stats/${targetUsername}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend GitHub API error:', response.status, response.statusText);
      // Return mock data as fallback
      return NextResponse.json(getMockGitHubStats(targetUsername));
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    
    // Return mock data as fallback
    const githubUsername = request.headers.get('x-github-username') || 'user';
    return NextResponse.json(getMockGitHubStats(githubUsername));
  }
}

function getMockGitHubStats(username: string) {
  return {
    username: username,
    total_repositories: 25,
    total_stars: 89,
    total_forks: 23,
    total_commits: 1250,
    user_data: {
      followers: 150,
      following: 89,
      public_repos: 25,
    },
    top_languages: [
      { language: 'JavaScript', count: 35 },
      { language: 'TypeScript', count: 30 },
      { language: 'Python', count: 20 },
      { language: 'React', count: 15 },
    ],
    recent_activity: 15,
    most_starred_repo: {
      name: 'awesome-portfolio',
      stargazers_count: 45,
      description: 'An awesome portfolio website',
    },
    recent_repositories: [],
    last_updated: new Date().toISOString(),
  };
}
