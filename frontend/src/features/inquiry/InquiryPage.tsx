import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { ActionButtons } from '../../components/ActionButtons';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { getCourses, type CourseDto } from '../master/course/api/courseApi';
import { getLibraryPlans, type LibraryPlanDto } from '../master/library-plan/api/libraryPlanApi';

interface Inquiry {
  inquiryId: number;
  studentName: string;
  parentName: string;
  mobileNumber: string;
  interestedCourse: string;
  admissionType?: string;
  inquirySource: string;
  counselorAssigned: string;
  remarks: string;
  status: 'Open' | 'Follow-up' | 'Converted' | 'Lost';
}

export const InquiryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [libraryPlans, setLibraryPlans] = useState<LibraryPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form State
  const [editingInquiryId, setEditingInquiryId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [interestedCourse, setInterestedCourse] = useState('');
  const [admissionType, setAdmissionType] = useState('');
  const [inquirySource, setInquirySource] = useState('Walk-in');
  const [counselorAssigned, setCounselorAssigned] = useState('Sales - Kiran');
  const [status, setStatus] = useState<'Open' | 'Follow-up' | 'Lost' | 'Converted'>('Open');
  const [remarks, setRemarks] = useState('');

  // Table Filter State
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'Follow-up' | 'Lost' | 'Converted'>('All');

  // Add Follow-up Modal State (TASK 2)
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [selectedInquiryForFollowUp, setSelectedInquiryForFollowUp] = useState<Inquiry | null>(null);
  const [fuDate, setFuDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuTime, setFuTime] = useState('10:00');
  const [fuNotes, setFuNotes] = useState('');
  const [fuNextDate, setFuNextDate] = useState('');
  const [fuCounselor, setFuCounselor] = useState('');
  const [fuStatus, setFuStatus] = useState<'Pending' | 'Done' | 'Missed'>('Pending');
  const [fuSaving, setFuSaving] = useState(false);

  // Inquiry History Modal State (TASK 3)
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedInquiryForHistory, setSelectedInquiryForHistory] = useState<Inquiry | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchInquiries();
    fetchMasters();
  }, []);

  const openAddFollowUpModal = (inquiry: Inquiry) => {
    setSelectedInquiryForFollowUp(inquiry);
    setFuDate(new Date().toISOString().split('T')[0]);
    setFuTime('10:00');
    setFuNotes('');
    setFuNextDate('');
    setFuCounselor(inquiry.counselorAssigned || 'Sales');
    setFuStatus('Pending');
    setFollowUpModalOpen(true);
  };

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryForFollowUp) return;
    setFuSaving(true);
    try {
      await axiosInstance.post('/followups', {
        inquiryId: selectedInquiryForFollowUp.inquiryId,
        followupDate: fuDate,
        followupTime: fuTime,
        discussionNotes: fuNotes,
        nextFollowupDate: fuNextDate || null,
        counselor: fuCounselor,
        status: fuStatus,
      });

      setFollowUpModalOpen(false);
      setSuccessMsg('Follow-up scheduled successfully');
      await fetchInquiries();
    } catch (err) {
      console.error('Failed to save follow-up:', err);
      alert('Failed to save follow-up. Please check backend connection.');
    } finally {
      setFuSaving(false);
    }
  };

  const openHistoryModal = async (inquiry: Inquiry) => {
    setSelectedInquiryForHistory(inquiry);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await axiosInstance.get(`/followups/inquiry/${inquiry.inquiryId}`);
      setHistoryList(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch follow-up history:', err);
      setHistoryList([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchMasters = async () => {
    try {
      const courseList = await getCourses();
      setCourses(courseList || []);
    } catch (err) {
      console.error('Error fetching courses master:', err);
    }
    try {
      const planList = await getLibraryPlans();
      setLibraryPlans(planList || []);
    } catch (err) {
      console.error('Error fetching library plans master:', err);
    }
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/inquiries');
      setInquiries(res.data.data || []);
    } catch (err) {
      console.error(err);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFormFieldsOnly = () => {
    setEditingInquiryId(null);
    setStudentName('');
    setParentName('');
    setMobileNumber('');
    setInterestedCourse('');
    setAdmissionType('');
    setInquirySource('Walk-in');
    setCounselorAssigned('Sales - Kiran');
    setStatus('Open');
    setRemarks('');
  };

  const resetForm = () => {
    resetFormFieldsOnly();
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSaveInquiry = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('Please enter Student Name');
      return;
    }
    if (!mobileNumber.trim()) {
      setErrorMsg('Please enter Mobile Number');
      return;
    }
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        studentName: studentName.trim(),
        parentName: parentName.trim(),
        mobileNumber: mobileNumber.trim(),
        interestedCourse: interestedCourse.trim(),
        admissionType: admissionType.trim(),
        inquirySource,
        counselorAssigned,
        status,
        remarks: remarks.trim(),
      };

      if (editingInquiryId) {
        await axiosInstance.put(`/inquiries/${editingInquiryId}`, payload);
        setSuccessMsg('Inquiry updated successfully');
      } else {
        await axiosInstance.post('/inquiries', payload);
        setSuccessMsg('New inquiry created successfully');
        resetFormFieldsOnly();
      }

      await fetchInquiries();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to save inquiry. Please check input values.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditInquiry = (inquiry: Inquiry) => {
    setEditingInquiryId(inquiry.inquiryId);
    setStudentName(inquiry.studentName || '');
    setParentName(inquiry.parentName || '');
    setMobileNumber(inquiry.mobileNumber || '');
    setInterestedCourse(inquiry.interestedCourse || '');
    setAdmissionType(inquiry.admissionType || '');
    setInquirySource(inquiry.inquirySource || 'Walk-in');
    setCounselorAssigned(inquiry.counselorAssigned || 'Sales - Kiran');
    setStatus(inquiry.status || 'Open');
    setRemarks(inquiry.remarks || '');
    setSuccessMsg('');
    setErrorMsg('');

    setActiveTab('form');
  };

  const handleQuickStatusChange = async (inquiryId: number, newStatus: 'Open' | 'Follow-up' | 'Lost' | 'Converted') => {
    try {
      const existing = inquiries.find((i) => i.inquiryId === inquiryId);
      if (!existing) return;

      await axiosInstance.put(`/inquiries/${inquiryId}`, {
        ...existing,
        status: newStatus,
      });
      await fetchInquiries();

      if (newStatus === 'Follow-up') {
        openAddFollowUpModal({ ...existing, status: 'Follow-up' });
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingId !== null) {
      try {
        await axiosInstance.delete(`/inquiries/${deletingId}`);
        await fetchInquiries();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Counts
  const openCount = inquiries.filter((i) => i.status === 'Open').length;
  const followupCount = inquiries.filter((i) => i.status === 'Follow-up').length;
  const lostCount = inquiries.filter((i) => i.status === 'Lost').length;
  const convertedCount = inquiries.filter((i) => i.status === 'Converted').length;

  // Filtered inquiries for single vertical table
  const filteredInquiries = filterStatus === 'All'
    ? inquiries
    : inquiries.filter((i) => i.status === filterStatus);

  return (
    <div>
      {/* Navigation Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('form');
            if (!editingInquiryId) {
              resetForm();
            }
          }}
        >
          <i className={editingInquiryId ? 'ti ti-pencil' : 'ti ti-user-plus'}></i>
          {editingInquiryId ? 'Edit Inquiry' : 'New Inquiry'}
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('list');
            fetchInquiries();
          }}
        >
          <i className="ti ti-list"></i> Inquiries
        </button>
      </div>

      {/* Centered Square Modal for Success Message */}
      {successMsg && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: '260px',
              height: '200px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              gap: '20px',
              border: '1px solid var(--border, #e2e8f0)',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--navy, #1e293b)', lineHeight: 1.4 }}>
              {successMsg}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                padding: '8px 28px',
                fontWeight: 600,
                borderRadius: '6px',
                minWidth: '90px',
              }}
              onClick={() => setSuccessMsg('')}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: New / Edit Inquiry Form (Simple Form Layout) */}
      {activeTab === 'form' && (
        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--navy)' }}>
              {editingInquiryId ? `Edit Inquiry (#${editingInquiryId})` : 'New Inquiry Form'}
            </h3>
            {editingInquiryId && (
              <button className="btn btn-sm" onClick={resetForm}>
                <i className="ti ti-plus"></i> New Form
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="badge badge-red" style={{ width: '100%', maxWidth: '480px', padding: '12px 16px', marginBottom: '20px', fontSize: '13.5px', borderRadius: '8px' }}>
              <i className="ti ti-alert-circle" style={{ marginRight: '6px' }}></i>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSaveInquiry} style={{ marginTop: '10px' }}>
            <div className="form-grid">
              <div className="form-field">
                <label>Student Name <span className="required-asterisk">*</span></label>
                <input
                  placeholder="e.g. Rahul Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Parent Name</label>
                <input
                  placeholder="e.g. Rajesh Sharma"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Mobile Number <span className="required-asterisk">*</span></label>
                <input
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Interested Course</label>
                <select value={interestedCourse} onChange={(e) => setInterestedCourse(e.target.value)}>
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.courseId} value={c.courseName}>
                      {c.courseName}
                    </option>
                  ))}
                  {libraryPlans.map((l) => (
                    <option key={`lib-${l.planId}`} value={l.planName}>
                      {l.planName}
                    </option>
                  ))}
                  {interestedCourse &&
                    !courses.some((c) => c.courseName === interestedCourse) &&
                    !libraryPlans.some((l) => l.planName === interestedCourse) && (
                      <option value={interestedCourse}>{interestedCourse}</option>
                    )}
                </select>
              </div>

              <div className="form-field">
                <label>Admission Type</label>
                <select value={admissionType} onChange={(e) => setAdmissionType(e.target.value)}>
                  <option value="">-- Select Admission Type --</option>
                  <option value="Regular">Regular</option>
                  <option value="Fast-track">Fast-track</option>
                  <option value="Academy Only">Academy Only</option>
                  <option value="Library Only">Library Only</option>
                  <option value="Academy + Library">Academy + Library</option>
                  {admissionType &&
                    !['Regular', 'Fast-track', 'Academy Only', 'Library Only', 'Academy + Library'].includes(admissionType) && (
                      <option value={admissionType}>{admissionType}</option>
                    )}
                </select>
              </div>

              <div className="form-field">
                <label>Inquiry Source</label>
                <select value={inquirySource} onChange={(e) => setInquirySource(e.target.value)}>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Website">Website</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Referral">Referral</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              <div className="form-field">
                <label>Counselor Assigned</label>
                <input
                  placeholder="e.g. Sales - Kiran"
                  value={counselorAssigned}
                  onChange={(e) => setCounselorAssigned(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="Open">Open</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="form-field" style={{ gridColumn: 'span 2' }}>
                <label>Remarks</label>
                <textarea
                  placeholder="Enter remarks or follow-up notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {editingInquiryId && (
                <button type="button" className="btn" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving Inquiry...' : editingInquiryId ? 'Update Inquiry' : 'Save Inquiry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Inquiries Tab with Stat Cards & Table */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top 4 Stat Cards */}
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <div
              className="card card-pad"
              style={{
                borderTop: '3px solid #3182ce',
                cursor: 'pointer',
                backgroundColor: filterStatus === 'Open' ? '#ebf8ff' : '#ffffff',
              }}
              onClick={() => setFilterStatus(filterStatus === 'Open' ? 'All' : 'Open')}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#718096' }}>OPEN</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#2b6cb0', marginTop: '4px' }}>{openCount}</div>
            </div>

            <div
              className="card card-pad"
              style={{
                borderTop: '3px solid #dd6b20',
                cursor: 'pointer',
                backgroundColor: filterStatus === 'Follow-up' ? '#fffaf0' : '#ffffff',
              }}
              onClick={() => setFilterStatus(filterStatus === 'Follow-up' ? 'All' : 'Follow-up')}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#718096' }}>FOLLOW UP</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#c05621', marginTop: '4px' }}>{followupCount}</div>
            </div>

            <div
              className="card card-pad"
              style={{
                borderTop: '3px solid #e53e3e',
                cursor: 'pointer',
                backgroundColor: filterStatus === 'Lost' ? '#fff5f5' : '#ffffff',
              }}
              onClick={() => setFilterStatus(filterStatus === 'Lost' ? 'All' : 'Lost')}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#718096' }}>LOST</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#c53030', marginTop: '4px' }}>{lostCount}</div>
            </div>

            <div
              className="card card-pad"
              style={{
                borderTop: '3px solid #38a169',
                cursor: 'pointer',
                backgroundColor: filterStatus === 'Converted' ? '#f0fff4' : '#ffffff',
              }}
              onClick={() => setFilterStatus(filterStatus === 'Converted' ? 'All' : 'Converted')}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#718096' }}>CONVERTED</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#2f855a', marginTop: '4px' }}>{convertedCount}</div>
            </div>
          </div>

          {/* Single Vertical Table Card */}
          <div className="card">
            <div
              className="card-pad"
              style={{
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--navy)' }}>
                  Inquiries List {filterStatus !== 'All' ? `(${filterStatus})` : ''}
                </h3>
                <span className="badge badge-blue">{filteredInquiries.length}</span>
                {filterStatus !== 'All' && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ fontSize: '12px', padding: '2px 8px' }}
                    onClick={() => setFilterStatus('All')}
                  >
                    Show All
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="empty" style={{ padding: '24px' }}>Loading inquiries...</div>
            ) : filteredInquiries.length === 0 ? (
              <div className="empty" style={{ padding: '24px' }}>No inquiries found</div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student Name</th>
                      <th>Mobile Number</th>
                      <th>Course / Type</th>
                      <th>Counselor / Source</th>
                      <th>Status Section</th>
                      <th>Remarks</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map((i, index) => (
                      <tr key={i.inquiryId}>
                        <td>{index + 1}</td>
                        <td>
                          <span>{i.studentName}</span>
                          {i.parentName && <div style={{ fontSize: '11.5px', color: '#718096' }}>Parent: {i.parentName}</div>}
                        </td>
                        <td>{i.mobileNumber}</td>
                        <td>
                          {i.interestedCourse || 'General'}
                          {i.admissionType && <span style={{ fontSize: '11.5px', color: '#718096', display: 'block' }}>Type: {i.admissionType}</span>}
                        </td>
                        <td>
                          {i.counselorAssigned || '—'}
                          <span style={{ fontSize: '11.5px', color: '#718096', display: 'block' }}>Source: {i.inquirySource || 'Walk-in'}</span>
                        </td>
                        <td>
                          <select
                            value={i.status}
                            onChange={(e) => handleQuickStatusChange(i.inquiryId, e.target.value as any)}
                            className={`badge ${
                              i.status === 'Open' ? 'badge-blue' :
                              i.status === 'Follow-up' ? 'badge-amber' :
                              i.status === 'Converted' ? 'badge-green' : 'badge-red'
                            }`}
                            style={{
                              cursor: 'pointer',
                              border: 'none',
                              fontWeight: 600,
                              padding: '4px 8px',
                            }}
                          >
                            <option value="Open">Open</option>
                            <option value="Follow-up">Follow UP</option>
                            <option value="Lost">Lost</option>
                            <option value="Converted">Converted</option>
                          </select>
                        </td>
                        <td>{i.remarks || '—'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#ebf8ff', color: '#2b6cb0', borderColor: '#bee3f8' }}
                              onClick={() => openAddFollowUpModal(i)}
                              title="Add Follow-up"
                            >
                              <i className="ti ti-plus" style={{ marginRight: '2px' }}></i> Follow Up
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#f7fafc', color: '#4a5568', borderColor: '#e2e8f0' }}
                              onClick={() => openHistoryModal(i)}
                              title="View Follow-up History"
                            >
                              <i className="ti ti-history" style={{ marginRight: '2px' }}></i> History
                            </button>
                            <ActionButtons
                              onEdit={() => handleEditInquiry(i)}
                              onDelete={() => setDeletingId(i.inquiryId)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Inquiry"
        message="Do you want to delete this inquiry record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* TASK 2: Add Follow-up Modal */}
      {followUpModalOpen && selectedInquiryForFollowUp && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="modal-content card card-pad" style={{ width: '100%', maxWidth: '520px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--navy)' }}>
                <i className="ti ti-calendar-plus" style={{ marginRight: '8px', color: '#3182ce' }}></i>
                Add Follow-up for {selectedInquiryForFollowUp.studentName}
              </h3>
              <button type="button" className="btn btn-sm" style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }} onClick={() => setFollowUpModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveFollowUp}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-field">
                  <label>Follow-up Date <span className="required-asterisk">*</span></label>
                  <input type="date" value={fuDate} onChange={(e) => setFuDate(e.target.value)} required />
                </div>

                <div className="form-field">
                  <label>Follow-up Time</label>
                  <input type="time" value={fuTime} onChange={(e) => setFuTime(e.target.value)} />
                </div>

                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label>Discussion Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter details of conversation or remarks..."
                    value={fuNotes}
                    onChange={(e) => setFuNotes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-field">
                  <label>Next Follow-up Date (Optional)</label>
                  <input type="date" value={fuNextDate} onChange={(e) => setFuNextDate(e.target.value)} />
                  <span style={{ fontSize: '11px', color: '#718096', marginTop: '2px', display: 'block' }}>Automatically schedules 2nd entry in Upcoming</span>
                </div>

                <div className="form-field">
                  <label>Counselor</label>
                  <input type="text" value={fuCounselor} onChange={(e) => setFuCounselor(e.target.value)} placeholder="Counselor name" />
                </div>

                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label>Status</label>
                  <select value={fuStatus} onChange={(e) => setFuStatus(e.target.value as any)}>
                    <option value="Pending">Pending</option>
                    <option value="Done">Done</option>
                    <option value="Missed">Missed</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn" onClick={() => setFollowUpModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={fuSaving}>
                  {fuSaving ? 'Saving...' : 'Save Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK 3: Follow-up History Modal */}
      {historyModalOpen && selectedInquiryForHistory && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="modal-content card card-pad" style={{ width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--navy)' }}>
                  <i className="ti ti-history" style={{ marginRight: '8px', color: '#3182ce' }}></i>
                  Follow-up History: {selectedInquiryForHistory.studentName}
                </h3>
                <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                  Mobile: {selectedInquiryForHistory.mobileNumber} | Course: {selectedInquiryForHistory.interestedCourse || 'General'}
                </div>
              </div>
              <button type="button" className="btn btn-sm" style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }} onClick={() => setHistoryModalOpen(false)}>×</button>
            </div>

            {historyLoading ? (
              <div className="empty" style={{ padding: '24px' }}>Loading timeline history...</div>
            ) : historyList.length === 0 ? (
              <div className="empty" style={{ padding: '32px' }}>
                <i className="ti ti-calendar-off" style={{ fontSize: '32px', color: '#a0aec0', display: 'block', marginBottom: '8px' }}></i>
                No past follow-up records found for this inquiry.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {historyList.map((item, index) => (
                  <div
                    key={item.followupId || index}
                    style={{
                      borderLeft: `3px solid ${
                        item.status === 'Done' ? '#38a169' :
                        item.status === 'Missed' ? '#e53e3e' : '#dd6b20'
                      }`,
                      backgroundColor: '#f8fafc',
                      borderRadius: '0 8px 8px 0',
                      padding: '12px 16px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#2d3748' }}>
                        <i className="ti ti-calendar" style={{ marginRight: '4px', color: '#4a5568' }}></i>
                        {item.followupDate} {item.followupTime ? `at ${item.followupTime}` : ''}
                      </div>
                      <span className={`badge ${
                        item.status === 'Done' ? 'badge-green' :
                        item.status === 'Missed' ? 'badge-red' : 'badge-amber'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: '#4a5568', margin: '4px 0', lineHeight: 1.4 }}>
                      {item.discussionNotes || <em style={{ color: '#a0aec0' }}>No notes logged</em>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#718096', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #e2e8f0' }}>
                      <span>Counselor: <strong>{item.counselor || 'Sales'}</strong></span>
                      {item.nextFollowupDate && (
                        <span>Next scheduled: <strong>{item.nextFollowupDate}</strong></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: '12px' }}
                onClick={() => {
                  setHistoryModalOpen(false);
                  openAddFollowUpModal(selectedInquiryForHistory);
                }}
              >
                + Schedule New Follow-up
              </button>
              <button type="button" className="btn" onClick={() => setHistoryModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

