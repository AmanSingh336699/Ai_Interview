import { connectDb } from "@/lib/connectDb";
import Interview from "@/models/Interview";
import { generateFeedback } from "@/utils/aiApi";
import { NextRequest, NextResponse } from "next/server";

// api/summery
export async function GET(req: NextRequest){
    try {
        const url = new URL(req.url)
        const interviewId = url.searchParams.get("interviewId")
        if(!interviewId){
            return NextResponse.json({ error: "Missing userId in request" }, { status: 400 })
        }
        await connectDb()
        const interview = await Interview.findById(interviewId)
        if(!interview){
            return NextResponse.json({ error: "Interview not found" }, { status: 404 })
        }
        if(interview.status === "completed"){
            return NextResponse.json({ interview }, { status: 200 })
        }
        const feedback = await generateFeedback(interview.response)
        console.log("ai feedback: ", feedback)
        interview.feedback = feedback
        interview.status = "completed"
        await interview.save()
        return NextResponse.json({ interview }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}