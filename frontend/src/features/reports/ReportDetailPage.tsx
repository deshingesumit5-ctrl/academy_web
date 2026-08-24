import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const runAutoTable = (doc: jsPDF, options: any) => {
  if (typeof autoTable === 'function') {
    autoTable(doc, options);
  } else if (typeof (autoTable as any)?.default === 'function') {
    (autoTable as any).default(doc, options);
  } else if (typeof (doc as any).autoTable === 'function') {
    (doc as any).autoTable(options);
  } else {
    console.error('autoTable is not a function');
  }
};

interface ColumnConfig {
  header: string;
  key: string;
  render?: (row: any) => React.ReactNode;
}

interface FilterOption {
  label: string;
  value: string;
}

interface ReportConfig {
  title: string;
  description: string;
  icon: string;
  apiEndpoint: string;
  dateKey: string; // key used for date filtering
  statusOptions: FilterOption[];
  categoryOptions?: FilterOption[];
  categoryLabel?: string;
  columns: ColumnConfig[];
}

export const ReportDetailPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const reportType = (type || 'student').toLowerCase();

  // State
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Report configurations for all 6 report types
  const reportConfigs: Record<string, ReportConfig> = useMemo(
    () => ({
      student: {
        title: 'Student Report',
        description: 'Comprehensive student list, admission details, and batch allocation',
        icon: 'ti-users',
        apiEndpoint: '/students',
        dateKey: 'admissionDate',
        statusOptions: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
          { label: 'Pending', value: 'Pending' },
        ],
        categoryLabel: 'Course / Batch',
        categoryOptions: [
          { label: 'Web Development', value: 'Web Development' },
          { label: 'Data Science', value: 'Data Science' },
          { label: 'Library Pass', value: 'Library Pass' },
        ],
        columns: [
          { header: 'Student ID', key: 'studentId' },
          { header: 'Full Name', key: 'fullName' },
          { header: 'Course / Batch', key: 'courseBatch' },
          { header: 'Contact', key: 'contact' },
          { header: 'Admission Date', key: 'admissionDate' },
          {
            header: 'Status',
            key: 'status',
            render: (row) => renderStatusPill(row.status),
          },
        ],
      },
      attendance: {
        title: 'Attendance Report',
        description: 'Daily, monthly, student-wise, and batch-wise attendance records',
        icon: 'ti-calendar-check',
        apiEndpoint: '/attendance',
        dateKey: 'date',
        statusOptions: [
          { label: 'Present', value: 'Present' },
          { label: 'Absent', value: 'Absent' },
          { label: 'Late', value: 'Late' },
        ],
        categoryLabel: 'Batch',
        categoryOptions: [
          { label: 'Morning Batch', value: 'Morning Batch' },
          { label: 'Evening Batch', value: 'Evening Batch' },
        ],
        columns: [
          { header: 'Student ID', key: 'studentId' },
          { header: 'Student Name', key: 'studentName' },
          { header: 'Batch', key: 'batch' },
          { header: 'Date', key: 'date' },
          { header: 'Check In', key: 'checkIn' },
          {
            header: 'Status',
            key: 'status',
            render: (row) => renderStatusPill(row.status),
          },
        ],
      },
      fee: {
        title: 'Fee Collection & Dues Report',
        description: 'Payment receipts, pending installments, and overdue fee status',
        icon: 'ti-cash',
        apiEndpoint: '/fees',
        dateKey: 'date',
        statusOptions: [
          { label: 'Paid', value: 'Paid' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Overdue', value: 'Overdue' },
        ],
        categoryLabel: 'Fee Type',
        categoryOptions: [
          { label: 'Tuition Fee', value: 'Tuition Fee' },
          { label: 'Library Membership', value: 'Library Membership' },
          { label: 'Exam Fee', value: 'Exam Fee' },
        ],
        columns: [
          { header: 'Receipt / Inv #', key: 'invoiceNo' },
          { header: 'Student Name', key: 'studentName' },
          { header: 'Fee Type', key: 'feeType' },
          { header: 'Total Amount (₹)', key: 'totalAmount' },
          { header: 'Paid Amount (₹)', key: 'paidAmount' },
          { header: 'Due Date', key: 'date' },
          {
            header: 'Status',
            key: 'status',
            render: (row) => renderStatusPill(row.status),
          },
        ],
      },
      inquiry: {
        title: 'Inquiry & Leads Report',
        description: 'Lead generation, source tracking, and conversion analytics',
        icon: 'ti-phone-call',
        apiEndpoint: '/inquiries',
        dateKey: 'inquiryDate',
        statusOptions: [
          { label: 'Converted', value: 'Converted' },
          { label: 'Follow-up', value: 'Follow-up' },
          { label: 'New', value: 'New' },
          { label: 'Closed', value: 'Closed' },
        ],
        categoryLabel: 'Source',
        categoryOptions: [
          { label: 'Website', value: 'Website' },
          { label: 'Walk-in', value: 'Walk-in' },
          { label: 'Social Media', value: 'Social Media' },
          { label: 'Referral', value: 'Referral' },
        ],
        columns: [
          { header: 'Inquiry ID', key: 'inquiryId' },
          { header: 'Candidate Name', key: 'candidateName' },
          { header: 'Contact', key: 'contact' },
          { header: 'Interested Course', key: 'course' },
          { header: 'Source', key: 'source' },
          { header: 'Inquiry Date', key: 'inquiryDate' },
          {
            header: 'Status',
            key: 'status',
            render: (row) => renderStatusPill(row.status),
          },
        ],
      },
      'follow-up': {
        title: 'Follow-up Tracking Report',
        description: 'Pending, completed, and missed follow-up communications',
        icon: 'ti-calendar-time',
        apiEndpoint: '/followups',
        dateKey: 'scheduledDate',
        statusOptions: [
          { label: 'Completed', value: 'Completed' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Missed', value: 'Missed' },
        ],
        categoryLabel: 'Follow-up Type',
        categoryOptions: [
          { label: 'Call', value: 'Call' },
          { label: 'Email', value: 'Email' },
          { label: 'Meeting', value: 'Meeting' },
        ],
        columns: [
          { header: 'Followup ID', key: 'followupId' },
          { header: 'Lead / Student', key: 'name' },
          { header: 'Type', key: 'type' },
          { header: 'Scheduled Date', key: 'scheduledDate' },
          { header: 'Assigned Executive', key: 'assignedTo' },
          { header: 'Next Action', key: 'nextAction' },
          {
            header: 'Status',
            key: 'status',
            render: (row) => renderStatusPill(row.status),
          },
        ],
      },
      task: {
        title: 'Task Status Report',
        description: 'Pending, in-progress, completed, and overdue system tasks',
        icon: 'ti-checklist',
        apiEndpoint: '/tasks',
        dateKey: 'dueDate',
        statusOptions: [
          { label: 'Completed', value: 'Completed' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Overdue', value: 'Overdue' },
        ],
        categoryLabel: 'Priority',
        categoryOptions: [
          { label: 'High', value: 'High' },
          { label: 'Medium', value: 'Medium' },
          { label: 'Low', value: 'Low' },
        ],
        columns: [
          { header: 'Task ID', key: 'taskId' },
          { header: 'Task Title', key: 'title' },
          { header: 'Assigned To', key: 'assignedTo' },
          { header: 'Priority', key: 'priority' },
          { header: 'Due Date', key: 'dueDate' },
          {
            header: 'Status',
            key: 'status',
            render: (row) => renderStatusPill(row.status),
          },
        ],
      },
      'student-growth': {
        title: 'Student Growth & Performance Report',
        description: 'Track student progress over time, comparing previous vs current exam performance, physical & written marks',
        icon: 'ti-trending-up',
        apiEndpoint: '/reports/student-growth',
        dateKey: 'createdAt',
        statusOptions: [
          { label: 'Positive Growth', value: 'POSITIVE' },
          { label: 'Declining', value: 'NEGATIVE' },
        ],
        columns: [
          { header: 'Roll No', key: 'rollNumber' },
          { header: 'Student Name', key: 'studentName' },
          { header: 'Batch', key: 'batchName' },
          { header: 'Course', key: 'courseName' },
          { header: 'Previous Exam Marks', key: 'previousMarks' },
          { header: 'Physical Marks', key: 'physicalMarks' },
          { header: 'Written Marks', key: 'writtenMarks' },
          { header: 'Current Total Marks', key: 'currentTotalMarks' },
          {
            header: 'Improvement',
            key: 'improvement',
            render: (row) => (
              <span style={{ color: row.improvement >= 0 ? '#047857' : '#b91c1c', fontWeight: 600 }}>
                {row.improvement >= 0 ? `+${row.improvement}` : row.improvement} ({row.growthPercent}%)
              </span>
            ),
          },
          {
            header: 'Growth Trend',
            key: 'trend',
            render: (row) => (
              <span className={`badge ${row.trend === 'POSITIVE' ? 'badge-green' : 'badge-red'}`}>
                {row.trend === 'POSITIVE' ? 'Positive Growth' : 'Needs Focus'}
              </span>
            ),
          },
        ],
      },
    }),
    []
  );

  const currentConfig = reportConfigs[reportType] || reportConfigs.student;

  // Helper for status pill rendering
  const renderStatusPill = (statusStr: string) => {
    if (!statusStr) return <span className="badge badge-gray">-</span>;
    const lower = statusStr.toLowerCase();
    let badgeClass = 'badge-gray';

    if (['active', 'present', 'paid', 'converted', 'completed'].includes(lower)) {
      badgeClass = 'badge-green';
    } else if (['pending', 'late', 'follow-up', 'in progress', 'new', 'open'].includes(lower)) {
      badgeClass = 'badge-amber';
    } else if (['inactive', 'absent', 'overdue', 'closed', 'missed'].includes(lower)) {
      badgeClass = 'badge-red';
    } else if (['high', 'graduated', 'hot'].includes(lower)) {
      badgeClass = 'badge-blue';
    }

    return <span className={`badge ${badgeClass}`}>{statusStr}</span>;
  };

  // Fetch real data from backend API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(currentConfig.apiEndpoint);
        if (isMounted) {
          const rawList = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

          if (rawList && rawList.length > 0) {
            const mapped = rawList.map((item: any, idx: number) => {
              if (reportType === 'student') {
                return {
                  ...item,
                  studentId: item.admissionNumber || (item.studentId ? `STD-${item.studentId}` : `STD-${1000 + idx}`),
                  fullName: item.studentName || item.fullName || 'N/A',
                  courseBatch: item.courseName || item.batchName || item.planName || item.courseBatch || 'Regular',
                  contact: item.mobileNumber || item.contact || item.phone || 'N/A',
                  admissionDate: item.admissionDate || (item.createdAt ? String(item.createdAt).substring(0, 10) : '-'),
                  status: item.status || 'Active',
                };
              } else if (reportType === 'attendance') {
                return {
                  ...item,
                  studentId: item.admissionNumber || (item.studentId ? `STD-${item.studentId}` : `STD-${1000 + idx}`),
                  studentName: item.studentName || 'N/A',
                  batch: item.batchName || item.batch || 'N/A',
                  date: item.attendanceDate || item.date || '-',
                  checkIn: item.timeIn || item.checkIn || '-',
                  status: item.status || 'Present',
                };
              } else if (reportType === 'fee') {
                return {
                  ...item,
                  invoiceNo: item.receiptNumber || (item.paymentId ? `INV-${item.paymentId}` : `INV-${1000 + idx}`),
                  studentName: item.studentName || 'N/A',
                  feeType: item.paymentType || item.paymentMode || item.feeType || 'Tuition Fee',
                  totalAmount: item.amountPaid !== undefined && item.amountPaid !== null ? Number(item.amountPaid).toLocaleString('en-IN') : (item.totalAmount || '0'),
                  paidAmount: item.amountPaid !== undefined && item.amountPaid !== null ? Number(item.amountPaid).toLocaleString('en-IN') : (item.paidAmount || '0'),
                  date: item.paymentDate || item.date || '-',
                  status: item.status || 'Paid',
                };
              } else if (reportType === 'inquiry') {
                return {
                  ...item,
                  inquiryId: item.inquiryId ? `INQ-${item.inquiryId}` : (item.id || `INQ-${500 + idx}`),
                  candidateName: item.studentName || item.candidateName || 'N/A',
                  contact: item.mobileNumber || item.contact || 'N/A',
                  course: item.interestedCourse || item.course || 'N/A',
                  source: item.inquirySource || item.source || 'N/A',
                  inquiryDate: item.createdAt ? String(item.createdAt).substring(0, 10) : (item.inquiryDate || '-'),
                  status: item.status || 'Open',
                };
              } else if (reportType === 'follow-up') {
                return {
                  ...item,
                  followupId: item.followupId ? `FLW-${item.followupId}` : (item.id || `FLW-${100 + idx}`),
                  name: item.studentName || item.name || 'N/A',
                  type: item.category || item.type || 'Call',
                  scheduledDate: item.followupDate || item.scheduledDate || '-',
                  assignedTo: item.counselor || item.assignedTo || 'Unassigned',
                  nextAction: item.discussionNotes || item.nextAction || '-',
                  status: item.status || 'Pending',
                };
              } else if (reportType === 'task') {
                return {
                  ...item,
                  taskId: item.taskId ? `TSK-${item.taskId}` : (item.id || `TSK-${300 + idx}`),
                  title: item.taskTitle || item.title || 'N/A',
                  assignedTo: item.assignedTo || 'Unassigned',
                  priority: item.priority || 'Medium',
                  dueDate: item.dueDate || '-',
                  status: item.status || 'Pending',
                };
              }
              return item;
            });
            setData(mapped);
          } else {
            setData([]);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error(`Error loading report data for endpoint ${currentConfig.apiEndpoint}:`, error);
          setData([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [reportType, currentConfig]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesSearch = Object.values(row).some((val) =>
          val ? String(val).toLowerCase().includes(term) : false
        );
        if (!matchesSearch) return false;
      }

      // 2. Status filter
      if (statusFilter !== 'ALL') {
        const rowStatus = String(row.status || '').toLowerCase();
        if (rowStatus !== statusFilter.toLowerCase()) return false;
      }

      // 3. Category/Batch filter
      if (categoryFilter !== 'ALL') {
        const categoryVal = String(
          row.courseBatch || row.batch || row.feeType || row.source || row.type || row.priority || ''
        ).toLowerCase();
        if (!categoryVal.includes(categoryFilter.toLowerCase())) return false;
      }

      // 4. Date Range filter
      const rowDateVal = row[currentConfig.dateKey] || row.admissionDate || row.date || row.inquiryDate || row.scheduledDate || row.dueDate;
      if (rowDateVal) {
        if (startDate && rowDateVal < startDate) return false;
        if (endDate && rowDateVal > endDate) return false;
      }

      return true;
    });
  }, [data, searchTerm, statusFilter, categoryFilter, startDate, endDate, currentConfig]);

  // Active filters summary string for PDF header
  const getActiveFilterSummary = () => {
    const parts: string[] = [];
    if (searchTerm) parts.push(`Search: "${searchTerm}"`);
    if (statusFilter !== 'ALL') parts.push(`Status: ${statusFilter}`);
    if (categoryFilter !== 'ALL') parts.push(`${currentConfig.categoryLabel || 'Category'}: ${categoryFilter}`);
    if (startDate) parts.push(`From: ${startDate}`);
    if (endDate) parts.push(`To: ${endDate}`);
    return parts.length > 0 ? parts.join(' | ') : 'All Records (No filters applied)';
  };

  // Generate Excel Client-Side using SheetJS (XLSX)
  const handleDownloadExcel = () => {
    if (isGeneratingExcel || filteredData.length === 0) return;
    setIsGeneratingExcel(true);

    try {
      const headers = currentConfig.columns.map((c) => c.header);
      const rows = filteredData.map((row) =>
        currentConfig.columns.map((c) => {
          const val = row[c.key];
          return val !== undefined && val !== null ? String(val) : '';
        })
      );

      const wsData = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);

      // Auto-fit column widths
      const colWidths = headers.map((h, i) => {
        let maxLen = h.length;
        rows.forEach((r) => {
          const cellVal = String(r[i] || '');
          if (cellVal.length > maxLen) maxLen = cellVal.length;
        });
        return { wch: Math.max(maxLen + 4, 12) };
      });
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, currentConfig.title.slice(0, 31));

      const formattedDate = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `${reportType}-report_${formattedDate}.xlsx`);
    } catch (err) {
      console.error('Failed to generate Excel file:', err);
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  // Generate PDF Client-Side using jsPDF + jspdf-autotable
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf || filteredData.length === 0) return;
    setIsGeneratingPdf(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const navyColor = [18, 40, 63]; // App Navy Theme (#12283F)

      // Header Banner
      doc.setFillColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(currentConfig.title.toUpperCase(), 14, 14);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Academy & Library Management System', doc.internal.pageSize.getWidth() - 14, 14, { align: 'right' });

      // Metadata Block
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);

      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      doc.setFont('helvetica', 'bold');
      doc.text('Generated On:', 14, 28);
      doc.setFont('helvetica', 'normal');
      doc.text(`${dateStr} at ${timeStr}`, 40, 28);

      doc.setFont('helvetica', 'bold');
      doc.text('Active Filters:', 14, 33);
      doc.setFont('helvetica', 'normal');
      doc.text(getActiveFilterSummary(), 40, 33);

      doc.setFont('helvetica', 'bold');
      doc.text('Records Exported:', 14, 38);
      doc.setFont('helvetica', 'normal');
      doc.text(`${filteredData.length} visible row(s)`, 44, 38);

      // Auto Table
      const headers = currentConfig.columns.map((c) => c.header);
      const rows = filteredData.map((row) =>
        currentConfig.columns.map((c) => {
          const val = row[c.key];
          return val !== undefined && val !== null ? String(val) : '';
        })
      );

      runAutoTable(doc, {
        startY: 43,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: {
          fillColor: navyColor as [number, number, number],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9.5,
          halign: 'left',
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [45, 55, 72],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { top: 43, bottom: 18, left: 14, right: 14 },
        didDrawPage: (data: { pageNumber: number }) => {
          const totalPages = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(140, 140, 140);
          doc.text(
            `Page ${data.pageNumber} of ${totalPages}`,
            doc.internal.pageSize.getWidth() - 14,
            doc.internal.pageSize.getHeight() - 8,
            { align: 'right' }
          );
          doc.text(
            'Academy & Library System - Official Analytics Report',
            14,
            doc.internal.pageSize.getHeight() - 8
          );
        },
      });

      const formattedDate = now.toISOString().split('T')[0];
      doc.save(`${reportType}-report_${formattedDate}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      {/* Top Header Row with Navigation & Download Buttons (Excel & PDF side-by-side) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn"
            onClick={() => navigate('/reports')}
            style={{ padding: '7px 12px', fontSize: '13px', background: '#FFFFFF' }}
          >
            <i className="ti ti-arrow-left"></i> Back to Reports
          </button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', margin: 0 }}>
              {currentConfig.title}
            </h2>
            <span style={{ fontSize: '12.5px', color: 'var(--slate-light)' }}>
              {currentConfig.description}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn"
            onClick={handleDownloadExcel}
            disabled={isGeneratingExcel || filteredData.length === 0}
            style={{
              background: '#107C41',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '6px',
              opacity: isGeneratingExcel || filteredData.length === 0 ? 0.65 : 1,
              cursor: isGeneratingExcel || filteredData.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {isGeneratingExcel ? (
              <>
                <i className="ti ti-loader rotate" style={{ animation: 'spin 1s linear infinite' }}></i> Preparing Excel…
              </>
            ) : (
              <>
                <i className="ti ti-file-spreadsheet"></i> Download Excel
              </>
            )}
          </button>

          <button
            className="btn btn-primary"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || filteredData.length === 0}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '6px',
              opacity: isGeneratingPdf || filteredData.length === 0 ? 0.65 : 1,
              cursor: isGeneratingPdf || filteredData.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {isGeneratingPdf ? (
              <>
                <i className="ti ti-loader rotate" style={{ animation: 'spin 1s linear infinite' }}></i> Preparing PDF…
              </>
            ) : (
              <>
                <i className="ti ti-file-download"></i> Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="card card-pad" style={{ marginBottom: '18px' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          {/* Search Box */}
          <div className="form-field">
            <label>Search Report</label>
            <input
              type="text"
              placeholder="Search keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="form-field">
            <label>Filter Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              {currentConfig.statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category / Batch Filter */}
          {currentConfig.categoryOptions && (
            <div className="form-field">
              <label>{currentConfig.categoryLabel || 'Category'}</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="ALL">All {currentConfig.categoryLabel || 'Categories'}</option>
                {currentConfig.categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Start Date */}
          <div className="form-field">
            <label>From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="form-field">
            <label>To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Reset Button */}
          <div className="form-field" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={resetFilters} style={{ width: '100%' }}>
              <i className="ti ti-refresh"></i> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>
          Results Count: <span className="badge badge-blue">{filteredData.length} records found</span>
        </span>
        {(searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || startDate || endDate) && (
          <span style={{ fontSize: '12px', color: 'var(--slate-light)' }}>
            Showing filtered results ({filteredData.length} of {data.length})
          </span>
        )}
      </div>

      {/* Clean Data Table Card */}
      <div className="card">
        {data.length === 0 && !loading ? (
          <div className="empty" style={{ padding: '40px' }}>
            <i className="ti ti-folder-off" style={{ fontSize: '32px', color: 'var(--slate-light)', marginBottom: '8px' }}></i>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--slate)', marginBottom: '4px' }}>No data available</h4>
            <p style={{ fontSize: '13px', color: 'var(--slate-light)' }}>There are no records available in the database for this report.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty" style={{ padding: '40px' }}>
            <i className="ti ti-search-off" style={{ fontSize: '32px', color: 'var(--slate-light)', marginBottom: '8px' }}></i>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--slate)', marginBottom: '4px' }}>No data available</h4>
            <p style={{ fontSize: '13px', color: 'var(--slate-light)' }}>No rows match your selected filter criteria. Try adjusting or resetting your filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  {currentConfig.columns.map((col) => (
                    <th key={col.key}>{col.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF' }}>
                    {currentConfig.columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row) : row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
