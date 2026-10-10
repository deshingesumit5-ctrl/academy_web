import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import { getCachedData } from '../../config/apiCache';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Student {
  studentId: number;
  studentName: string;
  rollNumber?: string;
  contactNumber?: string;
  mobileNumber?: string;
  parentMobile?: string;
  batchName?: string;
  courseName?: string;
  batch?: {
    batchId?: number;
    batchName?: string;
    batchTiming?: string;
  };
  course?: {
    courseName?: string;
  };
}

interface ClassTest {
  id: string;
  date: string;
  subject: string;
  totalMarks: number | '';
  obtainedMarks: number | '';
}

interface PhysicalTest {
  id: string;
  date: string;
  time1600: string;
  mark1600: number | '';
  time100: string;
  mark100: number | '';
  shotPutDistance: string;
  shotPutMark: number | '';
  totalMark: number | '';
}

export const MonthlyStudentReportPage: React.FC = () => {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [activeTab, setActiveTab] = useState<'preview' | 'entry'>('preview');
  const [isBlankTemplate, setIsBlankTemplate] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Sample tests default
  const [classTests, setClassTests] = useState<ClassTest[]>([
    { id: '1', date: '04/09/2026', subject: 'मराठी व्याकरण (Marathi Grammar)', totalMarks: 50, obtainedMarks: 44 },
    { id: '2', date: '11/09/2026', subject: 'सामान्य ज्ञान व चालू घडामोडी (GK)', totalMarks: 50, obtainedMarks: 42 },
    { id: '3', date: '18/09/2026', subject: 'अंकगणित व बुद्धिमत्ता चाचणी (Maths & IQ)', totalMarks: 50, obtainedMarks: 39 },
    { id: '4', date: '25/09/2026', subject: 'पोलीस प्रशासन व कायदे (Police Acts)', totalMarks: 50, obtainedMarks: 46 },
    { id: '5', date: '', subject: '', totalMarks: '', obtainedMarks: '' },
    { id: '6', date: '', subject: '', totalMarks: '', obtainedMarks: '' },
    { id: '7', date: '', subject: '', totalMarks: '', obtainedMarks: '' },
    { id: '8', date: '', subject: '', totalMarks: '', obtainedMarks: '' },
  ]);

  const [physicalTests, setPhysicalTests] = useState<PhysicalTest[]>([
    {
      id: '1',
      date: '05/09/2026',
      time1600: '05:08',
      mark1600: 28,
      time100: '11.8s',
      mark100: 14,
      shotPutDistance: '8.6m',
      shotPutMark: 15,
      totalMark: 57,
    },
    {
      id: '2',
      date: '12/09/2026',
      time1600: '05:01',
      mark1600: 30,
      time100: '11.6s',
      mark100: 15,
      shotPutDistance: '8.9m',
      shotPutMark: 15,
      totalMark: 60,
    },
    {
      id: '3',
      date: '19/09/2026',
      time1600: '04:56',
      mark1600: 30,
      time100: '11.5s',
      mark100: 15,
      shotPutDistance: '9.1m',
      shotPutMark: 15,
      totalMark: 60,
    },
    { id: '4', date: '', time1600: '', mark1600: '', time100: '', mark100: '', shotPutDistance: '', shotPutMark: '', totalMark: '' },
    { id: '5', date: '', time1600: '', mark1600: '', time100: '', mark100: '', shotPutDistance: '', shotPutMark: '', totalMark: '' },
  ]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const cached = getCachedData('/students');
      if (cached?.data?.length) {
        setStudents(cached.data);
        setSelectedStudentId(cached.data[0].studentId);
        return;
      }
      const res = await axiosInstance.get('/students');
      const list = res.data?.data || res.data || [];
      if (list.length > 0) {
        setStudents(list);
        setSelectedStudentId(list[0].studentId);
      } else {
        // Fallback demo student
        const demo: Student = {
          studentId: 51,
          studentName: 'Amar Patil',
          rollNumber: '51',
          mobileNumber: '9872193113',
          contactNumber: '9872193113',
          batchName: 'Police Bharti Morning',
          batch: {
            batchId: 1,
            batchName: 'Police Bharti Morning',
            batchTiming: '06:00 AM - 08:30 AM',
          },
          course: {
            courseName: 'Maharashtra Police Bharti',
          },
        };
        setStudents([demo]);
        setSelectedStudentId(51);
      }
    } catch {
      const demo: Student = {
        studentId: 51,
        studentName: 'Amar Patil',
        rollNumber: '51',
        mobileNumber: '9872193113',
        contactNumber: '9872193113',
        batchName: 'Police Bharti Morning',
        batch: {
          batchId: 1,
          batchName: 'Police Bharti Morning',
          batchTiming: '06:00 AM - 08:30 AM',
        },
        course: {
          courseName: 'Maharashtra Police Bharti',
        },
      };
      setStudents([demo]);
      setSelectedStudentId(51);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return students;
    const term = studentSearchTerm.toLowerCase();
    return students.filter((s) => {
      const name = (s.studentName || '').toLowerCase();
      const roll = (s.rollNumber || String(s.studentId || '')).toLowerCase();
      const mobile = (s.mobileNumber || s.contactNumber || s.parentMobile || '').toLowerCase();
      const batch = (s.batch?.batchName || s.batchName || '').toLowerCase();
      return name.includes(term) || roll.includes(term) || mobile.includes(term) || batch.includes(term);
    });
  }, [students, studentSearchTerm]);

  const currentStudent: Student = useMemo(() => {
    return (
      students.find((s) => s.studentId === Number(selectedStudentId)) ||
      students[0] || {
        studentId: 51,
        studentName: 'Amar Patil',
        rollNumber: '51',
        mobileNumber: '9872193113',
        contactNumber: '9872193113',
        batchName: 'Police Bharti Morning',
        batch: {
          batchName: 'Police Bharti Morning',
          batchTiming: '06:00 AM - 08:30 AM',
        },
      }
    );
  }, [students, selectedStudentId]);

  // Mobile number auto-filled directly from student registration form data
  const currentStudentMobile = useMemo(() => {
    return currentStudent.mobileNumber || currentStudent.contactNumber || currentStudent.parentMobile || '—';
  }, [currentStudent]);

  // Automatic addition for Class Test Marks
  const classTestTotalMarks = useMemo(() => {
    return classTests.reduce((sum, item) => {
      const val = typeof item.totalMarks === 'number' ? item.totalMarks : parseFloat(String(item.totalMarks));
      return sum + (!isNaN(val) && val > 0 ? val : 0);
    }, 0);
  }, [classTests]);

  const classTestObtainedMarks = useMemo(() => {
    return classTests.reduce((sum, item) => {
      const val = typeof item.obtainedMarks === 'number' ? item.obtainedMarks : parseFloat(String(item.obtainedMarks));
      return sum + (!isNaN(val) && val > 0 ? val : 0);
    }, 0);
  }, [classTests]);

  const classTestPercentage = useMemo(() => {
    if (classTestTotalMarks > 0) {
      const pct = (classTestObtainedMarks / classTestTotalMarks) * 100;
      return pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1);
    }
    return '0';
  }, [classTestTotalMarks, classTestObtainedMarks]);

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    const wasEntry = activeTab === 'entry';
    try {
      if (wasEntry) {
        setActiveTab('preview');
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const element = reportRef.current || document.getElementById('printable-monthly-report');
      if (!element) {
        throw new Error('Report element not found');
      }

      // Small delay to ensure any fonts and styles are fully rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

      let renderWidth = pdfWidth;
      let renderHeight = (canvas.height * pdfWidth) / canvas.width;

      if (renderHeight > pdfHeight) {
        renderHeight = pdfHeight;
        renderWidth = (canvas.width * pdfHeight) / canvas.height;
      }

      const xOffset = (pdfWidth - renderWidth) / 2;
      const yOffset = (pdfHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');

      const safeStudentName = (currentStudent.studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeMonth = selectedMonth.replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Monthly_Report_${safeStudentName}_${safeMonth}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      if (wasEntry) {
        setActiveTab('entry');
      }
      setIsGeneratingPdf(false);
    }
  };

  // Generate Excel Client-Side using SheetJS (XLSX) matching other reports
  const handleDownloadExcel = () => {
    if (isGeneratingExcel) return;
    setIsGeneratingExcel(true);

    try {
      // Sheet 1: Class Test Details & Automatic Totals
      const classTestHeaders = ['Sr No', 'Date', 'Test / Subject', 'Total Mark', 'Obtained Mark'];
      const classTestRows: any[][] = classTests
        .filter((t) => t.date || t.subject || t.totalMarks !== '' || t.obtainedMarks !== '')
        .map((t, idx) => [
          idx + 1,
          t.date || '',
          t.subject || '',
          t.totalMarks !== '' ? t.totalMarks : '',
          t.obtainedMarks !== '' ? t.obtainedMarks : '',
        ]);

      // Add Total Marks Addition Row
      classTestRows.push([
        '',
        'TOTAL',
        'Total Marks & Obtained Marks Addition',
        classTestTotalMarks,
        classTestObtainedMarks,
      ]);

      // Add Percentage Row
      classTestRows.push([
        '',
        'PERCENTAGE',
        'Calculated Percentage',
        '',
        `${classTestPercentage}%`,
      ]);

      const classTestSheetData = [
        ['AJINKYA FOUNDATION - MONTHLY STUDENT REPORT'],
        [`Student Name: ${currentStudent.studentName}`, `Mobile: ${currentStudentMobile}`, `Roll No: ${currentStudent.rollNumber || currentStudent.studentId || ''}`],
        [`Batch: ${currentStudent.batch?.batchName || currentStudent.batchName || 'Police Bharti Morning'}`, `Month: ${selectedMonth}`],
        [],
        classTestHeaders,
        ...classTestRows,
      ];

      const wsClassTest = XLSX.utils.aoa_to_sheet(classTestSheetData);

      // Sheet 2: Physical Trials
      const physicalHeaders = ['Sr No', 'Date', '1600M Time', '1600M Mark', '100M Time', '100M Mark', 'Shot Put Dist', 'Shot Put Mark', 'Total Mark'];
      const physicalRows = physicalTests
        .filter((p) => p.date || p.time1600 || p.mark1600 !== '' || p.totalMark !== '')
        .map((p, idx) => [
          idx + 1,
          p.date || '',
          p.time1600 || '',
          p.mark1600 !== '' ? p.mark1600 : '',
          p.time100 || '',
          p.mark100 !== '' ? p.mark100 : '',
          p.shotPutDistance || '',
          p.shotPutMark !== '' ? p.shotPutMark : '',
          p.totalMark !== '' ? p.totalMark : '',
        ]);

      const physicalSheetData = [
        ['AJINKYA FOUNDATION - PHYSICAL TRIALS RECORD'],
        [`Student: ${currentStudent.studentName}`, `Month: ${selectedMonth}`],
        [],
        physicalHeaders,
        ...physicalRows,
      ];

      const wsPhysical = XLSX.utils.aoa_to_sheet(physicalSheetData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, wsClassTest, 'Class Tests');
      XLSX.utils.book_append_sheet(workbook, wsPhysical, 'Physical Trials');

      const safeStudentName = (currentStudent.studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeMonth = selectedMonth.replace(/[^a-zA-Z0-9_-]/g, '_');
      XLSX.writeFile(workbook, `Monthly_Report_${safeStudentName}_${safeMonth}.xlsx`);
    } catch (err) {
      console.error('Failed to generate Excel file:', err);
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  // Entry updates
  const updateClassTest = (index: number, field: keyof ClassTest, val: any) => {
    const updated = [...classTests];
    updated[index] = { ...updated[index], [field]: val };
    setClassTests(updated);
  };

  const updatePhysicalTest = (index: number, field: keyof PhysicalTest, val: any) => {
    const updated = [...physicalTests];
    updated[index] = { ...updated[index], [field]: val };

    // Auto-sum total marks if numbers
    const m1600 = Number(field === 'mark1600' ? val : updated[index].mark1600) || 0;
    const m100 = Number(field === 'mark100' ? val : updated[index].mark100) || 0;
    const mShot = Number(field === 'shotPutMark' ? val : updated[index].shotPutMark) || 0;
    if (m1600 || m100 || mShot) {
      updated[index].totalMark = m1600 + m100 + mShot;
    }
    setPhysicalTests(updated);
  };

  const resetFilters = () => {
    setStudentSearchTerm('');
    if (students.length > 0) {
      setSelectedStudentId(students[0].studentId);
    }
    setSelectedMonth('September 2026');
    setIsBlankTemplate(false);
  };

  return (
    <div className="monthly-report-page">
      {/* Top Header Row with Navigation & Download Buttons (Matches other reports) */}
      <div className="no-print report-top-nav-bar">
        <div className="nav-title-group">
          <button
            className="btn back-nav-btn"
            onClick={() => navigate('/reports')}
          >
            <i className="ti ti-arrow-left"></i> Back to Reports
          </button>
          <div>
            <h2 className="report-main-title">
              Monthly Student Report
            </h2>
            <span className="report-main-desc">
              Individual student monthly class & physical test card with official printable report
            </span>
          </div>
        </div>

        {/* Right side download buttons: Excel & PDF (matches 2nd image) */}
        <div className="report-downloads-group">
          {/* Download Excel Button */}
          <button
            className="btn excel-download-btn"
            onClick={handleDownloadExcel}
            disabled={isGeneratingExcel}
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

          {/* Download PDF Button */}
          <button
            className="btn btn-primary pdf-download-btn"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
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

      {/* View Mode & Template Controls Bar */}
      <div className="no-print report-sub-bar">
        {/* Tabs for Mode Switch */}
        <div className="report-view-tabs">
          <button
            className={`view-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <i className="ti ti-file-text"></i> Report Preview
          </button>
          <button
            className={`view-tab-btn ${activeTab === 'entry' ? 'active' : ''}`}
            onClick={() => setActiveTab('entry')}
          >
            <i className="ti ti-edit"></i> Marks Entry
          </button>
        </div>

        {/* Blank Paper Toggle */}
        <button
          className={`btn template-toggle-btn ${isBlankTemplate ? 'active-blank' : ''}`}
          onClick={() => setIsBlankTemplate(!isBlankTemplate)}
          title="Toggle between filled data or blank sheet template for manual pen marking"
        >
          <i className="ti ti-notes"></i> {isBlankTemplate ? 'Show Filled Data' : 'Blank Sheet Mode'}
        </button>
      </div>

      {/* Filter Controls Card (Matches other reports) */}
      <div className="no-print card card-pad report-filter-card">
        <div className="form-grid report-filter-grid">
          {/* Select Student Dropdown */}
          <div className="form-field">
            <label>Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="form-control"
            >
              {filteredStudents.map((s) => {
                const roll = s.rollNumber ? `[Roll: ${s.rollNumber}] ` : '';
                const batch = s.batch?.batchName || s.batchName ? ` (${s.batch?.batchName || s.batchName})` : '';
                return (
                  <option key={s.studentId} value={s.studentId}>
                    {roll}{s.studentName}{batch}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Student Search Box */}
          <div className="form-field">
            <label>Search Student / Batch</label>
            <input
              type="text"
              placeholder="Search by name, roll, mobile..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Select Report Month */}
          <div className="form-field">
            <label>Report Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-control"
            >
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
              <option value="June 2026">June 2026</option>
              <option value="May 2026">May 2026</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="form-field filter-reset-field">
            <button className="btn reset-filter-btn" onClick={resetFilters} type="button">
              <i className="ti ti-rotate"></i> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Active Student Info & Live Score Summary Strip */}
      <div className="no-print student-summary-strip">
        <div className="summary-strip-left">
          <span className="summary-pill student-name-pill">
            <i className="ti ti-user"></i> {currentStudent.studentName}
          </span>
          <span className="summary-pill">
            <i className="ti ti-id"></i> Roll: <strong>{currentStudent.rollNumber || currentStudent.studentId || '—'}</strong>
          </span>
          <span className="summary-pill mobile-pill">
            <i className="ti ti-phone"></i> Mobile: <strong>{currentStudentMobile}</strong>
          </span>
          <span className="summary-pill batch-pill">
            <i className="ti ti-clock"></i> {currentStudent.batch?.batchName || currentStudent.batchName || 'Police Bharti Morning'}
          </span>
        </div>

        <div className="summary-strip-right">
          <span className="summary-badge total-marks-badge">
            Total Marks: <strong>{classTestTotalMarks}</strong>
          </span>
          <span className="summary-badge obtained-marks-badge">
            Obtained Marks: <strong>{classTestObtainedMarks}</strong>
          </span>
          <span className="summary-badge score-percent-badge">
            Score: <strong>{classTestPercentage}%</strong>
          </span>
        </div>
      </div>

      {/* TAB 1: REPORT DOCUMENT PREVIEW (Screen & Print) */}
      {activeTab === 'preview' && (
        <div className="report-sheet-container">
          <div className="report-paper-sheet" id="printable-monthly-report" ref={reportRef}>
            {/* Outer Decorative Double Border */}
            <div className="report-border-frame">
              {/* Top Foundation Banner Header Box */}
              <div className="foundation-banner-box">
                <div className="banner-logo-wrap">
                  <img src="/logo.png" alt="Ajinkya Foundation Logo" className="foundation-logo" />
                </div>
                <div className="banner-content">
                  <h1 className="foundation-title">अजिंक्य फाऊंडेशन कोल्हापूर</h1>
                  {/* Updated Address: नूतन मराठी शाळा */}
                  <p className="foundation-address">
                    पत्ता - हिंदू एकता हॉल, नूतन मराठी शाळा, मिरजकर तिकटी, मंगळवार पेठ, कोल्हापूर
                  </p>
                  <p className="foundation-subtitle">
                    पोलीस भरती, MPSC, SSC, आर्मी, सरळसेवा मार्गदर्शन केंद्र
                  </p>
                  {/* Updated Sir Name: अजिंक्य आपके सर */}
                  <p className="foundation-contact">अजिंक्य आपके सर : 7972193113</p>
                </div>
              </div>

              {/* Title Underlined */}
              <div className="report-title-section">
                <h2 className="report-main-heading">MONTHLY STUDENT REPORT</h2>
              </div>

              {/* Student Metadata Info Grid - Auto-filled from registration data */}
              <div className="student-info-grid">
                <div className="info-col">
                  <div className="info-row">
                    <span className="info-label">STUDENT NAME :</span>
                    <span className="info-value">{currentStudent.studentName || '—'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">MOBILE NO :</span>
                    <span className="info-value font-mono">{currentStudentMobile}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ROLL NO :</span>
                    <span className="info-value">{currentStudent.rollNumber || currentStudent.studentId || '—'}</span>
                  </div>
                </div>

                <div className="info-col">
                  <div className="info-row">
                    <span className="info-label">BATCH NAME :</span>
                    <span className="info-value">{currentStudent.batch?.batchName || currentStudent.batchName || 'Police Bharti Morning'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">BATCH TIME :</span>
                    <span className="info-value">{currentStudent.batch?.batchTiming || '06:00 AM - 08:30 AM'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">MONTH :</span>
                    <span className="info-value">{selectedMonth}</span>
                  </div>
                </div>
              </div>

              <div className="report-divider"></div>

              {/* SECTION 1: CLASS TEST */}
              <div className="report-section">
                <div className="section-title-wrap">
                  <h3 className="section-title">CLASS TEST :</h3>
                  {!isBlankTemplate && classTestTotalMarks > 0 && (
                    <div className="section-title-score-info">
                      <span>Total: <strong>{classTestTotalMarks}</strong></span>
                      <span style={{ margin: '0 4px' }}>|</span>
                      <span>Obtained: <strong>{classTestObtainedMarks}</strong></span>
                    </div>
                  )}
                </div>
                <table className="report-table class-test-table">
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>DATE</th>
                      <th style={{ width: '45%' }}>TEST / SUBJECT</th>
                      <th style={{ width: '20%' }}>TOTAL MARK</th>
                      <th style={{ width: '20%' }}>OBTAINED MARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isBlankTemplate ? Array(8).fill(null) : classTests).map((item, idx) => (
                      <tr key={idx}>
                        <td className="center-cell">{!isBlankTemplate && item ? item.date : ''}</td>
                        <td>{!isBlankTemplate && item ? item.subject : ''}</td>
                        <td className="center-cell">{!isBlankTemplate && item ? item.totalMarks : ''}</td>
                        <td className="center-cell bold-cell">{!isBlankTemplate && item ? item.obtainedMarks : ''}</td>
                      </tr>
                    ))}
                    {/* AUTOMATIC MARKS ADDITION ROW */}
                    <tr className="class-test-total-row">
                      <td colSpan={2} className="total-label-cell">
                        TOTAL MARKS :
                      </td>
                      <td className="center-cell bold-cell total-sum-cell">
                        {!isBlankTemplate && classTestTotalMarks > 0 ? classTestTotalMarks : ''}
                      </td>
                      <td className="center-cell bold-cell total-sum-cell">
                        {!isBlankTemplate && (classTestObtainedMarks > 0 || classTestTotalMarks > 0) ? classTestObtainedMarks : ''}
                      </td>
                    </tr>
                    {/* AUTOMATIC PERCENTAGE ROW */}
                    <tr className="class-test-total-row class-test-percentage-row">
                      <td colSpan={2} className="total-label-cell">
                        PERCENTAGE :
                      </td>
                      <td colSpan={2} className="center-cell bold-cell total-sum-cell percentage-val-cell">
                        {!isBlankTemplate && classTestTotalMarks > 0 ? `${classTestPercentage}%` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION 2: PHYSICAL TEST */}
              <div className="report-section">
                <h3 className="section-title">PHYSICAL TEST :</h3>
                <table className="report-table physical-test-table">
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ width: '15%' }}>
                        DATE
                      </th>
                      <th colSpan={2} style={{ width: '22%' }}>
                        1600 M
                      </th>
                      <th colSpan={2} style={{ width: '22%' }}>
                        100 M
                      </th>
                      <th colSpan={2} style={{ width: '26%' }}>
                        SHOT PUT
                      </th>
                      <th rowSpan={2} style={{ width: '15%' }}>
                        TOTAL MARK
                      </th>
                    </tr>
                    <tr>
                      <th style={{ width: '11%' }}>TIME</th>
                      <th style={{ width: '11%' }}>MARK</th>
                      <th style={{ width: '11%' }}>TIME</th>
                      <th style={{ width: '11%' }}>MARK</th>
                      <th style={{ width: '13%' }}>DISTANCE</th>
                      <th style={{ width: '13%' }}>MARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isBlankTemplate ? Array(6).fill(null) : physicalTests).map((item, idx) => (
                      <tr key={idx}>
                        <td className="center-cell">{!isBlankTemplate && item ? item.date : ''}</td>
                        <td className="center-cell">{!isBlankTemplate && item ? item.time1600 : ''}</td>
                        <td className="center-cell bold-cell">{!isBlankTemplate && item ? item.mark1600 : ''}</td>
                        <td className="center-cell">{!isBlankTemplate && item ? item.time100 : ''}</td>
                        <td className="center-cell bold-cell">{!isBlankTemplate && item ? item.mark100 : ''}</td>
                        <td className="center-cell">{!isBlankTemplate && item ? item.shotPutDistance : ''}</td>
                        <td className="center-cell bold-cell">{!isBlankTemplate && item ? item.shotPutMark : ''}</td>
                        <td className="center-cell total-cell">{!isBlankTemplate && item ? item.totalMark : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SIGNATURE FOOTER */}
              <div className="report-signature-footer">
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <span className="signature-title">STUDENTS SIGN</span>
                </div>
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <span className="signature-title">PARENTS SIGN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKS ENTRY SCREEN */}
      {activeTab === 'entry' && (
        <div className="entry-mode-container">
          {/* Class Test Entry Card */}
          <div className="card entry-card">
            <div className="card-header-flex">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                  Class Test Marks Entry — {currentStudent.studentName}
                </h3>
                <p className="card-desc">
                  Enter written test subjects and marks for {selectedMonth}. Total additions calculate automatically.
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setClassTests([
                    ...classTests,
                    { id: String(Date.now()), date: '', subject: '', totalMarks: 50, obtainedMarks: '' },
                  ])
                }
              >
                <i className="ti ti-plus"></i> Add Test Row
              </button>
            </div>

            {/* Live Auto-Addition Banner */}
            <div className="entry-score-banner">
              <div className="banner-item">
                <span className="lbl">Tests Entered:</span>
                <span className="val">{classTests.filter((t) => t.date || t.subject).length}</span>
              </div>
              <div className="banner-item">
                <span className="lbl">Total Marks:</span>
                <span className="val highlight">{classTestTotalMarks}</span>
              </div>
              <div className="banner-item">
                <span className="lbl">Obtained Marks:</span>
                <span className="val highlight-green">{classTestObtainedMarks}</span>
              </div>
              <div className="banner-item">
                <span className="lbl">Percentage:</span>
                <span className="val">{classTestPercentage}%</span>
              </div>
            </div>

            <div className="table-responsive entry-table-wrapper">
              <table className="entry-table">
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th style={{ width: '18%' }}>Date</th>
                    <th style={{ width: '45%' }}>Test / Subject Name</th>
                    <th style={{ width: '16%' }}>Total Marks</th>
                    <th style={{ width: '16%' }}>Obtained Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {classTests.map((t, idx) => (
                    <tr key={t.id || idx}>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <input
                          type="text"
                          placeholder="DD/MM/YYYY"
                          className="entry-input"
                          value={t.date}
                          onChange={(e) => updateClassTest(idx, 'date', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="e.g. Marathi Grammar / GK / Maths"
                          className="entry-input"
                          value={t.subject}
                          onChange={(e) => updateClassTest(idx, 'subject', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="50"
                          className="entry-input center"
                          value={t.totalMarks}
                          onChange={(e) => updateClassTest(idx, 'totalMarks', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="42"
                          className="entry-input center bold"
                          value={t.obtainedMarks}
                          onChange={(e) => updateClassTest(idx, 'obtainedMarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                  {/* Total row in entry table */}
                  <tr className="entry-total-row">
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, paddingRight: '14px' }}>
                      TOTAL ADDITION :
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '14px', color: '#1E293B' }}>
                      {classTestTotalMarks}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '14px', color: '#166534' }}>
                      {classTestObtainedMarks}
                    </td>
                  </tr>
                  {/* Percentage row in entry table */}
                  <tr className="entry-total-row" style={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, paddingRight: '14px' }}>
                      PERCENTAGE :
                    </td>
                    <td colSpan={2} style={{ textAlign: 'center', fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>
                      {classTestPercentage}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Physical Trial Entry Card */}
          <div className="card entry-card" style={{ marginTop: '20px' }}>
            <div className="card-header-flex">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                  Physical Trial Marks Entry — {currentStudent.studentName}
                </h3>
                <p className="card-desc">Track 1600M running, 100M sprint, and Shot Put (गोळाफेक)</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setPhysicalTests([
                    ...physicalTests,
                    {
                      id: String(Date.now()),
                      date: '',
                      time1600: '',
                      mark1600: '',
                      time100: '',
                      mark100: '',
                      shotPutDistance: '',
                      shotPutMark: '',
                      totalMark: '',
                    },
                  ])
                }
              >
                <i className="ti ti-plus"></i> Add Trial Row
              </button>
            </div>

            <div className="table-responsive entry-table-wrapper">
              <table className="entry-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>1600M Time</th>
                    <th>1600M Marks</th>
                    <th>100M Time</th>
                    <th>100M Marks</th>
                    <th>Shot Put Dist</th>
                    <th>Shot Put Marks</th>
                    <th>Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {physicalTests.map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <input
                          type="text"
                          placeholder="DD/MM/YYYY"
                          className="entry-input"
                          value={p.date}
                          onChange={(e) => updatePhysicalTest(idx, 'date', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="05:10"
                          className="entry-input center"
                          value={p.time1600}
                          onChange={(e) => updatePhysicalTest(idx, 'time1600', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="28"
                          className="entry-input center"
                          value={p.mark1600}
                          onChange={(e) => updatePhysicalTest(idx, 'mark1600', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="11.8s"
                          className="entry-input center"
                          value={p.time100}
                          onChange={(e) => updatePhysicalTest(idx, 'time100', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="15"
                          className="entry-input center"
                          value={p.mark100}
                          onChange={(e) => updatePhysicalTest(idx, 'mark100', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="8.6m"
                          className="entry-input center"
                          value={p.shotPutDistance}
                          onChange={(e) => updatePhysicalTest(idx, 'shotPutDistance', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="15"
                          className="entry-input center"
                          value={p.shotPutMark}
                          onChange={(e) => updatePhysicalTest(idx, 'shotPutMark', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="entry-input center bold"
                          style={{ backgroundColor: '#f0fdf4', color: '#166534' }}
                          value={p.totalMark}
                          readOnly
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('preview')}>
                <i className="ti ti-check"></i> View on Report Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS Styles */}
      <style>{`
        .monthly-report-page {
          padding: 4px 0 40px 0;
        }

        /* Top Header Row matching other reports */
        .report-top-nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .nav-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .back-nav-btn {
          padding: 7px 12px;
          font-size: 13px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: var(--navy, #12283F);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 6px;
          cursor: pointer;
        }
        .back-nav-btn:hover {
          background: #F8FAFC;
        }
        .report-main-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--navy, #12283F);
          margin: 0;
        }
        .report-main-desc {
          font-size: 12.5px;
          color: var(--slate-light, #64748B);
          display: block;
        }

        .report-downloads-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .report-sub-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        /* View Mode Tabs */
        .report-view-tabs {
          display: inline-flex;
          background: #E2E8F0;
          padding: 3px;
          border-radius: 8px;
          gap: 3px;
        }
        .view-tab-btn {
          border: none;
          background: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .view-tab-btn.active {
          background: #FFFFFF;
          color: #0F172A;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .template-toggle-btn {
          padding: 7px 12px;
          font-size: 12.5px;
          font-weight: 600;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #334155;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .template-toggle-btn.active-blank {
          background: #FEF3C7;
          border-color: #F59E0B;
          color: #B45309;
        }

        .excel-download-btn {
          background: #107C41 !important;
          color: #FFFFFF !important;
          border: none !important;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .excel-download-btn:hover {
          opacity: 0.92;
        }

        .pdf-download-btn {
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 6px;
          cursor: pointer;
        }

        /* Filter Controls Card */
        .report-filter-card {
          margin-bottom: 16px;
        }
        .report-filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          align-items: end;
        }
        .report-filter-grid .form-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .report-filter-grid label {
          font-size: 12px;
          font-weight: 600;
          color: var(--slate-light, #64748B);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .report-filter-grid .form-control {
          padding: 8px 12px;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          font-size: 13px;
          color: #0F172A;
          background: #FFFFFF;
          outline: none;
          box-sizing: border-box;
          width: 100%;
        }
        .report-filter-grid .form-control:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
        }
        .filter-reset-field {
          display: flex;
          justify-content: flex-start;
        }
        .reset-filter-btn {
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          color: #475569;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
        }
        .reset-filter-btn:hover {
          background: #F1F5F9;
        }

        /* Active Student Summary Strip */
        .student-summary-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 10px 16px;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .summary-strip-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .summary-pill {
          font-size: 12.5px;
          color: #334155;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .summary-pill.student-name-pill {
          font-weight: 700;
          color: #1E293B;
          background: #EFF6FF;
          border-color: #BFDBFE;
        }
        .summary-pill.mobile-pill {
          color: #0369A1;
          background: #F0F9FF;
          border-color: #BAE6FD;
          font-family: monospace;
          font-size: 13px;
        }
        .summary-strip-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .summary-badge {
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 6px;
          font-weight: 600;
        }
        .total-marks-badge {
          background: #F1F5F9;
          color: #334155;
          border: 1px solid #CBD5E1;
        }
        .obtained-marks-badge {
          background: #ECFDF5;
          color: #047857;
          border: 1px solid #A7F3D0;
        }
        .score-percent-badge {
          background: #EFF6FF;
          color: #1D4ED8;
          border: 1px solid #BFDBFE;
        }

        /* Printable Paper Sheet Container */
        .report-sheet-container {
          display: flex;
          justify-content: center;
          padding: 20px 0;
          background: #F8FAFC;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .report-paper-sheet {
          width: 820px;
          min-width: 820px;
          background: #FFFFFF;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #CBD5E1;
          padding: 22px;
          box-sizing: border-box;
          color: #000000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .report-border-frame {
          border: 1.5px solid #000000;
          padding: 16px;
          min-height: 1020px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        /* Banner Box */
        .foundation-banner-box {
          border: 1.5px solid #000000;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
        }
        .banner-logo-wrap {
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .foundation-logo {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .banner-content {
          text-align: center;
          flex-grow: 1;
        }
        .foundation-title {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 3px 0;
          color: #000000;
          letter-spacing: 0.5px;
        }
        .foundation-address {
          font-size: 11px;
          margin: 0 0 2px 0;
          color: #1E293B;
        }
        .foundation-subtitle {
          font-size: 12px;
          font-weight: 700;
          margin: 0 0 2px 0;
          color: #000000;
        }
        .foundation-contact {
          font-size: 11px;
          font-weight: 700;
          margin: 0;
          color: #000000;
        }

        /* Title */
        .report-title-section {
          text-align: center;
          margin: 10px 0 14px 0;
        }
        .report-main-heading {
          font-size: 16px;
          font-weight: 800;
          text-decoration: underline;
          text-underline-offset: 4px;
          letter-spacing: 1px;
          margin: 0;
          color: #000000;
        }

        /* Student Info Grid */
        .student-info-grid {
          display: flex;
          justify-content: space-between;
          padding: 0 4px;
          margin-bottom: 12px;
          gap: 20px;
        }
        .info-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .info-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 12px;
        }
        .info-label {
          font-weight: 800;
          color: #000000;
          white-space: nowrap;
          min-width: 110px;
        }
        .info-value {
          font-weight: 600;
          color: #000000;
          border-bottom: 1px dotted #94A3B8;
          flex-grow: 1;
          padding-bottom: 1px;
        }
        .font-mono {
          font-family: monospace;
          font-size: 12.5px;
          letter-spacing: 0.5px;
        }
        .report-divider {
          height: 1px;
          background: #000000;
          margin: 6px 0 12px 0;
        }

        /* Tables Inside Report Paper Sheet */
        .report-section {
          margin-bottom: 16px;
        }
        .section-title-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0 2px 6px 2px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 800;
          text-decoration: underline;
          text-underline-offset: 3px;
          margin: 0 0 6px 2px;
          color: #000000;
        }
        .section-title-score-info {
          font-size: 11px;
          font-weight: 700;
          color: #000000;
          display: flex;
          align-items: center;
        }

        .report-table {
          width: 100% !important;
          border-collapse: collapse !important;
          border: 1.5px solid #000000 !important;
          font-size: 11px !important;
          background: transparent !important;
        }
        .report-table th,
        .report-table td {
          border: 1px solid #000000 !important;
          padding: 5px 6px !important;
          color: #000000 !important;
          height: 22px;
          box-sizing: border-box;
        }
        .report-table th {
          background-color: #F8FAFC !important;
          font-weight: 800 !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        .center-cell {
          text-align: center !important;
        }
        .bold-cell {
          font-weight: 700 !important;
          text-align: center !important;
        }
        .total-cell {
          font-weight: 800 !important;
          background-color: #F1F5F9 !important;
        }
        .class-test-total-row {
          background-color: #F8FAFC !important;
          border-top: 1.5px solid #000000 !important;
        }
        .class-test-percentage-row {
          background-color: #F8FAFC !important;
          border-top: 1px solid #CBD5E1 !important;
        }
        .percentage-val-cell {
          font-weight: 800 !important;
          font-size: 13px !important;
          color: #0F172A !important;
          background-color: #F1F5F9 !important;
        }
        .total-label-cell {
          text-align: right !important;
          font-weight: 800 !important;
          padding-right: 12px !important;
          letter-spacing: 0.5px;
        }
        .total-sum-cell {
          font-weight: 800 !important;
          font-size: 12px !important;
          background-color: #F1F5F9 !important;
        }

        /* Signatures */
        .report-signature-footer {
          margin-top: auto;
          padding: 24px 20px 8px 20px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 180px;
        }
        .signature-line {
          width: 100%;
          border-bottom: 1px solid #000000;
          margin-bottom: 6px;
        }
        .signature-title {
          font-size: 12px;
          font-weight: 800;
          text-decoration: underline;
          color: #000000;
        }

        /* Entry Screen Styles */
        .entry-mode-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .entry-card {
          padding: 20px;
          background: #FFFFFF;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
        }
        .card-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .card-desc {
          margin: 2px 0 0 0;
          font-size: 13px;
          color: #64748B;
        }

        .entry-score-banner {
          display: flex;
          align-items: center;
          gap: 18px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 10px 16px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .banner-item {
          display: flex;
          align-items: baseline;
          gap: 6px;
          font-size: 13px;
        }
        .banner-item .lbl {
          color: #64748B;
          font-weight: 600;
        }
        .banner-item .val {
          font-weight: 700;
          color: #0F172A;
        }
        .banner-item .val.highlight {
          color: #2563EB;
          font-size: 15px;
        }
        .banner-item .val.highlight-green {
          color: #16A34A;
          font-size: 15px;
        }

        .entry-table-wrapper {
          overflow-x: auto;
        }
        .entry-table {
          width: 100%;
          border-collapse: collapse;
        }
        .entry-table th {
          background: #F1F5F9;
          padding: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          text-align: left;
          border-bottom: 1px solid #CBD5E1;
        }
        .entry-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #E2E8F0;
        }
        .entry-input {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid #CBD5E1;
          border-radius: 5px;
          font-size: 13px;
          box-sizing: border-box;
        }
        .entry-input.center {
          text-align: center;
        }
        .entry-input.bold {
          font-weight: 700;
        }
        .entry-total-row {
          background: #F8FAFC;
          border-top: 2px solid #CBD5E1;
        }

        /* Mobile & Responsive Rules (< 768px) */
        @media (max-width: 768px) {
          .report-top-nav-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .nav-title-group {
            width: 100%;
          }
          .report-actions-group {
            width: 100%;
            justify-content: stretch;
          }
          .report-actions-group > * {
            flex: 1 1 auto;
            justify-content: center;
          }
          .report-filter-grid {
            grid-template-columns: 1fr;
          }
          .student-summary-strip {
            flex-direction: column;
            align-items: flex-start;
          }
          .summary-strip-left,
          .summary-strip-right {
            width: 100%;
          }

          /* CRITICAL: Protect the report paper sheet table from global mobile table stacking in index.css */
          .report-paper-sheet table {
            display: table !important;
            width: 100% !important;
            border: 1.5px solid #000000 !important;
            background: transparent !important;
          }
          .report-paper-sheet table thead {
            display: table-header-group !important;
          }
          .report-paper-sheet table tbody {
            display: table-row-group !important;
            gap: 0 !important;
          }
          .report-paper-sheet table tbody tr {
            display: table-row !important;
            background: transparent !important;
            border: 1px solid #000000 !important;
            border-radius: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            gap: 0 !important;
          }
          .report-paper-sheet table tbody tr::before {
            content: none !important;
            display: none !important;
          }
          .report-paper-sheet table tbody td {
            display: table-cell !important;
            padding: 5px 6px !important;
            border: 1px solid #000000 !important;
            border-bottom: 1px solid #000000 !important;
            text-align: inherit !important;
            font-size: 11px !important;
            width: auto !important;
          }
          .report-paper-sheet table tbody td::before {
            content: none !important;
            display: none !important;
          }

          /* Entry screen table mobile protection */
          .entry-table {
            display: table !important;
            width: 100% !important;
            min-width: 600px;
          }
          .entry-table thead {
            display: table-header-group !important;
          }
          .entry-table tbody {
            display: table-row-group !important;
          }
          .entry-table tbody tr {
            display: table-row !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          .entry-table tbody tr::before {
            content: none !important;
            display: none !important;
          }
          .entry-table tbody td {
            display: table-cell !important;
            width: auto !important;
          }
          .entry-table tbody td::before {
            content: none !important;
            display: none !important;
          }
        }

        /* PRINT STYLES - Matches Official Print Layout */
        @media print {
          body * {
            visibility: hidden;
          }
          .monthly-report-page,
          .report-sheet-container,
          .report-paper-sheet,
          .report-paper-sheet * {
            visibility: visible !important;
          }
          .no-print,
          .app-container .sidebar,
          .app-container .topbar {
            display: none !important;
          }
          .monthly-report-page {
            padding: 0 !important;
            margin: 0 !important;
          }
          .report-sheet-container {
            padding: 0 !important;
            background: transparent !important;
            border: none !important;
          }
          .report-paper-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .report-border-frame {
            border: 2px solid #000000 !important;
            padding: 14px !important;
            min-height: 98vh !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
};

export default MonthlyStudentReportPage;
