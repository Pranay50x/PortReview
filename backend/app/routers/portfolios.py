from fastapi import APIRouter, HTTPException, Depends, status, Query
from app.models.portfolio import PortfolioCreate, Portfolio, PortfolioUpdate, PortfolioPublic
from app.services.portfolio_service import PortfolioService
from app.services.github_service import GitHubService
from app.services.ai_service import AIService
from app.routers.auth import get_current_active_user
from app.models.user import User
from app.core.database import get_database
from typing import List, Optional
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=Portfolio)
async def create_portfolio(
    portfolio_data: PortfolioCreate,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Create a new portfolio for the current user.
    """
    if current_user.user_type != "developer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only developers can create portfolios"
        )
    
    portfolio_service = PortfolioService(db)
    github_service = GitHubService()
    ai_service = AIService()
    
    try:
        # Create initial portfolio
        portfolio = await portfolio_service.create_portfolio(
            user_id=current_user.id,
            portfolio_data=portfolio_data
        )
        
        # Analyze GitHub repositories if GitHub username is provided
        if current_user.github_username:
            repositories = await github_service.get_user_repositories(
                current_user.github_username
            )
            
            # Get AI insights for the repositories
            ai_insights = await ai_service.analyze_repositories(repositories)
            
            # Update portfolio with GitHub data and AI insights
            update_data = PortfolioUpdate(
                github_repositories=repositories,
                ai_insights=ai_insights
            )
            
            portfolio = await portfolio_service.update_portfolio(
                portfolio.id,
                update_data
            )
        
        return portfolio
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create portfolio: {str(e)}"
        )

@router.get("/", response_model=List[PortfolioPublic])
async def get_portfolios(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    skills: Optional[List[str]] = Query(None),
    experience_level: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Get portfolios with filtering and search.
    For developers: get their own portfolios.
    For recruiters: search all public portfolios.
    """
    portfolio_service = PortfolioService(db)
    
    if current_user.user_type == "developer":
        # Developers get their own portfolios
        portfolios = await portfolio_service.get_user_portfolios(
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
    else:
        # Recruiters search all public portfolios
        portfolios = await portfolio_service.search_portfolios(
            search=search,
            skills=skills,
            experience_level=experience_level,
            skip=skip,
            limit=limit
        )
    
    return portfolios

@router.get("/me", response_model=List[Portfolio])
async def get_my_portfolios(
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Get current user's portfolios.
    """
    if current_user.user_type != "developer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only developers can access this endpoint"
        )
    
    portfolio_service = PortfolioService(db)
    portfolios = await portfolio_service.get_user_portfolios(current_user.id)
    
    return portfolios

@router.get("/{portfolio_id}", response_model=Portfolio)
async def get_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Get a specific portfolio by ID.
    """
    try:
        portfolio_service = PortfolioService(db)
        portfolio = await portfolio_service.get_portfolio(ObjectId(portfolio_id))
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        # Check permissions
        if (current_user.user_type == "developer" and 
            str(portfolio.user_id) != str(current_user.id)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Recruiters can only view public portfolios
        if (current_user.user_type == "recruiter" and 
            not portfolio.is_public):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Portfolio is private"
            )
        
        return portfolio
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid portfolio ID"
        )

@router.put("/{portfolio_id}", response_model=Portfolio)
async def update_portfolio(
    portfolio_id: str,
    portfolio_update: PortfolioUpdate,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Update a portfolio.
    """
    if current_user.user_type != "developer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only developers can update portfolios"
        )
    
    try:
        portfolio_service = PortfolioService(db)
        
        # Check if portfolio exists and belongs to user
        existing_portfolio = await portfolio_service.get_portfolio(ObjectId(portfolio_id))
        
        if not existing_portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        if str(existing_portfolio.user_id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Update portfolio
        updated_portfolio = await portfolio_service.update_portfolio(
            ObjectId(portfolio_id),
            portfolio_update
        )
        
        return updated_portfolio
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid portfolio ID"
        )

@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Delete a portfolio.
    """
    if current_user.user_type != "developer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only developers can delete portfolios"
        )
    
    try:
        portfolio_service = PortfolioService(db)
        
        # Check if portfolio exists and belongs to user
        existing_portfolio = await portfolio_service.get_portfolio(ObjectId(portfolio_id))
        
        if not existing_portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        if str(existing_portfolio.user_id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Delete portfolio
        await portfolio_service.delete_portfolio(ObjectId(portfolio_id))
        
        return {"message": "Portfolio deleted successfully"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid portfolio ID"
        )

@router.post("/{portfolio_id}/analyze")
async def analyze_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Trigger AI analysis of a portfolio.
    """
    if current_user.user_type != "developer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only developers can analyze portfolios"
        )
    
    try:
        portfolio_service = PortfolioService(db)
        github_service = GitHubService()
        ai_service = AIService()
        
        # Check if portfolio exists and belongs to user
        portfolio = await portfolio_service.get_portfolio(ObjectId(portfolio_id))
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        if str(portfolio.user_id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Get fresh GitHub data
        if current_user.github_username:
            repositories = await github_service.get_user_repositories(
                current_user.github_username
            )
            
            # Get AI insights
            ai_insights = await ai_service.analyze_repositories(repositories)
            
            # Update portfolio
            update_data = PortfolioUpdate(
                github_repositories=repositories,
                ai_insights=ai_insights
            )
            
            updated_portfolio = await portfolio_service.update_portfolio(
                ObjectId(portfolio_id),
                update_data
            )
            
            return {
                "message": "Portfolio analyzed successfully",
                "portfolio": updated_portfolio
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub username is required for analysis"
            )
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid portfolio ID"
        )
