import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import type { StudentItem } from './components/StudentEditModal';

export const StudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchStudentDetails(id);
    }
  }, [id]);

  const fetchStudentDetails = async (studentId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/students/${studentId}`);
      setStudent(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load student registration details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', padding: '40px' }}>
        <div style={{ fontSize: '16px', color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="ti ti-loader spin" style={{ fontSize: '24px' }}></i> Loading Student Registration Details...
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', color: 'var(--danger)', marginBottom: '12px' }}>
          <i className="ti ti-alert-circle"></i>
        </div>
        <h3 style={{ marginBottom: '8px', color: 'var(--navy)' }}>Student Details Not Found</h3>
        <p style={{ color: '#718096', marginBottom: '20px' }}>{error || 'Unable to retrieve registration record for this QR code.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/registration')}>
          Back to Registration
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button className="btn" onClick={() => navigate('/registration')} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="ti ti-arrow-left"></i> Back to Registration List
        </button>
        <span className={`badge ${student.status === 'ACTIVE' ? 'badge-green' : student.status === 'PENDING' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
          Status: {student.status || 'ACTIVE'}
        </span>
      </div>

      <div className="card card-pad" style={{ borderRadius: '12px', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Header Profile Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
          <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid #3182ce', flexShrink: 0 }}>
            {student.photo || student.photoUrl ? (
              <img src={student.photo || student.photoUrl} alt={student.studentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <i className="ti ti-user" style={{ fontSize: '42px', color: '#a0aec0' }}></i>
            )}
          </div>
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', color: 'var(--navy)', fontWeight: 700 }}>
              {student.studentName}
            </h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13.5px', color: '#4a5568' }}>
              <span>Admission No: <strong style={{ color: '#2b6cb0' }}>{student.admissionNumber || `ADM-${student.studentId}`}</strong></span>
              <span>Roll No: <strong style={{ color: '#2b6cb0' }}>{student.rollNumber || 'Not assigned'}</strong></span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#3182ce', marginBottom: '12px', borderBottom: '1px solid #ebf8ff', paddingBottom: '4px' }}>
              Personal Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <div><strong>Gender:</strong> {student.gender || '—'}</div>
              <div><strong>Religion:</strong> {student.religion || '—'}</div>
              <div><strong>Caste:</strong> {student.caste || '—'}</div>
              <div><strong>Date of Birth:</strong> {student.dob || '—'}</div>
              <div><strong>Mobile:</strong> {student.mobileNumber || '—'}</div>
              <div><strong>Email:</strong> {student.email || '—'}</div>
              <div><strong>Aadhaar Number:</strong> {student.aadhaarNumber || '—'}</div>
              <div><strong>Student Kit Size:</strong> {student.kitSize || '—'}</div>
              <div><strong>Address:</strong> {student.address || '—'}</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#3182ce', marginBottom: '12px', borderBottom: '1px solid #ebf8ff', paddingBottom: '4px' }}>
              Admission & Course Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <div><strong>Admission Type:</strong> {student.admissionType || '—'}</div>
              {student.courseName && <div><strong>Course:</strong> {student.courseName}</div>}
              {student.planName && <div><strong>Library Plan:</strong> {student.planName}</div>}
              {student.batchName && <div><strong>Batch:</strong> {student.batchName}</div>}
              <div><strong>Admission Date:</strong> {student.admissionDate || '—'}</div>
              {student.physicalTrainingSource && student.admissionType !== 'LIBRARY' && (
                <div><strong>Physical Training Source:</strong> {student.physicalTrainingSource}</div>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#3182ce', marginBottom: '12px', borderBottom: '1px solid #ebf8ff', paddingBottom: '4px' }}>
              Parent Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <div><strong>Father's Name:</strong> {student.fatherName || '—'}</div>
              <div><strong>Mother's Name:</strong> {student.motherName || '—'}</div>
              <div><strong>Parent Mobile:</strong> {student.parentMobile || '—'}</div>
              <div><strong>Parent Email:</strong> {student.parentEmail || '—'}</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#3182ce', marginBottom: '12px', borderBottom: '1px solid #ebf8ff', paddingBottom: '4px' }}>
              Certificates & Documents
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <div>
                <strong>Sports Certificate:</strong> {student.hasSportsCertificate || 'No'}
                {student.sportsCertificateDetails && <div style={{ fontSize: '12px', color: '#718096' }}>{student.sportsCertificateDetails}</div>}
              </div>
              <div>
                <strong>NCC Certificate:</strong> {student.hasNccCertificate || 'No'}
                {student.nccCertificateDetails && <div style={{ fontSize: '12px', color: '#718096' }}>{student.nccCertificateDetails}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
