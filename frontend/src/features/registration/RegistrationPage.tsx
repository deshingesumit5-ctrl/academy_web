import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { getCachedData } from '../../config/apiCache';
import { getCourses } from '../master/course/api/courseApi';
import type { CourseDto } from '../master/course/api/courseApi';
import { getLibraryPlans } from '../master/library-plan/api/libraryPlanApi';
import type { LibraryPlanDto } from '../master/library-plan/api/libraryPlanApi';
import { getBatches } from '../master/batch/api/batchApi';
import type { BatchDto } from '../master/batch/api/batchApi';
import { getActiveCastes } from '../master/caste/api/casteApi';
import type { CasteDto } from '../master/caste/api/casteApi';
import { getActiveKitSizes } from '../master/kit-size/api/kitSizeApi';
import type { KitSizeDto } from '../master/kit-size/api/kitSizeApi';
import { getActiveReligions, type ReligionDto } from '../master/religion/api/religionApi';
import { getActiveDistricts, type DistrictDto } from '../master/district/api/districtApi';
import { ActionButtons } from '../../components/ActionButtons';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Modal } from '../../components/Modal';
import { StudentEditModal } from './components/StudentEditModal';
import type { StudentItem } from './components/StudentEditModal';
import { RollNumberReassignModal } from './components/RollNumberReassignModal';
import { QRCodeView } from '../../components/QRCodeView';
import {
  MOBILE_PLACEHOLDER,
  handleMobileChange,
  validateMobile,
  validateRequired,
  FieldError,
} from '../../validations';

export const RegistrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [plans, setPlans] = useState<LibraryPlanDto[]>([]);
  const [batches, setBatches] = useState<BatchDto[]>([]);
  const [religions, setReligions] = useState<ReligionDto[]>([]);
  const [castes, setCastes] = useState<CasteDto[]>([]);
  const [kitSizes, setKitSizes] = useState<KitSizeDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);

  // Registered Students List State
  const cachedStudents = getCachedData('/students');
  const [students, setStudents] = useState<StudentItem[]>(cachedStudents?.data || []);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);

  // List Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCaste, setFilterCaste] = useState('');
  const [filterKitSize, setFilterKitSize] = useState('');
  const [filterCourseId, setFilterCourseId] = useState('');

  // Modals for QR Code and Roll Number Reassignment
  const [qrStudent, setQrStudent] = useState<StudentItem | null>(null);
  const [reassignStudent, setReassignStudent] = useState<StudentItem | null>(null);

  // Form State
  const [admissionType, setAdmissionType] = useState('ACADEMY');

  // Step 2 Personal Details (Ordered sequence: Student Name, Gender, Religion, Caste, Roll No, DOB, Mobile, Email, Aadhaar, Kit Size, Address, Photo)
  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState('Male');
  const [religion, setReligion] = useState('');
  const [caste, setCaste] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [kitSize, setKitSize] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Parent State
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  // Certificates & Physical Training Source
  const [hasSportsCertificate, setHasSportsCertificate] = useState('');
  const [sportsCertificateDetails, setSportsCertificateDetails] = useState('');
  const [sportsCertificateDoc, setSportsCertificateDoc] = useState('');
  const [hasNccCertificate, setHasNccCertificate] = useState('');
  const [nccCertificateDetails, setNccCertificateDetails] = useState('');
  const [nccCertificateDoc, setNccCertificateDoc] = useState('');
  const [physicalTrainingSource, setPhysicalTrainingSource] = useState('');

  // File Input Refs
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const sportsFileInputRef = useRef<HTMLInputElement>(null);
  const nccFileInputRef = useRef<HTMLInputElement>(null);

  // Previous Year Details
  const [lastExamDate, setLastExamDate] = useState('');
  const [examMarks, setExamMarks] = useState<number | ''>('');
  const [physicalMarks, setPhysicalMarks] = useState<number | ''>('');
  const [writtenMarks, setWrittenMarks] = useState<number | ''>('');
  const [previousDistrict, setPreviousDistrict] = useState('');

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

  useEffect(() => {
    fetchMasters();
    fetchRegisteredStudents();
  }, []);

  const fetchMasters = async () => {
    try {
      const [c, p, b, rList, casteList, kitList, distList] = await Promise.all([
        getCourses(),
        getLibraryPlans(),
        getBatches(),
        getActiveReligions(),
        getActiveCastes(),
        getActiveKitSizes(),
        getActiveDistricts(),
      ]);
      setCourses(c);
      setPlans(p);
      setBatches(b);
      setReligions(rList);
      setCastes(casteList);
      setKitSizes(kitList);
      setDistricts(distList);
      if (c.length > 0) setSelectedCourseId(c[0].courseId || '');
      if (p.length > 0) setSelectedPlanId(p[0].planId || '');
      if (b.length > 0) setSelectedBatchId(b[0].batchId || '');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRegisteredStudents = async (showLoading = students.length === 0) => {
    if (showLoading) setStudentsLoading(true);
    try {
      const res = await axiosInstance.get('/students');
      const list: StudentItem[] = res.data.data || [];
      list.sort((a, b) => (b.studentId || 0) - (a.studentId || 0));
      setStudents(list);
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
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSportsDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSportsCertificateDoc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNccDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNccCertificateDoc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateStepAndNavigate = (targetStep: number): boolean => {
    if (targetStep < step) {
      setStep(targetStep);
      return true;
    }

    const errors: Record<string, string> = { ...fieldErrors };
    let firstErrorStep: number | null = null;

    // Step 2 validations (Personal details)
    if (targetStep > 2) {
      const nameErr = validateRequired(studentName);
      if (nameErr) errors.studentName = nameErr;
      else delete errors.studentName;

      const religionErr = validateRequired(religion);
      if (religionErr) errors.religion = religionErr;
      else delete errors.religion;

      const casteErr = validateRequired(caste);
      if (casteErr) errors.caste = casteErr;
      else delete errors.caste;

      const rollErr = validateRequired(rollNumber);
      if (rollErr) {
        errors.rollNumber = rollErr;
      } else if (students.some((st) => st.rollNumber && String(st.rollNumber).trim().toLowerCase() === rollNumber.trim().toLowerCase() && st.status !== 'INACTIVE')) {
        errors.rollNumber = 'This roll number is not available';
      } else {
        delete errors.rollNumber;
      }

      const dobErr = validateRequired(dob);
      if (dobErr) errors.dob = dobErr;
      else delete errors.dob;

      const mobErr = validateMobile(mobileNumber, true);
      if (mobErr) errors.mobileNumber = mobErr;
      else delete errors.mobileNumber;

      const kitSizeErr = validateRequired(kitSize);
      if (kitSizeErr) errors.kitSize = kitSizeErr;
      else delete errors.kitSize;

      const addrErr = validateRequired(address);
      if (addrErr) errors.address = addrErr;
      else delete errors.address;

      if (nameErr || religionErr || casteErr || errors.rollNumber || dobErr || mobErr || kitSizeErr || addrErr) {
        if (firstErrorStep === null) firstErrorStep = 2;
      }
    }

    // Step 3 validations (Parent & Certificate info)
    if (targetStep > 3) {
      const fatherErr = validateRequired(fatherName);
      if (fatherErr) errors.fatherName = fatherErr;
      else delete errors.fatherName;

      const motherErr = validateRequired(motherName);
      if (motherErr) errors.motherName = motherErr;
      else delete errors.motherName;

      const pMobErr = validateMobile(parentMobile, true);
      if (pMobErr) errors.parentMobile = pMobErr;
      else delete errors.parentMobile;

      if (fatherErr || motherErr || pMobErr) {
        if (firstErrorStep === null) firstErrorStep = 3;
      }
    }

    // Step 4 validations (Education & Previous Year)
    if (targetStep > 4) {
      const schoolErr = validateRequired(schoolCollege);
      if (schoolErr) errors.schoolCollege = schoolErr;
      else delete errors.schoolCollege;

      const stdErr = validateRequired(currentStandard);
      if (stdErr) errors.currentStandard = stdErr;
      else delete errors.currentStandard;

      if (schoolErr || stdErr) {
        if (firstErrorStep === null) firstErrorStep = 4;
      }
    }

    setFieldErrors(errors);

    if (firstErrorStep !== null) {
      setStep(firstErrorStep);
      return false;
    }

    setStep(targetStep);
    return true;
  };

  const handleSubmit = async () => {
    const isValid = validateStepAndNavigate(5);
    if (!isValid) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const finalTrainingSource = physicalTrainingSource;

      const payload = {
        studentName: studentName.trim(),
        gender,
        religion: religion || undefined,
        caste: caste || undefined,
        rollNumber: rollNumber.trim() || undefined,
        dob: dob || undefined,
        mobileNumber: mobileNumber.trim(),
        email: email.trim() || undefined,
        aadhaarNumber: aadhaarNumber.trim() || undefined,
        kitSize: kitSize || undefined,
        address: address.trim() || undefined,
        photo: photo || undefined,
        photoUrl: photo || undefined,
        fatherName: fatherName.trim() || undefined,
        motherName: motherName.trim() || undefined,
        parentMobile: parentMobile.trim() || undefined,
        parentEmail: parentEmail.trim() || undefined,
        hasSportsCertificate,
        sportsCertificateDetails: hasSportsCertificate === 'Yes' ? sportsCertificateDetails.trim() : undefined,
        sportsCertificateDoc: hasSportsCertificate === 'Yes' ? sportsCertificateDoc || undefined : undefined,
        hasNccCertificate,
        nccCertificateDetails: hasNccCertificate === 'Yes' ? nccCertificateDetails.trim() : undefined,
        nccCertificateDoc: hasNccCertificate === 'Yes' ? nccCertificateDoc || undefined : undefined,
        physicalTrainingSource: admissionType !== 'LIBRARY' ? finalTrainingSource : undefined,
        lastExamDate: lastExamDate || undefined,
        examMarks: examMarks !== '' ? Number(examMarks) : undefined,
        physicalMarks: physicalMarks !== '' ? Number(physicalMarks) : undefined,
        writtenMarks: writtenMarks !== '' ? Number(writtenMarks) : undefined,
        previousDistrict: previousDistrict.trim() || undefined,
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
        setSuccessMsg(`Student Registered Successfully! Admission No: ${res.data.data.admissionNumber}`);
        fetchRegisteredStudents();
      }
    } catch (err: any) {
      console.error('Failed to register student:', err);
      const msg = err.response?.data?.message || 'Failed to register student. Please check the details.';
      if (msg.toLowerCase().includes('roll number')) {
        setFieldErrors((prev) => ({ ...prev, rollNumber: 'This roll number is not available' }));
        setStep(2);
        setErrorMsg('');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetFormAndClearMsg = () => {
    setSuccessMsg('');
    setErrorMsg('');
    setFieldErrors({});
    setStep(1);
    setStudentName('');
    setGender('Male');
    setReligion('');
    setCaste('');
    setRollNumber('');
    setDob('');
    setMobileNumber('');
    setEmail('');
    setAadhaarNumber('');
    setKitSize('');
    setAddress('');
    setPhoto('');

    setFatherName('');
    setMotherName('');
    setParentMobile('');
    setParentEmail('');

    setHasSportsCertificate('');
    setSportsCertificateDetails('');
    setSportsCertificateDoc('');

    setHasNccCertificate('');
    setNccCertificateDetails('');
    setNccCertificateDoc('');

    setPhysicalTrainingSource('');

    setLastExamDate('');
    setExamMarks('');
    setPhysicalMarks('');
    setWrittenMarks('');
    setPreviousDistrict('');
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
      throw err;
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
    { id: 3, title: 'Parent & Certificates' },
    { id: 4, title: 'Education details' },
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
            <Modal isOpen={!!successMsg} title="Registration Successful" onClose={handleResetFormAndClearMsg}>
              <div style={{ padding: '16px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#c6f6d5', color: '#22543d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
                  <i className="ti ti-check"></i>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--navy)', lineHeight: '1.5' }}>
                  {successMsg}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ minWidth: '100px', padding: '8px 24px', fontSize: '14px', borderRadius: '6px', marginTop: '8px' }}
                  onClick={handleResetFormAndClearMsg}
                >
                  OK
                </button>
              </div>
            </Modal>
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
                onClick={() => validateStepAndNavigate(s.id)}
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

          {/* Step 2: Personal Details (Sequence: Student Name -> Gender -> Religion -> Caste -> Roll No -> DOB -> Mobile -> Email -> Aadhaar -> Kit Size -> Address) */}
          {step === 2 && (
            <div className="form-grid">
              <div className="form-field">
                <label>Student name <span className="required-asterisk">*</span></label>
                <input
                  className={fieldErrors.studentName ? 'input-error' : ''}
                  placeholder="Full name"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (fieldErrors.studentName) {
                      setFieldErrors((prev) => ({ ...prev, studentName: '' }));
                    }
                  }}
                />
                <FieldError error={fieldErrors.studentName} />
              </div>

              <div className="form-field">
                <label>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-field">
                <label>Religion <span className="required-asterisk">*</span></label>
                <select
                  className={fieldErrors.religion ? 'input-error' : ''}
                  value={religion}
                  onChange={(e) => {
                    setReligion(e.target.value);
                    if (fieldErrors.religion) {
                      setFieldErrors((prev) => ({ ...prev, religion: '' }));
                    }
                  }}
                >
                  <option value="">-- Select Religion --</option>
                  {religions.map((r) => (
                    <option key={r.religionId} value={r.name}>{r.name}</option>
                  ))}
                </select>
                <FieldError error={fieldErrors.religion} />
              </div>

              <div className="form-field">
                <label>Caste <span className="required-asterisk">*</span></label>
                <select
                  className={fieldErrors.caste ? 'input-error' : ''}
                  value={caste}
                  onChange={(e) => {
                    setCaste(e.target.value);
                    if (fieldErrors.caste) {
                      setFieldErrors((prev) => ({ ...prev, caste: '' }));
                    }
                  }}
                >
                  <option value="">-- Select Caste --</option>
                  {castes.map((c) => (
                    <option key={c.casteId} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <FieldError error={fieldErrors.caste} />
              </div>

              <div className="form-field">
                <label>Roll Number <span className="required-asterisk">*</span></label>
                <input
                  className={fieldErrors.rollNumber ? 'input-error' : ''}
                  placeholder="e.g. RN-101"
                  value={rollNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRollNumber(val);
                    if (!val.trim()) {
                      if (fieldErrors.rollNumber) {
                        setFieldErrors((prev) => ({ ...prev, rollNumber: '' }));
                      }
                    } else if (students.some((st) => st.rollNumber && String(st.rollNumber).trim().toLowerCase() === val.trim().toLowerCase() && st.status !== 'INACTIVE')) {
                      setFieldErrors((prev) => ({ ...prev, rollNumber: 'This roll number is not available' }));
                    } else {
                      if (fieldErrors.rollNumber) {
                        setFieldErrors((prev) => ({ ...prev, rollNumber: '' }));
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (!val.trim()) {
                      setFieldErrors((prev) => ({ ...prev, rollNumber: 'This field needs to be filled' }));
                    } else if (students.some((st) => st.rollNumber && String(st.rollNumber).trim().toLowerCase() === val.trim().toLowerCase() && st.status !== 'INACTIVE')) {
                      setFieldErrors((prev) => ({ ...prev, rollNumber: 'This roll number is not available' }));
                    }
                  }}
                />
                <FieldError error={fieldErrors.rollNumber} />
              </div>

              <div className="form-field">
                <label>Date of birth <span className="required-asterisk">*</span></label>
                <input
                  type="date"
                  className={fieldErrors.dob ? 'input-error' : ''}
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    if (fieldErrors.dob) {
                      setFieldErrors((prev) => ({ ...prev, dob: '' }));
                    }
                  }}
                />
                <FieldError error={fieldErrors.dob} />
              </div>

              <div className="form-field">
                <label>Mobile number <span className="required-asterisk">*</span></label>
                <input
                  className={fieldErrors.mobileNumber ? 'input-error' : ''}
                  placeholder={MOBILE_PLACEHOLDER}
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => {
                    handleMobileChange(e, setMobileNumber);
                    if (fieldErrors.mobileNumber) {
                      setFieldErrors((prev) => ({ ...prev, mobileNumber: '' }));
                    }
                  }}
                />
                <FieldError error={fieldErrors.mobileNumber} />
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
                <label>Student Kit Size <span className="required-asterisk">*</span></label>
                <select
                  className={fieldErrors.kitSize ? 'input-error' : ''}
                  value={kitSize}
                  onChange={(e) => {
                    setKitSize(e.target.value);
                    if (fieldErrors.kitSize) {
                      setFieldErrors((prev) => ({ ...prev, kitSize: '' }));
                    }
                  }}
                >
                  <option value="">-- Select Kit Size --</option>
                  {kitSizes.map((k) => (
                    <option key={k.kitSizeId} value={k.name}>{k.name}</option>
                  ))}
                </select>
                <FieldError error={fieldErrors.kitSize} />
              </div>

              <div className="form-field">
                <label>Address <span className="required-asterisk">*</span></label>
                <textarea
                  className={fieldErrors.address ? 'input-error' : ''}
                  placeholder="Full address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (fieldErrors.address) {
                      setFieldErrors((prev) => ({ ...prev, address: '' }));
                    }
                  }}
                  rows={3}
                  style={{ resize: 'vertical', minHeight: '88px' }}
                />
                <FieldError error={fieldErrors.address} />
              </div>

              {/* Student Photo Upload beside Address */}
              <div className="form-field photo-upload-container">
                <label>Student Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={photoFileInputRef}
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                {!photo ? (
                  <div className="photo-upload-box" onClick={() => photoFileInputRef.current?.click()} title="Click to upload student photo">
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
                        onClick={() => photoFileInputRef.current?.click()}
                      >
                        <i className="ti ti-pencil"></i>
                      </button>
                      <button
                        type="button"
                        className="photo-action-btn photo-action-delete"
                        title="Delete Photo"
                        onClick={() => {
                          setPhoto('');
                          if (photoFileInputRef.current) photoFileInputRef.current.value = '';
                        }}
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Parent & Certificate Info */}
          {step === 3 && (
            <div className="form-grid">
              <div className="form-field">
                <label>Father's Name <span className="required-asterisk">*</span></label>
                <input
                  className={fieldErrors.fatherName ? 'input-error' : ''}
                  placeholder="Father's full name"
                  value={fatherName}
                  onChange={(e) => {
                    setFatherName(e.target.value);
                    if (fieldErrors.fatherName) {
                      setFieldErrors((prev) => ({ ...prev, fatherName: '' }));
                    }
                  }}
                />
                <FieldError error={fieldErrors.fatherName} />
              </div>

              <div className="form-field">
                <label>Mother's Name <span className="required-asterisk">*</span></label>
                <input
                  className={fieldErrors.motherName ? 'input-error' : ''}
                  placeholder="Mother's full name"
                  value={motherName}
                  onChange={(e) => {
                    setMotherName(e.target.value);
                    if (fieldErrors.motherName) {
                      setFieldErrors((prev) => ({ ...prev, motherName: '' }));
                    }
                  }}
                />
                <FieldError error={fieldErrors.motherName} />
              </div>

              <div className="form-field">
                <label>Parent Mobile Number <span className="required-asterisk">*</span></label>
                <input
                  className={fieldErrors.parentMobile ? 'input-error' : ''}
                  placeholder={MOBILE_PLACEHOLDER}
                  maxLength={10}
                  value={parentMobile}
                  onChange={(e) => {
                    handleMobileChange(e, setParentMobile);
                    if (fieldErrors.parentMobile) {
                      setFieldErrors((prev) => ({ ...prev, parentMobile: '' }));
                    }
                  }}
                />
                <FieldError error={fieldErrors.parentMobile} />
              </div>

              <div className="form-field">
                <label>Parent Email</label>
                <input placeholder="parent@email.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
              </div>

              {/* Sports Certificate & Upload */}
              <div className="form-field">


                <label>Sports Certificate</label>

                <select value={hasSportsCertificate} onChange={(e) => setHasSportsCertificate(e.target.value)}
                  >
                  <option value="">-- Select --</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {hasSportsCertificate === 'Yes' && (
                <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label>Sports Certificate Details & Document Upload</label>
                  <input
                    placeholder="e.g. National Level Athletics Certificate / Doc Details"
                    value={sportsCertificateDetails}
                    onChange={(e) => setSportsCertificateDetails(e.target.value)}
                  />

                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    ref={sportsFileInputRef}
                    onChange={handleSportsDocUpload}
                    style={{ display: 'none' }}
                  />

                  {!sportsCertificateDoc ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ alignSelf: 'flex-start', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => sportsFileInputRef.current?.click()}
                    >
                      <i className="ti ti-plus"></i> Upload Document
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0f9ff', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: 6, maxWidth: 400 }}>
                      <i className="ti ti-file-check" style={{ color: '#0284c7', fontSize: 18 }}></i>
                      <span style={{ fontSize: 13, color: '#0369a1', fontWeight: 500 }}>Sports Certificate Document Attached</span>
                      <button
                        type="button"
                        title="Edit / Replace Document"
                        style={{ border: 'none', background: 'transparent', color: '#0284c7', cursor: 'pointer', fontSize: 15, marginLeft: 'auto' }}
                        onClick={() => sportsFileInputRef.current?.click()}
                      >
                        <i className="ti ti-pencil"></i>
                      </button>
                      <button
                        type="button"
                        title="Delete Document"
                        style={{ border: 'none', background: 'transparent', color: '#e53e3e', cursor: 'pointer', fontSize: 15 }}
                        onClick={() => {
                          setSportsCertificateDoc('');
                          if (sportsFileInputRef.current) sportsFileInputRef.current.value = '';
                        }}
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* NCC Certificate & Upload */}
              <div className="form-field">
                <label>NCC Certificate</label>
                <select value={hasNccCertificate} onChange={(e) => setHasNccCertificate(e.target.value)}>
                  <option value="">-- Select --</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {hasNccCertificate === 'Yes' && (
                <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label>NCC Certificate Details & Document Upload</label>
                  <input
                    placeholder="e.g. NCC 'B' Certificate / Air Wing"
                    value={nccCertificateDetails}
                    onChange={(e) => setNccCertificateDetails(e.target.value)}
                  />

                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    ref={nccFileInputRef}
                    onChange={handleNccDocUpload}
                    style={{ display: 'none' }}
                  />

                  {!nccCertificateDoc ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ alignSelf: 'flex-start', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => nccFileInputRef.current?.click()}
                    >
                      <i className="ti ti-plus"></i> Upload Document
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0f9ff', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: 6, maxWidth: 400 }}>
                      <i className="ti ti-file-check" style={{ color: '#0284c7', fontSize: 18 }}></i>
                      <span style={{ fontSize: 13, color: '#0369a1', fontWeight: 500 }}>NCC Certificate Document Attached</span>
                      <button
                        type="button"
                        title="Edit / Replace Document"
                        style={{ border: 'none', background: 'transparent', color: '#0284c7', cursor: 'pointer', fontSize: 15, marginLeft: 'auto' }}
                        onClick={() => nccFileInputRef.current?.click()}
                      >
                        <i className="ti ti-pencil"></i>
                      </button>
                      <button
                        type="button"
                        title="Delete Document"
                        style={{ border: 'none', background: 'transparent', color: '#e53e3e', cursor: 'pointer', fontSize: 15 }}
                        onClick={() => {
                          setNccCertificateDoc('');
                          if (nccFileInputRef.current) nccFileInputRef.current.value = '';
                        }}
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Physical Training Source (ONLY for Academy and Academy + Library students) */}
              {admissionType !== 'LIBRARY' && (
                <div className="form-field">
                  <label>Physical Training Source</label>
                  <select value={physicalTrainingSource} onChange={(e) => setPhysicalTrainingSource(e.target.value)}>
                    <option value="">-- Select --</option>
                    <option value="Ajinkya Foundation">Ajinkya Foundation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Education & Previous Year Details */}
          {step === 4 && (
            <div className="form-grid">
              <div className="form-field">
                <label>School / College <span className="required-asterisk">*</span></label>
                <input
                  className={fieldErrors.schoolCollege ? 'input-error' : ''}
                  placeholder="School or college name"
                  value={schoolCollege}
                  onChange={(e) => {
                    setSchoolCollege(e.target.value);
                    if (fieldErrors.schoolCollege) {
                      setFieldErrors((prev) => ({ ...prev, schoolCollege: '' }));
                    }
                  }}
                />
                <FieldError error={fieldErrors.schoolCollege} />
              </div>

              <div className="form-field">
                <label>Qualification</label>
                <input placeholder="e.g. 10th Pass / 12th Pursuing" value={qualification} onChange={(e) => setQualification(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Current Standard <span className="required-asterisk">*</span></label>
                <input
                  className={fieldErrors.currentStandard ? 'input-error' : ''}
                  placeholder="e.g. 11th Science / FY B.Sc"
                  value={currentStandard}
                  onChange={(e) => {
                    setCurrentStandard(e.target.value);
                    if (fieldErrors.currentStandard) {
                      setFieldErrors((prev) => ({ ...prev, currentStandard: '' }));
                    }
                  }}
                />
                <FieldError error={fieldErrors.currentStandard} />
              </div>

              {/* Previous Year Details Header */}
              <div style={{ gridColumn: 'span 2', fontWeight: 600, fontSize: 13, color: '#3182ce', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginTop: 10 }}>
                PREVIOUS YEAR / PREVIOUS EXAM DETAILS
              </div>

              <div className="form-field">
                <label>Last Exam Date</label>
                <input type="date" value={lastExamDate} onChange={(e) => setLastExamDate(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Exam Marks</label>
                <input
                  type="number"
                  placeholder="0"
                  value={examMarks}
                  onChange={(e) => setExamMarks(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              <div className="form-field">
                <label>Physical Marks</label>
                <input
                  type="number"
                  placeholder="0"
                  value={physicalMarks}
                  onChange={(e) => setPhysicalMarks(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              <div className="form-field">
                <label>Written Marks</label>
                <input
                  type="number"
                  placeholder="0"
                  value={writtenMarks}
                  onChange={(e) => setWrittenMarks(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              <div className="form-field">
                <label>District</label>
                <select
                  value={previousDistrict}
                  onChange={(e) => setPreviousDistrict(e.target.value)}
                >
                  <option value="">-- Select District --</option>
                  {districts.map((d) => (
                    <option key={d.districtId} value={d.name}>{d.name}</option>
                  ))}
                </select>
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

              {(admissionType === 'LIBRARY' || admissionType === 'ACADEMY_LIBRARY') && (
                <div className="form-field">
                  <label>Library Plan</label>
                  <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">-- Select Library Plan --</option>
                    {plans.map((p) => (
                      <option key={p.planId} value={p.planId}>{p.planName} (₹{p.fees})</option>
                    ))}
                  </select>
                </div>
              )}

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
              <button className="btn" onClick={() => validateStepAndNavigate(step - 1)}>
                Back
              </button>
            )}
            {step < 5 ? (
              <button className="btn btn-primary" onClick={() => validateStepAndNavigate(step + 1)}>
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

      {activeTab === 'list' && (() => {
        const filteredStudents = students.filter((st) => {
          const matchesSearch =
            !searchQuery ||
            st.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (st.admissionNumber && st.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (st.rollNumber && st.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (st.mobileNumber && st.mobileNumber.includes(searchQuery));
          const matchesCaste = !filterCaste || st.caste === filterCaste;
          const matchesKitSize = !filterKitSize || st.kitSize === filterKitSize;
          const matchesCourse = !filterCourseId || String(st.courseId) === filterCourseId;
          return matchesSearch && matchesCaste && matchesKitSize && matchesCourse;
        });

        return (
          <div className="card">
            {/* Filter Section styled nicely matching other modules without (DB) labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Search Student</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search name, roll no, mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', paddingLeft: '32px', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }}
                  />
                  <i className="ti ti-search" style={{ position: 'absolute', left: '10px', top: '11px', color: '#a0aec0' }}></i>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Caste</label>
                <select value={filterCaste} onChange={(e) => setFilterCaste(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }}>
                  <option value="">Filter Caste</option>
                  {castes.map((c) => (
                    <option key={c.casteId} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Kit Size</label>
                <select value={filterKitSize} onChange={(e) => setFilterKitSize(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }}>
                  <option value="">Filter Kit Size</option>
                  {kitSizes.map((k) => (
                    <option key={k.kitSizeId} value={k.name}>{k.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Course</label>
                <select value={filterCourseId} onChange={(e) => setFilterCourseId(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }}>
                  <option value="">Filter Course</option>
                  {courses.map((c) => (
                    <option key={c.courseId} value={String(c.courseId)}>{c.courseName}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredStudents.length === 0 && !studentsLoading ? (
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
                      <th>Roll No.</th>
                      <th>Student Name</th>
                      <th>Caste</th>
                      <th>Mobile</th>
                      <th>Course / Plan</th>
                      <th>Kit Size</th>
                      <th>Admission Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((st) => (
                      <tr key={st.studentId}>
                        <td><span>{st.admissionNumber || `ADM-${st.studentId}`}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{st.rollNumber || '-'}</span>
                            <button
                              type="button"
                              title="Reassign Roll Number"
                              style={{ border: 'none', background: 'transparent', color: '#3182ce', cursor: 'pointer', fontSize: 13 }}
                              onClick={() => setReassignStudent(st)}
                            >
                              <i className="ti ti-refresh"></i>
                            </button>
                          </div>
                        </td>
                        <td>
                          <span>{st.studentName}</span>
                          {st.email && <div style={{ fontSize: '11.5px', color: '#718096' }}>{st.email}</div>}
                        </td>
                        <td>{st.caste || '—'}</td>
                        <td>{st.mobileNumber}</td>
                        <td>
                          {st.courseName || st.planName || st.admissionType || '—'}
                          {st.batchName && <span style={{ fontSize: '11.5px', color: '#718096', display: 'block' }}>Batch: {st.batchName}</span>}
                        </td>
                        <td>{st.kitSize || '—'}</td>
                        <td>{st.admissionDate || '—'}</td>
                        <td>
                          <span className={`badge ${st.status === 'ACTIVE' ? 'badge-green' : st.status === 'PENDING' ? 'badge-amber' : 'badge-red'}`}>
                            {st.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{ fontSize: 12, padding: '4px 8px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}
                              title="View Student QR Code"
                              onClick={() => setQrStudent(st)}
                            >
                              <i className="ti ti-qrcode" style={{ marginRight: 4 }}></i>QR Code
                            </button>
                            <ActionButtons
                              onEdit={() => handleOpenEditStudent(st)}
                              onDelete={() => setDeletingStudentId(st.studentId!)}
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
        );
      })()}

      {/* Edit Student Modal */}
      <StudentEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveUpdatedStudent}
        student={editingStudent}
        courses={courses}
        plans={plans}
        batches={batches}
        students={students}
      />

      {/* Reassign Roll Number Modal */}
      <RollNumberReassignModal
        isOpen={reassignStudent !== null}
        onClose={() => setReassignStudent(null)}
        student={reassignStudent}
        onSuccess={() => fetchRegisteredStudents(false)}
      />

      {/* QR Code Modal (No print QR code button, encodes student registration details URL) */}
      <Modal isOpen={qrStudent !== null} title="Student Unique QR Code" onClose={() => setQrStudent(null)}>
        {qrStudent && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>
              {qrStudent.studentName} ({qrStudent.admissionNumber || `ADM-${qrStudent.studentId}`})
            </div>
            <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 16 }}>
              Roll No: <strong>{qrStudent.rollNumber || 'Not assigned'}</strong> | Batch: <strong>{qrStudent.batchName || '-'}</strong>
            </div>
            <QRCodeView value={`${window.location.origin}/student-details/${qrStudent.studentId}`} size={190} />
          </div>
        )}
      </Modal>

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
