import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServiceClient } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/authHelper';

export async function PUT(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const { full_name, role, is_active, password } = await req.json();
    const supabase = getServiceClient();
    const updates = { full_name, role, is_active };
    if (password) updates.password_hash = await bcrypt.hash(password, 10);

    const { error } = await supabase.from('users').update(updates).eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Updated' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  if (String(params.id) === String(auth.user.id)) {
    return NextResponse.json({ success: false, message: 'Cannot deactivate yourself' }, { status: 400 });
  }
  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('users').update({ is_active: false }).eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Deactivated' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
