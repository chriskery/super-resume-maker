import { useReactToPrint } from 'react-to-print';

interface ExportButtonProps {
  documentTitle: string;
  getPrintRef: () => HTMLDivElement | null;
  compactScale?: number;
}

export default function ExportButton({ documentTitle, getPrintRef, compactScale }: ExportButtonProps) {
  // 智能压缩生效时，打印 CSS 仍保留 transform: scale() 以确保 PDF 输出 1 页
  const printTransform = compactScale && compactScale < 1
    ? `scale(${compactScale})`
    : 'none';
  const handlePrint = useReactToPrint({
    content: () => getPrintRef(),
    documentTitle: documentTitle.replace(/\s+/g, ''),
    pageStyle: `
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      html, body { margin: 0 !important; padding: 0 !important; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .print-area {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 794px !important;
        transform: ${printTransform} !important;
        transform-origin: top left !important;
        box-shadow: none !important;
        overflow: visible !important;
      }
      .no-print { display: none !important; }
    `,
  });

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="px-4 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {compactScale && compactScale < 1 ? `导出 PDF（${Math.round(compactScale * 100)}%）` : '导出 PDF'}
    </button>
  );
}