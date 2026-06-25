import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/authHelper';

export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('departments_with_count')
      .select('*')
      .eq('is_active', true)
      .order('name_am');

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const { name_am, name_or, name_en, slug, description, color, icon } = body;

    if (!name_am || !name_en || !slug) {
      return NextResponse.json({ success: false, message: 'name_am, name_en, slug are required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('departments')
      .insert({ name_am, name_or, name_en, slug, description, color: color || '#1B4F72', icon: icon || 'folder' })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ success: false, message: 'Slug already exists' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
