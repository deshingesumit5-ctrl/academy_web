import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { getCachedData } from '../../config/apiCache';
import { Modal } from '../../components/Modal';
import { validateRequired, FieldError } from '../../validations';

interface StudentFeeStructure {
  studentId: number;
  admissionNumber: string;
  studentName: string;
  mobileNumber: string;
  admissionType: string;
  courseName: string;
  planName: string;
  batchName: string;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
}

interface PaymentHistoryItem {
  paymentId: number;
  studentId: number;
  studentName: string;
  admissionNumber: string;
  amountPaid: number;
  paymentMode: string;
  paymentType: string;
  paymentDate: string;
  status: string;
  receiptNumber: string;
  remarks: string;
}

interface CourseOption {
  courseId: number;
  courseName: string;
}

interface BatchOption {
  batchId: number;
  batchName: string;
}

export const FeeManagementPage: React.FC = () => {
  const cachedFees = getCachedData('/fees/structures');
  const [structures, setStructures] = useState<StudentFeeStructure[]>(cachedFees?.data || []);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [loading, setLoading] = useState(structures.length === 0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegType, setFilterRegType] = useState('All');
  const [filterAcademyLibrary, setFilterAcademyLibrary] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterBatch, setFilterBatch] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(true);

  // Collect Payment Modal State
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeStructure | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountReceived, setAmountReceived] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payment History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<StudentFeeStructure | null>(null);
  const [historyList, setHistoryList] = useState<PaymentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchFeeStructures(structures.length === 0);
    fetchCoursesAndBatches();
  }, []);

  const fetchFeeStructures = async (showLoading = structures.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axiosInstance.get('/fees/structures');
      setStructures(res.data.data || []);
    } catch (err) {
      console.error('Error fetching fee structures:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesAndBatches = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        axiosInstance.get('/courses'),
        axiosInstance.get('/batches')
      ]);
      setCourses(cRes.data.data || []);
      setBatches(bRes.data.data || []);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const openCollectPaymentModal = (student: StudentFeeStructure) => {
    setSelectedStudent(student);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setAmountReceived(student.remainingAmount > 0 ? student.remainingAmount : '');
    setPaymentMode('UPI');
    setReferenceNo('');
    setRemarks('');
    setFieldErrors({});
    setCollectModalOpen(true);
  };

  const openPaymentHistoryModal = async (student: StudentFeeStructure) => {
    setHistoryStudent(student);
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await axiosInstance.get(`/fees/history/${student.studentId}`);
      setHistoryList(res.data.data || []);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setHistoryList([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const errors: Record<string, string> = {};

    const amtErr = validateRequired(amountReceived);
    if (amtErr) {
      errors.amountReceived = amtErr;
    } else if (Number(amountReceived) <= 0) {
      errors.amountReceived = 'Amount must be greater than 0';
    }

    const dateErr = validateRequired(paymentDate);
    if (dateErr) {
      errors.paymentDate = dateErr;
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: selectedStudent.studentId,
        amountPaid: Number(amountReceived),
        paymentMode: paymentMode,
        paymentType: 'Installment',
        paymentDate: paymentDate,
        receiptNumber: referenceNo.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });

      setCollectModalOpen(false);
      setToastMessage('Payment saved successfully!');
      setTimeout(() => setToastMessage(null), 4000);

      // Refresh data dynamically from DB
      fetchFeeStructures();
      if (historyModalOpen && historyStudent?.studentId === selectedStudent.studentId) {
        openPaymentHistoryModal(selectedStudent);
      }
    } catch (err) {
      console.error('Error saving fee payment:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredStructures.length === 0) return;
    const headers = ['Sr. No.', 'Student ID', 'Student Name', 'Registration Type', 'Course', 'Batch', 'Total Fee', 'Paid Amount', 'Remaining Amount', 'Status'];
    const rows = filteredStructures.map((s, idx) => [
      idx + 1,
      `"${s.admissionNumber || ''}"`,
      `"${s.studentName || ''}"`,
      `"${s.admissionType || ''}"`,
      `"${s.courseName || ''}"`,
      `"${s.batchName || ''}"`,
      s.totalFee || 0,
      s.paidAmount || 0,
      s.remainingAmount || 0,
      `"${s.status || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Structure_List_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStructures = structures.filter((s) => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = s.studentName?.toLowerCase().includes(q);
      const matchId = s.admissionNumber?.toLowerCase().includes(q);
      const matchMobile = s.mobileNumber?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchMobile) return false;
    }

    // Registration Type
    if (filterRegType !== 'All' && s.admissionType !== filterRegType) {
      return false;
    }

    // Academy / Library
    if (filterAcademyLibrary !== 'All') {
      if (filterAcademyLibrary === 'Academy' && !s.admissionType?.includes('Academy')) return false;
      if (filterAcademyLibrary === 'Library' && !s.admissionType?.includes('Library')) return false;
    }

    // Course
    if (filterCourse !== 'All' && !s.courseName?.toLowerCase().includes(filterCourse.toLowerCase())) {
      return false;
    }

    // Batch
    if (filterBatch !== 'All' && s.batchName !== filterBatch) {
      return false;
    }

    // Status
    if (filterStatus !== 'All' && s.status?.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }

    return true;
  });

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>


      {/* Main Card */}
      <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
        {/* Card Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#2d3748' }}>Fee Structure List</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#edf2f7', color: '#4a5568', border: '1px solid #cbd5e0', padding: '8px 14px', borderRadius: '6px' }}>
              <i className="ti ti-download"></i> Export
            </button>
            <button className="btn btn-primary" onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px' }}>
              <i className="ti ti-filter"></i> Filter
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            {/* Search */}
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Search</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by Student Name / ID / Mobile"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }}
                />
                <i className="ti ti-search" style={{ position: 'absolute', left: '10px', top: '11px', color: '#a0aec0' }}></i>
              </div>
            </div>

            {/* Registration Type */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Registration Type</label>
              <select value={filterRegType} onChange={(e) => setFilterRegType(e.target.value)}>
                <option value="All">All</option>
                <option value="Academy">Academy</option>
                <option value="Library">Library</option>
                <option value="Academy + Library">Academy + Library</option>
              </select>
            </div>

            {/* Academy / Library */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Academy / Library</label>
              <select value={filterAcademyLibrary} onChange={(e) => setFilterAcademyLibrary(e.target.value)}>
                <option value="All">All</option>
                <option value="Academy">Academy</option>
                <option value="Library">Library</option>
              </select>
            </div>

            {/* Course */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Course</label>
              <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', background: '#fff' }}>
                <option value="All">All</option>
                {courses.map((c) => (
                  <option key={c.courseId} value={c.courseName}>{c.courseName}</option>
                ))}
              </select>
            </div>

            {/* Batch */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Batch</label>
              <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', background: '#fff' }}>
                <option value="All">All</option>
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchName}>{b.batchName}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', background: '#fff' }}>
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {/* Data Table */}
        {filteredStructures.length === 0 && !loading ? (
          <div className="empty" style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
            <i className="ti ti-receipt" style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }}></i>
            <div>No fee structures found</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f7fafc', borderBottom: '2px solid #edf2f7', textAlign: 'left', color: '#4a5568', fontWeight: 600 }}>
                  <th style={{ padding: '12px 10px' }}>Sr. No.</th>
                  <th style={{ padding: '12px 10px' }}>Student ID</th>
                  <th style={{ padding: '12px 10px' }}>Student Name</th>
                  <th style={{ padding: '12px 10px' }}>Registration Type</th>
                  <th style={{ padding: '12px 10px' }}>Course</th>
                  <th style={{ padding: '12px 10px' }}>Batch</th>
                  <th style={{ padding: '12px 10px' }}>Total Fee Amount</th>
                  <th style={{ padding: '12px 10px' }}>Paid Amount</th>
                  <th style={{ padding: '12px 10px' }}>Remaining Amount</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStructures.map((s, idx) => (
                  <tr key={s.studentId} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px 10px', color: '#718096' }}>{idx + 1}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#2b6cb0' }}>{s.admissionNumber}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#2b6cb0' }}>{s.studentName}</td>
                    <td style={{ padding: '12px 10px', color: '#4a5568' }}>{s.admissionType}</td>
                    <td style={{ padding: '12px 10px', color: '#2d3748' }}>{s.courseName}</td>
                    <td style={{ padding: '12px 10px', color: '#4a5568' }}>{s.batchName}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#2d3748' }}>{formatCurrency(s.totalFee)}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#38a169' }}>{formatCurrency(s.paidAmount)}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: s.remainingAmount > 0 ? '#e53e3e' : '#38a169' }}>{formatCurrency(s.remainingAmount)}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          background: s.status === 'Active' ? '#c6f6d5' : s.status === 'Completed' ? '#bee3f8' : '#edf2f7',
                          color: s.status === 'Active' ? '#22543d' : s.status === 'Completed' ? '#2c5282' : '#4a5568',
                        }}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => openCollectPaymentModal(s)}
                          style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', fontWeight: 500 }}
                        >
                          Collect Payment
                        </button>
                        <button
                          onClick={() => openPaymentHistoryModal(s)}
                          title="Payment History"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '1px solid #cbd5e0',
                            background: '#fff',
                            color: '#4a5568',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <i className="ti ti-clock" style={{ fontSize: '16px' }}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '13px', color: '#718096' }}>
          <div>Showing 1 to {filteredStructures.length} of {filteredStructures.length} entries</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button style={{ border: '1px solid #cbd5e0', background: '#fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }} disabled>&lt;</button>
            <button style={{ border: '1px solid #3182ce', background: '#3182ce', color: '#fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>1</button>
            <button style={{ border: '1px solid #cbd5e0', background: '#fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }} disabled>&gt;</button>
          </div>
        </div>
      </div>

      {/* COLLECT PAYMENT MODAL */}
      <Modal isOpen={collectModalOpen} title="Collect Payment" onClose={() => setCollectModalOpen(false)}>
        {selectedStudent && (
          <form noValidate onSubmit={handleSavePayment}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Left Column: Student Details & Fee Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, color: '#2d3748' }}>Student & Admission Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Student Name</span>
                      <strong style={{ color: '#1a202c' }}>{selectedStudent.studentName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Student ID</span>
                      <span style={{ fontWeight: 600, color: '#2b6cb0' }}>{selectedStudent.admissionNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Registration Type</span>
                      <span style={{ fontWeight: 500, color: '#2d3748' }}>{selectedStudent.admissionType}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Course</span>
                      <span style={{ fontWeight: 500, color: '#2d3748' }}>{selectedStudent.courseName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Batch</span>
                      <span style={{ fontWeight: 500, color: '#2d3748' }}>{selectedStudent.batchName}</span>
                    </div>
                  </div>
                </div>

                <hr style={{ border: 0, borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, color: '#2d3748' }}>Fee Summary</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Total Fee Amount</span>
                      <strong style={{ color: '#1a202c' }}>{formatCurrency(selectedStudent.totalFee)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Total Paid Amount</span>
                      <strong style={{ color: '#38a169' }}>{formatCurrency(selectedStudent.paidAmount)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Remaining Amount</span>
                      <strong style={{ color: selectedStudent.remainingAmount > 0 ? '#e53e3e' : '#38a169' }}>{formatCurrency(selectedStudent.remainingAmount)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Input Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-field">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568' }}>Payment Date <span className="required-asterisk">*</span></label>
                  <input
                    type="date"
                    className={fieldErrors.paymentDate ? 'input-error' : ''}
                    value={paymentDate}
                    onChange={(e) => {
                      setPaymentDate(e.target.value);
                      if (fieldErrors.paymentDate) setFieldErrors((prev) => ({ ...prev, paymentDate: '' }));
                    }}
                    style={{ height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                  />
                  <FieldError error={fieldErrors.paymentDate} />
                </div>

                <div className="form-field">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568' }}>Amount Received <span className="required-asterisk">*</span></label>
                  <input
                    type="number"
                    placeholder="e.g. 20000"
                    className={fieldErrors.amountReceived ? 'input-error' : ''}
                    value={amountReceived}
                    onChange={(e) => {
                      setAmountReceived(e.target.value === '' ? '' : Number(e.target.value));
                      if (fieldErrors.amountReceived) setFieldErrors((prev) => ({ ...prev, amountReceived: '' }));
                    }}
                    style={{ height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                  />
                  <FieldError error={fieldErrors.amountReceived} />
                </div>

                <div className="form-field">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568' }}>Payment Mode <span className="required-asterisk">*</span></label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    style={{ height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#fff' }}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit/Debit Card">Credit/Debit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="form-field">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568' }}>Reference / Transaction No.</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-5123654656"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    style={{ height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                  />
                </div>

                <div className="form-field">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568' }}>Remarks (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Enter remarks (optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    style={{ borderRadius: '6px', border: '1px solid #cbd5e0', padding: '8px', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: 0, marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn" onClick={() => setCollectModalOpen(false)} style={{ background: '#edf2f7', color: '#4a5568' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* PAYMENT HISTORY MODAL */}
      <Modal isOpen={historyModalOpen} title={`Payment History - ${historyStudent?.studentName || ''} (${historyStudent?.admissionNumber || ''})`} onClose={() => setHistoryModalOpen(false)}>
        {historyStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header Cards Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#718096', fontWeight: 500 }}>Total Fee Amount</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', marginTop: '2px' }}>{formatCurrency(historyStudent.totalFee)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#718096', fontWeight: 500 }}>Total Paid Amount</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#38a169', marginTop: '2px' }}>{formatCurrency(historyStudent.paidAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#718096', fontWeight: 500 }}>Remaining Amount</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: historyStudent.remainingAmount > 0 ? '#e53e3e' : '#38a169', marginTop: '2px' }}>{formatCurrency(historyStudent.remainingAmount)}</div>
              </div>
            </div>

            {/* History Table */}
            {loadingHistory ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>Loading transaction history...</div>
            ) : historyList.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>
                <i className="ti ti-receipt-off" style={{ fontSize: '28px', marginBottom: '8px', display: 'block' }}></i>
                <div>No previous payment transactions found for this student.</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f7fafc', borderBottom: '2px solid #edf2f7', textAlign: 'left', color: '#4a5568', fontWeight: 600 }}>
                      <th style={{ padding: '10px' }}>Sr. No.</th>
                      <th style={{ padding: '10px' }}>Payment Date</th>
                      <th style={{ padding: '10px' }}>Amount Received</th>
                      <th style={{ padding: '10px' }}>Payment Mode</th>
                      <th style={{ padding: '10px' }}>Reference No.</th>
                      <th style={{ padding: '10px' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyList.map((item, idx) => (
                      <tr key={item.paymentId} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '10px', color: '#718096' }}>{idx + 1}</td>
                        <td style={{ padding: '10px', color: '#2d3748' }}>{item.paymentDate}</td>
                        <td style={{ padding: '10px', fontWeight: 600, color: '#38a169' }}>{formatCurrency(item.amountPaid)}</td>
                        <td style={{ padding: '10px', color: '#4a5568' }}>{item.paymentMode}</td>
                        <td style={{ padding: '10px', color: '#4a5568', fontFamily: 'monospace' }}>{item.receiptNumber || '-'}</td>
                        <td style={{ padding: '10px', color: '#4a5568' }}>{item.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-footer" style={{ padding: 0, marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setHistoryModalOpen(false)} style={{ background: '#edf2f7', color: '#4a5568', padding: '8px 20px' }}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Notification Toast Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#c6f6d5',
            color: '#22543d',
            border: '1px solid #9ae6b4',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '14px',
            zIndex: 9999,
          }}
        >
          <i className="ti ti-circle-check" style={{ fontSize: '20px', color: '#38a169' }}></i>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#22543d', cursor: 'pointer', marginLeft: '12px', fontSize: '16px' }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};
