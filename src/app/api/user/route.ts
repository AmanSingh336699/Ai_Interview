import { connectDb } from "@/lib/connectDb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
        const email = req.nextUrl.searchParams.get("email")
        if(!email){
            return NextResponse.json({ error: "Invalid email" }, { status: 400 })
        }

        await connectDb()
        const user = await User.findOne({ email })
        if(!user){
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        return NextResponse.json({ user }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}