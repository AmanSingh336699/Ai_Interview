import { connectDb } from "@/lib/connectDb";
import Interview from "@/models/Interview";
import { evaluteAnswer } from "@/utils/aiApi";
import { NextRequest, NextResponse } from "next/server";

// api/answer
export async function POST(req: NextRequest){
    try {
        const { interviewId, question, answer } = await req.json()
        if(!question || !answer || !interviewId){
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }
        await connectDb()
        const evaluation = await evaluteAnswer(question, answer)
        const score = evaluation.score || 0
        console.log("ai score", score)
        await Interview.findByIdAndUpdate(interviewId, {
            $push: {
                response: {
                    question,
                    answer,
                    score
                }
            }
        }, { new: true })
        return NextResponse.json({ message: "submitted answer" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}