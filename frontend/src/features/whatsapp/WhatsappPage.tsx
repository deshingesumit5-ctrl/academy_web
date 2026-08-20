import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { getCourses, type CourseDto } from '../master/course/api/courseApi';
import { getBatches, type BatchDto } from '../master/batch/api/batchApi';

interface StudentRecord {
  id: number;
  studentName: string;
  course: string;
  batch: string;
  city: string;
  studentMobile: string;
  parentMobile: string;
  registrationType?: string;
  academyLibrary?: string;
  classGrade?: string;
  areaLocation?: string;
  admissionDate?: string;
}

export const WhatsappPage: React.FC = () => {
  // Master data state
  const [studentsList, setStudentsList] = useState<StudentRecord[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [batches, setBatches] = useState<BatchDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter Form State
  const [regType, setRegType] = useState('All');
  const [academyLibrary, setAcademyLibrary] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [classGradeFilter, setClassGradeFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');
  const [admissionDateFilter, setAdmissionDateFilter] = useState('');

  // Search & Table selection State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Send Sidebar State
  const [sendTo, setSendTo] = useState<'both' | 'student' | 'parent'>('both');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [placeholderDropdownOpen, setPlaceholderDropdownOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [cList, bList] = await Promise.all([
        getCourses().catch(() => []),
        getBatches().catch(() => []),
      ]);
      setCourses(cList);
      setBatches(bList);

      const res = await axiosInstance.get('/students').catch(() => null);
      if (res && res.data) {
        const rawList = Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        const fetched: StudentRecord[] = rawList.map((st: any, idx: number) => ({
          id: st.studentId || idx + 1,
          studentName: st.studentName || '',
          course: st.courseName || st.planName || st.course?.courseName || st.libraryPlan?.planName || '-',
          batch: st.batchName || st.batch?.batchName || '-',
          city: st.address || '-',
          studentMobile: st.mobileNumber || '-',
          parentMobile: st.parentMobile || '-',
          registrationType: st.admissionType || 'ACADEMY',
          academyLibrary: st.admissionType === 'LIBRARY' ? 'Library' : 'Academy',
          classGrade: st.currentStandard || st.qualification || '-',
          areaLocation: st.address || '-',
          admissionDate: st.admissionDate || '',
        }));

        setStudentsList(fetched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setRegType('All');
    setAcademyLibrary('All');
    setCourseFilter('All');
    setBatchFilter('All');
    setClassGradeFilter('All');
    setCityFilter('All');
    setAreaFilter('All');
    setAdmissionDateFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filter Logic - Automatic upon dropdown selection
  const filteredStudents = studentsList.filter((student) => {
    if (regType !== 'All' && student.registrationType !== regType) {
      return false;
    }
    if (academyLibrary !== 'All' && student.academyLibrary !== academyLibrary) {
      return false;
    }
    if (courseFilter !== 'All' && student.course.toLowerCase() !== courseFilter.toLowerCase()) {
      return false;
    }
    if (batchFilter !== 'All' && student.batch.toLowerCase() !== batchFilter.toLowerCase()) {
      return false;
    }
    if (classGradeFilter !== 'All' && student.classGrade !== classGradeFilter) {
      return false;
    }
    if (cityFilter !== 'All' && student.city.toLowerCase() !== cityFilter.toLowerCase()) {
      return false;
    }
    if (areaFilter !== 'All' && student.areaLocation !== areaFilter) {
      return false;
    }
    if (admissionDateFilter && student.admissionDate !== admissionDateFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = student.studentName.toLowerCase().includes(q);
      const matchSMobile = student.studentMobile.includes(q);
      const matchPMobile = student.parentMobile.includes(q);
      if (!matchName && !matchSMobile && !matchPMobile) return false;
    }
    return true;
  });

  const displayTotalStudents = filteredStudents.length;

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage) || 1;

  // Dynamic filter dropdown items derived from actual DB data
  const uniqueCities = Array.from(new Set(studentsList.map((s) => s.city).filter((c) => c && c !== '-')));
  const uniqueGrades = Array.from(new Set(studentsList.map((s) => s.classGrade).filter((g) => g && g !== '-')));

  // Selection Handlers
  const handleSelectAllToggle = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleRowSelectToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Insert Placeholder Handler
  const insertPlaceholder = (tag: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || messageText.length;
      const end = textareaRef.current.selectionEnd || messageText.length;
      const newText = messageText.substring(0, start) + tag + messageText.substring(end);
      if (newText.length <= 1000) {
        setMessageText(newText);
      }
    } else {
      if ((messageText + tag).length <= 1000) {
        setMessageText((prev) => prev + tag);
      }
    }
    setPlaceholderDropdownOpen(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      alert('Please select at least one student');
      return;
    }
    if (!messageText.trim()) {
      alert('Please enter a message to send');
      return;
    }

    setSending(true);
    setStatusMsg('');
    try {
      await axiosInstance.post('/whatsapp/send-bulk', {
        studentIds: selectedIds,
        sendTo,
        message: messageText,
      });

      // Get selected student details to open WhatsApp Web/App
      const selectedStudents = studentsList.filter((s) => selectedIds.includes(s.id));

      selectedStudents.forEach((st) => {
        let phoneNumbers: string[] = [];
        if (sendTo === 'student' || sendTo === 'both') {
          if (st.studentMobile && st.studentMobile !== '-') phoneNumbers.push(st.studentMobile);
        }
        if (sendTo === 'parent' || sendTo === 'both') {
          if (st.parentMobile && st.parentMobile !== '-') phoneNumbers.push(st.parentMobile);
        }

        let formattedMsg = messageText
          .replace(/\{StudentName\}/g, st.studentName || 'Student')
          .replace(/\{ParentName\}/g, st.studentName || 'Parent')
          .replace(/\{Course\}/g, st.course || '')
          .replace(/\{Batch\}/g, st.batch || '')
          .replace(/\{City\}/g, st.city || '')
          .replace(/\{InstituteName\}/g, 'Academy & Library')
          .replace(/\{CurrentDate\}/g, new Date().toLocaleDateString())
          .replace(/\{ContactNumber\}/g, st.studentMobile || '');

        phoneNumbers.forEach((phone) => {
          const cleanPhone = phone.replace(/[^0-9]/g, '');
          if (cleanPhone) {
            const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
            const wpUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(formattedMsg)}`;
            window.open(wpUrl, '_blank');
          }
        });
      });

      setStatusMsg(`WhatsApp message successfully dispatched to ${selectedIds.length} recipient(s)!`);
      setMessageText('');
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to send WhatsApp message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const placeholdersList = [
    '{StudentName}',
    '{ParentName}',
    '{Course}',
    '{Batch}',
    '{City}',
    '{InstituteName}',
    '{CurrentDate}',
    '{ContactNumber}',
  ];

  return (
    <div style={{ paddingBottom: '30px' }}>
      {statusMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            border: '1px solid #BBF7D0',
            marginBottom: '16px',
            fontWeight: 500,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{statusMsg}</span>
          <button
            onClick={() => setStatusMsg('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803D', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Filter Students Section */}
      <div className="card card-pad" style={{ marginBottom: '20px', borderRadius: '10px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: 700,
            color: '#2563EB',
            marginBottom: '16px',
          }}
        >
          <i className="ti ti-filter" style={{ fontSize: '18px' }}></i>
          <span>1. Filter Students</span>
        </div>

        {/* Filter Form Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          {/* Registration Type */}
          <div className="form-field">
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
              Registration Type
            </label>
            <select
              value={regType}
              onChange={(e) => {
                setRegType(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13.5px' }}
            >
              <option value="All">All</option>
              <option value="ACADEMY">ACADEMY</option>
              <option value="LIBRARY">LIBRARY</option>
              <option value="BOTH">BOTH</option>
            </select>
          </div>

          {/* Academy / Library */}
          <div className="form-field">
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
              Academy / Library
            </label>
            <select
              value={academyLibrary}
              onChange={(e) => {
                setAcademyLibrary(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13.5px' }}
            >
              <option value="All">All</option>
              <option value="Academy">Academy</option>
              <option value="Library">Library</option>
            </select>
          </div>

          {/* Course */}
          <div className="form-field">
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
              Course
            </label>
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13.5px' }}
            >
              <option value="All">All</option>
              {courses.map((c) => (
                <option key={c.courseId} value={c.courseName}>
                  {c.courseName}
                </option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div className="form-field">
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
              Batch
            </label>
            <select
              value={batchFilter}
              onChange={(e) => {
                setBatchFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13.5px' }}
            >
              <option value="All">All</option>
              {batches.map((b) => (
                <option key={b.batchId} value={b.batchName}>
                  {b.batchName}
                </option>
              ))}
            </select>
          </div>

          {/* Class / Grade */}
          <div className="form-field">
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
              Class / Grade
            </label>
            <select
              value={classGradeFilter}
              onChange={(e) => {
                setClassGradeFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13.5px' }}
            >
              <option value="All">All</option>
              {uniqueGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="form-field">
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
              City
            </label>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13.5px' }}
            >
              <option value="All">All</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Area / Location */}
          <div className="form-field">
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
              Area / Location
            </label>
            <select
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13.5px' }}
            >
              <option value="All">All</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Admission Date */}
          <div className="form-field">
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' }}>
              Admission Date
            </label>
            <input
              type="date"
              value={admissionDateFilter}
              onChange={(e) => {
                setAdmissionDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', padding: '7.5px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13.5px' }}
            />
          </div>
        </div>

        {/* Filter Action Buttons Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleApplyFilter}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 18px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="ti ti-filter"></i> Apply Filter
          </button>

          <button
            onClick={handleResetFilter}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#4B5563',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              padding: '8px 18px',
              fontSize: '13.5px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>

          <div style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
            Total Students: <span style={{ color: '#2563EB' }}>{displayTotalStudents}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Table + Right Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: 2. Select Students */}
        <div className="card card-pad" style={{ borderRadius: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#2563EB',
              marginBottom: '16px',
            }}
          >
            <i className="ti ti-checkbox" style={{ fontSize: '18px' }}></i>
            <span>2. Select Students</span>
          </div>

          {/* Action Row above Table */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                  onChange={handleSelectAllToggle}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Select All ({filteredStudents.length})
              </label>

              <span style={{ fontSize: '13px', color: '#6B7280' }}>
                {selectedIds.length} student selected
              </span>
            </div>

            {/* Search Input & Refresh Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', width: '250px' }}>
                <i
                  className="ti ti-search"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9CA3AF',
                    fontSize: '15px',
                  }}
                ></i>
                <input
                  type="text"
                  placeholder="Search student name / mobile"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 12px 7px 32px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                />
              </div>

              <button
                onClick={fetchInitialData}
                title="Refresh student list"
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#4B5563',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="ti ti-refresh" style={{ fontSize: '16px' }}></i>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="table-responsive" style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ width: '40px', padding: '10px 12px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAllToggle}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '10px 12px', color: '#4B5563', fontWeight: 600, fontSize: '12px' }}>Sr. No.</th>
                  <th style={{ padding: '10px 12px', color: '#4B5563', fontWeight: 600, fontSize: '12px' }}>Student Name</th>
                  <th style={{ padding: '10px 12px', color: '#4B5563', fontWeight: 600, fontSize: '12px' }}>Course</th>
                  <th style={{ padding: '10px 12px', color: '#4B5563', fontWeight: 600, fontSize: '12px' }}>Batch</th>
                  <th style={{ padding: '10px 12px', color: '#4B5563', fontWeight: 600, fontSize: '12px' }}>City</th>
                  <th style={{ padding: '10px 12px', color: '#4B5563', fontWeight: 600, fontSize: '12px' }}>Student Mobile</th>
                  <th style={{ padding: '10px 12px', color: '#4B5563', fontWeight: 600, fontSize: '12px' }}>Parent Mobile</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#6B7280' }}>
                      Loading students...
                    </td>
                  </tr>
                ) : currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#6B7280' }}>
                      No students found matching filters
                    </td>
                  </tr>
                ) : (
                  currentRows.map((student, idx) => {
                    const isSelected = selectedIds.includes(student.id);
                    const serialNumber = indexOfFirstRow + idx + 1;
                    return (
                      <tr
                        key={student.id}
                        style={{
                          borderBottom: '1px solid #F3F4F6',
                          backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRowSelectToggle(student.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '10px 12px', color: '#4B5563', textAlign: 'center' }}>{serialNumber}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 400, color: '#1F2937' }}>{student.studentName}</td>
                        <td style={{ padding: '10px 12px', color: '#4B5563' }}>{student.course}</td>
                        <td style={{ padding: '10px 12px', color: '#4B5563' }}>{student.batch}</td>
                        <td style={{ padding: '10px 12px', color: '#4B5563' }}>{student.city}</td>
                        <td style={{ padding: '10px 12px', color: '#4B5563' }}>{student.studentMobile}</td>
                        <td style={{ padding: '10px 12px', color: '#4B5563' }}>{student.parentMobile}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '13px',
              color: '#6B7280',
            }}
          >
            <div>
              Showing {filteredStudents.length === 0 ? 0 : indexOfFirstRow + 1} to{' '}
              {Math.min(indexOfLastRow, filteredStudents.length)} of {displayTotalStudents} entries
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: currentPage === pg ? '#2563EB' : '#E5E7EB',
                    backgroundColor: currentPage === pg ? '#2563EB' : '#FFFFFF',
                    color: currentPage === pg ? '#FFFFFF' : '#374151',
                    fontWeight: currentPage === pg ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {pg}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage >= totalPages ? 0.5 : 1,
                }}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Send To & Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card 1: Send To */}
          <div className="card card-pad" style={{ borderRadius: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#2563EB',
                marginBottom: '14px',
              }}
            >
              <i className="ti ti-users" style={{ fontSize: '18px' }}></i>
              <span>Send To</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Radio 1 */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#1F2937',
                }}
              >
                <input
                  type="radio"
                  name="sendToOption"
                  checked={sendTo === 'student'}
                  onChange={() => setSendTo('student')}
                  style={{ marginTop: '3px', accentColor: '#2563EB' }}
                />
                <div>
                  <div>Send to Student</div>
                  <div style={{ fontSize: '12px', fontWeight: 400, color: '#6B7280' }}>
                    Send message to student mobile numbers
                  </div>
                </div>
              </label>

              {/* Radio 2 */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#1F2937',
                }}
              >
                <input
                  type="radio"
                  name="sendToOption"
                  checked={sendTo === 'parent'}
                  onChange={() => setSendTo('parent')}
                  style={{ marginTop: '3px', accentColor: '#2563EB' }}
                />
                <div>
                  <div>Send to Parent</div>
                  <div style={{ fontSize: '12px', fontWeight: 400, color: '#6B7280' }}>
                    Send message to parent mobile numbers
                  </div>
                </div>
              </label>

              {/* Radio 3 */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#1F2937',
                }}
              >
                <input
                  type="radio"
                  name="sendToOption"
                  checked={sendTo === 'both'}
                  onChange={() => setSendTo('both')}
                  style={{ marginTop: '3px', accentColor: '#2563EB' }}
                />
                <div>
                  <div>Send to Both</div>
                  <div style={{ fontSize: '12px', fontWeight: 400, color: '#6B7280' }}>
                    Send message to both student &amp; parent
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Card 2: Message */}
          <div className="card card-pad" style={{ borderRadius: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#2563EB',
                marginBottom: '14px',
              }}
            >
              <i className="ti ti-message" style={{ fontSize: '18px' }}></i>
              <span>Message</span>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <textarea
                ref={textareaRef}
                rows={5}
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value.slice(0, 1000))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13.5px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Controls under Textarea */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#6B7280',
                marginBottom: '14px',
                position: 'relative',
              }}
            >
              <span>{messageText.length} / 1000 Characters</span>

              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setPlaceholderDropdownOpen(!placeholderDropdownOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4B5563',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Insert Placeholder <span style={{ fontSize: '10px' }}>▼</span>
                </button>

                {placeholderDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: '100%',
                      marginBottom: '6px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      padding: '6px 0',
                      zIndex: 50,
                      minWidth: '160px',
                    }}
                  >
                    {placeholdersList.map((tag) => (
                      <div
                        key={tag}
                        onClick={() => insertPlaceholder(tag)}
                        style={{
                          padding: '6px 14px',
                          fontSize: '12.5px',
                          color: '#374151',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Allowed Placeholders Green Box */}
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#065F46', marginBottom: '8px' }}>
                Allowed Placeholders
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {placeholdersList.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertPlaceholder(tag)}
                    title={`Click to insert ${tag}`}
                    style={{
                      backgroundColor: '#D1FAE5',
                      color: '#047857',
                      border: '1px solid #6EE7B7',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11.5px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer Box */}
          <div
            className="card card-pad"
            style={{
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Selected Students</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{selectedIds.length}</div>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={sending}
              style={{
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: sending ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
              }}
            >
              <i className="ti ti-brand-whatsapp" style={{ fontSize: '18px' }}></i>
              {sending ? 'Sending...' : 'Send via WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
