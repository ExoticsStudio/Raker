import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isValidNpk(value: unknown): value is string {
  return typeof value === "string" && /^[0-9]{6}$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const npk = typeof body?.npk === "string" ? body.npk.trim() : "";

    if (!isValidNpk(npk)) {
      return NextResponse.json(
        { ok: false, message: "NPK harus tepat 6 digit angka." },
        { status: 400 }
      );
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    if (!appsScriptUrl) {
      return NextResponse.json(
        { ok: false, message: "APPS_SCRIPT_URL belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    const separator = appsScriptUrl.includes("?") ? "&" : "?";
    const response = await fetch(
      `${appsScriptUrl}${separator}action=validate&npk=${encodeURIComponent(npk)}`,
      { cache: "no-store", redirect: "follow" }
    );

    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      return NextResponse.json(
        { ok: false, message: "Server data event tidak dapat dihubungi." },
        { status: 502 }
      );
    }

    if (!data.ok) {
      return NextResponse.json(
        { ok: false, message: data.message || "NPK tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      attendee: data.attendee,
      rundown: Array.isArray(data.rundown) ? data.rundown : [],
      pdfUrl: data.pdfUrl || process.env.NEXT_PUBLIC_PDF_URL || "",
    });
  } catch (error) {
    console.error("Registration validation error", error);
    return NextResponse.json(
      { ok: false, message: "Terjadi gangguan saat mencocokkan data. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
