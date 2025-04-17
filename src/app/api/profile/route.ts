import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET handler to fetch a user's profile
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Process arrays if needed
    let processedData = { ...data };
    if (processedData.program_interest && typeof processedData.program_interest === 'string') {
      // Remove curly braces if they exist and split by comma
      processedData.program_interest = processedData.program_interest
        .replace(/^\{|\}$/g, '')
        .split(',')
        .filter((item: string) => item.trim() !== '');
    }
    if (processedData.scholarship_interest && typeof processedData.scholarship_interest === 'string') {
      // Remove curly braces if they exist and split by comma
      processedData.scholarship_interest = processedData.scholarship_interest
        .replace(/^\{|\}$/g, '')
        .split(',')
        .filter((item: string) => item.trim() !== '');
    }

    return NextResponse.json({ data: processedData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT handler to update a user's profile
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...profileData } = body;
        
        if (!id) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          );
        }
    
        // Process arrays for storage
        let processedData = { ...profileData };
        
        // Validate numeric fields
        if (processedData.family_income !== undefined) {
          // Ensure it's a valid number
          const income = Number(processedData.family_income);
          if (isNaN(income)) {
            return NextResponse.json(
              { error: 'Family income must be a valid number' },
              { status: 400 }
            );
          }
          
          // If the income is very large, PostgreSQL's numeric type might overflow
          // Ensure it's within safe bounds for PostgreSQL numeric type
          if (Math.abs(income) > 1e38) { // PostgreSQL numeric has approximately this limit
            return NextResponse.json(
              { error: 'Family income value is too large' },
              { status: 400 }
            );
          }
          
          processedData.family_income = income;
        }
        
        if (processedData.academic_gwa !== undefined) {
          // Accept GWA in any reasonable range (PH system can use 0-100 scale)
          const gwa = Number(processedData.academic_gwa);
          if (isNaN(gwa)) {
            return NextResponse.json(
              { error: 'Academic GWA must be a valid number' },
              { status: 400 }
            );
          }
          
          // Set to a safe numeric value - allow for different GWA systems
          processedData.academic_gwa = gwa;
        }
      
      // Process arrays with proper PostgreSQL array format
      if (Array.isArray(processedData.program_interest)) {
        processedData.program_interest = 
          processedData.program_interest.length > 0
            ? `{${processedData.program_interest.join(',')}}`
            : '{}';
      }
      
      if (Array.isArray(processedData.scholarship_interest)) {
        processedData.scholarship_interest = 
          processedData.scholarship_interest.length > 0
            ? `{${processedData.scholarship_interest.join(',')}}`
            : '{}';
      }
      
      // Add updated timestamp
      processedData.updated_at = new Date();
      
      const { data, error } = await supabase
        .from('profiles')
        .update(processedData)
        .eq('id', id)
        .select();
  
      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
  
      return NextResponse.json({ data });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }