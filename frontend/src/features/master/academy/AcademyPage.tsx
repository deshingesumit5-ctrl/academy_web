import React, { useState, useEffect } from 'react';
import { getAcademies, createAcademy, updateAcademy, deleteAcademy } from './api/academyApi';
import type { AcademyDto } from './api/academyApi';
import { AcademyFormModal } from './components/AcademyFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

import { getCachedData } from '../../../config/apiCache';

export const AcademyPage: React.FC = () => {
  const cached = getCachedData('/academies');
  const [academies, setAcademies] = useState<AcademyDto[]>(cached?.data || []);
  const [loading, setLoading] = useState(academies.length === 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademyDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAcademies = async (showLoading = academies.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getAcademies();
      setAcademies(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademies(academies.length === 0);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AcademyDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: AcademyDto) => {
    if (editingItem && editingItem.academyId) {
      await updateAcademy(editingItem.academyId, data);
    } else {
      await createAcademy(data);
    }
    await fetchAcademies(false);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteAcademy(deletingId);
        await fetchAcademies(false);
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
          <i className="ti ti-plus"></i>Add Academy
        </button>
      </div>

      <div className="card">
        {academies.length === 0 && !loading ? (
          <div className="empty">
            <i className="ti ti-building"></i>
            <div>No academies added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Academy Name</th>
                  <th>Branch Name</th>
                  <th>Address</th>
                  <th>Contact Details</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {academies.map((item, index) => (
                  <tr key={item.academyId}>
                    <td>{index + 1}</td>
                    <td>{item.academyName}</td>
                    <td>{item.branchName}</td>
                    <td>{item.address}</td>
                    <td>{item.contactNumber}</td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.academyId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AcademyFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Academy"
        message="Do you want to delete this Academy? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
