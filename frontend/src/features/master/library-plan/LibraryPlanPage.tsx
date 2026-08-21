import React, { useState, useEffect } from 'react';
import { getLibraryPlans, createLibraryPlan, updateLibraryPlan, deleteLibraryPlan } from './api/libraryPlanApi';
import type { LibraryPlanDto } from './api/libraryPlanApi';
import { LibraryPlanFormModal } from './components/LibraryPlanFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

import { getCachedData } from '../../../config/apiCache';

export const LibraryPlanPage: React.FC = () => {
  const cached = getCachedData('/library-plans');
  const [plans, setPlans] = useState<LibraryPlanDto[]>(cached?.data || []);
  const [loading, setLoading] = useState(plans.length === 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryPlanDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPlans = async (showLoading = plans.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getLibraryPlans();
      setPlans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans(plans.length === 0);
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
    await fetchPlans(false);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteLibraryPlan(deletingId);
        await fetchPlans(false);
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
        {plans.length === 0 && !loading ? (
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
