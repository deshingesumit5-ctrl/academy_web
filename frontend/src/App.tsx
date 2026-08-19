import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Login } from './auth/Login';

import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';

import { DashboardPage } from './features/dashboard/DashboardPage';
import { MasterOverviewPage } from './features/master/MasterOverviewPage';
import { AcademyPage } from './features/master/academy/AcademyPage';
import { LibraryPlanPage } from './features/master/library-plan/LibraryPlanPage';
import { CoursePage } from './features/master/course/CoursePage';
import { BatchPage } from './features/master/batch/BatchPage';
import { ExamPage } from './features/master/exam/ExamPage';
import { InquirySourcePage } from './features/master/inquiry-source/InquirySourcePage';
import { FeeStructurePage } from './features/master/fee-structure/FeeStructurePage';

import { RegistrationPage } from './features/registration/RegistrationPage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { FeeManagementPage } from './features/fees/FeeManagementPage';
import { MarksheetPage } from './features/marksheet/MarksheetPage';
import { InquiryPage } from './features/inquiry/InquiryPage';
import { FollowupPage } from './features/followup/FollowupPage';
import { WhatsappPage } from './features/whatsapp/WhatsappPage';
import { TaskPage } from './features/tasks/TaskPage';
import { ReportPage } from './features/reports/ReportPage';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/masters': 'Master management',
  '/masters/academy': 'Academy master',
  '/masters/library-plan': 'Library plan master',
  '/masters/course': 'Course master',
  '/masters/batch': 'Batch master',
  '/masters/exam': 'Exam master',
  '/masters/inquiry-source': 'Inquiry source master',
  '/masters/fee-structure': 'Fee structure master',
  '/registration': 'Student registration',
  '/attendance': 'Attendance management',
  '/fees': 'Fee management',
  '/marksheet': 'Marksheet management',
  '/inquiry': 'Inquiry management',
  '/followup': 'Follow-up management',
  '/whatsapp': 'WhatsApp integration',
  '/tasks': 'Task management',
  '/reports': 'Reports & Analytics',
};

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || 'Academy System';

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main">
        <Topbar title={currentTitle} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/masters" element={<MasterOverviewPage />} />
            <Route path="/masters/academy" element={<AcademyPage />} />
            <Route path="/masters/library-plan" element={<LibraryPlanPage />} />
            <Route path="/masters/course" element={<CoursePage />} />
            <Route path="/masters/batch" element={<BatchPage />} />
            <Route path="/masters/exam" element={<ExamPage />} />
            <Route path="/masters/inquiry-source" element={<InquirySourcePage />} />
            <Route path="/masters/fee-structure" element={<FeeStructurePage />} />

            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/fees" element={<FeeManagementPage />} />
            <Route path="/marksheet" element={<MarksheetPage />} />
            <Route path="/inquiry" element={<InquiryPage />} />
            <Route path="/followup" element={<FollowupPage />} />
            <Route path="/whatsapp" element={<WhatsappPage />} />
            <Route path="/tasks" element={<TaskPage />} />
            <Route path="/reports" element={<ReportPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<MainLayout />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
