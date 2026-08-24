import React, { useState, useEffect } from 'react';
import { getKitSizes, createKitSize, updateKitSize, deleteKitSize } from './api/kitSizeApi';
import type { KitSizeDto } from './api/kitSizeApi';
import { KitSizeFormModal } from './components/KitSizeFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

export const KitSizePage: React.FC = () => {
  const [kitSizes, setKitSizes] = useState<KitSizeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KitSizeDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchKitSizes = async () => {
    setLoading(true);
    try {
      const data = await getKitSizes();
      setKitSizes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitSizes();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: KitSizeDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: KitSizeDto) => {
    if (editingItem && editingItem.kitSizeId) {
      await updateKitSize(editingItem.kitSizeId, data);
    } else {
      await createKitSize(data);
    }
    await fetchKitSizes();
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteKitSize(deletingId);
        await fetchKitSizes();
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
          <i className="ti ti-plus"></i>Add Kit Size
        </button>
      </div>

      <div className="card">
        {kitSizes.length === 0 && !loading ? (
          <div className="empty">
            <i className="ti ti-shirt"></i>
            <div>No kit sizes added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kit Size</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kitSizes.map((item, index) => (
                  <tr key={item.kitSizeId}>
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
                        onDelete={() => setDeletingId(item.kitSizeId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <KitSizeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Kit Size"
        message="Do you want to delete this Kit Size? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
