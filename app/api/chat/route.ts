// app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: "Service de chat en cours de construction" },
    { status: 200 }
  );
}