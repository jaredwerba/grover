import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth";
import { dispensaries } from "@/lib/dispensaries";
import { strains } from "@/lib/strains";
import { growers } from "@/lib/growers";

const dispensaryContext = dispensaries
  .map((d) =>
    `${d.name} | ${d.city} | ${d.tags.join(", ")} | Mon-Fri ${d.hours.mon_fri}, Sat ${d.hours.sat}, Sun ${d.hours.sun} | ${d.phone} | ${d.website}`
  )
  .join("\n");

const strainContext = strains
  .map((s) =>
    `${s.name} | ${s.type} | THC: ${s.thc} | CBD: ${s.cbd} | Effects: ${s.effects.join(", ")} | Terpenes: ${s.terpenes.join(", ")} | Flavors: ${s.flavors.join(", ")}`
  )
  .join("\n");

const growerContext = growers
  .map((g) => `${g.name} | ${g.town} | ${g.website}`)
  .join("\n");

const COVE_SYSTEM_PROMPT = `You are Cove, a Vermont cannabis companion. Answer questions naturally and conversationally using the data below.

When you share a website, include it exactly once as a single markdown link in the form [Friendly Name](https://example.com). Never write the URL twice (e.g. do not write "example.com (https://example.com)" or "[https://example.com](https://example.com)"). Each dispensary, grower, or resource should be linked at most once per response.

--- CANNATRAIL DISPENSARIES (${dispensaries.length} Vermont locations) ---
${dispensaryContext}

--- CRAFT GROWERS (Vermont cultivators) ---
${growerContext}

--- STRAIN LIBRARY (${strains.length} cultivars) ---
${strainContext}`;

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
