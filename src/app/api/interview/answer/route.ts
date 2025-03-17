import { connectDb } from "@/lib/connectDb";
import Interview from "@/models/Interview";
import { evaluteAnswer } from "@/utils/aiApi";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { interviewId, question, answer } = await req.json();

        if (!question || !answer || !interviewId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        let score = 0, message = "";
        try {
            const evaluation = await evaluteAnswer(question, answer);
            score = evaluation.score || 0;
            message = evaluation.message || "";
        } catch (err) {
            console.error("AI Evaluation Error:", err);
        }

        const responseData = { question, answer, score, message: interview.IsAiComment ? message : undefined };
        interview.response.push(responseData);

        if (interview.currentIndex >= interview.questions.length - 1) {
            interview.status = "completed";
            await interview.save();
            return NextResponse.json({ message: "completed", status: "completed" });
        }

        interview.currentIndex += 1;
        await interview.save();

        return NextResponse.json({
            comment: interview.IsAiComment ? message : undefined,
            status: interview.status,
            nextIndex: interview.currentIndex,
            nextQuestion: interview.questions[interview.currentIndex] || null
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}