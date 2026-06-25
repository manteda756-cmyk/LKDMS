import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/authHelper';

export async function GET(req) {
  const result = await authenticate(req);
  if (result.error) return NextResponse.json({ success: false, message: result.error }, { status: result.status });
  return NextResponse.json({ success: true, user: result.user });
}
