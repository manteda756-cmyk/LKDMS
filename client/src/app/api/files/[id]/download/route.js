import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';

export async function GET(req, { params }) {
  try {
    const supabase = getServiceClient();
    const { data: file, error } = await supabase
      .from('files')
      .select('file_path, file_name')
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !file) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    if (!file.file_path) return NextResponse.json({ success: false, message: 'No attachment' }, { status: 404 });

    // Get a signed URL (valid 60 seconds) from Supabase Storage
    const { data: signed, error: signErr } = await supabase.storage
      .from('file-attachments')
      .createSignedUrl(file.file_path, 60, { download: file.file_name || true });

    if (signErr) throw signErr;

    // Increment download count
    supabase.rpc('increment_download', { file_id: parseInt(params.id) }).then(() => {});

    return NextResponse.redirect(signed.signedUrl);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
