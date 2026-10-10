import React, { useState, useEffect } from 'react';
import { getCastes, createCaste, updateCaste, deleteCaste } from './api/casteApi';
import type { CasteDto } from './api/casteApi';
import { CasteFormModal } from './components/CasteFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

export const CastePage: React.FC = () => {
  const [castes, setCastes] = useState<CasteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    const id = editingItem?.id || editingItem?.casteId;
    if (id) {
      await updateCaste(id, data);
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

  const filtered = castes.filter((c) => {
    const term = search.toLowerCase();
    const name = (c.casteName || c.name || '').toLowerCase();
    const marathi = (c.casteNameMarathi || '').toLowerCase();
    const cat = (c.categoryCode || '').toLowerCase();
    return !search || name.includes(term) || marathi.includes(term) || cat.includes(term);
  });

  return (
    <div>
      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search caste or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', height: '38px', borderRadius: '6px' }}
          />
          <i className="ti ti-search" style={{ position: 'absolute', left: '10px', top: '11px', color: '#a0aec0' }} />
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <i className="ti ti-plus"></i>Add Caste
        </button>
      </div>

      <div className="card">
        {filtered.length === 0 && !loading ? (
          <div className="empty">
            <i className="ti ti-category"></i>
            <div>{search ? 'No matching castes found' : 'No castes added yet'}</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Caste Name (English)</th>
                  <th>Marathi Name</th>
                  <th>Default Category</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr key={item.id || item.casteId || index}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>{item.casteName || item.name}</td>
                    <td>{item.casteNameMarathi || '—'}</td>
                    <td>
                      {item.categoryCode ? (
                        <span style={{ fontWeight: 600, color: '#2b6cb0', background: '#ebf8ff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {item.categoryCode}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId((item.id || item.casteId)!)}
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
