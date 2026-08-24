import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/Modal';
import type { CourseDto } from '../../master/course/api/courseApi';
import type { LibraryPlanDto } from '../../master/library-plan/api/libraryPlanApi';
import type { BatchDto } from '../../master/batch/api/batchApi';
import { getActiveCastes } from '../../master/caste/api/casteApi';
import type { CasteDto } from '../../master/caste/api/casteApi';
import { getActiveKitSizes } from '../../master/kit-size/api/kitSizeApi';
import type { KitSizeDto } from '../../master/kit-size/api/kitSizeApi';
import { getActiveReligions, type ReligionDto } from '../../master/religion/api/religionApi';
import { getActiveDistricts, type DistrictDto } from '../../master/district/api/districtApi';
import {
  MOBILE_PLACEHOLDER,
  handleMobileChange,
  validateMobile,
  validateRequired,
  FieldError,
} from '../../../validations';

export interface StudentItem {
  studentId?: number;
  admissionNumber?: string;
  studentName: string;
  gender?: string;
  dob?: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  aadhaarNumber?: string;
  photo?: string;
  photoUrl?: string;
  fatherName?: string;
  motherName?: string;
  parentMobile?: string;
  parentEmail?: string;
  schoolCollege?: string;
  qualification?: string;
  currentStandard?: string;
  admissionType?: string;
  courseId?: number;
  courseName?: string;
  planId?: number;
  planName?: string;
  batchId?: number;
  batchName?: string;
  admissionDate?: string;
  status?: string;

  // New Fields
  rollNumber?: string;
  religion?: string;
  caste?: string;
  kitSize?: string;
  hasSportsCertificate?: string;
  sportsCertificateDetails?: string;
  sportsCertificateDoc?: string;
  hasNccCertificate?: string;
  nccCertificateDetails?: string;
  nccCertificateDoc?: string;

  // Previous Year
  lastExamDate?: string;
  examMarks?: number;
  physicalMarks?: number;
  writtenMarks?: number;
  previousDistrict?: string;

  // Training Source
  physicalTrainingSource?: string;

  // Discount / Concession
  discountAmount?: number;
  concessionAmount?: number;
  discountRemarks?: string;
  finalFee?: number;
}

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: Partial<StudentItem>) => Promise<void>;
  student: StudentItem | null;
  courses: CourseDto[];
  plans: LibraryPlanDto[];
  batches: BatchDto[];
  students?: StudentItem[];
}

export const StudentEditModal: React.FC<StudentEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  student,
  courses,
  plans,
  batches,
  students,
}) => {
  // Master options
  const [religions, setReligions] = useState<ReligionDto[]>([]);
  const [castes, setCastes] = useState<CasteDto[]>([]);
  const [kitSizes, setKitSizes] = useState<KitSizeDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);

  // Personal Details
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Parent Info
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  // Certificates & Physical Training
  const [hasSportsCertificate, setHasSportsCertificate] = useState('');
  const [sportsCertificateDetails, setSportsCertificateDetails] = useState('');
  const [sportsCertificateDoc, setSportsCertificateDoc] = useState('');
  const [hasNccCertificate, setHasNccCertificate] = useState('');
  const [nccCertificateDetails, setNccCertificateDetails] = useState('');
  const [nccCertificateDoc, setNccCertificateDoc] = useState('');
  const [physicalTrainingSource, setPhysicalTrainingSource] = useState('');

  const sportsFileInputRef = useRef<HTMLInputElement>(null);
  const nccFileInputRef = useRef<HTMLInputElement>(null);

  // Previous Year Details
  const [lastExamDate, setLastExamDate] = useState('');
  const [examMarks, setExamMarks] = useState<number | ''>('');
  const [physicalMarks, setPhysicalMarks] = useState<number | ''>('');
  const [writtenMarks, setWrittenMarks] = useState<number | ''>('');
  const [previousDistrict, setPreviousDistrict] = useState('');

  // Education Details
  const [schoolCollege, setSchoolCollege] = useState('');
  const [qualification, setQualification] = useState('');
  const [currentStandard, setCurrentStandard] = useState('');

  // Admission Details
  const [admissionType, setAdmissionType] = useState('ACADEMY');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [batchId, setBatchId] = useState<number | ''>('');
  const [planId, setPlanId] = useState<number | ''>('');
  const [status, setStatus] = useState('ACTIVE');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [rList, cList, kList, dList] = await Promise.all([
        getActiveReligions(),
        getActiveCastes(),
        getActiveKitSizes(),
        getActiveDistricts(),
      ]);
      setReligions(rList);
      setCastes(cList);
      setKitSizes(kList);
      setDistricts(dList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (student) {
      setStudentName(student.studentName || '');
      setGender(student.gender || 'Male');
      setReligion(student.religion || '');
      setCaste(student.caste || '');
      setRollNumber(student.rollNumber || '');
      setDob(student.dob || '');
      setMobileNumber(student.mobileNumber || '');
      setEmail(student.email || '');
      setAadhaarNumber(student.aadhaarNumber || '');
      setKitSize(student.kitSize || '');
      setAddress(student.address || '');

      setFatherName(student.fatherName || '');
      setMotherName(student.motherName || '');
      setParentMobile(student.parentMobile || '');
      setParentEmail(student.parentEmail || '');

      setHasSportsCertificate(student.hasSportsCertificate || '');
      setSportsCertificateDetails(student.sportsCertificateDetails || '');
      setSportsCertificateDoc(student.sportsCertificateDoc || '');

      setHasNccCertificate(student.hasNccCertificate || '');
      setNccCertificateDetails(student.nccCertificateDetails || '');
      setNccCertificateDoc(student.nccCertificateDoc || '');

      const pts = student.physicalTrainingSource || '';
      if (pts && pts !== 'Ajinkya Foundation') {
        setPhysicalTrainingSource('Other');
      } else {
        setPhysicalTrainingSource(pts);
      }

      setLastExamDate(student.lastExamDate || '');
      setExamMarks(student.examMarks !== undefined && student.examMarks !== null ? student.examMarks : '');
      setPhysicalMarks(student.physicalMarks !== undefined && student.physicalMarks !== null ? student.physicalMarks : '');
      setWrittenMarks(student.writtenMarks !== undefined && student.writtenMarks !== null ? student.writtenMarks : '');
      setPreviousDistrict(student.previousDistrict || '');

      setSchoolCollege(student.schoolCollege || '');
      setQualification(student.qualification || '');
      setCurrentStandard(student.currentStandard || '');

      setAdmissionType(student.admissionType || 'ACADEMY');
      setCourseId(student.courseId || '');
      setBatchId(student.batchId || '');
      setPlanId(student.planId || '');
      setStatus(student.status || 'ACTIVE');
      setFieldErrors({});
      setErrorMsg('');
    }
  }, [student, isOpen]);

  const handleSportsDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSportsCertificateDoc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNccDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNccCertificateDoc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const errors: Record<string, string> = {};
    const nameErr = validateRequired(studentName);
    if (nameErr) errors.studentName = nameErr;

    const mobErr = validateMobile(mobileNumber, true);
    if (mobErr) errors.mobileNumber = mobErr;

    const dobErr = validateRequired(dob);
    if (dobErr) errors.dob = dobErr;

    const addrErr = validateRequired(address);
    if (addrErr) errors.address = addrErr;

    const fatherErr = validateRequired(fatherName);
    if (fatherErr) errors.fatherName = fatherErr;

    const motherErr = validateRequired(motherName);
    if (motherErr) errors.motherName = motherErr;

    const pMobErr = validateMobile(parentMobile, true);
    if (pMobErr) errors.parentMobile = pMobErr;

    const schoolErr = validateRequired(schoolCollege);
    if (schoolErr) errors.schoolCollege = schoolErr;

    const stdErr = validateRequired(currentStandard);
    if (stdErr) errors.currentStandard = stdErr;

    const religionErr = validateRequired(religion);
    if (religionErr) errors.religion = religionErr;

    const casteErr = validateRequired(caste);
    if (casteErr) errors.caste = casteErr;

    const rollErr = validateRequired(rollNumber);
    if (rollErr) {
      errors.rollNumber = rollErr;
    } else if (students?.some((st) => st.studentId !== student?.studentId && st.rollNumber && String(st.rollNumber).trim().toLowerCase() === rollNumber.trim().toLowerCase() && st.status !== 'INACTIVE')) {
      errors.rollNumber = 'This roll number is not available';
    }

    const kitSizeErr = validateRequired(kitSize);
    if (kitSizeErr) errors.kitSize = kitSizeErr;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !student?.studentId) return;

    setSaving(true);
    try {
      const finalTrainingSource = physicalTrainingSource;

      await onSave(student.studentId, {
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
        courseId: courseId !== '' ? Number(courseId) : undefined,
        batchId: batchId !== '' ? Number(batchId) : undefined,
        planId: planId !== '' ? Number(planId) : undefined,
        status,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update student details');
    } finally {
      setSaving(false);
    }
  };

  const sectionHeaderStyle: React.CSSProperties = {
    gridColumn: 'span 2',
    fontWeight: 600,
    fontSize: '13px',
    color: '#3182ce',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '4px',
    marginTop: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <Modal isOpen={isOpen} title="Edit Registered Student" onClose={onClose}>
      <form noValidate onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {errorMsg && (
          <div style={{ gridColumn: 'span 2', color: 'var(--danger)', background: '#fff5f5', border: '1px solid #feb2b2', padding: 10, borderRadius: 6, fontSize: 13 }}>
            <i className="ti ti-alert-circle" style={{ marginRight: 6 }}></i>
            {errorMsg}
          </div>
        )}
        
        {/* Personal Details Sequence: Student Name -> Gender -> Religion -> Caste -> Roll No -> DOB -> Mobile -> Email -> Aadhaar -> Kit Size -> Address */}
        <div style={sectionHeaderStyle}>Personal Details</div>

        <div className="form-field">
          <label>Student Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.studentName ? 'input-error' : ''}
            value={studentName}
            onChange={(e) => {
              setStudentName(e.target.value);
              if (fieldErrors.studentName) setFieldErrors((prev) => ({ ...prev, studentName: '' }));
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
              if (fieldErrors.religion) setFieldErrors((prev) => ({ ...prev, religion: '' }));
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
              if (fieldErrors.caste) setFieldErrors((prev) => ({ ...prev, caste: '' }));
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
            type="text"
            className={fieldErrors.rollNumber ? 'input-error' : ''}
            value={rollNumber}
            onChange={(e) => {
              const val = e.target.value;
              setRollNumber(val);
              if (!val.trim()) {
                if (fieldErrors.rollNumber) setFieldErrors((prev) => ({ ...prev, rollNumber: '' }));
              } else if (students?.some((st) => st.studentId !== student?.studentId && st.rollNumber && String(st.rollNumber).trim().toLowerCase() === val.trim().toLowerCase() && st.status !== 'INACTIVE')) {
                setFieldErrors((prev) => ({ ...prev, rollNumber: 'This roll number is not available' }));
              } else {
                if (fieldErrors.rollNumber) setFieldErrors((prev) => ({ ...prev, rollNumber: '' }));
              }
            }}
            onBlur={(e) => {
              const val = e.target.value;
              if (!val.trim()) {
                setFieldErrors((prev) => ({ ...prev, rollNumber: 'This field needs to be filled' }));
              } else if (students?.some((st) => st.studentId !== student?.studentId && st.rollNumber && String(st.rollNumber).trim().toLowerCase() === val.trim().toLowerCase() && st.status !== 'INACTIVE')) {
                setFieldErrors((prev) => ({ ...prev, rollNumber: 'This roll number is not available' }));
              }
            }}
            placeholder="e.g. RN-101"
          />
          <FieldError error={fieldErrors.rollNumber} />
        </div>

        <div className="form-field">
          <label>Date of Birth <span className="required-asterisk">*</span></label>
          <input
            type="date"
            className={fieldErrors.dob ? 'input-error' : ''}
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              if (fieldErrors.dob) setFieldErrors((prev) => ({ ...prev, dob: '' }));
            }}
          />
          <FieldError error={fieldErrors.dob} />
        </div>

        <div className="form-field">
          <label>Mobile Number <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.mobileNumber ? 'input-error' : ''}
            placeholder={MOBILE_PLACEHOLDER}
            maxLength={10}
            value={mobileNumber}
            onChange={(e) => {
              handleMobileChange(e, setMobileNumber);
              if (fieldErrors.mobileNumber) setFieldErrors((prev) => ({ ...prev, mobileNumber: '' }));
            }}
          />
          <FieldError error={fieldErrors.mobileNumber} />
        </div>

        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@email.com"
          />
        </div>

        <div className="form-field">
          <label>Aadhaar Number</label>
          <input
            type="text"
            maxLength={12}
            value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="XXXX XXXX XXXX"
          />
        </div>

        <div className="form-field">
          <label>Student Kit Size <span className="required-asterisk">*</span></label>
          <select
            className={fieldErrors.kitSize ? 'input-error' : ''}
            value={kitSize}
            onChange={(e) => {
              setKitSize(e.target.value);
              if (fieldErrors.kitSize) setFieldErrors((prev) => ({ ...prev, kitSize: '' }));
            }}
          >
            <option value="">-- Select Kit Size --</option>
            {kitSizes.map((k) => (
              <option key={k.kitSizeId} value={k.name}>{k.name}</option>
            ))}
          </select>
          <FieldError error={fieldErrors.kitSize} />
        </div>

        <div className="form-field" style={{ gridColumn: 'span 2' }}>
          <label>Address <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.address ? 'input-error' : ''}
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: '' }));
            }}
          />
          <FieldError error={fieldErrors.address} />
        </div>

        {/* Parent Info */}
        <div style={sectionHeaderStyle}>Parent Info</div>

        <div className="form-field">
          <label>Father's Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.fatherName ? 'input-error' : ''}
            value={fatherName}
            onChange={(e) => {
              setFatherName(e.target.value);
              if (fieldErrors.fatherName) setFieldErrors((prev) => ({ ...prev, fatherName: '' }));
            }}
          />
          <FieldError error={fieldErrors.fatherName} />
        </div>

        <div className="form-field">
          <label>Mother's Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.motherName ? 'input-error' : ''}
            value={motherName}
            onChange={(e) => {
              setMotherName(e.target.value);
              if (fieldErrors.motherName) setFieldErrors((prev) => ({ ...prev, motherName: '' }));
            }}
          />
          <FieldError error={fieldErrors.motherName} />
        </div>

        <div className="form-field">
          <label>Parent Mobile <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.parentMobile ? 'input-error' : ''}
            maxLength={10}
            value={parentMobile}
            onChange={(e) => {
              handleMobileChange(e, setParentMobile);
              if (fieldErrors.parentMobile) setFieldErrors((prev) => ({ ...prev, parentMobile: '' }));
            }}
          />
          <FieldError error={fieldErrors.parentMobile} />
        </div>

        <div className="form-field">
          <label>Parent Email</label>
          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
          />
        </div>

        {/* Certificates & Training Source */}
        <div style={sectionHeaderStyle}>Certificates & Training</div>

        <div className="form-field">
          <label>Sports Certificate</label>
          <select value={hasSportsCertificate} onChange={(e) => setHasSportsCertificate(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {hasSportsCertificate === 'Yes' && (
          <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label>Sports Certificate Details & Document Upload</label>
            <input
              type="text"
              value={sportsCertificateDetails}
              onChange={(e) => setSportsCertificateDetails(e.target.value)}
              placeholder="e.g. State Level Athletics Certificate / Doc Details"
              style={{ marginBottom: 6 }}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0f9ff', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: 6 }}>
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

        <div className="form-field">
          <label>NCC Certificate</label>
          <select value={hasNccCertificate} onChange={(e) => setHasNccCertificate(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {hasNccCertificate === 'Yes' && (
          <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label>NCC Certificate Details & Document Upload</label>
            <input
              type="text"
              value={nccCertificateDetails}
              onChange={(e) => setNccCertificateDetails(e.target.value)}
              placeholder="e.g. NCC 'B' Certificate / Wing"
              style={{ marginBottom: 6 }}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0f9ff', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: 6 }}>
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

        {/* Physical Training Source Section (Only for Academy and Academy + Library students) */}
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

        {/* Previous Year Details */}
        <div style={sectionHeaderStyle}>Previous Year / Previous Exam Details</div>

        <div className="form-field">
          <label>Last Exam Date</label>
          <input
            type="date"
            value={lastExamDate}
            onChange={(e) => setLastExamDate(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Total Exam Marks</label>
          <input
            type="number"
            value={examMarks}
            onChange={(e) => setExamMarks(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
          />
        </div>

        <div className="form-field">
          <label>Physical Marks</label>
          <input
            type="number"
            value={physicalMarks}
            onChange={(e) => setPhysicalMarks(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
          />
        </div>

        <div className="form-field">
          <label>Written Marks</label>
          <input
            type="number"
            value={writtenMarks}
            onChange={(e) => setWrittenMarks(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
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

        {/* Education Details */}
        <div style={sectionHeaderStyle}>Education Details</div>

        <div className="form-field">
          <label>School / College <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.schoolCollege ? 'input-error' : ''}
            value={schoolCollege}
            onChange={(e) => {
              setSchoolCollege(e.target.value);
              if (fieldErrors.schoolCollege) setFieldErrors((prev) => ({ ...prev, schoolCollege: '' }));
            }}
          />
          <FieldError error={fieldErrors.schoolCollege} />
        </div>

        <div className="form-field">
          <label>Qualification</label>
          <input
            type="text"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
          />
        </div>

        <div className="form-field" style={{ gridColumn: 'span 2' }}>
          <label>Current Standard <span className="required-asterisk">*</span></label>
          <input
            type="text"
            className={fieldErrors.currentStandard ? 'input-error' : ''}
            value={currentStandard}
            onChange={(e) => {
              setCurrentStandard(e.target.value);
              if (fieldErrors.currentStandard) setFieldErrors((prev) => ({ ...prev, currentStandard: '' }));
            }}
          />
          <FieldError error={fieldErrors.currentStandard} />
        </div>

        {/* Admission Details */}
        <div style={sectionHeaderStyle}>Admission Details</div>

        <div className="form-field">
          <label>Admission Type</label>
          <select value={admissionType} onChange={(e) => setAdmissionType(e.target.value)}>
            <option value="ACADEMY">Academy Only</option>
            <option value="LIBRARY">Library Only</option>
            <option value="ACADEMY_LIBRARY">Academy + Library</option>
          </select>
        </div>

        <div className="form-field">
          <label>Course</label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">-- Select Course --</option>
            {courses.map((c) => (
              <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Batch</label>
          <select value={batchId} onChange={(e) => setBatchId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">-- Select Batch --</option>
            {batches.map((b) => (
              <option key={b.batchId} value={b.batchId}>{b.batchName}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Library Plan</label>
          <select value={planId} onChange={(e) => setPlanId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">-- Select Plan --</option>
            {plans.map((p) => (
              <option key={p.planId} value={p.planId}>{p.planName}</option>
            ))}
          </select>
        </div>

        <div className="form-field" style={{ gridColumn: 'span 2' }}>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <div className="modal-footer" style={{ gridColumn: 'span 2', padding: 0, marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
