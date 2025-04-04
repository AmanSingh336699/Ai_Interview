import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/utils/config";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

//pusher/auth
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const contentType = request.headers.get("content-type");

    let socket_id: string | null = null;
    let channel_name: string | null = null;

    if (contentType?.includes("application/json")) {
      const body = await request.json();
      socket_id = body.socket_id;
      channel_name = body.channel_name;
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
      const rawBody = await request.text();
      const params = new URLSearchParams(rawBody);
      socket_id = params.get("socket_id");
      channel_name = params.get("channel_name");
    } else {
      return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 415 });
    }

    if (!socket_id || !channel_name) {
      return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
    }

    const userId = session.user.id;
    const userName = session.user.name || "Anonymous";
    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
      user_id: userId,
      user_info: { name: userName },
    });
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Error parsing request or authenticating:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}