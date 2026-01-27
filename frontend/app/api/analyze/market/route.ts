import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function POST(req: Request) {
  const body = await req.json();
  // Fetch from Python
  const res = await fetch(`${API_BASE_URL}/api/analyze/market`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Map UI names to Python names
    body: JSON.stringify({
        crop_name: body.crop,
        state: body.state,
        quantity: Number(body.quantity),
        target_date_str: body.date
    }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}