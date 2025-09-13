import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow this in development or with a specific debug key
  const { searchParams } = new URL(request.url);
  const debugKey = searchParams.get('key');
  
  if (debugKey !== 'debug123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    github_client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ? 'SET' : 'MISSING',
    github_client_secret: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'MISSING',
    google_client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    mongodb_uri: process.env.MONGODB_URI ? 'SET' : 'MISSING',
    mongodb_db: process.env.MONGODB_DB ? 'SET' : 'MISSING',
    node_env: process.env.NODE_ENV,
    // Show first few characters for validation
    github_client_id_preview: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID?.substring(0, 10),
    google_client_id_preview: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 20),
  });
}