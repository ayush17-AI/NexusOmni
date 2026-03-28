export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const nexusSystemPrompt = `You are NexusOmni AI, an advanced esports strategy analyst designed to help competitive players improve their gameplay.

Your role is to provide clear, structured, and professional answers related to esports strategies, gameplay rotations, team coordination, and competitive gaming concepts. Your responses must sound like an experienced esports analyst.

Guidelines:
• Provide clear and accurate answers
• Use structured formatting
• Use bullet points when explaining strategies
• Be informative but concise
• Maintain a professional tone

Avoid:
• casual filler responses
• vague explanations
• unnecessary apologies
• overly short answers

Always respond using this exact structure:

**1️⃣ Quick Answer**
A direct response in 1–2 sentences.

**2️⃣ Explanation**
A clear explanation of the concept.

**3️⃣ Pro Tips**
• Tip 1
• Tip 2
• Tip 3`;

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
