import { NextRequest, NextResponse } from 'next/server';

// Portfolio analytics API
export async function GET(request: NextRequest) {
  try {
    // For now, return mock analytics data
    // In production, this would connect to your analytics database
    const mockViews = Math.floor(Math.random() * 3000) + 1000;
    const thisMonthIncrease = Math.floor(Math.random() * 20) + 5;
    
    return NextResponse.json({
      total_views: mockViews,
      monthly_increase: thisMonthIncrease,
      weekly_views: Math.floor(mockViews * 0.25),
      daily_views: Math.floor(mockViews * 0.05),
      top_referrers: [
        { source: 'GitHub', views: Math.floor(mockViews * 0.4) },
        { source: 'LinkedIn', views: Math.floor(mockViews * 0.3) },
        { source: 'Direct', views: Math.floor(mockViews * 0.2) },
        { source: 'Other', views: Math.floor(mockViews * 0.1) },
      ],
    });
  } catch (error) {
    console.error('Error fetching portfolio views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio analytics' },
      { status: 500 }
    );
  }
}

// Track portfolio view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolio_id, timestamp } = body;
    
    // In production, save this to your analytics database
    console.log('Portfolio view tracked:', { portfolio_id, timestamp });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking portfolio view:', error);
    return NextResponse.json(
      { error: 'Failed to track portfolio view' },
      { status: 500 }
    );
  }
}
