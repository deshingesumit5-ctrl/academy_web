import React, { useState, useEffect } from 'react';
import { getInquirySources, createInquirySource, updateInquirySource, deleteInquirySource } from './api/inquirySourceApi';
import type { InquirySourceDto } from './api/inquirySourceApi';
import { InquirySourceFormModal } from './components/InquirySourceFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

export const InquirySourcePage: React.FC = () => {
  const [sources, setSources] = useState<InquirySourceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InquirySourceDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const data = await getInquirySources();
      setSources(data || []);
    } catch (err) {
      console.error(err);
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: InquirySourceDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: InquirySourceDto) => {
    if (editingItem && editingItem.sourceId) {
      await updateInquirySource(editingItem.sourceId, data);
    } else {
      await createInquirySource(data);
    }
    await fetchSources();
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteInquirySource(deletingId);
        await fetchSources();
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
          <i className="ti ti-plus"></i>Add Inquiry Source
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Loading inquiry sources...</div>
        ) : sources.length === 0 ? (
          <div className="empty">
            <i className="ti ti-route"></i>
            <div>No inquiry sources added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Source Name</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((item, index) => (
                  <tr key={item.sourceId}>
                    <td>{index + 1}</td>
                    <td>{item.sourceName}</td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.sourceId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InquirySourceFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Inquiry Source"
        message="Do you want to delete this Inquiry Source? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
