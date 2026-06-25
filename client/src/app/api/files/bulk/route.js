import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/authHelper';
import * as XLSX from 'xlsx';

// Duplicate = same file_number AND same department_id
// Different departments with same file_number = ALLOWED
async function isDuplicate(supabase, file_number, department_id) {
  let query = supabase
    .from('files')
    .select('id')
    .eq('file_number', file_number.trim())
    .eq('is_active', true);

  if (department_id) {
    query = query.eq('department_id', parseInt(department_id));
  } else {
    query = query.is('department_id', null);
  }

  const { data } = await query.limit(1);
  return data && data.length > 0;
}

export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const default_department_id = formData.get('department_id') || null;

    if (!file) return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) {
      return NextResponse.json({ success: false, message: 'Excel file is empty' }, { status: 400 });
    }

    const normalize = (row) => {
      const lower = {};
      Object.keys(row).forEach(k => {
        lower[k.toLowerCase().trim().replace(/\s+/g, '_')] = row[k];
      });

      const fileNumber =
        String(lower['file_number'] || lower['folder_number'] || lower['number'] ||
        lower['የፋይል_ቁጥር'] || lower['ቁጥር'] || lower['no'] || lower['#'] || '').trim();

      const titleAm =
        String(lower['title_am'] || lower['amharic'] || lower['title'] ||
        lower['የፋይል_ስም'] || lower['ስም'] || lower['name'] || lower['file_name'] || '').trim();

      const titleEn = String(lower['title_en'] || lower['english'] || '').trim();
      const titleOr = String(lower['title_or'] || lower['oromo'] || '').trim();
      const description = String(lower['description'] || lower['desc'] || lower['መግለጫ'] || '').trim();

      // Row-level department_id overrides the default if provided
      const rowDeptId = lower['department_id'] || lower['dept_id'] || null;
      const deptId = rowDeptId ? String(rowDeptId).trim() : default_department_id;

      return { fileNumber, titleAm, titleEn, titleOr, description, deptId };
    };

    const supabase = getServiceClient();
    const results = { inserted: 0, skipped: 0, errors: [] };

    for (const raw of rows) {
      const { fileNumber, titleAm, titleEn, titleOr, description, deptId } = normalize(raw);

      if (!fileNumber || !titleAm) {
        results.errors.push(`ሰናፍር ዝለለ — ቁጥር ወይም ስም የለም: ${JSON.stringify(raw)}`);
        results.skipped++;
        continue;
      }

      // Check duplicate per department
      const dup = await isDuplicate(supabase, fileNumber, deptId);
      if (dup) {
        results.skipped++;
        results.errors.push(
          `ዝለለ (ተደጋጋሚ): ፋይል ቁጥር "${fileNumber}" በዚህ መምሪያ አስቀድሞ አለ — ወደ ሌላ መምሪያ ያስገቡ።`
        );
        continue;
      }

      const { error } = await supabase.from('files').insert({
        file_number: fileNumber,
        title_am: titleAm,
        title_en: titleEn || null,
        title_or: titleOr || null,
        description: description || null,
        department_id: deptId ? parseInt(deptId) : null,
        created_by: auth.user.id,
      });

      if (error) {
        results.skipped++;
        results.errors.push(`ስህተት (${fileNumber}): ${error.message}`);
      } else {
        results.inserted++;
      }
    }

    return NextResponse.json({
      success: true,
      inserted: results.inserted,
      skipped: results.skipped,
      errors: results.errors,
      message: `${results.inserted} ፋይሎች ገብተዋል፣ ${results.skipped} ዝለለ`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}
