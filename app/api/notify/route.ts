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

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Telegram request failed", details },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
