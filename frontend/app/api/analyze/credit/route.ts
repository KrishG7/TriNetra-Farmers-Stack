import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  // Fetch from Python
  const res = await fetch("http://127.0.0.1:8000/api/analyze/credit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  
  // Format for UI
  return NextResponse.json({
    status: data.health_score > 0.6 ? "APPROVED" : "REJECTED",
    health_score: Math.round(data.health_score * 100),
    land_type: data.land_type,
    message: data.verification?.recommendation || "Analyzed"
  });
}