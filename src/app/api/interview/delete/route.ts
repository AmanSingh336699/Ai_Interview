import { connectDb } from "@/lib/connectDb";
import Interview from "@/models/Interview";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest){
    try {
        await connectDb()
        const interviewId = req.nextUrl.searchParams.get("interviewId")
        if(!interviewId){
            return NextResponse.json({ error: "interview id required" }, { status: 400 })
        }
        const deleteInterview = await Interview.findByIdAndDelete(interviewId)
        if(!deleteInterview){
            return NextResponse.json({ error: "Interview not found"}, { status: 404 })
        }
        return NextResponse.json({ message: "Interview deleted successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}