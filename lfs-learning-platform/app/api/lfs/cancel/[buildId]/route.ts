import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ buildId: string }> }
) {
  try {
    const { buildId } = await params;

    // TODO: Implement actual build cancellation
    // - Stop Docker container
    // - Update Firestore status
    // - Clean up resources

    return NextResponse.json({ 
      success: true, 
      message: "Build cancelled successfully" 
    });
  } catch (error) {
    console.error("Cancel build error:", error);
    return NextResponse.json(
      { error: "Failed to cancel build" },
      { status: 500 }
    );
  }
}
