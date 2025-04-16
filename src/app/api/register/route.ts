import { connectDb } from "@/lib/connectDb";
import { registerSchema } from "@/lib/validationSchema";
import User from "@/models/User";
import { NextResponse } from "next/server";


export async function POST(req: Request){
    try {
        await connectDb()
        const body = await req.json()
        const { username, email, password } = registerSchema.parse(body)
        const existedUser = await User.findOne({ email })
        if(existedUser){
            return NextResponse.json({ message: 'User already registered' }, { status: 400 })
        }
    
        const user = await User.create({
            username,
            email,
            password,
        })
    
        return NextResponse.json({ message: "User registered", user }, { status: 201 })
    } catch (_error) {
        return NextResponse.json({ message: "Something wen wrong" }, { status: 500 })
    }
}