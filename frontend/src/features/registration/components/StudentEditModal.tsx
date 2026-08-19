import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import type { CourseDto } from '../../master/course/api/courseApi';
import type { LibraryPlanDto } from '../../master/library-plan/api/libraryPlanApi';
import type { BatchDto } from '../../master/batch/api/batchApi';

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
}

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: Partial<StudentItem>) => Promise<void>;
  student: StudentItem | null;
  courses: CourseDto[];
  plans: LibraryPlanDto[];
  batches: BatchDto[];
}

export const StudentEditModal: React.FC<StudentEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  student,
  courses,
  plans,
  batches,
}) => {
  // Personal Details
  const [studentName, setStudentName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');

  // Parent Info
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [parentEmail, setParentEmail] = useState('');

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

  useEffect(() => {
    if (student) {
      setStudentName(student.studentName || '');
      setMobileNumber(student.mobileNumber || '');
      setEmail(student.email || '');
      setGender(student.gender || 'Male');
      setDob(student.dob || '');
      setAadhaarNumber(student.aadhaarNumber || '');
      setAddress(student.address || '');

      setFatherName(student.fatherName || '');
      setMotherName(student.motherName || '');
      setParentMobile(student.parentMobile || '');
      setParentEmail(student.parentEmail || '');

      setSchoolCollege(student.schoolCollege || '');
      setQualification(student.qualification || '');
      setCurrentStandard(student.currentStandard || '');

      setAdmissionType(student.admissionType || 'ACADEMY');
      setCourseId(student.courseId || '');
      setBatchId(student.batchId || '');
      setPlanId(student.planId || '');
      setStatus(student.status || 'ACTIVE');
    }
  }, [student, isOpen]);

  const isValid = studentName.trim() !== '' && mobileNumber.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?.studentId || !isValid) return;
    setSaving(true);
    try {
      await onSave(student.studentId, {
        studentName: studentName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim() || undefined,
        gender,
        dob: dob || undefined,
        aadhaarNumber: aadhaarNumber.trim() || undefined,
        address: address.trim() || undefined,
        fatherName: fatherName.trim() || undefined,
        motherName: motherName.trim() || undefined,
        parentMobile: parentMobile.trim() || undefined,
        parentEmail: parentEmail.trim() || undefined,
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
    } catch (err) {
      console.error(err);
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
      <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        
        {/* Personal Details */}
        <div style={sectionHeaderStyle}>Personal Details</div>

        <div className="form-field">
          <label>Student Name <span className="required-asterisk">*</span></label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Mobile Number <span className="required-asterisk">*</span></label>
          <input
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
          <label>Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Aadhaar Number</label>
          <input
            type="text"
            value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value)}
          />
        </div>

        <div className="form-field" style={{ gridColumn: 'span 2' }}>
          <label>Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Parent Details */}
        <div style={sectionHeaderStyle}>Parent Details</div>

        <div className="form-field">
          <label>Father's Name</label>
          <input
            type="text"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Mother's Name</label>
          <input
            type="text"
            value={motherName}
            onChange={(e) => setMotherName(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Parent Mobile Number</label>
          <input
            type="text"
            value={parentMobile}
            onChange={(e) => setParentMobile(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Parent Email</label>
          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
          />
        </div>

        {/* Education Details */}
        <div style={sectionHeaderStyle}>Education Details</div>

        <div className="form-field">
          <label>School / College</label>
          <input
            type="text"
            value={schoolCollege}
            onChange={(e) => setSchoolCollege(e.target.value)}
          />
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
          <label>Current Standard</label>
          <input
            type="text"
            value={currentStandard}
            onChange={(e) => setCurrentStandard(e.target.value)}
          />
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
            <option value="PENDING">PENDING</option>
          </select>
        </div>

        <div className="modal-footer" style={{ gridColumn: 'span 2', padding: 0, marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isValid || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

