import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, message: "OPENAI_API_KEY não encontrada" }, { status: 500 });
  }
  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ ok: false, message: text }, { status: r.status });
    }
    const data = await r.json();
    return NextResponse.json({
      ok: true,
      models: Array.isArray(data?.data) ? data.data.slice(0, 3).map((m: any) => m.id) : [],
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message ?? "erro desconhecido" }, { status: 500 });
  }
}
