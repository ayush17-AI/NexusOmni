export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const nexusSystemPrompt = `You are NexusOmni AI, an elite esports analyst and strategy coach specializing in BGMI (Battlegrounds Mobile India). You provide expert tactical advice, rotation strategies, loadout recommendations, scoring system explanations, and competitive meta analysis. Keep responses concise, actionable, and focused on helping players improve. Use a confident, professional tone.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("[NexusAI] GOOGLE_API_KEY is not set in environment");
    return NextResponse.json({
      reply: "⚠️ AI service is not configured. Please contact the administrator.",
    }, { status: 200 });
  }

  let message: string;
  try {
    const body = await req.json();
    message = body.message;
    if (!message || typeof message !== "string") {
      return NextResponse.json({ reply: "Please send a valid message." }, { status: 200 });
    }
  } catch {
    return NextResponse.json({ reply: "Invalid request format." }, { status: 200 });
  }

  // Try models in priority order — fallback if one fails
  const modelPriority = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-8b",
  ];

  for (const model of modelPriority) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: nexusSystemPrompt }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: message }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      const data = await geminiRes.json();

      if (!geminiRes.ok) {
        const errStatus = data?.error?.status || "";
        const errCode = data?.error?.code || geminiRes.status;

        console.error(`[NexusAI] Model ${model} failed: ${errCode} ${errStatus}`);

        // 404 = model not available, try next
        if (errCode === 404 || errStatus === "NOT_FOUND") continue;

        // 429 = quota exhausted, try next model
        if (errCode === 429 || errStatus === "RESOURCE_EXHAUSTED") continue;

        // 403 = permission denied, try next
        if (errCode === 403 || errStatus === "PERMISSION_DENIED") continue;

        // Other error — break and return fallback
        break;
      }

      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.error(`[NexusAI] Model ${model} returned empty response`);
        continue;
      }

      console.log(`[NexusAI] Success with model: ${model}`);
      return NextResponse.json({ reply: text });
    } catch (error) {
      console.error(`[NexusAI] Network error with model ${model}:`, error);
      continue;
    }
  }

  // All models failed
  console.error("[NexusAI] All Gemini models exhausted or unavailable");
  return NextResponse.json({
    reply:
      "🤖 NexusOmni AI is momentarily offline due to API limits. Please try again in a few minutes.",
  }, { status: 200 });
}
