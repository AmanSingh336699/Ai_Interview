import { connectDb } from "@/lib/connectDb";
import Interview from "@/models/Interview";
import { generateHint } from "@/utils/aiApi";
import { NextRequest, NextResponse } from "next/server";

// api/hint
export async function POST(req: NextRequest){
    try {
        await connectDb()
        const { question } = await req.json()
        const hint = await generateHint(question)
        return NextResponse.json({ hint }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}