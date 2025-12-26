// src/lib/export.ts
// Export utilities for PDF, CSV, and Excel

// Dynamic import for jsPDF to avoid SSR issues
async function getJsPDF() {
  const jsPDF = await import('jspdf');
  return jsPDF.default;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes, wrap in quotes if contains special chars
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to Excel format (using XLSX library)
 */
export async function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    const XLSX = await import('xlsx');
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export to Excel. Please try CSV instead.');
  }
}

/**
 * Export dashboard data to PDF
 */
export async function exportDashboardToPDF(
  summary: { totalCollected: number; cashInHand: number; digitalPayments: number; lastUpdated: string },
  employeeStatus: Array<{
    id: string;
    name: string;
    route: string | null;
    collectionsCount: number;
    cashInHand: number;
    lastActivity: string | null;
    status: string;
  }>,
  date: string
) {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Admin Dashboard Report', 14, 20);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Date: ${date}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);
  
  // Summary Section
  doc.setFontSize(14);
  doc.text('Summary', 14, 48);
  doc.setFontSize(10);
  doc.text(`Total Collected: ₹${summary.totalCollected.toLocaleString('en-IN')}`, 20, 56);
  doc.text(`Cash in Hand: ₹${summary.cashInHand.toLocaleString('en-IN')}`, 20, 62);
  doc.text(`Digital Payments: ₹${summary.digitalPayments.toLocaleString('en-IN')}`, 20, 68);
  
  // Employee Status Table
  let yPos = 80;
  doc.setFontSize(14);
  doc.text('Employee Status', 14, yPos);
  yPos += 8;
  
  // Table headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Name', 14, yPos);
  doc.text('Route', 60, yPos);
  doc.text('Collections', 100, yPos);
  doc.text('Cash', 130, yPos);
  doc.text('Status', 160, yPos);
  yPos += 6;
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  employeeStatus.forEach((emp) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(emp.name.substring(0, 20), 14, yPos);
    doc.text((emp.route || 'N/A').substring(0, 15), 60, yPos);
    doc.text(emp.collectionsCount.toString(), 100, yPos);
    doc.text(`₹${emp.cashInHand.toLocaleString('en-IN')}`, 130, yPos);
    doc.text(emp.status, 160, yPos);
    yPos += 6;
  });
  
  // Save PDF
  doc.save(`dashboard-report-${date}.pdf`);
}

/**
 * Export reconciliation data to PDF
 */
export async function exportReconciliationToPDF(
  eodSummary: {
    totalCollected: number;
    cashExpected: number;
    digitalPayments: number;
  },
  employeeSettlements: Array<{
    id: string;
    employeeName: string;
    expectedCash: number;
    actualCash?: number;
    variance?: number;
    status: string;
    note?: string;
  }>,
  date: string
) {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('End-of-Day Reconciliation Report', 14, 20);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Date: ${date}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);
  
  // Summary Section
  doc.setFontSize(14);
  doc.text('Summary', 14, 48);
  doc.setFontSize(10);
  doc.text(`Total Collected: ₹${eodSummary.totalCollected.toLocaleString('en-IN')}`, 20, 56);
  doc.text(`Cash Expected: ₹${eodSummary.cashExpected.toLocaleString('en-IN')}`, 20, 62);
  doc.text(`Digital Payments: ₹${eodSummary.digitalPayments.toLocaleString('en-IN')}`, 20, 68);
  
  // Employee Settlements Table
  let yPos = 80;
  doc.setFontSize(14);
  doc.text('Employee Settlements', 14, yPos);
  yPos += 8;
  
  // Table headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee', 14, yPos);
  doc.text('Expected', 70, yPos);
  doc.text('Actual', 100, yPos);
  doc.text('Variance', 130, yPos);
  doc.text('Status', 160, yPos);
  yPos += 6;
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  employeeSettlements.forEach((settlement) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(settlement.employeeName.substring(0, 25), 14, yPos);
    doc.text(`₹${settlement.expectedCash.toLocaleString('en-IN')}`, 70, yPos);
    doc.text(
      settlement.actualCash !== undefined 
        ? `₹${settlement.actualCash.toLocaleString('en-IN')}` 
        : 'N/A', 
      100, 
      yPos
    );
    doc.text(
      settlement.variance !== undefined 
        ? `₹${settlement.variance.toLocaleString('en-IN')}` 
        : 'N/A', 
      130, 
      yPos
    );
    doc.text(settlement.status, 160, yPos);
    
    // Add note if mismatch
    if (settlement.note && settlement.status === 'mismatch') {
      yPos += 4;
      doc.setFontSize(8);
      doc.text(`Note: ${(settlement.note || '').substring(0, 80)}`, 20, yPos);
      doc.setFontSize(9);
    }
    
    yPos += 6;
  });
  
  // Save PDF
  doc.save(`reconciliation-report-${date}.pdf`);
}

/**
 * Export transactions to PDF
 */
export async function exportTransactionsToPDF(
  transactions: Array<{
    id: string;
    date: string;
    employeeName: string;
    shopName: string;
    amount: number;
    paymentMode: string;
    reference?: string;
  }>,
  dateRange: { start: string; end: string },
  filters?: any
) {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Transaction History Report', 14, 20);
  
  // Date range and filters
  doc.setFontSize(10);
  doc.text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);
  doc.text(`Total Transactions: ${transactions.length}`, 14, 42);
  
  // Transactions Table
  let yPos = 52;
  doc.setFontSize(14);
  doc.text('Transactions', 14, yPos);
  yPos += 8;
  
  // Table headers
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 14, yPos);
  doc.text('Employee', 40, yPos);
  doc.text('Shop', 80, yPos);
  doc.text('Amount', 130, yPos);
  doc.text('Mode', 155, yPos);
  yPos += 5;
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  transactions.forEach((txn) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
      // Re-print headers
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 14, yPos);
      doc.text('Employee', 40, yPos);
      doc.text('Shop', 80, yPos);
      doc.text('Amount', 130, yPos);
      doc.text('Mode', 155, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(txn.date.substring(0, 10), 14, yPos);
    doc.text(txn.employeeName.substring(0, 18), 40, yPos);
    doc.text(txn.shopName.substring(0, 20), 80, yPos);
    doc.text(`₹${txn.amount.toLocaleString('en-IN')}`, 130, yPos);
    doc.text(txn.paymentMode.toUpperCase(), 155, yPos);
    yPos += 5;
  });
  
  // Summary
  const total = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  yPos += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Amount: ₹${total.toLocaleString('en-IN')}`, 14, yPos);
  
  // Save PDF
  doc.save(`transactions-${dateRange.start}-to-${dateRange.end}.pdf`);
}

