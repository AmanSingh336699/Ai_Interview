import { connectDb } from "@/lib/connectDb";
import Interview from "@/models/Interview";
import { NextRequest, NextResponse } from "next/server";

//api/question
export async function GET(req: NextRequest){
    try {
        await connectDb()
        const { searchParams } = new URL(req.url)
        const interviewId = searchParams.get("interviewId")
        if(!interviewId){
            return NextResponse.json({ error: "interview id not present "}, { status: 400 })
        }
        const interview = await Interview.findById(interviewId)
        if(!interview){
            return NextResponse.json({ error: "interview not present "}, { status: 404 })
        }
        return NextResponse.json({ question: interview.questions[interview.currentIndex], currentIndex: interview.currentIndex })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "internal server error" }, { status: 500 })
    }
}