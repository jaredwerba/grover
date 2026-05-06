import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/lib/user-preferences";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const favorites = await getFavorites(session.email);
  return NextResponse.json({ favorites });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { id, kind, name, type } = body;

  if (!id || !kind || !name || !type) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const favorites = await addFavorite(session.email, { id, kind, name, type });
  return NextResponse.json({ favorites });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const favorites = await removeFavorite(session.email, id);
  return NextResponse.json({ favorites });
}
