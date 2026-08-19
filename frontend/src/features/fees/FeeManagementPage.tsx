import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { Modal } from '../../components/Modal';

interface Payment {
  paymentId: number;
  studentId: number;
  studentName: string;
  admissionNumber: string;
  amountPaid: number;
  paymentMode: string;
  paymentType: string;
  paymentDate: string;
  status: string;
}

interface StudentOption {
  studentId: number;
  studentName: string;
  admissionNumber: string;
}

export const FeeManagementPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentType, setPaymentType] = useState('Installment');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/fees');
      setPayments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axiosInstance.get('/students');
      setStudents(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedStudentId(res.data.data[0].studentId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !amountPaid || Number(amountPaid) <= 0) return;
    setSaving(true);
    try {
      await axiosInstance.post('/fees', {
        studentId: Number(selectedStudentId),
        amountPaid: Number(amountPaid),
        paymentMode,
        paymentType,
        remarks,
      });
      setModalOpen(false);
      fetchPayments();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalCollected = payments.reduce((acc, p) => acc + (p.amountPaid || 0), 0);

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-cash"></i>Total Collection</div>
          <div className="stat-value">₹{totalCollected.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-calendar"></i>Payments Recorded</div>
          <div className="stat-value">{payments.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-alert-triangle"></i>Pending Fees</div>
          <div className="stat-value">₹42,000</div>
        </div>
        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-clock-exclamation"></i>Overdue Students</div>
          <div className="stat-value">18</div>
        </div>
      </div>

      <div className="section-title">
        <span>Recent Payments</span>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <i className="ti ti-plus"></i>Collect Fee
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="empty">
            <i className="ti ti-cash"></i>
            <div>No fee payments recorded yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.paymentId}>
                    <td>
                      <strong>{p.studentName}</strong>
                      <div style={{ fontSize: '11.5px', color: '#718096' }}>{p.admissionNumber}</div>
                    </td>
                    <td><strong>₹{p.amountPaid}</strong></td>
                    <td>{p.paymentMode}</td>
                    <td>{p.paymentType}</td>
                    <td>{p.paymentDate}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === 'Paid' ? 'badge-green' : p.status === 'Partial' ? 'badge-amber' : 'badge-red'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} title="Collect Fee Payment" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-field">
            <label>Select Student <span className="required-asterisk">*</span></label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              required
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentName} ({s.admissionNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Amount Paid (₹) <span className="required-asterisk">*</span></label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          <div className="form-field">
            <label>Payment Mode</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Credit/Debit Card">Credit/Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="form-field">
            <label>Payment Type</label>
            <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
              <option value="Installment">Installment</option>
              <option value="Full">Full Payment</option>
              <option value="Partial">Partial Payment</option>
            </select>
          </div>

          <div className="form-field">
            <label>Remarks</label>
            <input
              placeholder="e.g. Receipt #1042"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '10px' }}>
            <button type="button" className="btn" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
