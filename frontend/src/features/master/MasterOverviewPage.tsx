import React from 'react';
import { useNavigate } from 'react-router-dom';

export const MasterOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const masters = [
    { title: 'Employee master', desc: 'Employee name, DOB, designation, shift', icon: 'ti-id', route: '/masters/employee' },
    { title: 'User master', desc: 'Link employee, select role, credentials', icon: 'ti-user-cog', route: '/masters/user' },
    { title: 'Academy master', desc: 'Academy name, branch, address, contact details', icon: 'ti-building', route: '/masters/academy' },
    { title: 'Library plan master', desc: 'Plan name, duration, fees, description', icon: 'ti-books', route: '/masters/library-plan' },
    { title: 'Course master', desc: 'Course name, duration, fees, description', icon: 'ti-notebook', route: '/masters/course' },
    { title: 'Batch master', desc: 'Batch name, faculty, timing, capacity', icon: 'ti-users-group', route: '/masters/batch' },
    { title: 'Exam master', desc: 'Unit, weekly, monthly, final, scholarship, custom', icon: 'ti-clipboard-text', route: '/masters/exam' },
    { title: 'Inquiry source master', desc: 'Walk-in, website, social, referral, WhatsApp', icon: 'ti-route', route: '/masters/inquiry-source' },
    { title: 'Fee structure master', desc: 'Academy/library plans, installments, discounts', icon: 'ti-receipt', route: '/masters/fee-structure' },
    { title: 'Blood group master', desc: 'Blood group options and management', icon: 'ti-droplet', route: '/masters/blood-group' },
  ];

  return (
    <div>
      <div className="section-title">
        <span>Master Management</span>
      </div>
      <div className="grid-3">
        {masters.map((m, idx) => (
          <div
            key={idx}
            className="master-card"
            onClick={() => navigate(m.route)}
            style={{ cursor: 'pointer' }}
          >
            <div className="master-card-top">
              <div className="master-card-icon">
                <i className={`ti ${m.icon}`}></i>
              </div>
              <h4>{m.title}</h4>
            </div>
            <p>{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
