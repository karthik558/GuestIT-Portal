import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { WifiRequest, RequestStatus } from "@/types/wifi-request";

// Color scheme matching the dashboard
const COLORS = {
  primary: [111, 44, 110], // #6f2c6e - Primary Purple
  text: [60, 60, 60],
  muted: [107, 114, 128],
  successBg: [22, 163, 74],
  warningBg: [234, 179, 8],
  dangerBg: [220, 38, 38],
  infoBg: [59, 130, 246],
};

const FONTS = {
  regular: "helvetica",
  bold: "helvetica-bold",
};

export const generatePDF = async (requests: WifiRequest[], reportType: string, dateRange: { from?: Date, to?: Date }) => {
  try {
    const doc = new jsPDF();
    doc.addFont('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', 'Inter', 'normal');
    
    // Add report header with gradient-like effect
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    // Add logo/title with bolder appearance
    doc.setTextColor(255, 255, 255);
    doc.setFont(FONTS.bold);
    doc.setFontSize(28);
    doc.text('GUEST IT SUPPORT', 14, 25);
    
    // Add report type
    doc.setFont(FONTS.regular);
    doc.setFontSize(14);
    doc.text(`${reportType.replace('-', ' ').toUpperCase()} REPORT`, 14, 35);
    
    // Add date information section
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
    doc.text('Report Information', 14, 55);
    
    // Add divider line
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(14, 58, 196, 58);
    
    // Add date range and generation info
    doc.setTextColor(...COLORS.muted);
    const dateText = dateRange.from && dateRange.to 
      ? `Date Range: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
      : 'All Dates';
    doc.text(dateText, 14, 65);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 71);
    
    // Filter requests by date if date range is provided
    const filteredRequests = dateRange.from && dateRange.to
      ? requests.filter(req => {
          const reqDate = new Date(req.created_at);
          return reqDate >= dateRange.from && reqDate <= dateRange.to;
        })
      : requests;
    
    // Create summary section
    const summary = {
      total: filteredRequests.length,
      pending: filteredRequests.filter(r => r.status === 'pending').length,
      inProgress: filteredRequests.filter(r => r.status === 'in-progress').length,
      completed: filteredRequests.filter(r => r.status === 'completed').length,
      escalated: filteredRequests.filter(r => 
        r.status === 'escalated' || (r.status === 'completed' && r.was_escalated)
      ).length,
    };
    
    // Add summary table with modern styling
    autoTable(doc, {
      startY: 80,
      head: [['Metric', 'Count']],
      body: [
        ['Total Requests', summary.total.toString()],
        ['Pending', summary.pending.toString()],
        ['In Progress', summary.inProgress.toString()],
        ['Completed', summary.completed.toString()],
        ['Escalated', summary.escalated.toString()],
      ],
      headStyles: { 
        fillColor: COLORS.primary,
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 11,
        font: FONTS.regular,
      },
      alternateRowStyles: { 
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 40, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });
    
    // Function to add proper padding based on status
    const getStatusWithPadding = (status: string) => {
      // Add more padding for longer status text
      return status.includes('(Escalated)') ? '        ' + status : '    ' + status;
    };

    // Create detailed table with proper styling
    if (reportType === 'detailed' || reportType === 'summary') {
      const lastTable = (doc as any).lastAutoTable;
      const finalY = lastTable ? lastTable.finalY : 80;
      
      // Add section title
      doc.setFont(FONTS.bold);
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.text);
      doc.text('Request Details', 14, finalY + 15);
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Name', 'Room', 'Issue Type', 'Status', 'Date']],
        body: filteredRequests.map(req => [
          req.name,
          req.room_number,
          req.issue_type,
          getStatusWithPadding(getReportStatus(req)),
          new Date(req.created_at).toLocaleDateString()
        ]),
        headStyles: { 
          fillColor: COLORS.primary,
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'left',
        },
        bodyStyles: {
          fontSize: 10,
          font: FONTS.regular,
        },
        alternateRowStyles: { 
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 50 }, // Increased width for status column
          4: { cellWidth: 30 },
        },
        margin: { left: 14, right: 14 },
        didDrawCell: (data) => {
          // Add status color indicators
          if (data.section === 'body' && data.column.index === 3) {
            const status = data.cell.text[0].trim() as string;
            let color = COLORS.primary;
            
            if (status.includes('Pending')) color = COLORS.warningBg;
            if (status.includes('Progress')) color = COLORS.infoBg;
            if (status.includes('Completed')) color = COLORS.successBg;
            if (status.includes('Escalated')) color = COLORS.dangerBg;
            
            // Calculate proper positioning for the status indicator
            const circleX = data.cell.x + 3;
            const circleY = data.cell.y + (data.cell.height / 2);
            
            doc.setFillColor(...color);
            doc.circle(circleX, circleY, 1.5, 'F');
          }
        },
      });
    } else if (reportType === 'escalation') {
      const lastTable = (doc as any).lastAutoTable;
      const finalY = lastTable ? lastTable.finalY : 80;
      
      // Add section title for escalation report
      doc.setFont(FONTS.bold);
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.text);
      doc.text('Escalated Requests', 14, finalY + 15);
      
      // Filter only escalated requests
      const escalatedRequests = filteredRequests.filter(r => 
        r.status === 'escalated' || (r.status === 'completed' && r.was_escalated)
      );
      
      if (escalatedRequests.length > 0) {
        autoTable(doc, {
          startY: finalY + 20,
          head: [['Name', 'Room', 'Issue Type', 'Status', 'Submitted', 'Resolution']],
          body: escalatedRequests.map(req => [
            req.name,
            req.room_number,
            req.issue_type,
            getStatusWithPadding(getReportStatus(req)),
            new Date(req.created_at).toLocaleDateString(),
            req.status === 'completed' ? 'Resolved' : 'Pending'
          ]),
          headStyles: { 
            fillColor: COLORS.primary,
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'left',
          },
          bodyStyles: {
            fontSize: 10,
            font: FONTS.regular,
          },
          alternateRowStyles: { 
            fillColor: [250, 250, 250],
          },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 25 },
            2: { cellWidth: 35 },
            3: { cellWidth: 50 }, // Increased width for status column
            4: { cellWidth: 25 },
            5: { cellWidth: 20 },
          },
          margin: { left: 14, right: 14 },
          didDrawCell: (data) => {
            // Add status indicators
            if (data.section === 'body' && data.column.index === 3) {
              const status = data.cell.text[0].trim() as string;
              const color = status.includes('Completed') ? 
                COLORS.successBg : COLORS.dangerBg;
              
              // Calculate proper positioning for the status indicator
              const circleX = data.cell.x + 3;
              const circleY = data.cell.y + (data.cell.height / 2);
              
              doc.setFillColor(...color);
              doc.circle(circleX, circleY, 1.5, 'F');
            }
          },
        });
      } else {
        doc.setFont(FONTS.regular);
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.muted);
        doc.text("No escalated requests found in the selected date range.", 14, finalY + 30);
      }
    }
    
    // Add footer with page number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont(FONTS.regular);
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const fileName = `guestIT-${reportType}-report-${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF report');
    return null;
  }
};

// Helper function to get a more descriptive status for reports
function getReportStatus(request: WifiRequest): string {
  if (request.status === 'completed' && request.was_escalated) {
    return 'Completed (Escalated)';
  }
  
  switch (request.status) {
    case 'pending': return 'Pending';
    case 'in-progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'escalated': return 'Escalated';
    default: return request.status;
  }
}
