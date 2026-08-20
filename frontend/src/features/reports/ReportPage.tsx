import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();

  const reports = [
    { id: 'student', title: 'Student reports', desc: 'Student list, admission, batch-wise', icon: 'ti-users' },
    { id: 'attendance', title: 'Attendance reports', desc: 'Daily, monthly, student-wise, batch-wise', icon: 'ti-calendar-check' },
    { id: 'fee', title: 'Fee reports', desc: 'Collection, pending, installment, dues', icon: 'ti-cash' },
    { id: 'inquiry', title: 'Inquiry reports', desc: 'Source-wise, conversion report', icon: 'ti-phone-call' },
    { id: 'follow-up', title: 'Follow-up reports', desc: 'Pending, completed, missed', icon: 'ti-calendar-time' },
    { id: 'task', title: 'Task reports', desc: 'Pending, completed, overdue', icon: 'ti-checklist' },
  ];

  return (
    <div>

      <div className="grid-3">
        {reports.map((r) => (
          <div
            key={r.id}
            className="master-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/reports/${r.id}`)}
          >
            <div className="master-card-top">
              <div className="master-card-icon">
                <i className={`ti ${r.icon}`}></i>
              </div>
              <h4>{r.title}</h4>
            </div>
            <p>{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
