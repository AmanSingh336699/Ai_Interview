import { NextRequest, NextResponse } from "next/server";
import Battle, { IBattle } from "@/models/Battle";
import { connectDb } from "@/lib/connectDb";
import crypto from "crypto";
import { generateBattle } from "@/utils/aiApi";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { userId, topic, difficulty, maxPlayers, name } = await req.json();
    
    if (!userId || !topic || !difficulty || !maxPlayers) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let battleCode = crypto.randomBytes(6).toString("hex").toUpperCase();

    while (await Battle.exists({ battleCode })) {
      battleCode = crypto.randomBytes(6).toString("hex").toUpperCase();
    }

    const questions = await generateBattle(topic, difficulty);

    const user = await User.findById(userId).select("avatar");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const players = [{ userId, name, score: 0, avatar: user.avatar }];

    const newBattle = new Battle({
      battleCode,
      createdBy: userId,
      topic,
      maxPlayers,
      players,
      difficulty,
      questions,
    });

    await newBattle.save();

    return NextResponse.json({ battleCode }, { status: 201 });

  } catch (error) {
    console.log("Error saving battle", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
