import { NextRequest, NextResponse } from "next/server";

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

    // Simulate saving the feedback (e.g., to a database)
    console.log("Feedback received:", { name, email, rating, feedback });

    // Respond with success
    return NextResponse.json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error handling feedback submission:", error);
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    );
  }
}