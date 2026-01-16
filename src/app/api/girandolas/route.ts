import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Girandola, CreateGirandolaPayload } from "@/types/girandola";

const GIRANDOLAS_KEY = "girandolas";

export async function GET() {
  try {
    const girandolas = await kv.lrange<Girandola>(GIRANDOLAS_KEY, 0, -1);
    return NextResponse.json(girandolas ?? []);
  } catch (error) {
    console.error("Error fetching girandolas:", error);
    return NextResponse.json(
      { error: "Failed to fetch girandolas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CreateGirandolaPayload = await request.json();

    if (typeof body.lat !== "number" || typeof body.lng !== "number") {
      return NextResponse.json(
        { error: "Invalid payload: lat and lng must be numbers" },
        { status: 400 }
      );
    }

    const girandola: Girandola = {
      id: crypto.randomUUID(),
      lat: body.lat,
      lng: body.lng,
      userEmail: session.user.email,
      createdAt: new Date().toISOString(),
    };

    await kv.lpush(GIRANDOLAS_KEY, girandola);

    return NextResponse.json(girandola, { status: 201 });
  } catch (error) {
    console.error("Error creating girandola:", error);
    return NextResponse.json(
      { error: "Failed to create girandola" },
      { status: 500 }
    );
  }
}
