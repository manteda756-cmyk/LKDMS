import { FileText, FileSpreadsheet, Image, Archive, File, Presentation } from 'lucide-react';

const typeMap = {
  // PDF
  PDF:  { icon: FileText,        color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',       label: 'PDF' },
  // Word
  DOCX: { icon: FileText,        color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',     label: 'Word' },
  DOC:  { icon: FileText,        color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',     label: 'Word' },
  // Excel
  XLSX: { icon: FileSpreadsheet, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20',   label: 'Excel' },
  XLS:  { icon: FileSpreadsheet, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20',   label: 'Excel' },
  CSV:  { icon: FileSpreadsheet, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20',   label: 'CSV' },
  // PowerPoint
  PPTX: { icon: Presentation,    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'PowerPoint' },
  PPT:  { icon: Presentation,    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'PowerPoint' },
  // Archives
  ZIP:  { icon: Archive,         color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'ZIP' },
  RAR:  { icon: Archive,         color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'RAR' },
  // Images
  JPG:  { icon: Image,           color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Image' },
  JPEG: { icon: Image,           color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Image' },
  PNG:  { icon: Image,           color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Image' },
  GIF:  { icon: Image,           color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Image' },
  WEBP: { icon: Image,           color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Image' },
};

export default function FileTypeIcon({ type, size = 'md' }) {
  const info = typeMap[type?.toUpperCase()] || {
    icon: File, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', label: type || 'File'
  };
  const Icon = info.icon;
  const sizeClass = size === 'lg' ? 'w-10 h-10 p-2.5' : size === 'sm' ? 'w-7 h-7 p-1.5' : 'w-9 h-9 p-2';
  const iconSize  = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className={`${sizeClass} ${info.bg} rounded-lg flex items-center justify-center shrink-0`}>
      <Icon className={`${iconSize} ${info.color}`} />
    </div>
  );
}

export function FileTypeBadge({ type }) {
  const info = typeMap[type?.toUpperCase()] || {
    color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', label: type || 'File'
  };
  return (
    <span className={`badge ${info.bg} ${info.color} font-medium`}>
      {info.label || type}
    </span>
  );
}
