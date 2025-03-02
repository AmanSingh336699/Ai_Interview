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
        console.log(evaluteAnswer)
        const interview = Interview.findById(interviewId)
        if(interview){
            interview.response.push({ question, answer, score })
            await interview.save()
            return NextResponse.json({ message: "answer submitted" }, { status: 200 })
        }
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}