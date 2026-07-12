import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';

// Force dynamic — never cache this route, always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = getServiceClient();

    const [
      { count: total_files },
      { count: files_with_doc },
      { data: departments },
      { data: recent_files },
    ] = await Promise.all([
      // Total active files
      supabase
        .from('files')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),

      // Files that have an attachment uploaded
      supabase
        .from('files')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .not('file_path', 'is', null),

      // Department stats with file counts
      supabase
        .from('departments_with_count')
        .select('*')
        .eq('is_active', true)
        .order('count', { ascending: false }),

      // 5 most recently added files
      supabase
        .from('files')
        .select('id, file_number, title_am, title_or, title_en, file_type, upload_date, download_count, departments(name_am, color)')
        .eq('is_active', true)
        .order('upload_date', { ascending: false })
        .limit(5),
    ]);

    const recent = (recent_files || []).map(f => ({
      ...f,
      dept_name_am: f.departments?.name_am,
      dept_color:   f.departments?.color,
    }));

    return NextResponse.json({
      success: true,
      data: {
        total_files:    total_files    || 0,
        total:          files_with_doc || 0,
        departments:    departments    || [],
        recent_files:   recent,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
