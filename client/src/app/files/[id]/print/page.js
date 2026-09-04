import PrintCertificate from '@/components/Files/PrintCertificate';

export default function PrintPage({ params }) {
  return <PrintCertificate id={params.id} />;
}
