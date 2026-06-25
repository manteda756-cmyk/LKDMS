import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServiceClient } from '@/lib/supabaseServer';
import { signToken } from '@/lib/authHelper';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

    const token = signToken({ id: user.id, username: user.username, role: user.role });

    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
