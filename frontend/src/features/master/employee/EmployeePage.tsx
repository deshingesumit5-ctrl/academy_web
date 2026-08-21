import React, { useState, useEffect } from 'react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from './api/employeeApi';
import type { EmployeeDto } from './api/employeeApi';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

import { getCachedData } from '../../../config/apiCache';

export const EmployeePage: React.FC = () => {
  const cached = getCachedData('/employees');
  const [employees, setEmployees] = useState<EmployeeDto[]>(cached?.data || []);
  const [loading, setLoading] = useState(employees.length === 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeeDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchEmployees = async (showLoading = employees.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(employees.length === 0);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: EmployeeDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: EmployeeDto) => {
    if (editingItem && editingItem.employeeId) {
      await updateEmployee(editingItem.employeeId, data);
    } else {
      await createEmployee(data);
    }
    await fetchEmployees(false);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteEmployee(deletingId);
        await fetchEmployees(false);
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
          <i className="ti ti-plus"></i>Add Employee
        </button>
      </div>

      <div className="card">
        {employees.length === 0 && !loading ? (
          <div className="empty">
            <i className="ti ti-user-id"></i>
            <div>No employees added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee Name</th>
                  <th>Designation</th>
                  <th>Mobile</th>
                  <th>Email ID</th>
                  <th>Blood Group</th>
                  <th>Shift</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((item, index) => (
                  <tr key={item.employeeId}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>{item.employeeName}</td>
                    <td>{item.designation || '-'}</td>
                    <td>{item.mobileNumber}</td>
                    <td>{item.emailId || '-'}</td>
                    <td>{item.bloodGroup ? <span className="badge badge-blue">{item.bloodGroup}</span> : '-'}</td>
                    <td>{item.shift || '-'}</td>
                    <td>
                      <span className={`badge ${item.status === 'Inactive' ? 'badge-red' : 'badge-green'}`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.employeeId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Employee"
        message="Do you want to delete this Employee? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
