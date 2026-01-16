import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Query only the user's own Girandolas, ordered by createdAt descending
    const girandolas = await prisma.girandola.findMany({
      where: {
        userId: session.user.id,
      },
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

    // Transform to match the expected export format
    const response = girandolas.map((g) => ({
      id: g.id,
      lat: g.lat,
      lng: g.lng,
      userEmail: g.user.email,
      createdAt: g.createdAt.toISOString(),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error exporting girandolas:", error);
    return NextResponse.json(
      { error: "Failed to export girandolas" },
      { status: 500 }
    );
  }
}
