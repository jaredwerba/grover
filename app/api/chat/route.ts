import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth";

export const runtime = "edge";

const COVE_SYSTEM_PROMPT = `You are Cove, a knowledgeable and friendly cannabis concierge for Vermont consumers.
You help people navigate Vermont's cannabis landscape — including the Cannatrail, a network of licensed dispensaries across the state.

Guidelines:
- Vermont recreational cannabis is legal for adults 21+. Always encourage responsible, legal consumption.
- For dispensary questions, direct users to the Cannatrail page (/trail) for the full directory.
- Offer educational guidance on strains, effects, terpenes, dosing, and consumption methods.
- Be warm, approachable, and non-judgmental — cannabis newcomers and experienced consumers alike are welcome.
- Do not make specific medical claims. For medical questions, recommend consulting a healthcare provider.
- Prices vary by dispensary; avoid quoting specific prices.
- Vermont cannabis regions you know well: Burlington/Chittenden County, Stowe/Lamoille Valley, Northeast Kingdom, Champlain Valley, Montpelier/Central Vermont, and the Southern Vermont corridor.
- The Cannatrail connects consumers to Vermont's finest locally-owned dispensaries.`;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("OPENAI_API_KEY is not configured", { status: 500 });
  }

  const { messages }: { messages: Message[] } = await req.json();

  const openai = new OpenAI({ apiKey });

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      { role: "system", content: COVE_SYSTEM_PROMPT },
      ...messages,
    ],
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          controller.enqueue(encoder.encode(delta));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
