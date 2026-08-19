import React, { useState, useEffect } from 'react';
import { getLibraryPlans, createLibraryPlan, updateLibraryPlan, deleteLibraryPlan } from './api/libraryPlanApi';
import type { LibraryPlanDto } from './api/libraryPlanApi';
import { LibraryPlanFormModal } from './components/LibraryPlanFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

export const LibraryPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<LibraryPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryPlanDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await getLibraryPlans();
      setPlans(data || []);
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: LibraryPlanDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: LibraryPlanDto) => {
    if (editingItem && editingItem.planId) {
      await updateLibraryPlan(editingItem.planId, data);
    } else {
      await createLibraryPlan(data);
    }
    await fetchPlans();
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteLibraryPlan(deletingId);
        await fetchPlans();
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
          <i className="ti ti-plus"></i>Add Library Plan
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Loading library plans...</div>
        ) : plans.length === 0 ? (
          <div className="empty">
            <i className="ti ti-books"></i>
            <div>No library plans added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plan Name</th>
                  <th>Duration</th>
                  <th>Fees</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((item, index) => (
                  <tr key={item.planId}>
                    <td>{index + 1}</td>
                    <td>{item.planName}</td>
                    <td>{item.duration}</td>
                    <td>₹{item.fees}</td>
                    <td>{item.description}</td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.planId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LibraryPlanFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Library Plan"
        message="Do you want to delete this Library Plan? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
