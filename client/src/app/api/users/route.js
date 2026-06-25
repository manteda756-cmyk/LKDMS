import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServiceClient } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/authHelper';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, is_active, last_login, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const { username, email, password, full_name, role } = await req.json();
    if (!username || !email || !password) {
      return NextResponse.json({ success: false, message: 'username, email, password required' }, { status: 400 });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('users')
      .insert({ username, email, password_hash, full_name, role: role || 'viewer' })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ success: false, message: 'User already exists' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
