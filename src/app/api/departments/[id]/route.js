import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/authHelper';

export async function GET(req, { params }) {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !data) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const { name_am, name_or, name_en, slug, description, color, icon } = body;
    const supabase = getServiceClient();

    const { error } = await supabase
      .from('departments')
      .update({ name_am, name_or, name_en, slug, description, color, icon, updated_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Updated' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('departments').update({ is_active: false }).eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
