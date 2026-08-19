import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { Modal } from '../../components/Modal';

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

export const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('Daily');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('Office Admin');
  const [priority, setPriority] = useState('High');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/tasks');
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
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

  return (
    <div>
      <div className="section-title">
        <span>Task Management</span>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <i className="ti ti-plus"></i>New Task
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty">
            <i className="ti ti-checklist"></i>
            <div>No tasks created yet</div>
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
                {tasks.map((t) => (
                  <tr key={t.taskId}>
                    <td>
                      <strong>{t.taskTitle}</strong>
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
                      <span className={`badge ${t.status === 'Done' ? 'badge-green' : 'badge-amber'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} title="New Task" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-field">
            <label>Task Title <span className="required-asterisk">*</span></label>
            <input
              placeholder="e.g. Call pending fee students"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
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
            <input
              placeholder="e.g. Office Admin / Counselor Kiran"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
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
    </div>
  );
};
