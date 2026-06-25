import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = getServiceClient();

    const [{ count: total_files }, { data: withFile }, { data: departments }, { data: recent_files }] =
      await Promise.all([
        supabase.from('files').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('files').select('id', { count: 'exact' }).eq('is_active', true).not('file_path', 'is', null),
        supabase.from('departments_with_count').select('*').eq('is_active', true).order('count', { ascending: false }),
        supabase.from('files')
          .select('id, file_number, title_am, title_or, title_en, file_type, upload_date, download_count, departments(name_am, color)')
          .eq('is_active', true)
          .order('upload_date', { ascending: false })
          .limit(5),
      ]);

    const recent = (recent_files || []).map(f => ({
      ...f,
      dept_name_am: f.departments?.name_am,
      dept_color: f.departments?.color,
    }));

    return NextResponse.json({
      success: true,
      data: {
        total_files: total_files || 0,
        total: withFile?.length || 0,
        departments: departments || [],
        recent_files: recent,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
