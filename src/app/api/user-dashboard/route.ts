import { authOptions } from "@/lib/authOption";
import { connectDb } from "@/lib/connectDb";
import Interview from "@/models/Interview";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    await connectDb()
    const session = await getServerSession(authOptions)
    if(!session?.user?.id){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const userId = session.user.id
        const totalInterviews = await Interview.countDocuments({ userId })
        const highesScoreInterview = await Interview.aggregate([
            { $match: { userId } },
            { $addFields: { totalScore: { $sum: "$response.score" } } },
            { $sort: { totalScore: -1 } },
            { $limit: 1 },
            { $project: { _id: 1, role: 1, experience: 1, techStack: 1, totalScore: 1, createdAt: 1} }
        ])
        return NextResponse.json({ totalInterviews, highestScoreInterview: highesScoreInterview[0] || null }, { status: 200 })
    } catch (_error) {
        console.error("Dashboard error", _error)
        return NextResponse.json({ error: "failed to fetch data" }, { status: 500 })
    }
}