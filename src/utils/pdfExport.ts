
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type RequestStatus = "pending" | "in-progress" | "completed" | "escalated";

interface WifiRequest {
  id: string;
  name: string;
  email: string;
  room_number: string;
  device_type: string;
  issue_type: string;
  description: string;
  status: RequestStatus;
  created_at: Date;
}

export const generatePDF = async (requests: WifiRequest[], reportType: string, dateRange: { from?: Date, to?: Date }) => {
  try {
    const doc = new jsPDF();
    
    // Add report title
    doc.setFontSize(18);
    doc.setTextColor(111, 44, 110); // #6f2c6e
    doc.text('Lilac WiFi Support', 14, 22);
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(`${reportType.replace('-', ' ').toUpperCase()} REPORT`, 14, 32);
    
    // Add date range
    const dateText = dateRange.from && dateRange.to 
      ? `Date Range: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
      : 'All Dates';
    doc.setFontSize(10);
    doc.text(dateText, 14, 42);
    
    // Current date
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 48);
    
    // Filter requests by date if date range is provided
    const filteredRequests = dateRange.from && dateRange.to
      ? requests.filter(req => {
          const reqDate = new Date(req.created_at);
          return reqDate >= dateRange.from && reqDate <= dateRange.to;
        })
      : requests;
    
    // Create summary table
    const summary = {
      total: filteredRequests.length,
      pending: filteredRequests.filter(r => r.status === 'pending').length,
      inProgress: filteredRequests.filter(r => r.status === 'in-progress').length,
      completed: filteredRequests.filter(r => r.status === 'completed').length,
      escalated: filteredRequests.filter(r => r.status === 'escalated').length,
    };
    
    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Count']],
      body: [
        ['Total Requests', summary.total.toString()],
        ['Pending', summary.pending.toString()],
        ['In Progress', summary.inProgress.toString()],
        ['Completed', summary.completed.toString()],
        ['Escalated', summary.escalated.toString()],
      ],
      headStyles: { fillColor: [111, 44, 110] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });
    
    // Create detailed table 
    if (reportType === 'detailed' || reportType === 'summary') {
      const lastTable = (doc as any).lastAutoTable;
      const finalY = lastTable ? lastTable.finalY : 55;
      
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Name', 'Room', 'Issue Type', 'Status', 'Date']],
        body: filteredRequests.map(req => [
          req.name,
          req.room_number,
          req.issue_type,
          req.status,
          new Date(req.created_at).toLocaleDateString()
        ]),
        headStyles: { fillColor: [111, 44, 110] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });
    }
    
    // Save PDF
    const fileName = `lilac-wifi-${reportType}-report-${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF report');
    return null;
  }
};
