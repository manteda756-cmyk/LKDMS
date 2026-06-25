import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/authHelper';

export async function GET(req, { params }) {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('files_with_dept')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !data) return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 });

    // Increment view count (fire and forget)
    supabase.from('files').update({ view_count: (data.view_count || 0) + 1 }).eq('id', params.id);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const formData = await req.formData();
    const supabase = getServiceClient();

    const { data: existing } = await supabase.from('files').select('*').eq('id', params.id).single();
    if (!existing) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    let { file_path, file_name, file_type, file_size } = existing;
    const fileObj = formData.get('file');

    if (fileObj && fileObj.size > 0) {
      // Delete old file from storage
      if (file_path) await supabase.storage.from('file-attachments').remove([file_path]);

      const bytes = await fileObj.arrayBuffer();
      const ext = fileObj.name.split('.').pop();
      const storageKey = `files/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('file-attachments')
        .upload(storageKey, bytes, { contentType: fileObj.type });

      if (uploadErr) throw uploadErr;
      file_path = storageKey;
      file_name = fileObj.name;
      file_type = ext.toUpperCase();
      file_size = fileObj.size;
    }

    const dept_id = formData.get('department_id');
    const { error } = await supabase.from('files').update({
      file_number: formData.get('file_number'),
      title_am: formData.get('title_am'),
      title_or: formData.get('title_or') || null,
      title_en: formData.get('title_en') || null,
      department_id: dept_id ? parseInt(dept_id) : null,
      description: formData.get('description') || null,
      file_path, file_name, file_type, file_size,
      updated_at: new Date().toISOString(),
    }).eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Updated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('files').update({ is_active: false }).eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
