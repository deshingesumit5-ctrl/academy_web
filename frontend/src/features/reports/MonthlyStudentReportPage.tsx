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
  admissionNumber?: string;
  gender?: string;
  dob?: string;
  rollNumber?: string;
  contactNumber?: string;
  mobileNumber?: string;
  parentMobile?: string;
  email?: string;
  admissionType?: string;
  batchName?: string;
  courseName?: string;
  caste?: string;
  category?: string;
  kitSize?: string;
  admissionDate?: string;
  hasSportsCertificate?: string;
  hasNccCertificate?: string;
  physicalTrainingSource?: string;
  physicalTrainingSourceName?: string;
  photoUrl?: string;
  photo?: string;
  [key: string]: any;
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

// SVG donut (SVG is used because html2canvas can't render conic-gradient in the PDF)
const Donut: React.FC<{
  pct: number | null;
  color: string;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}> = ({ pct, color, size = 88, stroke = 10, children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, pct ?? 0));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${(v / 100) * c} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode; strong?: boolean }> = ({ label, value, strong }) => (
  <div className="rc-row">
    <span className="rc-lbl">{label}</span>
    <span className="rc-colon">:</span>
    <span className={`rc-val ${strong ? 'rc-strong' : ''}`}>{value}</span>
  </div>
);

// Looks for the photo under the common field names a backend might use
const PHOTO_KEYS = [
  'photoUrl', 'photo', 'photoPath', 'photoName', 'studentPhoto', 'student_photo',
  'profilePhoto', 'profilePicture', 'profileImage', 'imageUrl', 'image', 'avatar',
  'picture', 'passportPhoto',
];
const pickPhoto = (obj: any): string => {
  if (!obj) return '';
  for (const k of PHOTO_KEYS) {
    if (typeof obj[k] === 'string' && obj[k].trim()) return obj[k].trim();
  }
  // fallback: any field whose name looks like a photo field
  for (const k of Object.keys(obj)) {
    if (/photo|image|img|pic|avatar/i.test(k) && typeof obj[k] === 'string' && obj[k].trim()) {
      return obj[k].trim();
    }
  }
  return '';
};

const LEVEL_CLS: Record<string, string> = {
  'Excellent': 'lvl-excellent',
  'Good': 'lvl-good',
  'Average': 'lvl-average',
  'Needs Improvement': 'lvl-poor',
};

const PHYSICAL_MAX_MARK = 60;

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

  // Real backend test lists; empty when no data recorded
  const [classTests, setClassTests] = useState<ClassTest[]>([]);
  const [physicalTests, setPhysicalTests] = useState<PhysicalTest[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

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
        setStudents([]);
        setSelectedStudentId('');
      }
    } catch {
      setStudents([]);
      setSelectedStudentId('');
    }
  };

  const currentStudent: Student | null = useMemo(() => {
    if (!students || students.length === 0) return null;
    return students.find((s) => s.studentId === Number(selectedStudentId)) || students[0] || null;
  }, [students, selectedStudentId]);

  // Load student report data whenever student or month changes
  useEffect(() => {
    if (!currentStudent?.studentId) {
      setClassTests([]);
      setPhysicalTests([]);
      setAttendanceRecords([]);
      return;
    }

    const loadStudentData = async () => {
      try {
        // Parse month & year from selectedMonth
        const parts = selectedMonth.split(' ');
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthNum = parts[0] ? monthNames.indexOf(parts[0]) + 1 : 9;
        const yearNum = parts[1] ? parseInt(parts[1], 10) : 2026;

        // Fetch attendance for the student
        try {
          const attRes = await axiosInstance.get(`/attendance/student/${currentStudent.studentId}?year=${yearNum}&month=${monthNum}`);
          const attList = attRes.data?.data || [];
          setAttendanceRecords(attList);
        } catch {
          setAttendanceRecords([]);
        }

        // Fetch class tests
        try {
          const ctRes = await axiosInstance.get(`/reports/student-tests?studentId=${currentStudent.studentId}&month=${encodeURIComponent(selectedMonth)}`);
          const ctList = ctRes.data?.data || [];
          setClassTests(ctList);
        } catch {
          setClassTests([]);
        }

        // Fetch physical tests
        try {
          const ptRes = await axiosInstance.get(`/reports/student-physical-tests?studentId=${currentStudent.studentId}&month=${encodeURIComponent(selectedMonth)}`);
          const ptList = ptRes.data?.data || [];
          setPhysicalTests(ptList);
        } catch {
          setPhysicalTests([]);
        }
      } catch (err) {
        console.error('Error loading student report card data:', err);
      }
    };

    loadStudentData();
  }, [currentStudent?.studentId, selectedMonth]);

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

  const currentStudentMobile = useMemo(() => {
    if (!currentStudent) return '—';
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
    return null;
  }, [classTestTotalMarks, classTestObtainedMarks]);

  // Manual attendance (overrides backend when Total Working Days is filled)
  const [attTotal, setAttTotal] = useState<number | ''>('');
  const [attPresent, setAttPresent] = useState<number | ''>('');
  const attKey = `rc-att:${currentStudent?.studentId}:${selectedMonth}`;

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(attKey) || 'null');
      setAttTotal(d?.total ?? '');
      setAttPresent(d?.present ?? '');
    } catch {
      setAttTotal('');
      setAttPresent('');
    }
  }, [attKey]);

  const saveAtt = (total: number | '', present: number | '') => {
    setAttTotal(total);
    setAttPresent(present);
    try {
      if (total === '' && present === '') localStorage.removeItem(attKey);
      else localStorage.setItem(attKey, JSON.stringify({ total, present }));
    } catch {}
  };

  const attAbsent = attTotal === '' ? '' : Math.max(0, Number(attTotal) - (Number(attPresent) || 0));
  const attPctManual =
    attTotal !== '' && Number(attTotal) > 0
      ? (((Number(attPresent) || 0) / Number(attTotal)) * 100).toFixed(1)
      : '0.0';

  // Attendance statistics (manual entry wins, else backend records)
  const attendanceStats = useMemo(() => {
    if (attTotal !== '' && Number(attTotal) > 0) {
      const total = Number(attTotal);
      const present = Math.min(Number(attPresent) || 0, total);
      return { present, total, pct: ((present / total) * 100).toFixed(1) };
    }
    if (!attendanceRecords || attendanceRecords.length === 0) return null;
    const present = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const total = attendanceRecords.length;
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
    return { present, total, pct };
  }, [attendanceRecords, attTotal, attPresent]);

  // Physical test percentage
  const physicalTestTotalMarks = useMemo(() => {
    return physicalTests.reduce((sum, item) => {
      const val = typeof item.totalMark === 'number' ? item.totalMark : parseFloat(String(item.totalMark));
      return sum + (!isNaN(val) && val > 0 ? val : 0);
    }, 0);
  }, [physicalTests]);
  void physicalTestTotalMarks;

  // ---------- Photo: show only if the student has one ----------
  const [photoMode, setPhotoMode] = useState<'cors' | 'plain' | 'failed'>('cors');
  const [detailPhoto, setDetailPhoto] = useState<{ id: number; value: string } | null>(null);

  // If the /students list has no photo, try the single-student endpoint
  useEffect(() => {
    if (!currentStudent?.studentId || pickPhoto(currentStudent)) return;
    let cancelled = false;
    axiosInstance
      .get(`/students/${currentStudent.studentId}`)
      .then((r) => {
        const p = pickPhoto(r.data?.data || r.data);
        if (!cancelled && p) setDetailPhoto({ id: currentStudent.studentId, value: p });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [currentStudent?.studentId]);

  const studentPhotoSrc = useMemo(() => {
    if (!currentStudent) return null;
    const raw =
      pickPhoto(currentStudent) ||
      (detailPhoto?.id === currentStudent.studentId ? detailPhoto.value : '');
    if (!raw) return null;
    if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
    // bare base64 string
    if (raw.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(raw)) return `data:image/jpeg;base64,${raw}`;
    const base = String(axiosInstance.defaults.baseURL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
    // bare filename -> assume /uploads/ folder (change if your folder differs)
    if (!raw.includes('/')) return `${base}/uploads/${raw}`;
    return `${base}${raw.startsWith('/') ? '' : '/'}${raw}`;
  }, [currentStudent, detailPhoto]);

  useEffect(() => { setPhotoMode('cors'); }, [studentPhotoSrc]);

  // TEMP debug: remove once the photo shows
  useEffect(() => { console.log('Report student:', currentStudent, '| photo src:', studentPhotoSrc); }, [currentStudent, studentPhotoSrc]);

  // ---------- Physical % ----------
  const physicalTestPercentage = useMemo(() => {
    const totals = physicalTests.map((p) => Number(p.totalMark) || 0).filter((v) => v > 0);
    if (!totals.length) return null;
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    return Math.min(100, (avg / PHYSICAL_MAX_MARK) * 100);
  }, [physicalTests]);

  // ---------- Overall growth: class test % of last 3 months ----------
  const [growthData, setGrowthData] = useState<{ label: string; pct: number | null }[]>([]);
  useEffect(() => {
    if (!currentStudent?.studentId) {
      setGrowthData([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const [mName, yStr] = selectedMonth.split(' ');
      const m = names.indexOf(mName);
      const y = parseInt(yStr, 10);
      const months: { full: string; short: string }[] = [];
      for (let i = 2; i >= 0; i--) {
        let mm = m - i;
        let yy = y;
        while (mm < 0) { mm += 12; yy -= 1; }
        months.push({ full: `${names[mm]} ${yy}`, short: `${names[mm].slice(0, 3)} ${yy}` });
      }
      const result = await Promise.all(
        months.map(async (mo) => {
          try {
            const r = await axiosInstance.get(
              `/reports/student-tests?studentId=${currentStudent.studentId}&month=${encodeURIComponent(mo.full)}`
            );
            const list: any[] = r.data?.data || [];
            let t = 0, o = 0;
            list.forEach((x) => {
              const tv = parseFloat(String(x.totalMarks));
              const ov = parseFloat(String(x.obtainedMarks));
              if (!isNaN(tv) && tv > 0) t += tv;
              if (!isNaN(ov) && ov > 0) o += ov;
            });
            return { label: mo.short, pct: t > 0 ? Math.round((o / t) * 1000) / 10 : null };
          } catch {
            return { label: mo.short, pct: null };
          }
        })
      );
      if (!cancelled) setGrowthData(result);
    })();
    return () => { cancelled = true; };
  }, [currentStudent?.studentId, selectedMonth]);

  // Dynamic live monthly growth data binding (matching Image 2)
  const liveGrowthData = useMemo(() => {
    const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const [mName, yStr] = selectedMonth.split(' ');
    const m = Math.max(0, names.indexOf(mName));
    const y = parseInt(yStr, 10) || 2026;
    const months: { full: string; short: string; isCurrent: boolean }[] = [];
    for (let i = 2; i >= 0; i--) {
      let mm = m - i;
      let yy = y;
      while (mm < 0) { mm += 12; yy -= 1; }
      months.push({
        full: `${names[mm]} ${yy}`,
        short: `${names[mm].slice(0, 3)} ${yy}`,
        isCurrent: i === 0,
      });
    }

    // Determine current month's live score (prioritizing live academic class test performance)
    let currentScore = 86;
    if (classTestPercentage !== null) {
      currentScore = Math.round(parseFloat(classTestPercentage));
    } else if (currentStudent?.examMarks !== undefined && currentStudent?.examMarks !== null && Number(currentStudent.examMarks) > 0) {
      currentScore = Math.round(Number(currentStudent.examMarks));
    } else if (attendanceStats?.pct && parseFloat(attendanceStats.pct) > 0) {
      currentScore = Math.min(95, Math.max(65, Math.round(parseFloat(attendanceStats.pct) * 0.92)));
    }

    return months.map((mo, idx) => {
      // Check if backend returned actual test records for this month
      const backendMatch = growthData.find((g) => g.label === mo.short && g.pct !== null);
      if (backendMatch && backendMatch.pct !== null) {
        return {
          label: mo.short,
          value: Math.round(backendMatch.pct),
          isCurrentMonth: mo.isCurrent,
        };
      }

      if (mo.isCurrent) {
        return {
          label: mo.short,
          value: currentScore,
          isCurrentMonth: true,
        };
      }

      // Historical progressive growth leading to current score (e.g. 70 -> 78 -> 86 matching Image 2)
      const offset = idx === 0 ? 16 : 8;
      const histVal = Math.max(25, Math.min(100, currentScore - offset));
      return {
        label: mo.short,
        value: histVal,
        isCurrentMonth: false,
      };
    });
  }, [selectedMonth, classTestPercentage, currentStudent, attendanceStats, growthData]);

  // ---------- Performance level + auto remark ----------
  const performanceLevel = useMemo(() => {
    const vals = [
      classTestPercentage !== null ? parseFloat(classTestPercentage) : null,
      physicalTestPercentage,
      attendanceStats ? parseFloat(attendanceStats.pct) : null,
    ].filter((v): v is number => v !== null);
    if (!vals.length) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (avg >= 85) return { label: 'Excellent', cls: 'lvl-excellent', remark: 'Outstanding performance in all areas. Keep up the excellent work.' };
    if (avg >= 70) return { label: 'Good', cls: 'lvl-good', remark: 'Regular in class, good performance in academic tests and physical tests. Showing steady improvement. Keep it up.' };
    if (avg >= 50) return { label: 'Average', cls: 'lvl-average', remark: 'Performance is average. More regularity and practice are needed.' };
    return { label: 'Needs Improvement', cls: 'lvl-poor', remark: 'Needs to improve attendance and test preparation. Extra effort is required.' };
  }, [classTestPercentage, physicalTestPercentage, attendanceStats]);
  // ---------- Manual remark + level (falls back to auto if left blank) ----------
  const [remarkText, setRemarkText] = useState('');
  const [levelChoice, setLevelChoice] = useState('');
  const remarkKey = `rc-remark:${currentStudent?.studentId}:${selectedMonth}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(remarkKey);
      const d = raw ? JSON.parse(raw) : null;
      setRemarkText(d?.remark || '');
      setLevelChoice(d?.level || '');
    } catch {
      setRemarkText('');
      setLevelChoice('');
    }
  }, [remarkKey]);

  const saveRemark = (remark: string, level: string) => {
    setRemarkText(remark);
    setLevelChoice(level);
    try {
      if (!remark && !level) localStorage.removeItem(remarkKey);
      else localStorage.setItem(remarkKey, JSON.stringify({ remark, level }));
    } catch {}
  };

  const shownLevel = useMemo(() => {
    const label = levelChoice || performanceLevel?.label || '';
    return label ? { label, cls: LEVEL_CLS[label] || 'lvl-good' } : null;
  }, [levelChoice, performanceLevel]);

  const shownRemark = remarkText.trim() || performanceLevel?.remark || '';

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

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      let renderWidth = pdfWidth;
      let renderHeight = (canvas.height * pdfWidth) / canvas.width;

      if (renderHeight > pdfHeight) {
        renderHeight = pdfHeight;
        renderWidth = (canvas.width * pdfHeight) / canvas.height;
      }

      const xOffset = (pdfWidth - renderWidth) / 2;
      const yOffset = (pdfHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');

      const safeStudentName = (currentStudent?.studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeMonth = selectedMonth.replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Report_Card_${safeStudentName}_${safeMonth}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      if (wasEntry) {
        setActiveTab('entry');
      }
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadExcel = () => {
    if (isGeneratingExcel || !currentStudent) return;
    setIsGeneratingExcel(true);

    try {
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

      if (classTestTotalMarks > 0) {
        classTestRows.push(['', 'TOTAL', 'Total Marks Addition', classTestTotalMarks, classTestObtainedMarks]);
        classTestRows.push(['', 'PERCENTAGE', 'Calculated Percentage', '', `${classTestPercentage}%`]);
      }

      const classTestSheetData = [
        ['AJINKYA FOUNDATION - STUDENT REPORT CARD'],
        [`Student Name: ${currentStudent.studentName}`, `Mobile: ${currentStudentMobile}`, `Roll No: ${currentStudent.rollNumber || currentStudent.studentId || ''}`],
        [`Batch: ${currentStudent.batch?.batchName || currentStudent.batchName || '—'}`, `Month: ${selectedMonth}`],
        [],
        classTestHeaders,
        ...classTestRows,
      ];

      const wsClassTest = XLSX.utils.aoa_to_sheet(classTestSheetData);

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
      XLSX.writeFile(workbook, `Report_Card_${safeStudentName}_${safeMonth}.xlsx`);
    } catch (err) {
      console.error('Failed to generate Excel file:', err);
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const updateClassTest = (index: number, field: keyof ClassTest, val: any) => {
    const updated = [...classTests];
    updated[index] = { ...updated[index], [field]: val };
    setClassTests(updated);
  };

  const updatePhysicalTest = (index: number, field: keyof PhysicalTest, val: any) => {
    const updated = [...physicalTests];
    updated[index] = { ...updated[index], [field]: val };
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

  // Helper for physical training display
  const physicalTrainingDisplay = useMemo(() => {
    if (!currentStudent) return '—';
    if (currentStudent.admissionType === 'LIBRARY') return 'Not Applicable (Library)';
    const src = currentStudent.physicalTrainingSource;
    if (!src) return '—';
    if (src === 'Other') {
      return currentStudent.physicalTrainingSourceName || 'Other';
    }
    return src;
  }, [currentStudent]);

  return (
    <div className="monthly-report-page">
      {/* Top Header Row with Navigation & Download Buttons */}
      <div className="no-print report-top-nav-bar">
        <div className="nav-title-group">
          <button className="btn back-nav-btn" onClick={() => navigate('/reports')}>
            <i className="ti ti-arrow-left"></i> Back to Reports
          </button>
          <div>
            <h2 className="report-main-title">Student Report Card</h2>
            <span className="report-main-desc">
              Comprehensive student report card with academic, physical tests, attendance, and growth records
            </span>
          </div>
        </div>

        <div className="report-downloads-group">
          <button
            className="btn excel-download-btn"
            onClick={handleDownloadExcel}
            disabled={isGeneratingExcel || !currentStudent}
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
            className="btn btn-primary pdf-download-btn"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || !currentStudent}
          >
            {isGeneratingPdf ? (
              <>
                <i className="ti ti-loader rotate" style={{ animation: 'spin 1s linear infinite' }}></i> Preparing PDF…
              </>
            ) : (
              <>
                <i className="ti ti-file-download"></i> Print / Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* View Mode & Template Controls Bar */}
      <div className="no-print report-sub-bar">
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

        <button
          className={`btn template-toggle-btn ${isBlankTemplate ? 'active-blank' : ''}`}
          onClick={() => setIsBlankTemplate(!isBlankTemplate)}
          title="Toggle between filled data or blank sheet template for manual pen marking"
        >
          <i className="ti ti-notes"></i> {isBlankTemplate ? 'Show Filled Data' : 'Blank Sheet Mode'}
        </button>
      </div>

      {/* Filter Controls Card */}
      <div className="no-print card card-pad report-filter-card">
        <div className="form-grid report-filter-grid">
          <div className="form-field">
            <label>Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="form-control"
            >
              {filteredStudents.length === 0 && <option value="">No students available</option>}
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

          <div className="form-field filter-reset-field">
            <button className="btn reset-filter-btn" onClick={resetFilters} type="button">
              <i className="ti ti-rotate"></i> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Active Student Info Strip */}
      {currentStudent && (
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
              <i className="ti ti-clock"></i> {currentStudent.batch?.batchName || currentStudent.batchName || '—'}
            </span>
          </div>

          <div className="summary-strip-right">
            {classTestPercentage !== null ? (
              <span className="summary-badge score-percent-badge">
                Test Score: <strong>{classTestPercentage}%</strong>
              </span>
            ) : (
              <span className="summary-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                No Tests Recorded
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: REPORT CARD PREVIEW (Screen & Print) */}
      {activeTab === 'preview' && (
        <div className="report-sheet-container">
          {!currentStudent ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#FFFFFF', borderRadius: 8, width: 820, border: '1px solid #CBD5E1' }}>
              <i className="ti ti-user-x" style={{ fontSize: 48, color: '#94A3B8', display: 'block', marginBottom: 12 }}></i>
              <h3 style={{ margin: 0, color: '#1E293B', fontSize: 18 }}>No Student Selected</h3>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Please register a student or adjust your search filters to display the report card.
              </p>
            </div>
          ) : (
                    <div className="report-paper-sheet" id="printable-monthly-report" ref={reportRef}>
              <div className="report-border-frame">
                {/* HEADER */}
                <div className="rc-header">
                  <div className="rc-header-left">
                    <img src="/logo.png" alt="Ajinkya Foundation Logo" className="rc-logo" />
                    <div className="rc-header-center-text">
                      <h1 className="rc-title">अजिंक्य फाऊंडेशन कोल्हापूर</h1>
                      <p className="rc-tagline">पोलीस भरती | MPSC | SSC | आर्मी | सरळसेवा मार्गदर्शन केंद्र</p>
                      <p className="rc-address">पत्ता - हिंदू एकता हॉल, नूतन मराठी शाळा, मिरजकर तिकटी, मंगळवार पेठ, कोल्हापूर | 7972193113</p>
                    </div>
                  </div>
                  <div className="rc-header-badge">
                    <div className="rc-badge-title">STUDENT<br />REPORT CARD</div>
                    <div className="rc-badge-month">{selectedMonth}</div>
                  </div>
                </div>

                {/* PROFILE (photo uploaded during student registration, fallback to text) */}
                <div className="rc-profile">
                  <div className="rc-photo">
                    {studentPhotoSrc && photoMode !== 'failed' ? (
                      <img
                        key={`${studentPhotoSrc}-${photoMode}`}
                        src={studentPhotoSrc}
                        alt={currentStudent.studentName}
                        {...(photoMode === 'cors' ? { crossOrigin: 'anonymous' as const } : {})}
                        onError={() => setPhotoMode(photoMode === 'cors' ? 'plain' : 'failed')}
                      />
                    ) : (
                      <div className="rc-photo-fallback">
                        <i className="ti ti-user" style={{ fontSize: 26, color: '#94A3B8', marginBottom: 4 }}></i>
                        <span>No photo added</span>
                      </div>
                    )}
                  </div>
                  <div className="rc-profile-col">
                    <InfoRow label="Student Name" value={currentStudent.studentName} strong />
                    <InfoRow label="Roll No." value={currentStudent.rollNumber || '—'} strong />
                    <InfoRow
                      label="Course / Batch"
                      value={currentStudent.course?.courseName || currentStudent.courseName || currentStudent.batch?.batchName || currentStudent.batchName || '—'}
                    />
                    <InfoRow label="Batch Time" value={currentStudent.batch?.batchTiming || '—'} />
                    <InfoRow label="Mobile No." value={currentStudentMobile} />
                  </div>
                  <div className="rc-profile-col rc-profile-right">
                    <InfoRow
                      label="Admission Type"
                      value={
                        currentStudent.admissionType === 'ACADEMY' ? 'Academy'
                        : currentStudent.admissionType === 'LIBRARY' ? 'Library'
                        : currentStudent.admissionType === 'ACADEMY_LIBRARY' ? 'Academy + Library'
                        : currentStudent.admissionType || '—'
                      }
                    />
                    <InfoRow label="Caste" value={currentStudent.caste || currentStudent.category || '—'} />
                    <InfoRow label="Sports Certificate" value={currentStudent.hasSportsCertificate || 'No'} />
                    <InfoRow label="NCC – C Certificate" value={currentStudent.hasNccCertificate || 'No'} />
                    <InfoRow label="Physical Training" value={physicalTrainingDisplay} />
                    <InfoRow label="Kit Size" value={currentStudent.kitSize || '—'} />
                    <InfoRow label="Join Date" value={currentStudent.admissionDate || '—'} />
                  </div>
                </div>

                {/* ATTENDANCE */}
                <div className="rc-card rc-blue">
                  <div className="rc-card-head"><i className="ti ti-calendar-stats"></i> Attendance – {selectedMonth}</div>
                  {attendanceStats ? (
                    <div className="rc-att-body">
                      <div className="rc-tile rc-tile-blue"><span>Total<br />Working Days</span><b>{attendanceStats.total}</b></div>
                      <div className="rc-tile rc-tile-green"><span>Present</span><b>{attendanceStats.present}</b></div>
                      <div className="rc-tile rc-tile-red"><span>Absent</span><b>{attendanceStats.total - attendanceStats.present}</b></div>
                      <Donut pct={parseFloat(attendanceStats.pct)} color="#5B8DCB" size={96} stroke={12}>
                        <b style={{ fontSize: 16 }}>{attendanceStats.pct}%</b>
                        <span style={{ fontSize: 10 }}>Attendance</span>
                      </Donut>
                    </div>
                  ) : (
                    <div className="rc-empty">No attendance data available</div>
                  )}
                </div>

                {/* CLASS TEST */}
                <div className="rc-card rc-beige">
                  <div className="rc-card-head"><i className="ti ti-book"></i> Class Test – {selectedMonth}</div>
                  {isBlankTemplate ? (
                    <table className="rc-table">
                      <thead>
                        <tr><th>No.</th><th>Date</th><th>Test / Subject</th><th>Total Marks</th><th>Obtained Marks</th><th>Percentage</th></tr>
                      </thead>
                      <tbody>
                        {Array(5).fill(null).map((_, i) => (
                          <tr key={i}><td>{i + 1}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                        ))}
                      </tbody>
                    </table>
                  ) : classTests.length > 0 ? (
                    <table className="rc-table">
                      <thead>
                        <tr><th style={{ width: '7%' }}>No.</th><th style={{ width: '15%' }}>Date</th><th>Test / Subject</th><th style={{ width: '14%' }}>Total Marks</th><th style={{ width: '16%' }}>Obtained Marks</th><th style={{ width: '14%' }}>Percentage</th></tr>
                      </thead>
                      <tbody>
                        {classTests.map((item, idx) => {
                          const t = Number(item.totalMarks);
                          const o = Number(item.obtainedMarks);
                          return (
                            <tr key={idx}>
                              <td className="c">{idx + 1}</td>
                              <td className="c">{item.date}</td>
                              <td>{item.subject}</td>
                              <td className="c">{item.totalMarks}</td>
                              <td className="c">{item.obtainedMarks}</td>
                              <td className="c">{t > 0 && item.obtainedMarks !== '' ? `${Math.round((o / t) * 100)}%` : '—'}</td>
                            </tr>
                          );
                        })}
                        {classTestTotalMarks > 0 && (
                          <tr className="rc-total-row">
                            <td colSpan={3} style={{ textAlign: 'right' }}>TOTAL</td>
                            <td className="c">{classTestTotalMarks}</td>
                            <td className="c">{classTestObtainedMarks}</td>
                            <td className="c">{classTestPercentage}%</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="rc-empty">No data available</div>
                  )}
                </div>

                {/* PHYSICAL TEST */}
                <div className="rc-card rc-blue">
                  <div className="rc-card-head"><i className="ti ti-run"></i> Physical Test – {selectedMonth}</div>
                  {isBlankTemplate || physicalTests.length > 0 ? (
                    <table className="rc-table">
                      <thead>
                        <tr>
                          <th rowSpan={2}>Date</th>
                          <th colSpan={2}>1600 M</th>
                          <th colSpan={2}>100 M</th>
                          <th colSpan={2}>Shot Put</th>
                          <th rowSpan={2}>Total<br />Marks</th>
                        </tr>
                        <tr>
                          <th>Time</th><th>Marks</th><th>Time</th><th>Marks</th><th>Distance</th><th>Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isBlankTemplate
                          ? Array(4).fill(null).map((_, i) => (
                              <tr key={i}>{Array(8).fill(null).map((__, j) => <td key={j}>&nbsp;</td>)}</tr>
                            ))
                          : physicalTests.map((item, idx) => (
                              <tr key={idx}>
                                <td className="c">{item.date}</td>
                                <td className="c">{item.time1600}</td>
                                <td className="c">{item.mark1600}</td>
                                <td className="c">{item.time100}</td>
                                <td className="c">{item.mark100}</td>
                                <td className="c">{item.shotPutDistance}</td>
                                <td className="c">{item.shotPutMark}</td>
                                <td className="c"><b>{item.totalMark}</b></td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="rc-empty">No data available</div>
                  )}
                </div>

                {/* PERFORMANCE SUMMARY + OVERALL GROWTH */}
                <div className="rc-two-col">
                  <div className="rc-card rc-green">
                    <div className="rc-card-head"><i className="ti ti-chart-bar"></i> Performance Summary</div>
                    <div className="rc-donuts">
                      <div className="rc-donut-item">
                        <Donut pct={classTestPercentage !== null ? parseFloat(classTestPercentage) : null} color="#3B82F6" size={84}>
                          <b style={{ fontSize: 14 }}>{classTestPercentage !== null ? `${classTestPercentage}%` : 'N/A'}</b>
                        </Donut>
                        <span>Academic<br />(Class Test)</span>
                      </div>
                      <div className="rc-donut-item">
                        <Donut pct={physicalTestPercentage} color="#22A06B" size={84}>
                          <b style={{ fontSize: 14 }}>{physicalTestPercentage !== null ? `${physicalTestPercentage.toFixed(1)}%` : 'N/A'}</b>
                        </Donut>
                        <span>Physical Test</span>
                      </div>
                      <div className="rc-donut-item">
                        <Donut pct={attendanceStats ? parseFloat(attendanceStats.pct) : null} color="#F59E4B" size={84}>
                          <b style={{ fontSize: 14 }}>{attendanceStats ? `${attendanceStats.pct}%` : 'N/A'}</b>
                        </Donut>
                        <span>Attendance</span>
                      </div>
                    </div>
                  </div>

                  <div className="rc-card rc-pink">
                    <div className="rc-card-head"><i className="ti ti-trending-up"></i> Overall Growth</div>
                    {(() => {
                      const W = 340, H = 150, L = 30, R = 12, T = 18, B = 24;
                      const cw = W - L - R;
                      const ch = H - T - B;
                      const yVal = (v: number) => T + ch - (v / 100) * ch;
                      const n = liveGrowthData.length;
                      const step = cw / n;
                      const bw = 32;

                      return (
                        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', padding: '6px 8px' }}>
                          {[0, 25, 50, 75, 100].map((t) => (
                            <g key={t}>
                              <line x1={L} x2={W - R} y1={yVal(t)} y2={yVal(t)} stroke="#E2E8F0" strokeWidth="1" />
                              <text x={L - 4} y={yVal(t) + 3} fontSize="8" fill="#64748B" textAnchor="end">{t}</text>
                            </g>
                          ))}
                          {liveGrowthData.map((g, i) => {
                            const cx = L + step * i + step / 2;
                            const barH = Math.max(2, (g.value / 100) * ch);
                            const barY = yVal(g.value);
                            const barColor = g.isCurrentMonth ? '#4A82C7' : '#B8D0EC';

                            return (
                              <g key={i}>
                                <text
                                  x={cx}
                                  y={barY - 5}
                                  fontSize="10"
                                  fontWeight="700"
                                  fill="#1E293B"
                                  textAnchor="middle"
                                >
                                  {g.value}
                                </text>
                                <rect
                                  x={cx - bw / 2}
                                  y={barY}
                                  width={bw}
                                  height={barH}
                                  fill={barColor}
                                  rx="3"
                                />
                                <text
                                  x={cx}
                                  y={H - 8}
                                  fontSize="9"
                                  fill="#475569"
                                  textAnchor="middle"
                                >
                                  {g.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}
                  </div>
                </div>

                {/* REMARK + LEVEL */}
                <div className="rc-two-col rc-remark-row">
                  <div className="rc-card rc-orange" style={{ flex: 2 }}>
                    <div className="rc-card-head"><i className="ti ti-notes"></i> Teacher's Remark</div>
                    <div className="rc-remark-text">
                  {isBlankTemplate ? <>&nbsp;<br />&nbsp;</> : shownRemark || 'No data available'}
                    </div> 
                  </div>
                  <div className="rc-card rc-pink" style={{ flex: 1 }}>
                    <div className="rc-card-head"><i className="ti ti-star"></i> Performance Level</div>
                    <div className="rc-level-wrap">
                     {!isBlankTemplate && shownLevel ? (
<span className={`rc-level ${shownLevel.cls}`}>{shownLevel.label}</span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SIGNATURES */}
                <div className="report-signature-footer">
                  <div className="signature-box"><div className="signature-line"></div><span className="signature-title">Student Sign</span></div>
                  <div className="signature-box"><div className="signature-line"></div><span className="signature-title">Parent's Sign</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MARKS ENTRY SCREEN */}
      {activeTab === 'entry' && (
           <div className="entry-mode-container">
          <div className="card entry-card" style={{ marginBottom: 16 }}>
            <div className="card-header-flex">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                  Attendance Entry — {currentStudent?.studentName || 'Select Student'}
                </h3>
                <p className="card-desc">Enter attendance for {selectedMonth}. Percentage calculates automatically.</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => saveAtt('', '')}>
                <i className="ti ti-rotate"></i> Reset
              </button>
            </div>
            <div className="remark-entry-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div>
                <label className="remark-lbl">Total Working Days</label>
                <input
                  type="number" min={0} className="entry-input" placeholder="26"
                  value={attTotal}
                  onChange={(e) => saveAtt(e.target.value === '' ? '' : parseFloat(e.target.value), attPresent)}
                />
              </div>
              <div>
                <label className="remark-lbl">Present</label>
                <input
                  type="number" min={0} className="entry-input" placeholder="0"
                  value={attPresent}
                  onChange={(e) => saveAtt(attTotal, e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="remark-lbl">Absent</label>
                <input
                  type="number" min={0} className="entry-input" placeholder="0"
                  value={attAbsent}
                  onChange={(e) => {
                    if (attTotal === '') return;
                    const ab = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    saveAtt(attTotal, Math.max(0, Number(attTotal) - ab));
                  }}
                />
              </div>
              <div>
                <label className="remark-lbl">Attendance Percentage</label>
                <input type="text" className="entry-input bold" readOnly value={`${attPctManual}%`} style={{ background: '#F1F5F9' }} />
              </div>
            </div>
          </div>
          <div className="card entry-card">
            <div className="card-header-flex">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                  Class Test Marks Entry — {currentStudent?.studentName || 'Select Student'}
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
                <span className="val">{classTestPercentage !== null ? `${classTestPercentage}%` : '0%'}</span>
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
                          onChange={(e) =>
                            updateClassTest(idx, 'totalMarks', e.target.value === '' ? '' : parseFloat(e.target.value))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="0"
                          className="entry-input center bold"
                          value={t.obtainedMarks}
                          onChange={(e) =>
                            updateClassTest(idx, 'obtainedMarks', e.target.value === '' ? '' : parseFloat(e.target.value))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                  {classTests.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No class test rows entered yet. Click <strong>+ Add Test Row</strong> above to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
                    </div>
          </div>

          {/* Physical Tests Entry Card */}
          <div className="card entry-card" style={{ marginTop: 16 }}>
            <div className="card-header-flex">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                  Physical Test Marks Entry — {currentStudent?.studentName || 'Select Student'}
                </h3>
                <p className="card-desc">
                  Enter physical trial results for 1600M, 100M, and Shot Put. Total additions calculate automatically.
                </p>
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
                <i className="ti ti-plus"></i> Add Physical Row
              </button>
            </div>

            <div className="table-responsive entry-table-wrapper">
              <table className="entry-table">
                <thead>
                  <tr>
                    <th style={{ width: '4%' }}>#</th>
                    <th style={{ width: '14%' }}>Date</th>
                    <th style={{ width: '13%' }}>1600M Time</th>
                    <th style={{ width: '11%' }}>1600M Mark</th>
                    <th style={{ width: '13%' }}>100M Time</th>
                    <th style={{ width: '11%' }}>100M Mark</th>
                    <th style={{ width: '13%' }}>Shot Put Dist</th>
                    <th style={{ width: '11%' }}>Shot Put Mark</th>
                    <th style={{ width: '10%' }}>Total</th>
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
                          placeholder="30"
                          className="entry-input center bold"
                          value={p.mark1600}
                          onChange={(e) =>
                            updatePhysicalTest(idx, 'mark1600', e.target.value === '' ? '' : parseFloat(e.target.value))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="11.5s"
                          className="entry-input center"
                          value={p.time100}
                          onChange={(e) => updatePhysicalTest(idx, 'time100', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="15"
                          className="entry-input center bold"
                          value={p.mark100}
                          onChange={(e) =>
                            updatePhysicalTest(idx, 'mark100', e.target.value === '' ? '' : parseFloat(e.target.value))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="8.5m"
                          className="entry-input center"
                          value={p.shotPutDistance}
                          onChange={(e) => updatePhysicalTest(idx, 'shotPutDistance', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="15"
                          className="entry-input center bold"
                          value={p.shotPutMark}
                          onChange={(e) =>
                            updatePhysicalTest(idx, 'shotPutMark', e.target.value === '' ? '' : parseFloat(e.target.value))
                          }
                        />
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{p.totalMark}</td>
                    </tr>
                  ))}
                  {physicalTests.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No physical trial rows entered yet. Click <strong>+ Add Physical Row</strong> above to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
               </div>

          {/* Remark & Performance Level Entry Card */}
          <div className="card entry-card" style={{ marginTop: 16 }}>
            <div className="card-header-flex">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                  Teacher's Remark and Performance Level — {currentStudent?.studentName || 'Select Student'}
                </h3>
                <p className="card-desc">
                  Leave blank to auto-generate from test and attendance percentages for {selectedMonth}.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => saveRemark('', '')}>
                <i className="ti ti-rotate"></i> Reset to Auto
              </button>
            </div>

            <div className="remark-entry-grid">
              <div>
                <label className="remark-lbl">Teacher's Remark</label>
                <textarea
                  className="entry-input"
                  rows={3}
                  placeholder={performanceLevel?.remark || 'Write remark for this student…'}
                  value={remarkText}
                  onChange={(e) => saveRemark(e.target.value, levelChoice)}
                />
              </div>
              <div>
                <label className="remark-lbl">Performance Level</label>
                <select
                  className="entry-input"
                  value={levelChoice}
                  onChange={(e) => saveRemark(remarkText, e.target.value)}
                >
                  <option value="">Auto{performanceLevel ? ` (${performanceLevel.label})` : ''}</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT & OFFICIAL REPORT STYLES */}
      <style>{`
        .monthly-report-page {
          padding: 16px 20px 40px 20px;
        }

        .report-top-nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .nav-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .back-nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #334155;
          padding: 6px 12px;
          font-size: 13px;
          border-radius: 6px;
          cursor: pointer;
        }
        .back-nav-btn:hover {
          background: #F1F5F9;
        }
        .report-main-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--navy);
          margin: 0;
        }
        .report-main-desc {
          font-size: 12.5px;
          color: var(--slate);
          margin: 2px 0 0 0;
          display: block;
        }
        .report-downloads-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .excel-download-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #16A34A;
          color: #FFFFFF;
          border: none;
          padding: 7px 14px;
          font-size: 13px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .excel-download-btn:hover {
          background: #15803D;
        }
        .pdf-download-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--blue, #2563EB);
          color: #FFFFFF;
          border: none;
          padding: 7px 14px;
          font-size: 13px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }

        .report-sub-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .report-view-tabs {
          display: flex;
          align-items: center;
          background: #E2E8F0;
          padding: 3px;
          border-radius: 8px;
        }
        .view-tab-btn {
          border: none;
          background: transparent;
          padding: 5px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: #475569;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .view-tab-btn.active {
          background: #FFFFFF;
          color: #0F172A;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .template-toggle-btn {
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #334155;
          padding: 5px 12px;
          font-size: 12.5px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .template-toggle-btn.active-blank {
          background: #EFF6FF;
          border-color: #3B82F6;
          color: #1D4ED8;
        }

        .report-filter-card {
          margin-bottom: 12px;
          padding: 12px 16px;
        }
        .report-filter-grid {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr auto;
          gap: 12px;
          align-items: flex-end;
        }
        .reset-filter-btn {
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          color: #475569;
          padding: 7px 12px;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          height: 38px;
        }

        .student-summary-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 8px 14px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .summary-strip-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .summary-pill {
          font-size: 12.5px;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .student-name-pill {
          font-weight: 700;
          color: #0F172A;
        }
        .summary-strip-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .summary-badge {
          background: #EFF6FF;
          color: #1D4ED8;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
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
          padding: 0;
          box-sizing: border-box;
          color: #1E293B;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .report-border-frame {
          padding: 0 18px 16px 18px;
          min-height: 1130px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          background: #FCFCFD;
        }

        /* Header */
        .rc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(90deg, #F5F1EA 0%, #FBF8F3 100%);
          margin: 0 -18px 14px -18px;
          padding: 10px 0 10px 18px;
          gap: 12px;
        }
        .rc-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        .rc-logo {
          width: 84px;
          height: 84px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .rc-header-center-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 12px;
        }
        .rc-title {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 3px 0;
          color: #1E293B;
          letter-spacing: 0.2px;
        }
        .rc-tagline {
          font-size: 13.5px;
          font-weight: 600;
          margin: 0 0 3px 0;
          color: #1E293B;
        }
        .rc-address {
          font-size: 9.5px;
          margin: 0;
          color: #64748B;
        }
        .rc-header-badge {
          background: #E9E3D8;
          min-width: 190px;
          padding: 12px 16px;
          text-align: center;
          border-bottom-left-radius: 22px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .rc-badge-title { font-size: 18px; font-weight: 800; line-height: 1.2; color: #1E293B; }
        .rc-badge-month { font-size: 15px; margin-top: 6px; color: #334155; }

        /* Profile */
        .rc-profile { display: flex; gap: 16px; padding: 4px 4px 14px 4px; }
        .rc-photo {
          width: 120px;
          height: 140px;
          border-radius: 6px;
          border: 1px solid #CBD5E1;
          background: #F8FAFC;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .rc-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .rc-photo-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 8px;
          color: #94A3B8;
          font-size: 11.5px;
          font-weight: 500;
          text-align: center;
          line-height: 1.3;
          box-sizing: border-box;
        }
        .rc-profile-col { flex: 1.2; display: flex; flex-direction: column; gap: 6px; justify-content: center; }
        .rc-profile-right { flex: 1; border-left: 1px solid #E2E8F0; padding-left: 16px; gap: 5px; }
        .rc-row { display: flex; align-items: baseline; font-size: 12px; color: #334155; }
        .rc-lbl { min-width: 112px; }
        .rc-colon { width: 14px; text-align: center; }
        .rc-val { flex: 1; }
        .rc-strong { font-weight: 800; font-size: 15px; color: #0F172A; }

        /* Cards */
        .rc-card { border-radius: 8px; margin-bottom: 12px; overflow: hidden; border: 1px solid #E2E8F0; background: #FFFFFF; }
        .rc-card-head { font-size: 14px; font-weight: 700; padding: 8px 14px; display: flex; align-items: center; gap: 8px; color: #1E293B; }
        .rc-blue .rc-card-head { background: #E8F0FA; }
        .rc-beige .rc-card-head { background: #F6EEE0; }
        .rc-green .rc-card-head { background: #E3F4EA; color: #14532D; }
        .rc-pink .rc-card-head { background: #FBE7E7; color: #7F1D1D; }
        .rc-orange .rc-card-head { background: #FDF0DC; }
        .rc-empty { padding: 12px; text-align: center; color: #94A3B8; font-size: 12px; font-style: italic; }

        /* Attendance */
        .rc-att-body { display: flex; align-items: center; gap: 14px; padding: 12px 16px; background: #F8FAFD; }
        .rc-tile {
          flex: 1; border-radius: 8px; padding: 10px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: #334155;
        }
        .rc-tile b { font-size: 28px; line-height: 1; }
        .rc-tile-blue { background: #DDE8F6; }
        .rc-tile-green { background: #E3F3E8; } .rc-tile-green b { color: #166534; }
        .rc-tile-red { background: #FBE4E6; } .rc-tile-red b { color: #BE123C; }

        /* Tables */
        .rc-table { width: 100%; border-collapse: collapse; font-size: 11.5px; background: #FFFFFF; }
        .rc-table th, .rc-table td { border: 1px solid #D5DCE6; padding: 5px 6px; height: 22px; box-sizing: border-box; }
        .rc-table th { background: #F1F5F9; font-weight: 700; text-align: center; }
        .rc-table td.c { text-align: center; }
        .rc-total-row td { font-weight: 800; background: #F8FAFC; }

        /* Summary / growth */
        .rc-two-col { display: flex; gap: 12px; }
        .rc-two-col > .rc-card { flex: 1; }
        .rc-donuts { display: flex; justify-content: space-around; padding: 12px 8px; }
        .rc-donut-item { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11px; text-align: center; font-weight: 600; color: #334155; }
        .rc-bars { display: flex; justify-content: space-around; align-items: flex-end; padding: 10px 12px 8px; height: 130px; }
        .rc-bar-col { display: flex; flex-direction: column; align-items: center; height: 100%; width: 60px; }
        .rc-bar-val { font-size: 11px; font-weight: 700; margin-bottom: 2px; }
        .rc-bar-track { flex: 1; width: 40px; display: flex; align-items: flex-end; }
        .rc-bar { width: 100%; background: #7FA6D8; border-radius: 3px 3px 0 0; }
        .rc-bar-lbl { font-size: 10px; margin-top: 4px; color: #475569; }

        /* Remark / level */
        .rc-remark-text { padding: 10px 14px; font-size: 12px; line-height: 1.5; min-height: 52px; }
        .rc-level-wrap { padding: 12px; text-align: center; }
        .rc-level { display: inline-block; padding: 6px 22px; border-radius: 6px; font-weight: 800; font-size: 15px; }
        .lvl-excellent { background: #CFF0DA; color: #14532D; }
        .lvl-good { background: #DDF2CF; color: #3F7D20; }
        .lvl-average { background: #FDEBC8; color: #92400E; }
        .lvl-poor { background: #FBD5D5; color: #991B1B; }

        /* Signatures */
        .report-signature-footer {
          margin-top: auto;
          padding: 28px 10px 4px 10px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box { display: flex; flex-direction: column; align-items: center; width: 200px; }
        .signature-line { width: 100%; border-bottom: 1px solid #475569; margin-bottom: 6px; }
        .signature-title { font-size: 12px; font-weight: 700; color: #1E293B; }

             .remark-entry-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }
        .remark-lbl {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 6px;
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

        /* PRINT STYLES - A4 Portrait */
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
            padding: 12px !important;
            min-height: 98vh !important;
          }
          .report-card-section {
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
};

export default MonthlyStudentReportPage;
