import { NextRequest, NextResponse } from "next/server";
import Battle from "@/models/Battle";
import Answer from "@/models/Answer";
import { connectDb } from "@/lib/connectDb";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const battleCode = searchParams.get("battleCode");
    const userId = searchParams.get("userId");

    if (!battleCode || !userId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const battle = await Battle.findOne({ battleCode }).lean() as { currentIndex: number } | null;
    if (!battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }

    const hasAnswered = await Answer.exists({
      battleCode,
      userId,
      questionIndex: battle.currentIndex,
    });

    return NextResponse.json({ hasAnswered: !!hasAnswered });
  } catch (error) {
    console.error("Error checking answer status:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}