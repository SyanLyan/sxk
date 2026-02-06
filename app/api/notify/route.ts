import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { message } = await request.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 },
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { error: "Telegram is not configured" },
      { status: 500 },
    );
  }

  const url = new URL(`https://api.telegram.org/bot${token}/sendMessage`);
  url.searchParams.set("chat_id", chatId);
  url.searchParams.set("text", message);

  const response = await fetch(url.toString(), { method: "POST" });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Telegram request failed", details },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
