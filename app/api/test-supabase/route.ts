import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("trips")
      .insert({
        user_email: "test@pilotprompt.local",
        original_text: "test from /api/test-supabase",
        parsed: {},
      })
      .select();

    return NextResponse.json({ data, error }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
