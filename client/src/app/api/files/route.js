import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/authHelper';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = getServiceClient();
    let query = supabase
      .from('files_with_dept')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (search) {
      query = query.or(
        `file_number.ilike.%${search}%,title_am.ilike.%${search}%,title_or.ilike.%${search}%,title_en.ilike.%${search}%,description.ilike.%${search}%`
      );
    }
    if (department) {
      query = query.eq('dept_slug', department);
    }

    const { data, error, count } = await query.order('file_number').range(from, to);
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [], total: count || 0, page, limit });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const formData = await req.formData();
    const file_number = formData.get('file_number');
    const title_am = formData.get('title_am');
    const title_or = formData.get('title_or') || null;
    const title_en = formData.get('title_en') || null;
    const department_id = formData.get('department_id') || null;
    const description = formData.get('description') || null;
    const fileObj = formData.get('file');

    if (!file_number || !title_am) {
      return NextResponse.json({ success: false, message: 'file_number and title_am required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    let file_path = null, file_name = null, file_type = null, file_size = 0;

    if (fileObj && fileObj.size > 0) {
      const bytes = await fileObj.arrayBuffer();
      const ext = fileObj.name.split('.').pop();
      const storageKey = `files/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('file-attachments')
        .upload(storageKey, bytes, { contentType: fileObj.type, upsert: false });

      if (uploadErr) throw uploadErr;

      file_path = storageKey;
      file_name = fileObj.name;
      file_type = ext.toUpperCase();
      file_size = fileObj.size;
    }

    const { data, error } = await supabase
      .from('files')
      .insert({
        file_number, title_am, title_or, title_en,
        department_id: department_id ? parseInt(department_id) : null,
        description, file_path, file_name, file_type, file_size,
        created_by: auth.user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ success: false, message: 'File number already exists' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ success: true, id: data.id, message: 'File created' }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
