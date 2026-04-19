<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Cove chat behavior — where tweaks live

Cove is this app's chat assistant. When the user asks for a change in how Cove responds, route the edit to the right file based on what kind of change it is:

| Change type | File |
|---|---|
| Voice, tone, persona, response shape, formatting rules, safety rules | `lib/cove-prompt.ts` |
| Determinism, creativity, response length cap (temperature, max_tokens, top_p) | `app/api/chat/route.ts` |
| How links/markdown render in the UI | `components/MessageBubble.tsx` |
| Conversation history cap | `components/ChatApp.tsx` |
| Cove's knowledge base | `lib/dispensaries.ts`, `lib/growers.ts`, `lib/strains.ts` |

`lib/cove-prompt.ts` is the default. It is split into five named sections — `PERSONA`, `STYLE`, `FORMAT`, `SAFETY`, `DATA`. Match the user's request to the right section and edit in place; don't add a sixth section unless the request genuinely doesn't fit the existing four behavioral ones.

Examples:
- "Make Cove warmer" → edit `STYLE` in `lib/cove-prompt.ts`
- "Always end with a follow-up question" → add a rule to `FORMAT` in `lib/cove-prompt.ts`
- "Cove is too verbose" → tighten `STYLE` and/or lower `max_tokens` in `app/api/chat/route.ts`
- "Cove shouldn't recommend dispensaries outside Vermont" → add a rule to `SAFETY` in `lib/cove-prompt.ts`
