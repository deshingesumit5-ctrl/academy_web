import React, { useState } from 'react';
import axiosInstance from '../../config/axiosInstance';

export const WhatsappPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [targetBatch, setTargetBatch] = useState('All students');
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setSending(true);
    setStatusMsg('');
    try {
      await axiosInstance.post('/whatsapp/send-bulk', {
        targetBatch,
        message,
      });
      setStatusMsg('Bulk WhatsApp broadcast initiated successfully!');
      setMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="section-title">
        <span>WhatsApp Integration</span>
      </div>

      <div className="two-col">
        <div className="card card-pad">
          <strong style={{ fontSize: '14px' }}>Message Templates</strong>
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13.5px' }}>Fee reminder</span>
              <span className="badge badge-green">Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13.5px' }}>Payment receipt</span>
              <span className="badge badge-green">Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13.5px' }}>Attendance alert</span>
              <span className="badge badge-green">Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <span style={{ fontSize: '13.5px' }}>Admission confirmation</span>
              <span className="badge badge-gray">Draft</span>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <strong style={{ fontSize: '14px' }}>Send Bulk Message</strong>

          {statusMsg && (
            <div className="badge badge-green" style={{ width: '100%', padding: '8px 12px', marginTop: '10px' }}>
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <div className="form-field">
              <label>Select Target Batch</label>
              <select value={targetBatch} onChange={(e) => setTargetBatch(e.target.value)}>
                <option value="All students">All Students</option>
                <option value="Morning batch">Morning Batch</option>
                <option value="Evening batch">Evening Batch</option>
              </select>
            </div>

            <div className="form-field">
              <label>Message Content</label>
              <textarea
                rows={4}
                placeholder="Type your WhatsApp notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={sending}
            >
              <i className="ti ti-send"></i>
              {sending ? 'Sending Broadcast...' : 'Send Broadcast Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
