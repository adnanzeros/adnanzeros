import { NextResponse } from "next/server";
import { sendContact } from "../../../lib/contact.js";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const result = await sendContact(
    body && typeof body === "object" ? body : {},
  );
  return NextResponse.json(result.body, { status: result.status });
}
