// src/app/api/test-openai/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "rota /api/test-openai funcionando íº€",
  });
}
