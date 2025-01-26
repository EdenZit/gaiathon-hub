import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // List available integrations
  const integrations = [
    {
      id: "google-drive",
      name: "Google Drive",
      status: "available",
      description: "Connect your Google Drive for document storage",
    },
    {
      id: "calendar",
      name: "Calendar",
      status: "coming-soon",
      description: "Sync your team events with calendar",
    },
  ];

  return NextResponse.json({ integrations });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { integration_id } = body;

    if (!integration_id) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    // Handle integration setup (placeholder for now)
    return NextResponse.json({
      message: "Integration setup initiated",
      integration_id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
} 