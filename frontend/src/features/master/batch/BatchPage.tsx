import React, { useState, useEffect } from 'react';
import { getBatches, createBatch, updateBatch, deleteBatch } from './api/batchApi';
import type { BatchDto } from './api/batchApi';
import { BatchFormModal } from './components/BatchFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

import { getCachedData } from '../../../config/apiCache';

export const BatchPage: React.FC = () => {
  const cached = getCachedData('/batches');
  const [batches, setBatches] = useState<BatchDto[]>(cached?.data || []);
  const [loading, setLoading] = useState(batches.length === 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BatchDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchBatches = async (showLoading = batches.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getBatches();
      setBatches(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches(batches.length === 0);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: BatchDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: BatchDto) => {
    if (editingItem && editingItem.batchId) {
      await updateBatch(editingItem.batchId, data);
    } else {
      await createBatch(data);
    }
    await fetchBatches(false);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteBatch(deletingId);
        await fetchBatches(false);
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
          <i className="ti ti-plus"></i>Add Batch
        </button>
      </div>

      <div className="card">
        {batches.length === 0 && !loading ? (
          <div className="empty">
            <i className="ti ti-users-group"></i>
            <div>No batches added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Batch Name</th>
                  <th>Faculty</th>
                  <th>Batch Timing</th>
                  <th>Capacity</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((item, index) => (
                  <tr key={item.batchId}>
                    <td>{index + 1}</td>
                    <td>{item.batchName}</td>
                    <td>{item.faculty}</td>
                    <td>{item.batchTiming}</td>
                    <td>{item.capacity || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.batchId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BatchFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Batch"
        message="Do you want to delete this Batch? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
