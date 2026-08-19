import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { getCourses } from '../master/course/api/courseApi';
import type { CourseDto } from '../master/course/api/courseApi';
import { getLibraryPlans } from '../master/library-plan/api/libraryPlanApi';
import type { LibraryPlanDto } from '../master/library-plan/api/libraryPlanApi';
import { getBatches } from '../master/batch/api/batchApi';
import type { BatchDto } from '../master/batch/api/batchApi';
import { ActionButtons } from '../../components/ActionButtons';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StudentEditModal } from './components/StudentEditModal';
import type { StudentItem } from './components/StudentEditModal';

export const RegistrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [plans, setPlans] = useState<LibraryPlanDto[]>([]);
  const [batches, setBatches] = useState<BatchDto[]>([]);

  // Registered Students List State
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);

  // Form State
  const [admissionType, setAdmissionType] = useState('ACADEMY');
  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState('');

  // Parent State
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  // Education State
  const [schoolCollege, setSchoolCollege] = useState('');
  const [qualification, setQualification] = useState('');
  const [currentStandard, setCurrentStandard] = useState('');

  // Admission State
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>('');
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('ACTIVE');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMasters();
    fetchRegisteredStudents();
  }, []);

  const fetchMasters = async () => {
    try {
      const [c, p, b] = await Promise.all([getCourses(), getLibraryPlans(), getBatches()]);
      setCourses(c);
      setPlans(p);
      setBatches(b);
      if (c.length > 0) setSelectedCourseId(c[0].courseId || '');
      if (p.length > 0) setSelectedPlanId(p[0].planId || '');
      if (b.length > 0) setSelectedBatchId(b[0].batchId || '');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRegisteredStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await axiosInstance.get('/students');
      setStudents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePhoto = () => {
    setPhoto('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!studentName.trim()) {
      setErrorMsg('Please enter Student Name');
      setStep(2);
      return;
    }
    if (!mobileNumber.trim()) {
      setErrorMsg('Please enter Mobile Number');
      setStep(2);
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        studentName: studentName.trim(),
        gender,
        dob: dob || undefined,
        mobileNumber: mobileNumber.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        aadhaarNumber: aadhaarNumber.trim() || undefined,
        photo: photo || undefined,
        photoUrl: photo || undefined,
        fatherName: fatherName.trim() || undefined,
        motherName: motherName.trim() || undefined,
        parentMobile: parentMobile.trim() || undefined,
        parentEmail: parentEmail.trim() || undefined,
        schoolCollege: schoolCollege.trim() || undefined,
        qualification: qualification.trim() || undefined,
        currentStandard: currentStandard.trim() || undefined,
        admissionType,
        courseId: selectedCourseId ? Number(selectedCourseId) : undefined,
        planId: selectedPlanId ? Number(selectedPlanId) : undefined,
        batchId: selectedBatchId ? Number(selectedBatchId) : undefined,
        admissionDate: admissionDate || undefined,
        status: status || 'ACTIVE',
      };

      const res = await axiosInstance.post('/students', payload);
      if (res.data.status) {
        setSuccessMsg(`Student Registration Successfully! Admission No: ${res.data.data.admissionNumber}`);
        // Refresh registered students list in background
        fetchRegisteredStudents();
      }
    } catch (err: any) {
      console.error('Failed to register student:', err);
      const msg = err.response?.data?.message || 'Failed to register student. Please check the details.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleResetFormAndClearMsg = () => {
    setSuccessMsg('');
    setErrorMsg('');
    setStep(1);
    setStudentName('');
    setMobileNumber('');
    setEmail('');
    setAddress('');
    setPhoto('');
    setAadhaarNumber('');
    setFatherName('');
    setMotherName('');
    setParentMobile('');
    setParentEmail('');
    setSchoolCollege('');
    setQualification('');
    setCurrentStandard('');
    if (courses.length > 0) setSelectedCourseId(courses[0].courseId || '');
    if (plans.length > 0) setSelectedPlanId(plans[0].planId || '');
    if (batches.length > 0) setSelectedBatchId(batches[0].batchId || '');
    setAdmissionType('ACADEMY');
    setStatus('ACTIVE');
  };

  const handleOpenEditStudent = (student: StudentItem) => {
    setEditingStudent(student);
    setEditModalOpen(true);
  };

  const handleSaveUpdatedStudent = async (id: number, data: Partial<StudentItem>) => {
    try {
      await axiosInstance.put(`/students/${id}`, data);
      await fetchRegisteredStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDeleteStudent = async () => {
    if (deletingStudentId) {
      try {
        await axiosInstance.delete(`/students/${deletingStudentId}`);
        await fetchRegisteredStudents();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingStudentId(null);
      }
    }
  };

  const stepsList = [
    { id: 1, title: 'Admission type' },
    { id: 2, title: 'Personal details' },
    { id: 3, title: 'Parent info' },
    { id: 4, title: 'Education' },
    { id: 5, title: 'Admission details' },
  ];

  return (
    <div>
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <i className="ti ti-user-plus"></i> Student Registration
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('list');
            fetchRegisteredStudents();
          }}
        >
          <i className="ti ti-users"></i> Registered Students
        </button>
      </div>

      {activeTab === 'form' && (
        <div className="card card-pad">
          {successMsg && (
            <div
              className="badge badge-green"
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
               justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-check" style={{ fontSize: '18px' }}></i>
                <span>{successMsg}</span>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  backgroundColor: '#276749',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                onClick={handleResetFormAndClearMsg}
              >
                OK
              </button>
            </div>
          )}
          {errorMsg && (
            <div className="badge badge-red" style={{ width: '100%', padding: '10px 14px', marginBottom: '20px', fontSize: '13.5px', borderRadius: '8px' }}>
              <i className="ti ti-alert-circle" style={{ marginRight: '6px' }}></i>
              {errorMsg}
            </div>
          )}

          {/* Multi-Step Stepper Header */}
          <div className="stepper-header">
            <div className="stepper-progress-bar">
              <div
                className="stepper-progress-fill"
                style={{ width: `${((step - 1) / (stepsList.length - 1)) * 100}%` }}
              />
            </div>
            {stepsList.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`step-item ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}
                onClick={() => setStep(s.id)}
              >
                <div className="step-circle">
                  {step > s.id ? <i className="ti ti-check" style={{ fontSize: '18px' }}></i> : s.id}
                </div>
                <span className="step-label">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Step 1: Admission Type */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate)' }}>Select Admission Registration Type:</label>
              <div className="grid-3">
                <div
                  className={`master-card ${admissionType === 'ACADEMY' ? 'badge-blue' : ''}`}
                  style={{ cursor: 'pointer', border: admissionType === 'ACADEMY' ? '2px solid var(--accent)' : '' }}
                  onClick={() => setAdmissionType('ACADEMY')}
                >
                  <div className="master-card-top">
                    <div className="master-card-icon"><i className="ti ti-school"></i></div>
                    <h4>Academy Only</h4>
                  </div>
                  <p>Register student for coaching courses</p>
                </div>

                <div
                  className={`master-card ${admissionType === 'LIBRARY' ? 'badge-blue' : ''}`}
                  style={{ cursor: 'pointer', border: admissionType === 'LIBRARY' ? '2px solid var(--accent)' : '' }}
                  onClick={() => setAdmissionType('LIBRARY')}
                >
                  <div className="master-card-top">
                    <div className="master-card-icon"><i className="ti ti-books"></i></div>
                    <h4>Library Only</h4>
                  </div>
                  <p>Register student for study hall / library membership</p>
                </div>

                <div
                  className={`master-card ${admissionType === 'ACADEMY_LIBRARY' ? 'badge-blue' : ''}`}
                  style={{ cursor: 'pointer', border: admissionType === 'ACADEMY_LIBRARY' ? '2px solid var(--accent)' : '' }}
                  onClick={() => setAdmissionType('ACADEMY_LIBRARY')}
                >
                  <div className="master-card-top">
                    <div className="master-card-icon"><i className="ti ti-building"></i></div>
                    <h4>Academy + Library</h4>
                  </div>
                  <p>Combined admission for coaching and library</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Details */}
          {step === 2 && (
            <div className="form-grid">
              <div className="form-field">
                <label>Student name <span className="required-asterisk">*</span></label>
                <input placeholder="Full name" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Date of birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Mobile number <span className="required-asterisk">*</span></label>
                <input placeholder="10-digit mobile number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Aadhaar number</label>
                <input placeholder="XXXX XXXX XXXX" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Address</label>
                <textarea
                  placeholder="Full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical', minHeight: '88px' }}
                />
              </div>

              {/* Student Photo Upload beside Address */}
              <div className="form-field photo-upload-container">
                <label>Student Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                {!photo ? (
                  <div className="photo-upload-box" onClick={triggerPhotoPicker} title="Click to upload student photo">
                    <div className="photo-plus-icon">
                      <i className="ti ti-plus"></i>
                    </div>
                    <span className="photo-upload-text">Upload Photo</span>
                  </div>
                ) : (
                  <div className="photo-preview-wrapper">
                    <img src={photo} alt="Student Preview" className="photo-preview-img" />
                    <div className="photo-overlay-actions">
                      <button
                        type="button"
                        className="photo-action-btn photo-action-edit"
                        title="Edit / Replace Photo"
                        onClick={triggerPhotoPicker}
                      >
                        <i className="ti ti-pencil"></i>
                      </button>
                      <button
                        type="button"
                        className="photo-action-btn photo-action-delete"
                        title="Delete Photo"
                        onClick={handleDeletePhoto}
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Parent Info */}
          {step === 3 && (
            <div className="form-grid">
              <div className="form-field">
                <label>Father's Name</label>
                <input placeholder="Father's full name" value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Mother's Name</label>
                <input placeholder="Mother's full name" value={motherName} onChange={(e) => setMotherName(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Parent Mobile Number</label>
                <input placeholder="10-digit mobile number" value={parentMobile} onChange={(e) => setParentMobile(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Parent Email</label>
                <input placeholder="parent@email.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 4: Education */}
          {step === 4 && (
            <div className="form-grid">
              <div className="form-field">
                <label>School / College</label>
                <input placeholder="School or college name" value={schoolCollege} onChange={(e) => setSchoolCollege(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Qualification</label>
                <input placeholder="e.g. 10th Pass / 12th Pursuing" value={qualification} onChange={(e) => setQualification(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Current Standard</label>
                <input placeholder="e.g. 11th Science / FY B.Sc" value={currentStandard} onChange={(e) => setCurrentStandard(e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 5: Admission Details */}
          {step === 5 && (
            <div className="form-grid">
              {/* Admission Type Display Summary & Select */}
              <div className="admission-summary-card">
                <div className="admission-summary-left">
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--slate)' }}>Selected Admission Type:</span>
                  <span className="admission-type-badge">
                    <i className={admissionType === 'ACADEMY' ? 'ti ti-school' : admissionType === 'LIBRARY' ? 'ti ti-books' : 'ti ti-building'}></i>
                    {admissionType === 'ACADEMY' ? 'Academy Only' : admissionType === 'LIBRARY' ? 'Library Only' : 'Academy + Library'}
                  </span>
                </div>
                <button type="button" className="btn btn-sm" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => setStep(1)}>
                  <i className="ti ti-pencil"></i> Change Type
                </button>
              </div>

              <div className="form-field">
                <label>Admission Type</label>
                <select value={admissionType} onChange={(e) => setAdmissionType(e.target.value)}>
                  <option value="ACADEMY">Academy Only</option>
                  <option value="LIBRARY">Library Only</option>
                  <option value="ACADEMY_LIBRARY">Academy + Library</option>
                </select>
              </div>

              {(admissionType === 'ACADEMY' || admissionType === 'ACADEMY_LIBRARY') && (
                <div className="form-field">
                  <label>Select Course</label>
                  <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(Number(e.target.value))}>
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.courseId} value={c.courseId}>{c.courseName} (₹{c.fees})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-field">
                <label>Select Batch</label>
                <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(Number(e.target.value))}>
                  <option value="">-- Select Batch --</option>
                  {batches.map((b) => (
                    <option key={b.batchId} value={b.batchId}>{b.batchName} ({b.batchTiming || 'Flexible'})</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Admission Date</label>
                <input type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Library Plan</label>
                <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">-- Select Library Plan --</option>
                  {plans.map((p) => (
                    <option key={p.planId} value={p.planId}>{p.planName} (₹{p.fees})</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>
          )}

          {/* Footer Navigation Buttons */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {step > 1 && (
              <button className="btn" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            {step < 5 ? (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
                Next <i className="ti ti-arrow-right"></i>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Registering...' : 'Complete Admission'}
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="card">
          {studentsLoading ? (
            <div className="empty">Loading registered students...</div>
          ) : students.length === 0 ? (
            <div className="empty">
              <i className="ti ti-users"></i>
              <div>No registered students found</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Admission No.</th>
                    <th>Student Name</th>
                    <th>Mobile</th>
                    <th>Course / Plan</th>
                    <th>Admission Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <tr key={st.studentId}>
                      <td><span>{st.admissionNumber || `ADM-${st.studentId}`}</span></td>
                      <td>
                        <span>{st.studentName}</span>
                        {st.email && <div style={{ fontSize: '11.5px', color: '#718096' }}>{st.email}</div>}
                      </td>
                      <td>{st.mobileNumber}</td>
                      <td>
                        {st.courseName || st.planName || st.admissionType || '—'}
                        {st.batchName && <span style={{ fontSize: '11.5px', color: '#718096', display: 'block' }}>Batch: {st.batchName}</span>}
                      </td>
                      <td>{st.admissionDate || '—'}</td>
                      <td>
                        <span className={`badge ${st.status === 'ACTIVE' ? 'badge-green' : st.status === 'PENDING' ? 'badge-amber' : 'badge-red'}`}>
                          {st.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <ActionButtons
                          onEdit={() => handleOpenEditStudent(st)}
                          onDelete={() => setDeletingStudentId(st.studentId!)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <StudentEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveUpdatedStudent}
        student={editingStudent}
        courses={courses}
        plans={plans}
        batches={batches}
      />

      <ConfirmDialog
        isOpen={deletingStudentId !== null}
        title="Delete Registered Student"
        message="Do you want to delete this student record? This action cannot be undone."
        onConfirm={handleConfirmDeleteStudent}
        onCancel={() => setDeletingStudentId(null)}
      />
    </div>
  );
};
