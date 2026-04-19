import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth";
import { COVE_SYSTEM_PROMPT } from "@/lib/cove-prompt";

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
    temperature: 0.7, // tighter than default 1.0 for consistency
    max_tokens: 800, // keep responses concise; prevents runaway generations
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
