import React, { useState, useEffect } from 'react';
import {
  getReligions,
  createReligion,
  updateReligion,
  deleteReligion,
  type ReligionDto,
} from './api/religionApi';
import { ActionButtons } from '../../../components/ActionButtons';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { Modal } from '../../../components/Modal';

export const ReligionPage: React.FC = () => {
  const [religions, setReligions] = useState<ReligionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReligion, setEditingReligion] = useState<ReligionDto | null>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Active');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReligions();
  }, []);

  const fetchReligions = async () => {
    setLoading(true);
    try {
      const data = await getReligions();
      setReligions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingReligion(null);
    setName('');
    setStatus('Active');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ReligionDto) => {
    setEditingReligion(item);
    setName(item.name);
    setStatus(item.status || 'Active');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Religion Name is required');
      return;
    }
    try {
      if (editingReligion && editingReligion.religionId) {
        await updateReligion(editingReligion.religionId, { name: name.trim(), status });
      } else {
        await createReligion({ name: name.trim(), status });
      }
      setModalOpen(false);
      fetchReligions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save religion');
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteReligion(deletingId);
        fetchReligions();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filtered = religions.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0 }}>Religion Master</h3>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <i className="ti ti-plus"></i> Add Religion
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16, width: 250 }}>
          <input
            type="text"
            placeholder="Search religion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div>Loading religions...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No religions found</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Religion Name</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.religionId}>
                    <td>{item.religionId}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>
                      <span className={`badge ${item.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.religionId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title={editingReligion ? 'Edit Religion' : 'Add Religion'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave}>
          {error && <div style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</div>}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Religion Name <span className="required-asterisk">*</span></label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hindu, Muslim, Christian"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Religion"
        message="Are you sure you want to delete this religion master option?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
