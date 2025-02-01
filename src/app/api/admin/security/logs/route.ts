import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/adminGuard";
import { getAdminLogs } from "@/lib/auth/adminGuard";

export async function GET(req: NextRequest) {
  // Check admin access and log the action
  const guardResponse = await adminGuard(req, "fetch_security_logs");
  if (guardResponse) return guardResponse;

  try {
    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    
    // Fetch logs with pagination
    const logs = await getAdminLogs(limit);

    return NextResponse.json({ 
      logs,
      total: logs.length,
      limit
    });
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch security logs",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 