import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { Modal } from '../../components/Modal';
import { validateRequired, FieldError } from '../../validations';
import { getUsers } from '../master/user/api/userMasterApi';
import type { UserMasterDto } from '../master/user/api/userMasterApi';
import { useAuth } from '../../auth/AuthContext';

interface Task {
  taskId: number;
  taskTitle: string;
  taskType: string;
  description: string;
  assignedTo: string;
  priority: string;
  dueDate: string;
  status: string;
}

import { getCachedData } from '../../config/apiCache';

export const TaskPage: React.FC = () => {
  const { user, isSuperAdmin, hasPermission } = useAuth();
  const cachedTasks = getCachedData('/tasks');
  const [tasks, setTasks] = useState<Task[]>(cachedTasks?.data || []);
  const [users, setUsers] = useState<UserMasterDto[]>([]);
  const [loading, setLoading] = useState(tasks.length === 0);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('Daily');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('High');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Pending');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Edit Status State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editStatus, setEditStatus] = useState<string>('Pending');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const fetchTasks = async (showLoading = tasks.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axiosInstance.get('/tasks');
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  // Mark assigned tasks as seen when user visits TaskPage
  useEffect(() => {
    if (tasks.length > 0 && user) {
      const userFull = (user.fullName || '').trim().toLowerCase();
      const userEmail = (user.username || '').trim().toLowerCase();
      const userTasks = isSuperAdmin()
        ? tasks
        : tasks.filter((t) => {
            const assigned = (t.assignedTo || '').trim().toLowerCase();
            return (userFull && assigned === userFull) || (userEmail && assigned === userEmail);
          });

      const key = `seen_tasks_${user.username || 'user'}`;
      const existing: number[] = JSON.parse(localStorage.getItem(key) || '[]');
      const newIds = userTasks.map((t) => t.taskId);
      const combined = Array.from(new Set([...existing, ...newIds]));
      localStorage.setItem(key, JSON.stringify(combined));
      window.dispatchEvent(new Event('tasks_read'));
    }
  }, [tasks, user]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const titleErr = validateRequired(taskTitle);
    if (titleErr) errors.taskTitle = titleErr;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await axiosInstance.post('/tasks', {
        taskTitle,
        taskType,
        description,
        assignedTo,
        priority,
        dueDate,
        status,
      });
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTaskStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setUpdatingStatus(true);
    try {
      await axiosInstance.put(`/tasks/${editingTask.taskId}`, {
        ...editingTask,
        status: editStatus,
      });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const roleUpper = (user?.role || '').toUpperCase();
  const isEmployeeOrUser = roleUpper === 'USER' || roleUpper.includes('EMPLOYEE');
  const isAdmin = (isSuperAdmin() || roleUpper.includes('ADMIN') || hasPermission('Tasks', 'Create')) && !isEmployeeOrUser;

  const displayedTasks = isSuperAdmin()
    ? tasks
    : tasks.filter((t) => {
        if (!user) return false;
        const assigned = (t.assignedTo || '').trim().toLowerCase();
        const userFull = (user.fullName || '').trim().toLowerCase();
        const userEmail = (user.username || '').trim().toLowerCase();
        return (userFull && assigned === userFull) || (userEmail && assigned === userEmail);
      });

  return (
    <div>
      {isAdmin && (
        <div className="section-title">
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <i className="ti ti-plus"></i>New Task
          </button>
        </div>
      )}

      <div className="card">
        {displayedTasks.length === 0 && !loading ? (
          <div className="empty">
            <i className="ti ti-checklist"></i>
            <div>No tasks assigned</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Type</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedTasks.map((t) => (
                  <tr key={t.taskId}>
                    <td>
                      <div>{t.taskTitle}</div>
                      {t.description && <div style={{ fontSize: '11.5px', color: '#718096' }}>{t.description}</div>}
                    </td>
                    <td>{t.taskType}</td>
                    <td>{t.assignedTo || 'Office Admin'}</td>
                    <td>{t.dueDate || 'Today'}</td>
                    <td>
                      <span
                        className={`badge ${
                          t.priority === 'High' ? 'badge-red' : t.priority === 'Medium' ? 'badge-amber' : 'badge-gray'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${t.status === 'Done' ? 'badge-green' : t.status === 'Scheduled' ? 'badge-blue' : 'badge-amber'}`}>
                          {t.status}
                        </span>
                        <button
                          type="button"
                          title="Edit Status"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--accent)',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          onClick={() => {
                            setEditingTask(t);
                            setEditStatus(t.status || 'Pending');
                          }}
                        >
                          <i className="ti ti-pencil" style={{ fontSize: '14px' }}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} title="New Task" onClose={() => setModalOpen(false)}>
        <form noValidate onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-field">
            <label>Task Title <span className="required-asterisk">*</span></label>
            <input
              className={fieldErrors.taskTitle ? 'input-error' : ''}
              placeholder="e.g. Call pending fee students"
              value={taskTitle}
              onChange={(e) => {
                setTaskTitle(e.target.value);
                if (fieldErrors.taskTitle) setFieldErrors((prev) => ({ ...prev, taskTitle: '' }));
              }}
            />
            <FieldError error={fieldErrors.taskTitle} />
          </div>

          <div className="form-field">
            <label>Task Type</label>
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
              <option value="Daily">Daily Task</option>
              <option value="One-Time">One-Time Task</option>
              <option value="Meeting">Meeting Task</option>
              <option value="Personal">Personal Task</option>
            </select>
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              placeholder="Task details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Assigned To</label>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">-- Select User --</option>
              {users.map((u) => {
                const name = u.employeeName || u.email;
                return (
                  <option key={u.userId} value={name}>
                    {u.roleName ? `${name} (${u.roleName})` : name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-field">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="form-field">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
            <button type="button" className="btn" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Save Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Status Modal */}
      <Modal isOpen={!!editingTask} title="Update Task Status" onClose={() => setEditingTask(null)}>
        {editingTask && (
          <form onSubmit={handleUpdateTaskStatus} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-field">
              <label style={{ fontSize: '13.5px', color: 'var(--slate)' }}>
                Task Title: <strong style={{ color: 'var(--navy)' }}>{editingTask.taskTitle}</strong>
              </label>
            </div>
            <div className="form-field">
              <label>Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
            <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
              <button type="button" className="btn" onClick={() => setEditingTask(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={updatingStatus}>
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
