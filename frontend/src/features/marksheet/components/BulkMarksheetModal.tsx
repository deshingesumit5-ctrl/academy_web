import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Modal } from '../../../components/Modal';
import axiosInstance from '../../../config/axiosInstance';
import type { ExamDto } from '../../master/exam/api/examApi';
import type { BatchDto } from '../../master/batch/api/batchApi';

interface StudentOption {
  studentId: number;
  studentName: string;
  admissionNumber?: string;
  rollNumber?: string;
  batchId?: number;
}

interface MarksheetRow {
  studentId: number;
  studentName: string;
  rollNumber?: string;
  fileName: string;
  fileUrl?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exams: ExamDto[];
  batches: BatchDto[];
  students: StudentOption[];
  existingMarksheets: any[];
  onSuccess: () => void;
}

export const BulkMarksheetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  exams,
  batches,
  students,
  existingMarksheets,
  onSuccess,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [rows, setRows] = useState<MarksheetRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (exams.length > 0) setSelectedExamId(exams[0].examId || '');
    if (batches.length > 0) setSelectedBatchId(batches[0].batchId || '');
    setErrorMsg('');
    setSuccessMsg('');
  }, [isOpen, exams, batches]);

  // When exam or batch changes, initialize student mapping rows
  useEffect(() => {
    if (selectedBatchId !== '') {
      const filteredStudents = students.filter((s) => s.batchId === Number(selectedBatchId));
      const targetList = filteredStudents.length > 0 ? filteredStudents : students;
      const initialRows: MarksheetRow[] = targetList.map((st) => ({
        studentId: st.studentId,
        studentName: st.studentName,
        rollNumber: st.rollNumber,
        fileName: '',
      }));
      setRows(initialRows);
    } else {
      const initialRows: MarksheetRow[] = students.map((st) => ({
        studentId: st.studentId,
        studentName: st.studentName,
        rollNumber: st.rollNumber,
        fileName: '',
      }));
      setRows(initialRows);
    }
  }, [selectedBatchId, students, isOpen]);

  const handleFileNameChange = (index: number, name: string) => {
    const updated = [...rows];
    updated[index].fileName = name;
    setRows(updated);
  };

  const handleFileUpload = (index: number, file: File) => {
    const updated = [...rows];
    updated[index].fileName = file.name;
    updated[index].fileUrl = `/uploads/marksheets/${file.name}`;
    setRows(updated);
  };

  // Excel Upload Handler
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (!jsonData || jsonData.length === 0) {
          setErrorMsg('Uploaded Excel file contains no data rows.');
          return;
        }

        let filledCount = 0;
        const updatedRows = [...rows];

        jsonData.forEach((row: any) => {
          const keys = Object.keys(row);
          const getValue = (candidateKeys: string[]): string => {
            const matchedKey = keys.find((k) =>
              candidateKeys.some((ck) => k.trim().toLowerCase() === ck.toLowerCase())
            );
            return matchedKey ? String(row[matchedKey]).trim() : '';
          };

          const rollNo = getValue(['Roll No', 'Roll Number', 'RollNo', 'Roll']);
          const studentName = getValue(['Student Name', 'StudentName', 'Name', 'Student']);
          const admissionNo = getValue(['Admission Number', 'Admission No', 'AdmissionNo', 'Admission']);
          const marksheetFile = getValue([
            'Marksheet File Name',
            'Marksheet File',
            'Marksheet',
            'File Name',
            'FileName',
            'File',
            'Document',
          ]);
          const examName = getValue(['Exam Name', 'Exam']);

          if (examName && exams.length > 0) {
            const matchedExam = exams.find(
              (ex) => ex.examName?.toLowerCase() === examName.toLowerCase()
            );
            if (matchedExam && matchedExam.examId) {
              setSelectedExamId(matchedExam.examId);
            }
          }

          // Search in existing updatedRows first
          const index = updatedRows.findIndex((r) => {
            if (rollNo && String(r.rollNumber || '').trim() === rollNo) return true;
            if (studentName && r.studentName.toLowerCase().trim() === studentName.toLowerCase().trim()) return true;
            const stObj = students.find((s) => s.studentId === r.studentId);
            if (admissionNo && stObj?.admissionNumber?.trim() === admissionNo) return true;
            return false;
          });

          if (index !== -1) {
            if (marksheetFile) {
              updatedRows[index].fileName = marksheetFile;
              updatedRows[index].fileUrl = `/uploads/marksheets/${marksheetFile}`;
              filledCount++;
            }
          } else {
            // Find in overall students list
            const matchedSt = students.find((s) => {
              if (rollNo && String(s.rollNumber || '').trim() === rollNo) return true;
              if (admissionNo && s.admissionNumber?.trim() === admissionNo) return true;
              if (studentName && s.studentName.toLowerCase().trim() === studentName.toLowerCase().trim()) return true;
              return false;
            });

            if (matchedSt) {
              updatedRows.push({
                studentId: matchedSt.studentId,
                studentName: matchedSt.studentName,
                rollNumber: matchedSt.rollNumber,
                fileName: marksheetFile || '',
                fileUrl: marksheetFile ? `/uploads/marksheets/${marksheetFile}` : undefined,
              });
              if (marksheetFile) filledCount++;
            }
          }
        });

        setRows(updatedRows);
        if (filledCount > 0) {
          setSuccessMsg(`Excel loaded successfully! Auto-filled marksheet details for ${filledCount} student(s).`);
        } else {
          setErrorMsg('Excel file processed, but no matching student marksheet records were updated. Check Roll No or Student Names in Excel.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Error reading Excel file. Please upload a valid .xlsx or .xls file.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const targetList = rows.length > 0 ? rows : students;
    const currentExam = exams.find((e) => e.examId === Number(selectedExamId));

    const templateData = targetList.map((st: any) => ({
      'Roll No': st.rollNumber || '',
      'Student Name': st.studentName || '',
      'Admission No': st.admissionNumber || students.find((s) => s.studentId === st.studentId)?.admissionNumber || '',
      'Marksheet File Name': `${(st.studentName || 'student').replace(/\s+/g, '_')}_Marksheet.pdf`,
      'Exam Name': currentExam ? currentExam.examName : exams.length > 0 ? exams[0].examName : 'Monthly Test',
    }));

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Marksheets');
    XLSX.writeFile(workbook, 'Student_Marksheets_Template.xlsx');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedExamId) {
      setErrorMsg('Please select an Exam');
      return;
    }

    const filledRows = rows.filter((r) => r.fileName && r.fileName.trim() !== '');
    if (filledRows.length === 0) {
      setErrorMsg('Please upload or specify at least one marksheet file');
      return;
    }

    // Client-side duplicate check
    for (const r of filledRows) {
      const duplicate = existingMarksheets.find(
        (m) => m.studentId === r.studentId && m.examId === Number(selectedExamId)
      );
      if (duplicate) {
        setErrorMsg(`Duplicate Upload Error: Student '${r.studentName}' already has a marksheet uploaded for this exam!`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = filledRows.map((r) => ({
        studentId: r.studentId,
        examId: Number(selectedExamId),
        batchId: selectedBatchId !== '' ? Number(selectedBatchId) : undefined,
        fileName: r.fileName.trim(),
        fileUrl: r.fileUrl || `/uploads/marksheets/${r.fileName.trim()}`,
        admissionType: 'Academy',
      }));

      await axiosInstance.post('/marksheets/bulk', payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to upload bulk marksheets');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Marksheet Upload">
      <form onSubmit={handleSubmit}>
        {errorMsg && (
          <div style={{ color: 'var(--danger)', background: '#fff5f5', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13, border: '1px solid #feb2b2' }}>
            <i className="ti ti-alert-circle" style={{ marginRight: 6 }}></i>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ color: '#15803d', background: '#f0fdf4', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13, border: '1px solid #bbf7d0' }}>
            <i className="ti ti-check" style={{ marginRight: 6 }}></i>
            {successMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">
              Select Exam <span className="required-asterisk">*</span>
            </label>
            <select
              className="form-control"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : '')}
              required
            >
              <option value="">-- Select Exam --</option>
              {exams.map((ex) => (
                <option key={ex.examId} value={ex.examId}>
                  {ex.examName} ({ex.examType || 'Exam'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Batch / Course</label>
            <select
              className="form-control"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Excel Import Box */}
        <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ backgroundColor: '#dcfce7', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-file-spreadsheet" style={{ fontSize: 20, color: '#16a34a' }}></i>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#14532d' }}>Upload Student Marksheet Details via Excel</div>
                <div style={{ fontSize: 11, color: '#166534' }}>Upload Excel (.xlsx, .xls) to auto-fill all student marksheets at once</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDownloadTemplate}
                style={{ fontSize: 12, padding: '5px 10px', height: 32, display: 'inline-flex', alignItems: 'center' }}
                title="Download Excel template pre-populated with registered students"
              >
                <i className="ti ti-download" style={{ marginRight: 4 }}></i>Download Template
              </button>
              <label
                className="btn"
                style={{
                  fontSize: 12,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 32,
                  fontWeight: 500,
                }}
              >
                <i className="ti ti-upload" style={{ marginRight: 4 }}></i>Upload Excel File
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  style={{ display: 'none' }}
                  onChange={handleExcelUpload}
                />
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>
          Map Student Marksheets ({rows.length} Students)
        </div>

        <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, marginBottom: 20 }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: 8 }}>Roll No.</th>
                <th style={{ padding: 8 }}>Student Name</th>
                <th style={{ padding: 8 }}>Marksheet File Name / Upload</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 8, fontWeight: 600, color: 'var(--primary)' }}>{row.rollNumber || '-'}</td>
                  <td style={{ padding: 8, fontWeight: 500 }}>{row.studentName}</td>
                  <td style={{ padding: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Marksheet file name (e.g. Rahul_Maths.pdf)"
                        value={row.fileName}
                        onChange={(e) => handleFileNameChange(idx, e.target.value)}
                        style={{ fontSize: 12, height: 32 }}
                      />
                      <input
                        type="file"
                        id={`file-input-${row.studentId}`}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(idx, e.target.files[0]);
                        }}
                      />
                      <label
                        htmlFor={`file-input-${row.studentId}`}
                        className="btn btn-secondary"
                        style={{ fontSize: 11, padding: '4px 8px', cursor: 'pointer', whiteSpace: 'nowrap', height: 32, display: 'flex', alignItems: 'center' }}
                      >
                        <i className="ti ti-upload" style={{ marginRight: 4 }}></i>Browse
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Uploading Bulk Marksheets...' : 'Save All Records'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
