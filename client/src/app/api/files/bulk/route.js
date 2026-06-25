import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/authHelper';
import * as XLSX from 'xlsx';

export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const department_id = formData.get('department_id') || null;

    if (!file) return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) {
      return NextResponse.json({ success: false, message: 'Excel file is empty' }, { status: 400 });
    }

    // Normalize column names — support various header spellings
    const normalize = (row) => {
      const lower = {};
      Object.keys(row).forEach(k => { lower[k.toLowerCase().trim().replace(/\s+/g,'_')] = row[k]; });

      const fileNumber =
        lower['file_number'] || lower['folder_number'] || lower['number'] ||
        lower['የፋይል_ቁጥር'] || lower['ቁጥር'] || lower['no'] || lower['#'] || '';

      const titleAm =
        lower['title_am'] || lower['amharic'] || lower['title'] ||
        lower['የፋይል_ስም'] || lower['ስም'] || lower['name'] || lower['file_name'] || '';

      const titleEn =
        lower['title_en'] || lower['english'] || lower['title_english'] || '';

      const titleOr =
        lower['title_or'] || lower['oromo'] || lower['title_oromo'] || '';

      const description =
        lower['description'] || lower['desc'] || lower['መግለጫ'] || '';

      const deptId =
        lower['department_id'] || lower['dept_id'] || lower['department'] || department_id || null;

      return { fileNumber: String(fileNumber).trim(), titleAm: String(titleAm).trim(), titleEn: String(titleEn).trim(), titleOr: String(titleOr).trim(), description: String(description).trim(), deptId };
    };

    const supabase = getServiceClient();
    const results = { inserted: 0, skipped: 0, errors: [] };

    for (const raw of rows) {
      const { fileNumber, titleAm, titleEn, titleOr, description, deptId } = normalize(raw);

      if (!fileNumber || !titleAm) {
        results.errors.push(`Row skipped — missing file number or Amharic title: ${JSON.stringify(raw)}`);
        results.skipped++;
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
        if (error.code === '23505') {
          results.skipped++;
          results.errors.push(`Skipped duplicate: ${fileNumber}`);
        } else {
          results.errors.push(`Error on ${fileNumber}: ${error.message}`);
          results.skipped++;
        }
      } else {
        results.inserted++;
      }
    }

    return NextResponse.json({
      success: true,
      inserted: results.inserted,
      skipped: results.skipped,
      errors: results.errors,
      message: `${results.inserted} files imported, ${results.skipped} skipped`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}
