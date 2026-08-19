import React, { useState, useEffect } from 'react';
import { getExams, createExam, updateExam, deleteExam } from './api/examApi';
import type { ExamDto } from './api/examApi';
import { ExamFormModal } from './components/ExamFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

export const ExamPage: React.FC = () => {
  const [exams, setExams] = useState<ExamDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExamDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await getExams();
      setExams(data || []);
    } catch (err) {
      console.error(err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ExamDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: ExamDto) => {
    if (editingItem && editingItem.examId) {
      await updateExam(editingItem.examId, data);
    } else {
      await createExam(data);
    }
    await fetchExams();
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteExam(deletingId);
        await fetchExams();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div>
      <div className="section-title">
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <i className="ti ti-plus"></i>Add Exam
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="empty">
            <i className="ti ti-clipboard-text"></i>
            <div>No exams added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Exam Name</th>
                  <th>Exam Type</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((item, index) => (
                  <tr key={item.examId}>
                    <td>{index + 1}</td>
                    <td>{item.examName}</td>
                    <td><span className="badge badge-blue">{item.examType}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.examId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExamFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Exam"
        message="Do you want to delete this Exam? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
