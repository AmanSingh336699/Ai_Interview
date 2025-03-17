import { NextResponse } from "next/server";
import Interview from "@/models/Interview";
import { connectDb } from "@/lib/connectDb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function GET(req: Request) {
    try {
        await connectDb();

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const url = new URL(req.url);
        let page = parseInt(url.searchParams.get("page") || "1");
        let limit = 10;
        let order = url.searchParams.get("order") || "desc";
        let status = url.searchParams.get("status");

        page = Math.max(1, page);
        const skip = (page - 1) * limit;
        const orderValue = order === "asc" ? 1 : -1;

        let filter: any = { userId };

        if (status) filter.status = status; 

        const interviews = await Interview.find(filter)
            .sort({ createdAt: orderValue }) 
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Interview.countDocuments(filter);

        return NextResponse.json({ interviews, total, page, totalPages: Math.ceil(total / limit) }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching interviews", error }, { status: 500 });
    }
}