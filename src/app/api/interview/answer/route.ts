import { connectDb } from "@/lib/connectDb";
import Interview, { IInterview } from "@/models/Interview";
import { evaluteAnswer } from "@/utils/aiApi";
import { NextRequest, NextResponse } from "next/server";

//api/answer
export async function POST(req: NextRequest){
    try {
        const { interviewId, question, answer } = await req.json()
        if(!question || !answer || !interviewId){
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }
        await connectDb()
        const evaluation = await evaluteAnswer(question, answer)
        const score = evaluation.score || 0
        const message = evaluation.message || ""
        const interview = await Interview.findByIdAndUpdate(interviewId, {
            $push: { response: { question, answer, score, message } }
        }, { new: true })
        if(!interview){
            console.log("interview not found...")
            return NextResponse.json({ error: "Interview not found" }, { status: 404 })
        }
        if(interview.currentIndex + 1 >= interview.questions.length){
            interview.status = "completed"
            await interview.save()
            return NextResponse.json({ message: "completed"})
        }

        interview.currentIndex += 1
        await interview.save()
        const nextQuestion = interview.questions[interview.currentIndex]
        return NextResponse.json({ comment: message, status: interview.status, nextQuestion, nextIndex: interview.currentIndex }, { status: 200 })
        
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}