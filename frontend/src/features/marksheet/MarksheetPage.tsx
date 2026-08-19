import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { getExams } from '../master/exam/api/examApi';
import type { ExamDto } from '../master/exam/api/examApi';
import { getBatches } from '../master/batch/api/batchApi';
import type { BatchDto } from '../master/batch/api/batchApi';

export const MarksheetPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<BatchDto[]>([]);
  const [exams, setExams] = useState<ExamDto[]>([]);

  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [admissionType, setAdmissionType] = useState('Academy');
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [fileName, setFileName] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [sRes, bRes, eRes] = await Promise.all([
        axiosInstance.get('/students'),
        getBatches(),
        getExams(),
      ]);
      setStudents(sRes.data.data);
      setBatches(bRes);
      setExams(eRes);
      if (sRes.data.data.length > 0) setSelectedStudentId(sRes.data.data[0].studentId);
      if (bRes.length > 0) setSelectedBatchId(bRes[0].batchId || '');
      if (eRes.length > 0) setSelectedExamId(eRes[0].examId || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRecord = async () => {
    if (!selectedStudentId) return;
    setSaving(true);
    setMsg('');
    try {
      await axiosInstance.post('/marksheets', {
        studentId: Number(selectedStudentId),
        batchId: selectedBatchId ? Number(selectedBatchId) : undefined,
        admissionType,
        examId: selectedExamId ? Number(selectedExamId) : undefined,
        fileName: fileName || 'marksheet.pdf',
        fileUrl: '/files/marksheet.pdf',
      });
      setMsg('Marksheet record saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="section-title">
        <span>Marksheet Management</span>
      </div>

      <div className="card card-pad" style={{ maxWidth: '720px' }}>
        {msg && (
          <div className="badge badge-green" style={{ width: '100%', padding: '10px', marginBottom: '14px' }}>
            {msg}
          </div>
        )}

        <div className="form-grid">
          <div className="form-field">
            <label>Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentName} — {s.admissionNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Select Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(Number(e.target.value))}
            >
              <option value="">-- Select Batch --</option>
              {batches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Admission Type</label>
            <select value={admissionType} onChange={(e) => setAdmissionType(e.target.value)}>
              <option value="Academy">Academy</option>
              <option value="Library">Library</option>
            </select>
          </div>

          <div className="form-field">
            <label>Select Exam</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(Number(e.target.value))}
            >
              <option value="">-- Select Exam --</option>
              {exams.map((ex) => (
                <option key={ex.examId} value={ex.examId}>
                  {ex.examName} ({ex.examType})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="upload-box" style={{ marginTop: '16px' }}>
          <i className="ti ti-file-upload"></i>
          <div>Upload Marksheet (PDF or Image)</div>
          <input
            type="file"
            style={{ marginTop: '10px' }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
          />
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={handleSaveRecord} disabled={saving}>
            <i className="ti ti-device-floppy"></i>
            {saving ? 'Saving...' : 'Save Record'}
          </button>
          <button className="btn">
            <i className="ti ti-brand-whatsapp"></i>Send to Parent via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
