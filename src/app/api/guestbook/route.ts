import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

const GUESTBOOK_KEY = "guestbook:messages";

interface GuestbookMessage {
  id: string;
  name: string;
  text: string;
  date: string;
  likes: number;
}

export async function GET() {
  try {
    const messages = await redis.lrange<GuestbookMessage>(GUESTBOOK_KEY, 0, -1);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch guestbook messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 3 messages per minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, text } = body;

    if (!name?.trim() || !text?.trim()) {
      return NextResponse.json({ error: "Name and text are required" }, { status: 400 });
    }

    if (text.trim().length > 500) {
      return NextResponse.json({ error: "Text must be 500 characters or less" }, { status: 400 });
    }

    const newMessage: GuestbookMessage = {
      id: Date.now().toString(),
      name: name.trim(),
      text: text.trim(),
      date: new Date().toISOString().split("T")[0],
      likes: 0,
    };

    await redis.lpush(GUESTBOOK_KEY, newMessage);

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Failed to create guestbook message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const messages = await redis.lrange<GuestbookMessage>(GUESTBOOK_KEY, 0, -1);
    const messageIndex = messages.findIndex((m) => m.id === id);

    if (messageIndex === -1) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    messages[messageIndex].likes += 1;
    await redis.lset(GUESTBOOK_KEY, messageIndex, messages[messageIndex]);

    return NextResponse.json(messages[messageIndex]);
  } catch (error) {
    console.error("Failed to like message:", error);
    return NextResponse.json({ error: "Failed to like message" }, { status: 500 });
  }
}
