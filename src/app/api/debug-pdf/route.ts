import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug PDF endpoint called');
    
    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get('estimateId');
    
    console.log('EstimateId from params:', estimateId);
    
    if (!estimateId) {
      console.log('No estimateId provided');
      return NextResponse.json(
        { error: 'estimateId query parameter is required' },
        { status: 400 }
      );
    }

    // Simple test - just return success without doing anything complex
    console.log('Returning success response');
    return NextResponse.json({
      success: true,
      message: 'Debug endpoint working',
      estimateId: estimateId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug PDF error:', error);
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Debug PDF POST endpoint called');
    
    // Try to get body safely
    let body = {};
    try {
      body = await request.json();
      console.log('Body parsed successfully:', body);
    } catch (jsonError) {
      console.log('JSON parsing failed:', jsonError);
      body = {};
    }

    const { estimateId } = body as { estimateId?: string };
    console.log('EstimateId from body:', estimateId);

    return NextResponse.json({
      success: true,
      message: 'Debug POST endpoint working',
      body: body,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug PDF POST error:', error);
    return NextResponse.json(
      { 
        error: 'Debug POST endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}