import { useReactToPrint } from 'react-to-print';

interface ExportButtonProps {
  documentTitle: string;
  getPrintRef: () => HTMLDivElement | null;
}

export default function ExportButton({ documentTitle, getPrintRef }: ExportButtonProps) {
  const handlePrint = useReactToPrint({
    content: () => getPrintRef(),
    documentTitle: documentTitle.replace(/\s+/g, ''),
    pageStyle: `
      @page { size: A4; margin: 0; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    `,
  });

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1.5"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      导出 PDF
    </button>
  );
}
