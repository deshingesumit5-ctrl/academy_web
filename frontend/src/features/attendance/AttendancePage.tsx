import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { getCachedData } from '../../config/apiCache';

interface AttendanceLog {
  attendanceId: number;
  admissionNumber: string;
  studentName: string;
  batchName: string;
  attendanceDate: string;
  timeIn: string;
  status: string;
  deviceMode: string;
}

export const AttendancePage: React.FC = () => {
  const [tab, setTab] = useState<'device' | 'excel' | 'logs'>('device');
  const cached = getCachedData('/attendance');
  const [logs, setLogs] = useState<AttendanceLog[]>(cached?.data || []);
  const [loading, setLoading] = useState(logs.length === 0);

  useEffect(() => {
    fetchLogs(logs.length === 0);
  }, []);

  const fetchLogs = async (showLoading = logs.length === 0) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axiosInstance.get('/attendance');
      setLogs(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="tabs">
        <div
          className={`tab ${tab === 'device' ? 'active' : ''}`}
          onClick={() => setTab('device')}
        >
          Machine sync
        </div>
        <div
          className={`tab ${tab === 'excel' ? 'active' : ''}`}
          onClick={() => setTab('excel')}
        >
          Excel upload
        </div>
        <div
          className={`tab ${tab === 'logs' ? 'active' : ''}`}
          onClick={() => setTab('logs')}
        >
          Attendance log
        </div>
      </div>

      {tab === 'device' && (
        <div className="two-col">
          <div className="card card-pad">
            <strong style={{ fontSize: '14px' }}>Connected Devices</strong>
            <table style={{ marginTop: '12px' }}>
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Mode</th>
                  <th>Last sync</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Front desk unit</td>
                  <td>Face recognition</td>
                  <td>2 minutes ago</td>
                  <td><span className="badge badge-green">Online</span></td>
                </tr>
                <tr>
                  <td>Library entrance</td>
                  <td>Face recognition</td>
                  <td>5 minutes ago</td>
                  <td><span className="badge badge-green">Online</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card card-pad">
            <strong style={{ fontSize: '14px' }}>Sync Device Log</strong>
            <p style={{ fontSize: '12.5px', color: '#718096', margin: '10px 0' }}>
              Pull recent biometric face recognition punch events into attendance log.
            </p>
            <button className="btn btn-primary" onClick={() => fetchLogs(true)}>
              <i className="ti ti-refresh"></i>Sync Now
            </button>
          </div>
        </div>
      )}

      {tab === 'excel' && (
        <div className="card card-pad" style={{ maxWidth: '600px' }}>
          <strong style={{ fontSize: '14px' }}>Upload Attendance Sheet</strong>
          <div className="upload-box" style={{ marginTop: '12px' }}>
            <i className="ti ti-file-spreadsheet"></i>
            Drag an Excel file here, or click to browse
          </div>
          <button className="btn btn-primary" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>
            <i className="ti ti-upload"></i>Import Attendance Sheet
          </button>
        </div>
      )}

      {(tab === 'logs' || tab === 'device') && (
        <>
          <div className="section-title" style={{ marginTop: '24px' }}>
            <span>Today's Attendance Log</span>
          </div>
          <div className="card">
            {logs.length === 0 && !loading ? (
              <div className="empty">
                <i className="ti ti-calendar-check"></i>
                <div>No attendance records logged today</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Admission No.</th>
                      <th>Student</th>
                      <th>Batch</th>
                      <th>Time In</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.attendanceId}>
                        <td>{log.admissionNumber}</td>
                        <td><strong>{log.studentName}</strong></td>
                        <td>{log.batchName || '—'}</td>
                        <td>{log.timeIn || '—'}</td>
                        <td>
                          <span
                            className={`badge ${
                              log.status === 'PRESENT'
                                ? 'badge-green'
                                : log.status === 'ABSENT'
                                ? 'badge-red'
                                : 'badge-amber'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
