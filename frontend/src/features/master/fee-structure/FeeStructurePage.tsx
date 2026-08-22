import React, { useState, useEffect } from 'react';
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
} from './api/feeStructureApi';
import type { FeeStructureDto } from './api/feeStructureApi';
import { FeeStructureFormModal } from './components/FeeStructureFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

import { getCachedData } from '../../../config/apiCache';

export const FeeStructurePage: React.FC = () => {
  const cached = getCachedData('/fee-structures');
  const initialList = Array.isArray(cached?.data)
    ? cached.data
    : (cached?.data?.academyFeePlans && Array.isArray(cached?.data?.academyFeePlans) ? cached.data.academyFeePlans : []);
  const [feeStructures, setFeeStructures] = useState<FeeStructureDto[]>(initialList);
  const [loading, setLoading] = useState(initialList.length === 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeeStructureDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchFeeStructures = async (showLoading = feeStructures.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getFeeStructures();
      const list = Array.isArray(data) ? data : [];
      setFeeStructures(list);
    } catch (err) {
      console.error(err);
      setFeeStructures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeStructures(feeStructures.length === 0);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: FeeStructureDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: FeeStructureDto) => {
    if (editingItem && editingItem.academyFeePlanId) {
      await updateFeeStructure(editingItem.academyFeePlanId, data);
    } else {
      await createFeeStructure(data);
    }
    await fetchFeeStructures(false);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteFeeStructure(deletingId);
        await fetchFeeStructures(false);
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
          <i className="ti ti-plus"></i>Add Fee Structure
        </button>
      </div>

      <div className="card">
        {(!Array.isArray(feeStructures) || feeStructures.length === 0) && !loading ? (
          <div className="empty">
            <i className="ti ti-cash"></i>
            <div>No fee structures added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(feeStructures) ? feeStructures : []).map((item, index) => (
                  <tr key={item.academyFeePlanId || index}>
                    <td>{index + 1}</td>
                    <td>{item.planName}</td>
                    <td>₹{(item.totalFee ?? 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.academyFeePlanId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FeeStructureFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Fee Structure"
        message="Do you want to delete this Fee Structure? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
