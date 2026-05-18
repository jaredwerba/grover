import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth";
import { COVE_SYSTEM_PROMPT } from "@/lib/cove-prompt";
import { getLiveInventoryForPrompt } from "@/lib/inventory-public";
import { getUserPreferences, getFavorites } from "@/lib/user-preferences";
import { dispensaries } from "@/lib/dispensaries";
import { haversineDistance } from "@/lib/geo";

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

  const {
    messages,
    userLocation,
  }: {
    messages: Message[];
    userLocation?: { lat: number; lng: number } | null;
  } = await req.json();

  const openai = new OpenAI({ apiKey });

  // Cove Connect — append live inventory snapshot to the system
  // prompt at request time. Read failures fall back to "" so the
  // chat keeps working even if Redis is unreachable.
  const [liveInventory, prefs, favs] = await Promise.all([
    getLiveInventoryForPrompt(),
    getUserPreferences(session.email).catch(() => null),
    getFavorites(session.email).catch(() => []),
  ]);

  let systemPrompt = COVE_SYSTEM_PROMPT;
  if (liveInventory) systemPrompt += `\n\n${liveInventory}`;

  // Inject user preferences so Cove AI can personalize recommendations
  if (prefs || favs.length > 0) {
    const lines: string[] = ["--- USER PREFERENCES ---"];
    if (prefs?.preferred_types?.length)
      lines.push(`Preferred types: ${prefs.preferred_types.join(", ")}`);
    if (prefs?.preferred_effects?.length)
      lines.push(`Preferred effects: ${prefs.preferred_effects.join(", ")}`);
    if (prefs?.preferred_category)
      lines.push(`Tends toward: ${prefs.preferred_category}`);
    if (favs.length > 0)
      lines.push(`Favorites: ${favs.slice(-8).map((f) => f.name).join(", ")}`);
    lines.push(
      "Use these preferences to personalize recommendations. Don't mention that you have access to their preferences unless asked."
    );
    systemPrompt += `\n\n${lines.join("\n")}`;
  }

  // Inject proximity context if the user shared their location.
  // Computes the 3 nearest licensed dispensaries so Cove can ground
  // recommendations in real distances instead of guessing.
  if (userLocation && typeof userLocation.lat === "number" && typeof userLocation.lng === "number") {
    const ranked = dispensaries
      .map((d) => ({
        d,
        dist: haversineDistance(userLocation.lat, userLocation.lng, d.lat, d.lng),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);
    const lines = [
      "--- USER LOCATION CONTEXT ---",
      `Coordinates: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`,
      "Nearest licensed dispensaries:",
      ...ranked.map(({ d, dist }) => `- ${d.name} (${d.city}) — ${dist.toFixed(1)} mi`),
      "When recommending where to buy, prefer dispensaries from this list and reference their town and distance naturally (e.g. \"Higher Elevation in Burlington, about 4 miles away\"). Don't quote raw coordinates.",
    ];
    systemPrompt += `\n\n${lines.join("\n")}`;
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    temperature: 0.7, // tighter than default 1.0 for consistency
    max_tokens: 800, // keep responses concise; prevents runaway generations
    messages: [
      { role: "system", content: systemPrompt },
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
