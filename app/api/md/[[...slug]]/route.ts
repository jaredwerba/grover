import { NextRequest } from "next/server";
import { renderMarkdownForPath } from "@/lib/markdown";

/**
 * Markdown representation of a public page.
 * Reached either directly (GET /api/md/about) or via the Accept-header
 * rewrite in middleware.ts. Returns text/markdown; 404 for unknown paths.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const path = !slug || slug.length === 0 ? "/" : `/${slug.join("/")}`;

  const md = renderMarkdownForPath(path);
  if (md === null) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
