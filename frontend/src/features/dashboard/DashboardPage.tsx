import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';


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
  const { isSuperAdmin, hasPermission, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [followupFilter, setFollowupFilter] = useState<'all' | 'today' | 'upcoming' | 'missed'>('all');
  const navigate = useNavigate();



  const canViewAttendance = isSuperAdmin() || hasPermission('Attendance', 'Read');
  const canViewFeeManagement = isSuperAdmin() || hasPermission('Fee Management', 'Read');
  const canViewStudents = isSuperAdmin() || hasPermission('Student Registration', 'Read');
  const canViewInquiry = isSuperAdmin() || hasPermission('Inquiry', 'Read');
  const canViewFollowups = isSuperAdmin() || hasPermission('Follow-ups', 'Read');
  const canViewTasks = isSuperAdmin() || hasPermission('Tasks', 'Read');

  const showStatGrid = canViewAttendance || canViewFeeManagement || canViewStudents || canViewInquiry;
  const visibleTablesCount = (canViewFollowups ? 1 : 0) + (canViewTasks ? 1 : 0);
  const gridClass = visibleTablesCount === 1 ? 'one-col' : 'two-col';

  const userFull = (user?.fullName || '').trim().toLowerCase();
  const userEmail = (user?.username || '').trim().toLowerCase();
  const userRole = (user?.role || '').trim().toLowerCase();

  const roleUpper = (user?.role || '').toUpperCase();
  const isEmployeeOrUser = roleUpper === 'USER' || roleUpper.includes('EMPLOYEE');
  const isAdmin = (isSuperAdmin() || roleUpper.includes('ADMIN') || hasPermission('Tasks', 'Create')) && !isEmployeeOrUser;

  const userTasks = (isSuperAdmin() || isAdmin)
    ? (stats?.todaysTasks || [])
    : (stats?.todaysTasks || []).filter((t: any) => {
        if (!user) return false;
        const assigned = (t.assignedTo || '').trim().toLowerCase();
        if (!assigned) return false;
        return (
          (userFull && assigned === userFull) ||
          (userEmail && assigned === userEmail) ||
          (userRole && assigned === userRole)
        );
      });

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

  useEffect(() => {
    fetchStats();
  }, []);



  return (
    <div>
      {showStatGrid && (
        <div className="stat-grid">
          {canViewAttendance && (
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/attendance')}>
              <div className="stat-top"><i className="ti ti-user-check"></i>Today's attendance</div>
              <div className="stat-value">{loading ? '...' : (stats?.attendancePercentage ?? '0%')}</div>
              <div className="stat-delta">{stats?.attendanceDetails ?? '0 of 0 present'}</div>
            </div>
          )}

          {canViewFeeManagement && (
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/fees')}>
              <div className="stat-top"><i className="ti ti-currency-rupee"></i>Today's collection</div>
              <div className="stat-value">₹{loading ? '...' : (stats?.todayCollection ?? 0).toLocaleString()}</div>
              <div className="stat-delta">{stats?.todayPaymentsCount ?? 0} payments received</div>
            </div>
          )}

          {canViewFeeManagement && (
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/fees')}>
              <div className="stat-top"><i className="ti ti-alert-triangle"></i>Pending fees</div>
              <div className="stat-value">₹{loading ? '...' : (stats?.pendingFeesAmount ?? 0).toLocaleString()}</div>
              <div className="stat-delta" style={{ color: 'var(--amber)' }}>{stats?.overdueStudentsCount ?? 0} students overdue</div>
            </div>
          )}

          {canViewStudents && (
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/students')}>
              <div className="stat-top"><i className="ti ti-users"></i>Active students</div>
              <div className="stat-value">{loading ? '...' : (stats?.activeStudentsCount ?? 0)}</div>
              <div className="stat-delta">+{stats?.newStudentsThisMonth ?? 0} this month</div>
            </div>
          )}

          {canViewInquiry && (
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/inquiry')}>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>{loading ? '...' : (stats?.convertedInquiriesCount ?? 0)}</div>
              <div className="stat-delta" style={{ color: '#2b6cb0' }}>
                {stats?.convertedInquiriesCount ?? 0} of {stats?.totalInquiriesCount ?? 0} converted
              </div>
            </div>
          )}

          {canViewStudents && (
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/students')}>
              <div className="stat-top"><i className="ti ti-user-plus"></i>Today's Admissions</div>
              <div className="stat-value">{loading ? '...' : (stats?.todayAdmissionsCount ?? 0)}</div>
              <div className="stat-delta">Admissions today</div>
            </div>
          )}

          {canViewFeeManagement && (
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/fees')}>
              <div className="stat-top"><i className="ti ti-chart-bar"></i>Monthly Revenue</div>
              <div className="stat-value">₹{loading ? '...' : (stats?.monthlyRevenue ?? 0).toLocaleString()}</div>
              <div className="stat-delta">This month collection</div>
            </div>
          )}
        </div>
      )}

      {visibleTablesCount > 0 && (
        <div className={gridClass}>
          {canViewFollowups && (
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
                    const list = (stats?.todaysFollowups ?? []).filter((f) => {
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
                        <tr key={i} style={{ cursor: 'pointer' }} onClick={() => navigate('/followup')}>
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
          )}

          {canViewTasks && (
            <div className="card">
              <div className="card-pad" style={{ borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px' }}>Today's tasks</strong>
                <button className="btn btn-sm" style={{ fontSize: '12px' }} onClick={() => navigate('/tasks')}>
                  View all tasks
                </button>
              </div>
              <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userTasks && userTasks.length > 0 ? (
                  userTasks.map((t: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < userTasks.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{t.taskTitle}</div>
                        <div style={{ fontSize: '12px', color: 'var(--slate-light)' }}>
                          Due today · {t.priority} priority {t.assignedTo ? `· Assigned: ${t.assignedTo}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${t.status === 'Done' ? 'badge-green' : t.status === 'Scheduled' ? 'badge-blue' : 'badge-amber'}`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#718096', padding: '24px', fontSize: '13px' }}>
                    <i className="ti ti-checklist" style={{ fontSize: '28px', display: 'block', marginBottom: '6px', color: '#cbd5e0' }}></i>
                    No data available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}


    </div>
  );
};
