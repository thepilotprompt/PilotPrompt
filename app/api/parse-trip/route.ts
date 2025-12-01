import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import supabaseAdmin from "@/lib/supabaseAdmin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const SYSTEM_PROMPT = `
You are a travel intent parser for a service called PilotPrompt that helps users find the best flight + hotel plans.

Your job is to take a natural-language travel request and convert it into a STRICT JSON object with the following fields:

{
  "origin_airports": [string],
  "destination_cities": [string],
  "start_date": "YYYY-MM-DD or null",
  "end_date": "YYYY-MM-DD or null",
  "date_flexibility_days": integer,
  "total_budget_currency": "USD",
  "total_budget_amount": number or null,
  "num_travelers": integer,
  "trip_type": "business" | "leisure" | "mixed" | "unknown",
  "cabin_preference": "economy" | "premium_economy" | "business" | "first" | "unknown",
  "hotel_min_rating": number | null,
  "hotel_type_preference": "hotel" | "airbnb" | "either" | "unknown",
  "avoid_airlines": [string],
  "preferred_airlines": [string],
  "avoid_redeye": boolean,
  "max_layovers": integer | null,
  "notes": string
}

Rules:
- Infer reasonable defaults if not specified.
- If dates are vague, set start_date and end_date to null and explain in notes.
- If budget is not stated, set total_budget_amount = null.
- Output MUST be valid JSON. No extra text, no comments.
`;

export async function POST(req: NextRequest) {
  try {
    const { userRequest } = await req.json();

    if (!userRequest || typeof userRequest !== "string") {
      return NextResponse.json(
        { error: "Missing userRequest string" },
        { status: 400 }
      );
    }

    // 1) Ask OpenAI to parse the trip into structured JSON
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userRequest },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content from OpenAI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);

    // 2) Save the original text + parsed JSON into Supabase
    const { data, error } = await supabaseAdmin
      .from("trips")
      .insert({
        user_email: "rlinhart99@gmail.com", // later this can be real users
        original_text: userRequest,
        parsed,
      })
      .select();

    if (error) {
      console.error("Supabase insert error (parse-trip):", error);
      // still return parsed so UI works
      return NextResponse.json(
        { success: false, parsed, dbError: error.message },
        { status: 200 }
      );
    }

    // 3) Return what we parsed + the saved row
    return NextResponse.json({
      success: true,
      parsed,
      savedRow: data?.[0] ?? null,
    });
  } catch (err: any) {
    console.error("parse-trip route error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
