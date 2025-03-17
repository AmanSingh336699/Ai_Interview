import { connectDb } from "@/lib/connectDb";
import Interview from "@/models/Interview";
import { generateAIQuestions } from "@/utils/aiApi";
import { NextResponse } from "next/server";

//api/start
export async function POST(req: Request){
    try {
        await connectDb()
        const { userId, role, experience, techStack, aiComments } = await req.json();
        if(!userId || !role || !experience || !techStack){
            console.log("fields are missing")
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }
        const questions = await generateAIQuestions(role, experience, techStack)
        const interview = new Interview({
            userId,
            role,
            experience,
            IsAiComment: aiComments,
            techStack,
            questions,
            currentIndex: 0,
            responses: [],
            status: "ongoing"
        });
        await interview.save();
        return NextResponse.json({ interviewId: interview._id }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}