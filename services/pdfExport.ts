
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { TimeRecord } from '../types';

export const generatePDF = (records: TimeRecord[]) => {
  // Use any for the doc to handle dynamic properties added by plugins if needed, 
  // though we will now call autoTable directly.
  const doc = new jsPDF() as any;
  const now = new Date();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text('Timesheet Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${format(now, 'PPP p')}`, 14, 28);

  const tableData = records.map(record => [
    format(new Date(record.startTime), 'MMM dd, yyyy'),
    format(new Date(record.startTime), 'HH:mm:ss'),
    format(new Date(record.endTime), 'HH:mm:ss'),
    formatDuration(record.duration),
  ]);

  // Use the autoTable function directly instead of doc.autoTable
  autoTable(doc, {
    startY: 35,
    head: [['Date', 'Start Time', 'End Time', 'Duration']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 35 },
  });

  const totalMs = records.reduce((acc, rec) => acc + rec.duration, 0);
  // Access finalY from the metadata added by autoTable
  const finalY = (doc as any).lastAutoTable?.finalY || 40;
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Records: ${records.length}`, 14, finalY + 10);
  doc.text(`Total Time: ${formatDuration(totalMs)}`, 14, finalY + 18);

  doc.save(`Timesheet_${format(now, 'yyyy-MM-dd')}.pdf`);
};

const formatDuration = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};
