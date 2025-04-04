import { pusherServer } from "@/utils/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { battleCode, userId, typing } = await req.json()

    await pusherServer.trigger(`presence-battle-${battleCode}`, "typing-event", {
        userId,
        typing
    })
    return NextResponse.json({ success: true })
}