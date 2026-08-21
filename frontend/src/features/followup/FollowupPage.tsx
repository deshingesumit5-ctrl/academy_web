import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { getCachedData } from '../../config/apiCache';
import { useSearchParams } from 'react-router-dom';

interface FollowUp {
  followupId: number;
  inquiryId: number;
  studentName: string;
  mobileNumber: string;
  interestedCourse: string;
  admissionType?: string;
  followupDate: string;
  followupTime: string;
  discussionNotes?: string;
  notes?: string;
  nextFollowupDate?: string;
  counselor?: string;
  counselorName?: string;
  status: string;
  category?: string;
  historyText?: string;
  createdAt?: string;
  updatedAt?: string;
}

type FollowupTabType = 'all' | 'today' | 'upcoming' | 'missed';

export const FollowupPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as FollowupTabType | null;
  const initialTab: FollowupTabType = rawTab && ['all', 'today', 'upcoming', 'missed'].includes(rawTab) ? rawTab : 'all';
  const [tab, setTab] = useState<FollowupTabType>(initialTab);
  const endpoint = initialTab === 'all' ? '/followups' : `/followups/${initialTab}`;
  const cached = getCachedData(endpoint);
  const [followups, setFollowups] = useState<FollowUp[]>(cached?.data || []);
  const [loading, setLoading] = useState(followups.length === 0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCounselor, setFilterCounselor] = useState('All');
  const [showFilters, setShowFilters] = useState(true);

  // Mark Done Modal State
  const [markDoneItem, setMarkDoneItem] = useState<FollowUp | null>(null);
  const [doneNotes, setDoneNotes] = useState('');
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('10:00');
  const [nextDays, setNextDays] = useState('');
  const [doneActionLoading, setDoneActionLoading] = useState(false);

  // Reschedule Modal State
  const [rescheduleItem, setRescheduleItem] = useState<FollowUp | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDays, setRescheduleDays] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    const rawActive = searchParams.get('tab') as FollowupTabType | null;
    const activeTab: FollowupTabType = rawActive && ['all', 'today', 'upcoming', 'missed'].includes(rawActive) ? rawActive : 'all';
    setTab(activeTab);
  }, [searchParams]);

  useEffect(() => {
    fetchTabFollowUps(tab);
  }, [tab]);

  const handleTabChange = (newTab: FollowupTabType) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const fetchTabFollowUps = async (targetTab: FollowupTabType, showLoading = followups.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const endpoint = targetTab === 'all' ? '/followups' : `/followups/${targetTab}`;
      const res = await axiosInstance.get(endpoint);
      setFollowups(res.data.data || []);
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto calculate date helper from days input
  const calculateDateFromDays = (daysStr: string) => {
    if (!daysStr || isNaN(Number(daysStr))) return '';
    const days = parseInt(daysStr, 10);
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDaysChange = (
    val: string,
    setDays: (v: string) => void,
    setDate: (v: string) => void
  ) => {
    setDays(val);
    if (val !== '' && !isNaN(Number(val))) {
      const calcDate = calculateDateFromDays(val);
      if (calcDate) setDate(calcDate);
    }
  };

  // Open Mark Done modal
  const openMarkDoneModal = (item: FollowUp) => {
    if (item.status?.toLowerCase() === 'done') return;
    setMarkDoneItem(item);
    setDoneNotes(item.discussionNotes || '');
    setScheduleNext(false);
    setNextDate('');
    setNextTime('10:00');
    setNextDays('');
  };

  // Submit Mark Done
  const handleMarkDoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markDoneItem) return;
    setDoneActionLoading(true);
    try {
      await axiosInstance.patch(`/followups/${markDoneItem.followupId}/mark-done`, {
        discussionNotes: doneNotes,
      });

      // If user checked "Schedule Next Follow-up"
      if (scheduleNext && nextDate) {
        await axiosInstance.post('/followups', {
          inquiryId: markDoneItem.inquiryId,
          followupDate: nextDate,
          followupTime: nextTime,
          discussionNotes: doneNotes ? `Follow-up following: ${doneNotes}` : 'Next follow-up',
          counselor: markDoneItem.counselor,
          status: 'Pending',
        });
      }

      setMarkDoneItem(null);
      await fetchTabFollowUps(tab);
    } catch (err) {
      console.error('Failed to mark follow-up as done:', err);
      alert('Failed to update follow-up status.');
    } finally {
      setDoneActionLoading(false);
    }
  };

  // Open Reschedule modal
  const openRescheduleModal = (item: FollowUp) => {
    if (item.status?.toLowerCase() === 'done') return;
    setRescheduleItem(item);
    setRescheduleDate(item.followupDate || new Date().toISOString().split('T')[0]);
    setRescheduleTime(item.followupTime || '10:00');
    setRescheduleDays('');
  };

  // Submit Reschedule
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleItem || !rescheduleDate) return;
    setRescheduleLoading(true);
    try {
      await axiosInstance.patch(`/followups/${rescheduleItem.followupId}/reschedule`, {
        followupDate: rescheduleDate,
        followupTime: rescheduleTime,
      });

      setRescheduleItem(null);
      await fetchTabFollowUps(tab);
    } catch (err) {
      console.error('Failed to reschedule follow-up:', err);
      alert('Failed to reschedule follow-up.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const counselorOptions = Array.from(new Set(followups.map((f) => f.counselor).filter(Boolean)));

  const filteredFollowups = followups.filter((f) => {
    const matchesSearch =
      !searchQuery ||
      (f.studentName && f.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.mobileNumber && f.mobileNumber.includes(searchQuery)) ||
      (f.interestedCourse && f.interestedCourse.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.discussionNotes && f.discussionNotes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'All' || f.status === filterStatus;
    const matchesCounselor = filterCounselor === 'All' || f.counselor === filterCounselor;

    return matchesSearch && matchesStatus && matchesCounselor;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
        {/* Card Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#2d3748' }}>Follow-up List</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px' }}
            >
              <i className="ti ti-filter"></i> Filter
            </button>
          </div>
        </div>

        {/* Filters Bar (Matching Fee Management dropdown filter style in Image 2) */}
        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            {/* Search */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Search</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by Student Name / Mobile / Course"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }}
                />
                <i className="ti ti-search" style={{ position: 'absolute', left: '10px', top: '11px', color: '#a0aec0' }}></i>
              </div>
            </div>

            {/* Follow-up Category / Type Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Follow-up Type</label>
              <select
                value={tab}
                onChange={(e) => handleTabChange(e.target.value as FollowupTabType)}
                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', background: '#fff', padding: '0 10px' }}
              >
                <option value="all">All Follow-ups</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="missed">Missed</option>
              </select>
            </div>

            {/* Counselor Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Counselor</label>
              <select
                value={filterCounselor}
                onChange={(e) => setFilterCounselor(e.target.value)}
                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', background: '#fff', padding: '0 10px' }}
              >
                <option value="All">All</option>
                {counselorOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', background: '#fff', padding: '0 10px' }}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
                <option value="Missed">Missed</option>
              </select>
            </div>
          </div>
        )}

        {filteredFollowups.length === 0 && !loading ? (
          <div className="empty" style={{ padding: '40px' }}>
            <i className="ti ti-calendar-time" style={{ fontSize: '36px', color: '#a0aec0', marginBottom: '8px' }}></i>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#4a5568' }}>No follow-ups scheduled</div>
            <div style={{ fontSize: '12.5px', color: '#718096', marginTop: '4px' }}>
              {tab === 'today' ? 'No pending follow-ups scheduled for today.' :
               tab === 'upcoming' ? 'No future follow-ups currently scheduled.' :
               tab === 'missed' ? 'No overdue missed follow-ups pending action.' :
               'No follow-ups found.'}
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Date & Time</th>
                  <th>Counselor</th>
                  <th>Discussion Notes</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFollowups.map((f) => {
                  const cat = f.category || (f.status === 'Missed' ? 'Missed' : 'Today');
                  const isDone = f.status?.toLowerCase() === 'done';
                  return (
                    <tr key={f.followupId}>
                      <td>
                        <strong style={{ color: 'var(--navy)' }}>{f.studentName || 'Student Inquiry'}</strong>
                        <div style={{ fontSize: '11.5px', color: '#718096' }}>{f.mobileNumber}</div>
                      </td>
                      <td>
                        <span className="badge badge-gray" style={{ fontSize: '11.5px' }}>
                          {f.interestedCourse || 'General'}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: cat === 'Missed' ? '#fed7d7' : cat === 'Upcoming' ? '#feebc8' : '#ebf8ff',
                            color: cat === 'Missed' ? '#c53030' : cat === 'Upcoming' ? '#c05621' : '#2b6cb0',
                            borderColor: cat === 'Missed' ? '#feb2b2' : cat === 'Upcoming' ? '#fbd38d' : '#bee3f8',
                            fontSize: '11.5px',
                          }}
                        >
                          {cat}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{f.followupDate}</div>
                        {f.followupTime && (
                          <div style={{ fontSize: '11.5px', color: '#718096' }}>{f.followupTime}</div>
                        )}
                      </td>
                      <td>{f.counselor || 'Sales'}</td>
                      <td style={{ maxWidth: '280px', whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '12.5px', color: '#4a5568' }}>
                        {f.discussionNotes || '—'}
                      </td>
                      <td>
                        <span className={`badge ${
                          f.status === 'Done' ? 'badge-green' :
                          f.status === 'Missed' ? 'badge-red' : 'badge-amber'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-sm"
                            disabled={isDone}
                            style={{
                              backgroundColor: isDone ? '#edf2f7' : '#f0fff4',
                              color: isDone ? '#a0aec0' : '#276749',
                              borderColor: isDone ? '#e2e8f0' : '#c6f6d5',
                              padding: '4px 10px',
                              fontSize: '12px',
                              cursor: isDone ? 'not-allowed' : 'pointer',
                              opacity: isDone ? 0.6 : 1,
                            }}
                            onClick={() => !isDone && openMarkDoneModal(f)}
                          >
                            <i className="ti ti-check" style={{ marginRight: '4px' }}></i> Mark Done
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            disabled={isDone}
                            style={{
                              backgroundColor: isDone ? '#edf2f7' : '#ebf8ff',
                              color: isDone ? '#a0aec0' : '#2b6cb0',
                              borderColor: isDone ? '#e2e8f0' : '#bee3f8',
                              padding: '4px 10px',
                              fontSize: '12px',
                              cursor: isDone ? 'not-allowed' : 'pointer',
                              opacity: isDone ? 0.6 : 1,
                            }}
                            onClick={() => !isDone && openRescheduleModal(f)}
                          >
                            <i className="ti ti-calendar" style={{ marginRight: '4px' }}></i> Reschedule
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Done Modal */}
      {markDoneItem && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="modal-content card card-pad" style={{ width: '100%', maxWidth: '480px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--navy)' }}>
                <i className="ti ti-check-circle" style={{ marginRight: '8px', color: '#38a169' }}></i>
                Mark Follow-up as Done
              </h3>
              <button type="button" className="btn btn-sm" style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }} onClick={() => setMarkDoneItem(null)}>×</button>
            </div>

            <form onSubmit={handleMarkDoneSubmit}>
              <div style={{ marginBottom: '14px', fontSize: '13px', color: '#4a5568' }}>
                Student: <strong>{markDoneItem.studentName}</strong> ({markDoneItem.mobileNumber})
              </div>

              <div className="form-field" style={{ marginBottom: '14px' }}>
                <label>Discussion / Completion Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter outcome of this follow-up..."
                  value={doneNotes}
                  onChange={(e) => setDoneNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '16px', padding: '10px 12px', backgroundColor: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: '#2d3748', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={scheduleNext}
                    onChange={(e) => setScheduleNext(e.target.checked)}
                  />
                  Schedule Next Follow-up
                </label>

                {scheduleNext && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="form-field">
                      <label style={{ fontSize: '11.5px' }}>Number of Days (Quick Calculate)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 7 (days from today)"
                        value={nextDays}
                        onChange={(e) => handleDaysChange(e.target.value, setNextDays, setNextDate)}
                      />
                    </div>

                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-field">
                        <label style={{ fontSize: '11.5px' }}>Next Date</label>
                        <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} required={scheduleNext} />
                      </div>
                      <div className="form-field">
                        <label style={{ fontSize: '11.5px' }}>Next Time</label>
                        <input type="time" value={nextTime} onChange={(e) => setNextTime(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn" onClick={() => setMarkDoneItem(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={doneActionLoading}>
                  {doneActionLoading ? 'Updating...' : 'Confirm Mark Done'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleItem && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="modal-content card card-pad" style={{ width: '100%', maxWidth: '440px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--navy)' }}>
                <i className="ti ti-calendar" style={{ marginRight: '8px', color: '#3182ce' }}></i>
                Reschedule Follow-up
              </h3>
              <button type="button" className="btn btn-sm" style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }} onClick={() => setRescheduleItem(null)}>×</button>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div style={{ marginBottom: '14px', fontSize: '13px', color: '#4a5568' }}>
                Student: <strong>{rescheduleItem.studentName}</strong> ({rescheduleItem.mobileNumber})
              </div>

              <div className="form-field" style={{ marginBottom: '14px' }}>
                <label>Number of Days (Quick Calculate)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 7 (days from today)"
                  value={rescheduleDays}
                  onChange={(e) => handleDaysChange(e.target.value, setRescheduleDays, setRescheduleDate)}
                />
                <span style={{ fontSize: '11.5px', color: '#718096', marginTop: '2px', display: 'block' }}>
                  Entering days auto-calculates Next Follow-up Date below. You can also edit the date manually.
                </span>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div className="form-field">
                  <label>New Follow-up Date <span className="required-asterisk">*</span></label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>New Follow-up Time</label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn" onClick={() => setRescheduleItem(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={rescheduleLoading}>
                  {rescheduleLoading ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
