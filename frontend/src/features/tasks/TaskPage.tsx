import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { Modal } from '../../components/Modal';
import { validateRequired, FieldError } from '../../validations';
import { getUsers } from '../master/user/api/userMasterApi';
import type { UserMasterDto } from '../master/user/api/userMasterApi';
import { useAuth } from '../../auth/AuthContext';
import { getCachedData } from '../../config/apiCache';

import { isUserAdmin, isTaskAssignedToUser } from '../../utils/taskUtils';

interface Task {
  taskId: number;
  taskTitle: string;
  taskType: string;
  description: string;
  assignedTo: string;
  priority: string;
  dueDate: string;
  status: string;
  sendViaWhatsApp?: boolean;
  recurrenceType?: string;
  recurrenceDay?: string;
  recurrenceDate?: number;
}

export const TaskPage: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const cachedTasks = getCachedData('/tasks');
  const [tasks, setTasks] = useState<Task[]>(cachedTasks?.data || []);
  const [users, setUsers] = useState<UserMasterDto[]>([]);
  const [loading, setLoading] = useState(tasks.length === 0);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('Daily');
  const [description, setDescription] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [priority, setPriority] = useState('High');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Pending');
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('ONE_TIME');
  const [recurrenceDay, setRecurrenceDay] = useState('Monday');
  const [recurrenceDate, setRecurrenceDate] = useState<number>(1);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Edit Status State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editStatus, setEditStatus] = useState<string>('Pending');
  const [editDescription, setEditDescription] = useState<string>('');
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
      const userTasks = tasks.filter((t) => isTaskAssignedToUser(t, user));
      const key = `seen_tasks_${user.username || user.userId || 'user'}`;
      const existing: number[] = JSON.parse(localStorage.getItem(key) || '[]');
      const newIds = userTasks.map((t) => t.taskId);
      const combined = Array.from(new Set([...existing, ...newIds]));
      localStorage.setItem(key, JSON.stringify(combined));
      window.dispatchEvent(new Event('tasks_read'));
    }
  }, [tasks, user]);

  const handleEmployeeToggle = (empName: string) => {
    if (selectedEmployees.includes(empName)) {
      setSelectedEmployees(selectedEmployees.filter((name) => name !== empName));
    } else {
      setSelectedEmployees([...selectedEmployees, empName]);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const titleErr = validateRequired(taskTitle);
    if (titleErr) errors.taskTitle = titleErr;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const assignedToStr = selectedEmployees.length > 0 ? selectedEmployees.join(', ') : 'Office Admin';

      await axiosInstance.post('/tasks', {
        taskTitle: taskTitle.trim(),
        taskType,
        description: description.trim(),
        assignedTo: assignedToStr,
        priority,
        dueDate,
        status,
        sendViaWhatsApp,
        recurrenceType,
        recurrenceDay: recurrenceType === 'WEEKLY' ? recurrenceDay : undefined,
        recurrenceDate: recurrenceType === 'MONTHLY' ? recurrenceDate : undefined,
      });

      // Reset form
      setModalOpen(false);
      setTaskTitle('');
      setDescription('');
      setSelectedEmployees([]);
      setSendViaWhatsApp(false);
      setRecurrenceType('ONE_TIME');
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
        description: editDescription,
      });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const isAdmin = isUserAdmin(user, isSuperAdmin);

  const displayedTasks = isAdmin
    ? tasks
    : tasks.filter((t) => isTaskAssignedToUser(t, user));

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
                  <th>Type & Recurrence</th>
                  <th>Assigned To</th>
                  <th>WhatsApp</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedTasks.map((t) => (
                  <tr key={t.taskId}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.taskTitle}</div>
                      {t.description && <div style={{ fontSize: '11.5px', color: '#718096' }}>{t.description}</div>}
                    </td>
                    <td>
                      <div>{t.taskType}</div>
                      {t.recurrenceType && t.recurrenceType !== 'ONE_TIME' && (
                        <span className="badge badge-blue" style={{ fontSize: 10, marginTop: 2 }}>
                          {t.recurrenceType === 'WEEKLY' ? `Weekly (${t.recurrenceDay || 'Mon'})` : t.recurrenceType === 'MONTHLY' ? `Monthly (${t.recurrenceDate || 1}th)` : 'Daily'}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(t.assignedTo || 'Office Admin').split(', ').map((emp, i) => (
                          <span key={i} className="badge badge-secondary" style={{ fontSize: 11 }}>
                            <i className="ti ti-user" style={{ marginRight: 3 }}></i>{emp}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {t.sendViaWhatsApp ? (
                        <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <i className="ti ti-brand-whatsapp"></i>Enabled
                        </span>
                      ) : (
                        <span style={{ color: '#a0aec0', fontSize: 12 }}>Off</span>
                      )}
                    </td>
                    <td>{t.dueDate || 'Today'}</td>
                    <td>
                      <span className={`badge ${t.priority === 'High' ? 'badge-red' : t.priority === 'Medium' ? 'badge-amber' : 'badge-gray'}`}>
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
                            alignItems: 'center',
                          }}
                          onClick={() => {
                            setEditingTask(t);
                            setEditStatus(t.status || 'Pending');
                            setEditDescription(t.description || '');
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

      {/* New Task Modal */}
      <Modal isOpen={modalOpen} title="Create New Task" onClose={() => setModalOpen(false)}>
        <form noValidate onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-field">
            <label>Task Title <span className="required-asterisk">*</span></label>
            <input
              className={fieldErrors.taskTitle ? 'input-error' : ''}
              placeholder="e.g. Call pending fee students / Verify batch marks"
              value={taskTitle}
              onChange={(e) => {
                setTaskTitle(e.target.value);
                if (fieldErrors.taskTitle) setFieldErrors((prev) => ({ ...prev, taskTitle: '' }));
              }}
            />
            <FieldError error={fieldErrors.taskTitle} />
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              placeholder="Task instructions and details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Multiple Employee Selection */}
          <div className="form-field">
            <label>Assign to Multiple Employees</label>
            <div style={{ maxHeight: 130, overflowY: 'auto', border: '1px solid #cbd5e0', borderRadius: 6, padding: 8, background: '#fff' }}>
              {users.length === 0 ? (
                <div style={{ fontSize: 12, color: '#a0aec0' }}>No employees found</div>
              ) : (
                users.map((u) => {
                  const empName = u.employeeName || u.email;
                  const isChecked = selectedEmployees.includes(empName);
                  return (
                    <label key={u.userId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', cursor: 'pointer', fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleEmployeeToggle(empName)}
                      />
                      <span>{empName} {u.roleName ? `(${u.roleName})` : ''}</span>
                    </label>
                  );
                })
              )}
            </div>
            {selectedEmployees.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4 }}>
                Selected: {selectedEmployees.join(', ')}
              </div>
            )}
          </div>

          {/* Recurrence Schedule */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label>Recurrence Option</label>
              <select value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)}>
                <option value="ONE_TIME">One-Time</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            {recurrenceType === 'WEEKLY' && (
              <div className="form-field">
                <label>Select Day</label>
                <select value={recurrenceDay} onChange={(e) => setRecurrenceDay(e.target.value)}>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
            )}

            {recurrenceType === 'MONTHLY' && (
              <div className="form-field">
                <label>Select Date (1-31)</label>
                <select value={recurrenceDate} onChange={(e) => setRecurrenceDate(Number(e.target.value))}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'} of month</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* WhatsApp Notification Checkbox */}
          <div style={{ background: '#f0fdf4', padding: 10, borderRadius: 6, border: '1px solid #bbf7d0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#166534', margin: 0 }}>
              <input
                type="checkbox"
                checked={sendViaWhatsApp}
                onChange={(e) => setSendViaWhatsApp(e.target.checked)}
              />
              <i className="ti ti-brand-whatsapp" style={{ fontSize: 18 }}></i>
              Send Task Notification via WhatsApp
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
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
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
            <button type="button" className="btn" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Task...' : 'Create & Assign Task'}
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
            <div className="form-field">
              <label>Description</label>
              <textarea
                placeholder="Task details"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
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
