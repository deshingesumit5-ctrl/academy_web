import React, { useState, useEffect } from 'react';
import { getCastes, createCaste, updateCaste, deleteCaste } from './api/casteApi';
import type { CasteDto } from './api/casteApi';
import { CasteFormModal } from './components/CasteFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

export const CastePage: React.FC = () => {
  const [castes, setCastes] = useState<CasteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CasteDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCastes = async () => {
    setLoading(true);
    try {
      const data = await getCastes();
      setCastes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCastes();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CasteDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: CasteDto) => {
    if (editingItem && editingItem.casteId) {
      await updateCaste(editingItem.casteId, data);
    } else {
      await createCaste(data);
    }
    await fetchCastes();
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteCaste(deletingId);
        await fetchCastes();
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
          <i className="ti ti-plus"></i>Add Caste
        </button>
      </div>

      <div className="card">
        {castes.length === 0 && !loading ? (
          <div className="empty">
            <i className="ti ti-category"></i>
            <div>No castes added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Caste Name</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {castes.map((item, index) => (
                  <tr key={item.casteId}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>
                      <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.casteId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CasteFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Caste"
        message="Do you want to delete this Caste? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
