import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  attendancePercentage: string;
  attendanceDetails: string;
  todayCollection: number;
  todayPaymentsCount: number;
  pendingFeesAmount: number;
  overdueStudentsCount: number;
  activeStudentsCount: number;
  newStudentsThisMonth: number;
  todayAdmissionsCount?: number;
  monthlyRevenue?: number;
  todaysFollowups: any[];
  todayFollowupsCount?: number;
  upcomingFollowupsCount?: number;
  missedFollowupsCount?: number;
  todaysTasks: any[];
  convertedInquiriesCount?: number;
  openInquiriesCount?: number;
  followupInquiriesCount?: number;
  lostInquiriesCount?: number;
  totalInquiriesCount?: number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [followupFilter, setFollowupFilter] = useState<'all' | 'today' | 'upcoming' | 'missed'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-user-check"></i>Today's attendance</div>
          <div className="stat-value">{loading ? '...' : (stats?.attendancePercentage || '86%')}</div>
          <div className="stat-delta">{stats?.attendanceDetails || '268 of 312 present'}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-currency-rupee"></i>Today's collection</div>
          <div className="stat-value">₹{loading ? '...' : (stats?.todayCollection ? stats.todayCollection.toLocaleString() : '18,400')}</div>
          <div className="stat-delta">{stats?.todayPaymentsCount || 12} payments received</div>
        </div>

        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-alert-triangle"></i>Pending fees</div>
          <div className="stat-value">₹{loading ? '...' : (stats?.pendingFeesAmount ? stats.pendingFeesAmount.toLocaleString() : '42,000')}</div>
          <div className="stat-delta" style={{ color: 'var(--amber)' }}>{stats?.overdueStudentsCount || 18} students overdue</div>
        </div>

        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-users"></i>Active students</div>
          <div className="stat-value">{loading ? '...' : (stats?.activeStudentsCount || 148)}</div>
          <div className="stat-delta">+{stats?.newStudentsThisMonth || 14} this month</div>
        </div>



        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-phone-call"></i>Converted Inquiries</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{loading ? '...' : (stats?.convertedInquiriesCount || 24)}</div>
          <div className="stat-delta" style={{ color: '#2b6cb0' }}>
            {stats?.convertedInquiriesCount || 24} of {stats?.totalInquiriesCount || 45} converted
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-user-plus"></i>Today's Admissions</div>
          <div className="stat-value">{loading ? '...' : (stats?.todayAdmissionsCount || 4)}</div>
          <div className="stat-delta">Admissions today</div>
        </div>

        <div className="stat-card">
          <div className="stat-top"><i className="ti ti-chart-bar"></i>Monthly Revenue</div>
          <div className="stat-value">₹{loading ? '...' : (stats?.monthlyRevenue ? stats.monthlyRevenue.toLocaleString() : '1,25,000')}</div>
          <div className="stat-delta">This month collection</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-pad" style={{ borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong style={{ fontSize: '14px' }}>Follow-ups</strong>
              <div style={{ display: 'flex', gap: '2px', background: '#edf2f7', padding: '2px', borderRadius: '6px' }}>
                {(['all', 'today', 'upcoming', 'missed'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFollowupFilter(t)}
                    style={{
                      padding: '3px 9px',
                      fontSize: '11.5px',
                      fontWeight: followupFilter === t ? 600 : 400,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: followupFilter === t ? '#fff' : 'transparent',
                      color: followupFilter === t ? 'var(--navy)' : '#4a5568',
                      boxShadow: followupFilter === t ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => navigate(`/followup?tab=${followupFilter}`)}>
              View all
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Category</th>
                <th>Notes</th>
                <th>Time / Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const list = (stats?.todaysFollowups || []).filter((f) => {
                  if (followupFilter === 'today') return f.category === 'Today';
                  if (followupFilter === 'upcoming') return f.category === 'Upcoming';
                  if (followupFilter === 'missed') return f.category === 'Missed';
                  return true;
                });

                if (list.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#718096', padding: '16px' }}>
                        No follow-ups scheduled {followupFilter !== 'all' ? `for ${followupFilter}` : ''}
                      </td>
                    </tr>
                  );
                }

                return list.map((f, i) => {
                  const cat = f.category || (f.status === 'Missed' ? 'Missed' : 'Today');
                  return (
                    <tr key={i}>
                      <td>
                        <strong>{f.studentName || 'Student'}</strong>
                        {f.mobileNumber && <div style={{ fontSize: '11.5px', color: '#718096' }}>{f.mobileNumber}</div>}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: cat === 'Missed' ? '#fed7d7' : cat === 'Upcoming' ? '#feebc8' : '#ebf8ff',
                            color: cat === 'Missed' ? '#c53030' : cat === 'Upcoming' ? '#c05621' : '#2b6cb0',
                            borderColor: cat === 'Missed' ? '#feb2b2' : cat === 'Upcoming' ? '#fbd38d' : '#bee3f8',
                            fontSize: '11px',
                          }}
                        >
                          {cat}
                        </span>
                      </td>
                      <td>{f.discussionNotes || '-'}</td>
                      <td>{f.followupTime || f.followupDate || '-'}</td>
                      <td>
                        <span className={`badge ${f.status === 'Done' ? 'badge-green' : f.status === 'Missed' ? 'badge-red' : 'badge-amber'}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-pad" style={{ borderBottom: '1px solid var(--border)' }}>
            <strong style={{ fontSize: '14px' }}>Today's tasks</strong>
          </div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.todaysTasks && stats.todaysTasks.length > 0 ? (
              stats.todaysTasks.map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.taskTitle}</div>
                    <div style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Due today · {t.priority} priority</div>
                  </div>
                  <span className={`badge ${t.status === 'Done' ? 'badge-green' : 'badge-amber'}`}>{t.status}</span>
                </div>
              ))
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Call pending fee students</div>
                    <div style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Due 5:00 PM · High priority</div>
                  </div>
                  <span className="badge badge-amber">Pending</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Upload monthly test marksheets</div>
                    <div style={{ fontSize: '12px', color: 'var(--slate-light)' }}>Due today · Medium priority</div>
                  </div>
                  <span className="badge badge-green">Done</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Team meeting — new batch planning</div>
                    <div style={{ fontSize: '12px', color: 'var(--slate-light)' }}>6:30 PM</div>
                  </div>
                  <span className="badge badge-gray">Scheduled</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
