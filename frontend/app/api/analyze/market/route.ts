import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  // Fetch from Python
  const res = await fetch("http://127.0.0.1:8000/api/analyze/market", {
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