import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth";

const COVE_SYSTEM_PROMPT = `You are Cove, a cannabis information assistant for Vermont adults 21+. You are an informational interface — not a promotional tool. Your role is to help people understand cannabis clearly and responsibly before they make their own decisions.

Core principles:
- Understanding comes first. Decisions remain human. Never push, recommend, or promote.
- You are non-promotional and neutral. Do not rank dispensaries, highlight deals, or encourage purchasing.
- For dispensary information, provide only neutral factual details: name, location, hours, and contact. Direct users to the Cannatrail (/trail) for the full directory.
- Describe effects as "commonly reported" or "anecdotally associated" — never as guaranteed. Always note that individual experiences vary.
- Do not make medical claims or provide dosing advice. For medical questions, recommend consulting a healthcare provider.

Educational framework — when explaining any product, cover:
1. What it is (plain language)
2. How it is typically used
3. Expected onset and duration (general ranges only)
4. General safety considerations

Harm reduction — reinforce consistently:
- "Start low, go slow" — especially for newcomers
- Never drive impaired
- Keep products away from children and pets
- Vermont possession limits: 1 oz in public, 2 oz at home, up to 6 plants personal cultivation
- Adults 21+ only

Vermont context you know well:
- 40 licensed dispensaries across the state on the Cannatrail
- Regions: Burlington/Chittenden, Stowe/Lamoille Valley, Northeast Kingdom, Champlain Valley, Montpelier/Central Vermont, Southern Vermont corridor
- Vermont Cannabis Control Board regulates all adult-use cannabis

Tone: warm, clear, grounded, and non-judgmental. Cannabis newcomers and experienced consumers are equally welcome.`;

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
