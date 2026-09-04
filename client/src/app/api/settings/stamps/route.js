import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/authHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET — fetch current stamp & signature URLs
export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['stamp_path', 'signature_path', 'manager_name', 'office_name']);

    if (error) throw error;

    const result = {};
    (data || []).forEach(row => { result[row.key] = row.value; });

    // Generate signed URLs so the browser can display the images
    for (const field of ['stamp_path', 'signature_path']) {
      if (result[field]) {
        const { data: urlData } = await supabase.storage
          .from('file-attachments')
          .createSignedUrl(result[field], 3600);
        result[field.replace('_path', '_url')] = urlData?.signedUrl || null;
      }
    }

    return NextResponse.json({ success: true, data: result }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST — upload stamp or signature image
export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const formData = await req.formData();
    const type = formData.get('type'); // 'stamp' or 'signature'
    const manager_name = formData.get('manager_name');
    const office_name = formData.get('office_name');
    const fileObj = formData.get('file');

    const supabase = getServiceClient();

    // Save text fields if provided
    if (manager_name !== null) {
      await upsertSetting(supabase, 'manager_name', manager_name);
    }
    if (office_name !== null) {
      await upsertSetting(supabase, 'office_name', office_name);
    }

    // Upload image if provided
    if (fileObj && fileObj.size > 0 && (type === 'stamp' || type === 'signature')) {
      const ext = fileObj.name.split('.').pop().toLowerCase();
      if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        return NextResponse.json({ success: false, message: 'Only PNG, JPG, WEBP images allowed' }, { status: 400 });
      }

      const storageKey = `settings/${type}-${Date.now()}.${ext}`;
      const bytes = await fileObj.arrayBuffer();

      // Delete old image if exists
      const { data: existing } = await supabase
        .from('settings').select('value').eq('key', `${type}_path`).single();
      if (existing?.value) {
        await supabase.storage.from('file-attachments').remove([existing.value]);
      }

      const { error: uploadErr } = await supabase.storage
        .from('file-attachments')
        .upload(storageKey, bytes, { contentType: fileObj.type, upsert: false });

      if (uploadErr) throw uploadErr;
      await upsertSetting(supabase, `${type}_path`, storageKey);
    }

    return NextResponse.json({ success: true, message: 'Saved' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE — remove stamp or signature
export async function DELETE(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const { type } = await req.json();
    if (!['stamp', 'signature'].includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid type' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: existing } = await supabase
      .from('settings').select('value').eq('key', `${type}_path`).single();

    if (existing?.value) {
      await supabase.storage.from('file-attachments').remove([existing.value]);
      await supabase.from('settings').delete().eq('key', `${type}_path`);
    }

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

async function upsertSetting(supabase, key, value) {
  await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
}
