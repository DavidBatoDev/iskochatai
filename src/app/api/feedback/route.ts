import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the incoming data
    const { name, email, rating, feedback } = body;
    if (!name || !email || !rating || !feedback) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Store feedback in Supabase
    const { data, error } = await supabase.from("feedbacks").insert([
      {
        name,
        email,
        rating,
        feedback: feedback,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error storing feedback in Supabase:", error);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    // Respond with success
    return NextResponse.json({
      message: "Feedback submitted successfully",
      data,
    });
  } catch (error) {
    console.error("Error handling feedback submission:", error);
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    );
  }
}
