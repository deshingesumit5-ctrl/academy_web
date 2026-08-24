import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { getCachedData } from '../../config/apiCache';
import { getExams } from '../master/exam/api/examApi';
import type { ExamDto } from '../master/exam/api/examApi';
import { getBatches } from '../master/batch/api/batchApi';
import type { BatchDto } from '../master/batch/api/batchApi';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ActionButtons } from '../../components/ActionButtons';
import { BulkMarksheetModal } from './components/BulkMarksheetModal';

interface MarksheetRecord {
  marksheetId?: number;
  studentId?: number;
  studentName?: string;
  admissionNumber?: string;
  batchId?: number;
  batchName?: string;
  admissionType?: string;
  examId?: number;
  examName?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt?: string;
}

export const MarksheetPage: React.FC = () => {
  const cachedMarksheets = getCachedData('/marksheets');
  const [marksheets, setMarksheets] = useState<MarksheetRecord[]>(cachedMarksheets?.data || []);
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<BatchDto[]>([]);
  const [exams, setExams] = useState<ExamDto[]>([]);
  const [loading, setLoading] = useState(marksheets.length === 0);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [admissionType, setAdmissionType] = useState('Academy');
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [fileName, setFileName] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  useEffect(() => {
    fetchData(marksheets.length === 0);
  }, []);

  const fetchData = async (showLoading = marksheets.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const [sRes, bRes, eRes, mRes] = await Promise.all([
        axiosInstance.get('/students'),
        getBatches(),
        getExams(),
        axiosInstance.get('/marksheets'),
      ]);

      const stList = sRes.data?.data || sRes.data || [];
      const msList = mRes.data?.data || mRes.data || [];

      setStudents(stList);
      setBatches(bRes || []);
      setExams(eRes || []);
      setMarksheets(msList);

      if (stList.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stList[0].studentId);
      }
      if (bRes && bRes.length > 0 && !selectedBatchId) {
        setSelectedBatchId(bRes[0].batchId || '');
      }
      if (eRes && eRes.length > 0 && !selectedExamId) {
        setSelectedExamId(eRes[0].examId || '');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarksheets = async () => {
    try {
      const mRes = await axiosInstance.get('/marksheets');
      const msList = mRes.data?.data || mRes.data || [];
      setMarksheets(msList);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFileName('');
    if (students.length > 0) setSelectedStudentId(students[0].studentId);
    if (batches.length > 0) setSelectedBatchId(batches[0].batchId || '');
    if (exams.length > 0) setSelectedExamId(exams[0].examId || '');
    setAdmissionType('Academy');
  };

  const handleEdit = (item: MarksheetRecord) => {
    if (!item.marksheetId) return;
    setEditingId(item.marksheetId);
    if (item.studentId) setSelectedStudentId(item.studentId);
    if (item.batchId) setSelectedBatchId(item.batchId);
    if (item.admissionType) setAdmissionType(item.admissionType);
    if (item.examId) setSelectedExamId(item.examId);
    setFileName(item.fileName || '');
    setMsg(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRecord = async () => {
    if (!selectedStudentId) {
      setMsg({ text: 'Please select a student', type: 'error' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        marksheetId: editingId || undefined,
        studentId: Number(selectedStudentId),
        batchId: selectedBatchId ? Number(selectedBatchId) : undefined,
        admissionType,
        examId: selectedExamId ? Number(selectedExamId) : undefined,
        fileName: fileName || 'marksheet.pdf',
        fileUrl: '/files/' + (fileName || 'marksheet.pdf'),
      };

      if (editingId) {
        await axiosInstance.put(`/marksheets/${editingId}`, payload);
        setMsg({ text: 'Marksheet record updated successfully!', type: 'success' });
      } else {
        await axiosInstance.post('/marksheets', payload);
        setMsg({ text: 'Marksheet record saved successfully!', type: 'success' });
      }

      resetForm();
      await fetchMarksheets();
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Failed to save record.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await axiosInstance.delete(`/marksheets/${deletingId}`);
      setMsg({ text: 'Marksheet deleted successfully!', type: 'success' });
      await fetchMarksheets();
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Failed to delete marksheet.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="section-title" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 10 }}>
        <button
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }}
          onClick={() => setBulkModalOpen(true)}
        >
          <i className="ti ti-file-spreadsheet" style={{ fontSize: '18px', color: '#16A34A' }}></i>
          Upload Excel / Bulk Upload
        </button>
        <button className="btn btn-primary" onClick={() => setBulkModalOpen(true)}>
          <i className="ti ti-upload" style={{ marginRight: 6 }}></i>Bulk Marksheet Upload
        </button>
      </div>

      {/* Form Card */}
      <div className="card card-pad" style={{ marginBottom: '24px' }}>
        {editingId && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1A202C' }}>
              <i className="ti ti-edit" style={{ marginRight: '8px', color: '#3182CE' }}></i>
              Edit Marksheet Record
            </h3>
            <button className="btn btn-outline" onClick={resetForm} style={{ padding: '4px 12px', fontSize: '13px' }}>
              <i className="ti ti-x"></i> Cancel Edit
            </button>
          </div>
        )}

        {msg && (
          <div
            className={msg.type === 'success' ? 'badge badge-green' : 'badge badge-red'}
            style={{ width: '100%', padding: '10px 14px', marginBottom: '16px', fontSize: '14px', textAlign: 'left' }}
          >
            <i className={msg.type === 'success' ? 'ti ti-check' : 'ti ti-alert-circle'} style={{ marginRight: '6px' }}></i>
            {msg.text}
          </div>
        )}

        <div className="form-grid">
          <div className="form-field">
            <label>
              Select Student <span className="required-asterisk">*</span>
            </label>
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
              onChange={(e) => setSelectedBatchId(e.target.value ? Number(e.target.value) : '')}
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
              onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : '')}
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

        {/* Enhanced Upload Marksheet Section */}
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            border: '2px dashed #CBD5E0',
            borderRadius: '10px',
            backgroundColor: '#F8FAFC',
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '28px', color: '#4A5568', marginBottom: '6px' }}>
            <i className="ti ti-cloud-upload"></i>
          </div>
          <div style={{ fontWeight: 600, color: '#2D3748', fontSize: '14px', marginBottom: '4px' }}>
            Upload Marksheet Document (PDF or Image)
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label
              className="btn btn-primary"
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              }}
            >
              <i className="ti ti-plus" style={{ fontSize: '16px' }}></i>
              <span>{fileName ? 'Change Marksheet' : 'Upload Marksheet'}</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setFileName(file.name);
                }}
              />
            </label>

            {fileName && (
              <span
                className="badge badge-blue"
                style={{
                  fontSize: '13px',
                  padding: '8px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '6px',
                }}
              >
                <i className="ti ti-file-text" style={{ fontSize: '16px' }}></i>
                <span>{fileName}</span>
                <i
                  className="ti ti-x"
                  style={{ cursor: 'pointer', marginLeft: '4px', opacity: 0.8 }}
                  title="Remove file"
                  onClick={() => setFileName('')}
                ></i>
              </span>
            )}
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleSaveRecord} disabled={saving}>
            <i className="ti ti-device-floppy"></i>
            {saving ? 'Saving...' : editingId ? 'Update Record' : 'Save Record'}
          </button>
          <button className="btn" type="button">
            <i className="ti ti-brand-whatsapp"></i>Send to Parent via WhatsApp
          </button>
        </div>
      </div>

      {/* Big Marksheet Table */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1A202C' }}>
            <i className="ti ti-file-description" style={{ marginRight: '8px', color: '#3182CE' }}></i>
            Marksheet Records ({marksheets.length})
          </h3>
        </div>

        {marksheets.length === 0 && !loading ? (
          <div className="empty">
            <i className="ti ti-file-off" style={{ fontSize: '36px', color: '#A0AEC0', marginBottom: '8px' }}></i>
            <div>No marksheets uploaded yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Admission No.</th>
                  <th>Batch</th>
                  <th>Admission Type</th>
                  <th>Exam</th>
                  <th>Marksheet Document</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {marksheets.map((item, index) => (
                  <tr key={item.marksheetId || index}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 500 }}>{item.studentName || '-'}</td>
                    <td><span className="badge badge-gray">{item.admissionNumber || '-'}</span></td>
                    <td>{item.batchName || '-'}</td>
                    <td><span className="badge badge-blue">{item.admissionType || 'Academy'}</span></td>
                    <td>{item.examName || '-'}</td>
                    <td>
                      <span
                        className="badge badge-green"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        title="Uploaded Document"
                      >
                        <i className="ti ti-file-text"></i>
                        {item.fileName || 'marksheet.pdf'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleEdit(item)}
                        onDelete={() => setDeletingId(item.marksheetId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Marksheet"
        message="Are you sure you want to delete this marksheet record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />

      <BulkMarksheetModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        exams={exams}
        batches={batches}
        students={students}
        existingMarksheets={marksheets}
        onSuccess={() => fetchMarksheets()}
      />
    </div>
  );
};
