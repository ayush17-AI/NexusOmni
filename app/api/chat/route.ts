export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const nexusSystemPrompt = "You are NexusOmni AI, an advanced esports strategy analyst. Provide clear, structured, and professional answers related to esports strategies, gameplay rotations, team coordination, and competitive gaming. Use 1. Quick Answer, 2. Explanation, and 3. Pro Tips.";

export async function POST(req: NextRequest) {
  console.log("Chat API hit");

  try {
    const body = await req.json();
    const message: string = body.message;
    console.log("User message:", message);

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set");
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error response:", errText);
      throw new Error(`Gemini responded with status ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    const text: string = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({
      reply: `AI server error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check environment variables.`,
    });
  }
}
