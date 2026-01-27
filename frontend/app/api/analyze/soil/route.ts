import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${API_BASE_URL}/api/analyze/soil`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}