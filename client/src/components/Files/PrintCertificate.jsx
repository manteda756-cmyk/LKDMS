'use client';
import { useQuery } from 'react-query';
import { useEffect } from 'react';
import api from '@/lib/api';
import useStore from '@/store/useStore';
import { format } from 'date-fns';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function PrintCertificate({ id }) {
  const { language } = useStore();

  const { data: file, isLoading: fileLoading } = useQuery(
    ['file', id],
    () => api.get(`/files/${id}`).then(r => r.data.data)
  );

  const { data: stamps, isLoading: stampsLoading } = useQuery(
    'stampSettings',
    () => api.get('/settings/stamps').then(r => r.data.data),
    { staleTime: 5 * 60 * 1000 }
  );

  // Auto-print once everything is loaded
  useEffect(() => {
    if (!fileLoading && !stampsLoading && file) {
      const timer = setTimeout(() => window.print(), 600);
      return () => clearTimeout(timer);
    }
  }, [fileLoading, stampsLoading, file]);

  const getTitle = () => {
    if (!file) return '';
    if (language === 'en' && file.title_en) return file.title_en;
    if (language === 'or' && file.title_or) return file.title_or;
    return file.title_am;
  };

  const getDeptName = () => {
    if (!file) return '—';
    if (language === 'en' && file.dept_name_en) return file.dept_name_en;
    if (language === 'or' && file.dept_name_or) return file.dept_name_or;
    return file.dept_name_am || '—';
  };

  const today = format(new Date(), 'dd/MM/yyyy');
  const uploadDate = file?.upload_date ? format(new Date(file.upload_date), 'dd/MM/yyyy') : '—';

  if (fileLoading || stampsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Preparing certificate..." />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">File not found</p>
      </div>
    );
  }

  const managerName = stamps?.manager_name || '';
  const officeName = stamps?.office_name || (language === 'en' ? 'Lemi Kura Peace & Security Sub-city Office' : 'ለሚ ኩራ ሰላምና ጸጥታ አ/ጽ/ቤት');
  const stampUrl = stamps?.stamp_url || null;
  const signatureUrl = stamps?.signature_url || null;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm 20mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        body { font-family: 'Noto Sans Ethiopic', 'Segoe UI', sans-serif; background: white; }
      `}</style>

      {/* No-print controls */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-blue-700"
        >
          🖨️ {language === 'en' ? 'Print' : 'አትም'}
        </button>
        <button
          onClick={() => window.close()}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-gray-300"
        >
          ✕ {language === 'en' ? 'Close' : 'ዝጋ'}
        </button>
      </div>

      {/* A4 Certificate */}
      <div style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        background: 'white',
        padding: '15mm 20mm',
        boxSizing: 'border-box',
        position: 'relative',
      }}>

        {/* Ethiopian flag color bar */}
        <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ flex: 1, background: '#078930' }} />
          <div style={{ flex: 1, background: '#FCDD09' }} />
          <div style={{ flex: 1, background: '#DA121A' }} />
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #1B6CA8', paddingBottom: '16px' }}>
          <p style={{ fontSize: '11pt', color: '#1B6CA8', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>
            {language === 'en' ? 'FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA' : 'የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ'}
          </p>
          <p style={{ fontSize: '13pt', fontWeight: '800', color: '#1a1a2e', margin: '4px 0' }}>
            {officeName}
          </p>
          <p style={{ fontSize: '10pt', color: '#555', margin: 0 }}>
            {language === 'en' ? 'Digital File Registry Certificate' : 'ዲጅታል ፋይል ምዝገባ ሰርተፊኬት'}
          </p>
        </div>

        {/* Certificate title */}
        <div style={{ textAlign: 'center', margin: '16px 0 24px' }}>
          <h2 style={{
            fontSize: '16pt', fontWeight: '800', color: '#1B6CA8',
            border: '2px solid #1B6CA8', display: 'inline-block',
            padding: '6px 24px', borderRadius: '8px', letterSpacing: '1px',
          }}>
            {language === 'en' ? 'FILE REGISTRATION CERTIFICATE' : 'የፋይል ምዝገባ ሰርተፊኬት'}
          </h2>
        </div>

        {/* File info table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11pt' }}>
          <tbody>
            <Row label={language === 'en' ? 'File Number' : 'የፋይል ቁጥር'} value={file.file_number} mono />
            <Row label={language === 'en' ? 'File Title (Amharic)' : 'የፋይሉ ስም (አማርኛ)'} value={file.title_am} />
            {file.title_en && (
              <Row label="File Title (English)" value={file.title_en} />
            )}
            {file.title_or && (
              <Row label="Maqaa Faayilii (Af-Oromoo)" value={file.title_or} />
            )}
            <Row label={language === 'en' ? 'Department' : 'መምሪያ'} value={getDeptName()} />
            <Row label={language === 'en' ? 'Registration Date' : 'የምዝገባ ቀን'} value={uploadDate} />
            <Row label={language === 'en' ? 'File Type' : 'የፋይሉ አይነት'} value={file.file_type || '—'} />
            {file.description && (
              <Row label={language === 'en' ? 'Description' : 'መግለጫ'} value={file.description} />
            )}
            <Row label={language === 'en' ? 'Certificate Date' : 'የሰርተፊኬት ቀን'} value={today} />
          </tbody>
        </table>

        {/* Note */}
        <div style={{
          background: '#f0f7ff', border: '1px solid #bfdbfe',
          borderRadius: '8px', padding: '10px 14px', marginBottom: '32px',
        }}>
          <p style={{ fontSize: '9pt', color: '#1e40af', margin: 0, lineHeight: '1.6' }}>
            {language === 'en'
              ? 'This certificate confirms that the above file has been officially registered in the digital file management system of this office.'
              : 'ይህ ሰርተፊኬት ከላይ የተጠቀሰው ፋይል በዚህ ጽ/ቤት ዲጅታል ፋይል አስተዳደር ሥርዓት ውስጥ በይፋ መመዝገቡን ያረጋግጣል።'}
          </p>
        </div>

        {/* Signature & Stamp section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
          {/* Signature block */}
          <div style={{ textAlign: 'center', minWidth: '160px' }}>
            {signatureUrl ? (
              <img
                src={signatureUrl}
                alt="Signature"
                style={{ height: '60px', objectFit: 'contain', display: 'block', margin: '0 auto 4px' }}
              />
            ) : (
              <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ borderBottom: '1px solid #aaa', width: '140px' }} />
              </div>
            )}
            <div style={{ borderTop: '1px solid #555', paddingTop: '4px', marginTop: signatureUrl ? '4px' : '0' }}>
              <p style={{ fontSize: '10pt', fontWeight: '700', margin: '2px 0', color: '#1a1a2e' }}>
                {managerName || (language === 'en' ? '_________________' : '_________________')}
              </p>
              <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>
                {language === 'en' ? 'Head of Office' : 'የጽ/ቤቱ ኃላፊ'}
              </p>
              <p style={{ fontSize: '8pt', color: '#888', margin: '2px 0 0' }}>{today}</p>
            </div>
          </div>

          {/* Stamp */}
          <div style={{ textAlign: 'center' }}>
            {stampUrl ? (
              <img
                src={stampUrl}
                alt="Official Stamp"
                style={{ width: '90px', height: '90px', objectFit: 'contain', opacity: 0.85 }}
              />
            ) : (
              <div style={{
                width: '90px', height: '90px', border: '2px dashed #aaa',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#bbb', fontSize: '9pt',
              }}>
                {language === 'en' ? 'STAMP' : 'ቴምብር'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: '12mm', left: '20mm', right: '20mm',
          borderTop: '1px solid #e5e7eb', paddingTop: '6px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p style={{ fontSize: '8pt', color: '#9ca3af', margin: 0 }}>
            {language === 'en' ? 'Digital File Management System' : 'ዲጅታል ፋይል አስተዳደር ሥርዓት'}
          </p>
          <p style={{ fontSize: '8pt', color: '#9ca3af', margin: 0, fontFamily: 'monospace' }}>
            #{file.file_number}
          </p>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, mono }) {
  return (
    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
      <td style={{
        padding: '7px 12px 7px 0', fontWeight: '600', color: '#374151',
        width: '38%', verticalAlign: 'top', fontSize: '10.5pt',
      }}>
        {label}
      </td>
      <td style={{ padding: '7px 0', color: '#1f2937', fontSize: '10.5pt' }}>
        <span style={mono ? { fontFamily: 'monospace', fontWeight: '700' } : {}}>
          {value}
        </span>
      </td>
    </tr>
  );
}
