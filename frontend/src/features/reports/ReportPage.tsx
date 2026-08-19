import React from 'react';

export const ReportPage: React.FC = () => {
  const reports = [
    { title: 'Student reports', desc: 'Student list, admission, batch-wise', icon: 'ti-users' },
    { title: 'Attendance reports', desc: 'Daily, monthly, student-wise, batch-wise', icon: 'ti-calendar-check' },
    { title: 'Fee reports', desc: 'Collection, pending, installment, dues', icon: 'ti-cash' },
    { title: 'Inquiry reports', desc: 'Source-wise, conversion report', icon: 'ti-phone-call' },
    { title: 'Follow-up reports', desc: 'Pending, completed, missed', icon: 'ti-calendar-time' },
    { title: 'Task reports', desc: 'Pending, completed, overdue', icon: 'ti-checklist' },
  ];

  return (
    <div>
      <div className="section-title">
        <span>Reports & Analytics</span>
      </div>

      <div className="grid-3">
        {reports.map((r, i) => (
          <div key={i} className="master-card" style={{ cursor: 'pointer' }}>
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
