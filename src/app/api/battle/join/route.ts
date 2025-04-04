import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/connectDb";
import Battle from "@/models/Battle";
import User from "@/models/User";
import { pusherServer } from "@/utils/config";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { userId, name, battleCode } = await req.json();

    if (!battleCode || !userId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const battle = await Battle.findOne({ battleCode });
    if (!battle) {
      return NextResponse.json({ error: "Invalid battle code" }, { status: 404 });
    }

    if (battle.createdBy === userId) {
      return NextResponse.json({ error: "Creator cannot join" }, { status: 400 });
    }

    if (battle.players.some((p: { userId: string }) => p.userId === userId)) {
      return NextResponse.json({ error: "Already joined" }, { status: 400 });
    }

    if (battle.players.length >= battle.maxPlayers) {
      return NextResponse.json({ error: "Too many players" }, { status: 400 });
    }

    const user = await User.findById(userId).select("avatar");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newPlayer = { userId, name, score: 0, avatar: user.avatar || null };
    battle.players.push(newPlayer);
    await battle.save();
    await pusherServer.trigger(`battle-${battleCode}`, "player-joined", { players: battle.players });

    if (battle.players.length === battle.maxPlayers) {
      battle.status = "ongoing";
      await battle.save();
      await pusherServer.trigger(`battle-${battleCode}`, "battle-started", { battleCode });
    }

    return NextResponse.json({ message: "Joined successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in /battle/join:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
