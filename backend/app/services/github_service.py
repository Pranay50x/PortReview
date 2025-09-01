import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings

class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "PortReviewer/1.0"
        }
        
        if settings.github_token:
            self.headers["Authorization"] = f"token {settings.github_token}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """
        Exchange GitHub OAuth code for access token.
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "code": code,
                },
                headers={"Accept": "application/json"}
            )
            response.raise_for_status()
            token_data = response.json()
            
            # Convert to expected format
            return {
                "access_token": token_data.get("access_token"),
                "token_type": token_data.get("token_type", "bearer"),
                "scope": token_data.get("scope", "")
            }
    
    async def get_user_data(self, access_token: str) -> Dict[str, Any]:
        """
        Get GitHub user data using access token.
        """
        headers = {
            **self.headers,
            "Authorization": f"token {access_token}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/user",
                headers=headers
            )
            response.raise_for_status()
            user_data = response.json()
            
            # Convert to expected format
            return {
                "id": user_data.get("id"),
                "login": user_data.get("login"),
                "name": user_data.get("name"),
                "email": user_data.get("email"),
                "avatar_url": user_data.get("avatar_url"),
                "bio": user_data.get("bio"),
                "company": user_data.get("company"),
                "location": user_data.get("location"),
                "blog": user_data.get("blog"),
                "public_repos": user_data.get("public_repos", 0),
                "followers": user_data.get("followers", 0),
                "following": user_data.get("following", 0),
                "created_at": user_data.get("created_at"),
                "updated_at": user_data.get("updated_at")
            }
    
    async def get_user_repositories(self, username: str, per_page: int = 100) -> List[Dict[str, Any]]:
        """
        Get user's public repositories.
        """
        repositories = []
        page = 1
        
        async with httpx.AsyncClient() as client:
            while True:
                response = await client.get(
                    f"{self.base_url}/users/{username}/repos",
                    headers=self.headers,
                    params={
                        "sort": "updated",
                        "direction": "desc",
                        "per_page": per_page,
                        "page": page
                    }
                )
                response.raise_for_status()
                repos = response.json()
                
                if not repos:
                    break
                
                for repo in repos:
                    # Get additional repository details
                    repo_data = {
                        "id": repo.get("id"),
                        "name": repo.get("name"),
                        "full_name": repo.get("full_name"),
                        "description": repo.get("description"),
                        "html_url": repo.get("html_url"),
                        "clone_url": repo.get("clone_url"),
                        "language": repo.get("language"),
                        "stargazers_count": repo.get("stargazers_count", 0),
                        "watchers_count": repo.get("watchers_count", 0),
                        "forks_count": repo.get("forks_count", 0),
                        "open_issues_count": repo.get("open_issues_count", 0),
                        "size": repo.get("size", 0),
                        "topics": repo.get("topics", []),
                        "created_at": repo.get("created_at"),
                        "updated_at": repo.get("updated_at"),
                        "pushed_at": repo.get("pushed_at"),
                        "license": repo.get("license"),
                        "has_readme": False,  # Will be checked separately
                        "has_wiki": repo.get("has_wiki", False),
                        "has_pages": repo.get("has_pages", False),
                        "archived": repo.get("archived", False),
                        "disabled": repo.get("disabled", False),
                        "private": repo.get("private", False),
                        "fork": repo.get("fork", False)
                    }
                    
                    # Check for README
                    readme_exists = await self._check_readme_exists(username, repo.get("name"))
                    repo_data["has_readme"] = readme_exists
                    
                    repositories.append(repo_data)
                
                # GitHub API pagination
                if len(repos) < per_page:
                    break
                
                page += 1
                
                # Limit to prevent excessive API calls
                if page > 10:  # Max 1000 repos
                    break
        
        return repositories
    
    async def _check_readme_exists(self, username: str, repo_name: str) -> bool:
        """
        Check if repository has a README file.
        """
        readme_files = ["README.md", "readme.md", "README.txt", "readme.txt", "README"]
        
        async with httpx.AsyncClient() as client:
            for readme_file in readme_files:
                try:
                    response = await client.get(
                        f"{self.base_url}/repos/{username}/{repo_name}/contents/{readme_file}",
                        headers=self.headers
                    )
                    if response.status_code == 200:
                        return True
                except httpx.HTTPError:
                    continue
        
        return False
    
    async def get_repository_languages(self, username: str, repo_name: str) -> Dict[str, int]:
        """
        Get programming languages used in a repository.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/repos/{username}/{repo_name}/languages",
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError:
                return {}
    
    async def get_repository_commits(self, username: str, repo_name: str, since: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get recent commits for a repository.
        """
        params = {"per_page": 100}
        if since:
            params["since"] = since
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/repos/{username}/{repo_name}/commits",
                    headers=self.headers,
                    params=params
                )
                response.raise_for_status()
                commits = response.json()
                
                return [
                    {
                        "sha": commit.get("sha"),
                        "message": commit.get("commit", {}).get("message"),
                        "author": commit.get("commit", {}).get("author", {}).get("name"),
                        "date": commit.get("commit", {}).get("author", {}).get("date"),
                        "url": commit.get("html_url")
                    }
                    for commit in commits
                ]
            except httpx.HTTPError:
                return []
    
    async def get_user_activity_stats(self, username: str) -> Dict[str, Any]:
        """
        Get user's GitHub activity statistics.
        """
        repos = await self.get_user_repositories(username)
        
        # Calculate statistics
        total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)
        total_forks = sum(repo.get("forks_count", 0) for repo in repos)
        languages = {}
        
        for repo in repos:
            if repo.get("language"):
                languages[repo["language"]] = languages.get(repo["language"], 0) + 1
        
        # Get top languages
        top_languages = sorted(languages.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Recent activity (repositories updated in last 6 months)
        from datetime import datetime, timedelta
        six_months_ago = datetime.now() - timedelta(days=180)
        
        recent_repos = []
        for repo in repos:
            if repo.get("updated_at"):
                try:
                    updated_date = datetime.fromisoformat(repo["updated_at"].replace("Z", "+00:00"))
                    if updated_date > six_months_ago:
                        recent_repos.append(repo)
                except ValueError:
                    continue
        
        return {
            "total_repositories": len(repos),
            "total_stars": total_stars,
            "total_forks": total_forks,
            "top_languages": [{"language": lang, "count": count} for lang, count in top_languages],
            "recent_activity": len(recent_repos),
            "most_starred_repo": max(repos, key=lambda x: x.get("stargazers_count", 0)) if repos else None,
            "recent_repositories": recent_repos[:10]  # Last 10 recently updated repos
        }
