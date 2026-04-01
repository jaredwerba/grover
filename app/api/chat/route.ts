import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  systemPrompt?: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("OPENAI_API_KEY is not configured", { status: 500 });
  }

  const { messages, systemPrompt }: ChatRequest = await req.json();

  const openai = new OpenAI({ apiKey });

  const systemMessages: Message[] = systemPrompt
    ? [{ role: "system", content: systemPrompt }]
    : [];

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [...systemMessages, ...messages],
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
