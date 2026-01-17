import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get users with their girandola count, ordered by count descending
    const contributors = await prisma.user.findMany({
      where: {
        girandolas: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: {
            girandolas: true,
          },
        },
      },
      orderBy: {
        girandolas: {
          _count: "desc",
        },
      },
      take: 20,
    });

    const result = contributors.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name || "Anonymous",
      image: user.image,
      count: user._count.girandolas,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch contributors:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributors" },
      { status: 500 }
    );
  }
}
