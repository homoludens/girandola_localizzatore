import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { CreateGirandolaPayload } from "@/types/girandola";

export async function GET() {
  try {
    const girandolas = await prisma.girandola.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to match the expected API response format
    const response = girandolas.map((g) => ({
      id: g.id,
      lat: g.lat,
      lng: g.lng,
      userEmail: g.user.email,
      createdAt: g.createdAt.toISOString(),
    }));

    return NextResponse.json(response);
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

    if (!session?.user?.id) {
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

    const girandola = await prisma.girandola.create({
      data: {
        lat: body.lat,
        lng: body.lng,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // Return in the expected format
    const response = {
      id: girandola.id,
      lat: girandola.lat,
      lng: girandola.lng,
      userEmail: girandola.user.email,
      createdAt: girandola.createdAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating girandola:", error);
    return NextResponse.json(
      { error: "Failed to create girandola" },
      { status: 500 }
    );
  }
}
