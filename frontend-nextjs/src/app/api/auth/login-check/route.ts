// import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (session) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          email: session.user?.email,
          name: session.user?.name,
        }
      })
    }

    return NextResponse.json({
      success: true,
      authenticated: false,
      user: null
    })
    
  } catch (error) {
    console.error('[Login Check API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check authentication status' 
      },
      { status: 500 }
    )
  }
}