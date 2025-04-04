import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/connectDb";
import Battle from "@/models/Battle";

//battle/lobby/route
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const battleCode = searchParams.get("battleCode");

    if (!battleCode) {
      return NextResponse.json({ error: "Battle code is required" }, { status: 400 });
    }

    const battle = await Battle.findOne({ battleCode })
    if (!battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }
    
    console.log("battle: ", battle);
    return NextResponse.json({
      players: battle.players,
      maxPlayers: battle.maxPlayers,
      status: battle.status,
      battleDetails: { topic: battle.topic, difficulty: battle.difficulty}
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}