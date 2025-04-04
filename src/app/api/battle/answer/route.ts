// api/battle/answer.ts (POST)
import { NextRequest, NextResponse } from "next/server";
import Battle from "@/models/Battle";
import Answer from "@/models/Answer";
import { connectDb } from "@/lib/connectDb";
import { evaluteAnswer, generateRanking } from "@/utils/aiApi";
import { pusherServer } from "@/utils/config";
import User, { IUser } from "@/models/User";
import { UpdatedRankAnswer, RankedAnswer } from "@/utils/Types";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { userId, battleCode, answer } = await req.json();

    const battle = await Battle.findOne({ battleCode });
    if (!battle || battle.status !== "ongoing") {
      return NextResponse.json({ error: "Battle nahi mila ya ongoing nahi hai" }, { status: 404 });
    }

    const currentIndex = battle.currentIndex;

    const existingAnswer = await Answer.findOne({
      battleCode,
      userId,
      questionIndex: currentIndex,
    });
    if (existingAnswer) {
      return NextResponse.json({ error: "Already answered" }, { status: 400 });
    }

    const question = battle.questions[currentIndex];
    const { score } = await evaluteAnswer(question, answer);

    const newAnswer = new Answer({
      battleCode,
      userId,
      questionIndex: currentIndex,
      answer,
      score,
    });
    await newAnswer.save();

    const player = battle.players.find((p: { userId: string }) => p.userId === userId);
    if (player) {
      player.score = (player.score || 0) + score;
    }

    const answersForCurrent = await Answer.countDocuments({
      battleCode,
      questionIndex: currentIndex,
    });
    const allAnswered = answersForCurrent === battle.players.length;

    if (allAnswered) {
      battle.currentIndex++;
      if (battle.currentIndex >= battle.questions.length) {
        battle.status = "completed";
      }
    }

    await battle.save();

    if (allAnswered) {
      if (battle.status === "completed") {
        await pusherServer.trigger(`presence-battle-${battleCode}`, "battle-completed", {
          status: "completed",
        });
      } else {
        await pusherServer.trigger(`presence-battle-${battleCode}`, "next-question", {
          currentQuestionIndex: battle.currentIndex,
          question: battle.questions[battle.currentIndex] || null,
          status: battle.status,
        });
      }
    }

    await pusherServer.trigger(`presence-battle-${battleCode}`, "score-updated", {
      players: battle.players,
    });

    return NextResponse.json({ message: "Successfully answer submitted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
      await connectDb();
      const battleCode = req.nextUrl.searchParams.get("battleCode");
      if (!battleCode) {
        return NextResponse.json({ error: "Battle code nahi diya" }, { status: 400 });
      }
  
      const battle = await Battle.findOne({ battleCode })
      if (!battle) {
        return NextResponse.json({ error: "No Battle found" }, { status: 404 });
      }
      if(battle.AnswerRank.length){
        return NextResponse.json({ updatedRankAnswer: battle.AnswerRank, players: battle.players, status: battle.status }, { status: 200 });
      }
      const formattedAnswers = await Answer.find({ battleCode }).lean();
      const rankAnswers = await generateRanking(
        formattedAnswers.map((a) => ({
          userId: a.userId,
          question: battle.questions[a.questionIndex],
          answer: a.answer,
        }))
      );
      const userIds = [...new Set(rankAnswers.map((a: { userId: string }) => a.userId))];
      const users:IUser[] = await User.find({ _id: { $in: userIds } }).lean().select("username _id");

    const updatedRankAnswer: UpdatedRankAnswer[] = rankAnswers.map((answer: RankedAnswer) => ({
      username: users.find((u: IUser) => u._id?.toString() === answer.userId)?.username || "Unknown",
      question: answer.question,
      answer: answer.answer,
    }));
    battle.AnswerRank = updatedRankAnswer
    await battle.save()
      return NextResponse.json({ updatedRankAnswer, players: battle.players, status: battle.status }, { status: 200 });
    } catch (error) {
      console.error("error for fetching answer", error);
      return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
  }