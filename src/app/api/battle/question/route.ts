import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/connectDb";
import Battle from "@/models/Battle";

//battle/question/route
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const battleCode = req.nextUrl.searchParams.get("battleCode");
    if (!battleCode) {
      return NextResponse.json({ error: "Missing battleCode" }, { status: 400 });
    }

    const battle = await Battle.findOne({ battleCode });
    if (!battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }

    const currentIndex = battle.currentIndex;
    if (currentIndex >= battle.questions.length) {
      return NextResponse.json({ error: "Battle finished" }, { status: 400 });
    }
    console.log("question current index: " + currentIndex, "question", battle.questions[currentIndex]);

    return NextResponse.json({
      question: battle.questions[currentIndex],
      currentIndex,
      status: battle.status,
      players: battle.players,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}