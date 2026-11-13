import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Student,
  Teacher,
  InquiryActivityRecord,
  RoadmapMilestone,
  ChatMessage,
  MindMapNode,
  SubjectInquiryTopic,
  TeacherFeedback,
} from './types';
import {
  mockStudents,
  mockTeachers,
  initialMindMaps,
  mockInquiryRecords,
  mockRoadmap,
  mockChatMessages,
} from './data/mockData';
import {
  generateTailoredRoadmap,
  generateTailoredInquiryRecords,
} from './data/tailoredRoadmapAndLogs';
import { Navbar } from './components/Navbar';
import { CurriculumInquiryWizard } from './components/CurriculumInquiryWizard';
import { AiTopicGenerator } from './components/AiTopicGenerator';
import { CareerRoadmap } from './components/CareerRoadmap';
import { InquiryLogManager } from './components/InquiryLogManager';
import { TeacherCoachingPanel } from './components/TeacherCoachingPanel';
import { LiveChatModal } from './components/LiveChatModal';
import { ExportReportModal } from './components/ExportReportModal';
import { StudentCareerProfileModal } from './components/StudentCareerProfileModal';
import { QuestionRefinementWizard } from './components/QuestionRefinementWizard';
import { ClassroomKanbanDashboard } from './components/ClassroomKanbanDashboard';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { StudentRegistrationModal } from './components/StudentRegistrationModal';
import {
  Sparkles,
  Compass,
  FileText,
  Users,
  MessageSquare,
  Printer,
  HelpCircle,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Edit3,
} from 'lucide-react';

const CURRENT_APP_VERSION = 'v3.2_teacher_auth_student_approval';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const storedVer = localStorage.getItem('hakjong_app_version');
      if (storedVer !== CURRENT_APP_VERSION) {
        localStorage.removeItem('hakjong_students');
        localStorage.removeItem('hakjong_roadmaps');
        localStorage.removeItem('hakjong_records');
        localStorage.removeItem('hakjong_custom_units');
        localStorage.setItem('hakjong_app_version', CURRENT_APP_VERSION);
        return mockStudents;
      }
      const saved = localStorage.getItem('hakjong_students');
      return saved ? JSON.parse(saved) : mockStudents;
    } catch {
      return mockStudents;
    }
  });
  const [currentStudentId, setCurrentStudentId] = useState<string>(mockStudents[0].id);
  const teacher = mockTeachers[0];

  const [activeNav, setActiveNav] = useState<string>('wizard');

  // Application State: dynamically tailored based on student profile
  const [mindmaps, setMindmaps] = useState<Record<string, MindMapNode>>(initialMindMaps);
  const [records, setRecords] = useState<InquiryActivityRecord[]>(() => {
    try {
      const saved = localStorage.getItem('hakjong_records');
      if (saved) {
        const parsed = JSON.parse(saved) as InquiryActivityRecord[];
        const s1Recs = parsed.filter((r) => r.studentId === 'student-1');
        const s1HasBioMismatch = s1Recs.some((r) => /crispr|유전자|단백질/i.test(r.title));
        if (parsed.length > 0 && !s1HasBioMismatch) {
          return parsed;
        }
      }
    } catch {}
    const initialRecs: InquiryActivityRecord[] = [];
    mockStudents.forEach((st) => {
      initialRecs.push(...generateTailoredInquiryRecords(st));
    });
    return initialRecs;
  });
  const [roadmaps, setRoadmaps] = useState<Record<string, RoadmapMilestone[]>>(() => {
    try {
      const saved = localStorage.getItem('hakjong_roadmaps');
      if (saved) {
        const parsed = JSON.parse(saved);
        const s1Roadmap = parsed['student-1'] as RoadmapMilestone[] | undefined;
        const s1HasBioMismatch = s1Roadmap && s1Roadmap.some((m) => /crispr|유전자|단백질/i.test(m.title));
        if (s1Roadmap && s1Roadmap.length >= 8 && !s1HasBioMismatch) {
          return parsed;
        }
      }
    } catch {}
    const initialRoads: Record<string, RoadmapMilestone[]> = {};
    mockStudents.forEach((st) => {
      initialRoads[st.id] = generateTailoredRoadmap(st);
    });
    return initialRoads;
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState<boolean>(false);
  const [roadmapSource, setRoadmapSource] = useState<'gemini' | 'local'>('local');

  // Modals
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [chatActivityId, setChatActivityId] = useState<string | undefined>(undefined);

  // Teacher Authentication & Student Registration State
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('hakjong_teacher_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isTeacherAuthModalOpen, setIsTeacherAuthModalOpen] = useState<boolean>(false);
  const [isStudentRegistrationModalOpen, setIsStudentRegistrationModalOpen] = useState<boolean>(false);

  // Read URL query parameters for student distribution links (e.g. ?register=true, ?nav=refine, ?student=id)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'student') {
        setCurrentRole('student');
      } else if (modeParam === 'teacher' && isTeacherAuthenticated) {
        setCurrentRole('teacher');
      }

      const navParam = params.get('nav');
      if (navParam && ['wizard', 'refine', 'ai-topics', 'roadmap', 'inquiry-log', 'kanban'].includes(navParam)) {
        setActiveNav(navParam);
      }

      const registerParam = params.get('register');
      if (registerParam === 'true' || registerParam === '1') {
        setCurrentRole('student');
        setIsStudentRegistrationModalOpen(true);
      }

      const studentParam = params.get('student');
      if (studentParam && students.some((s) => s.id === studentParam)) {
        setCurrentStudentId(studentParam);
      }
    } catch (e) {
      console.error('Failed to parse URL parameters:', e);
    }
  }, []);

  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];

  // Save student profile handler: updates profile AND dynamically regenerates roadmap + inquiry records + mindmap
  const handleSaveStudentProfile = (
    updated: Student,
    targetTab?: 'wizard' | 'ai-topics' | 'roadmap' | 'inquiry-log'
  ) => {
    const updatedList = students.map((s) => (s.id === updated.id ? updated : s));
    setStudents(updatedList);
    try {
      localStorage.setItem('hakjong_students', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }

    // 1. Optimistically set local roadmap immediately, then upgrade via live Gemini AI API
    const newMilestones = generateTailoredRoadmap(updated);
    setRoadmaps((prev) => {
      const updatedRoadmaps = {
        ...prev,
        [updated.id]: newMilestones,
      };
      try {
        localStorage.setItem('hakjong_roadmaps', JSON.stringify(updatedRoadmaps));
      } catch {}
      return updatedRoadmaps;
    });
    setRoadmapSource('local');
    setIsGeneratingRoadmap(true);
    fetch('/api/ai/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student: updated }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.milestones) && data.milestones.length > 0) {
          setRoadmaps((prev) => {
            const updatedRoadmaps = {
              ...prev,
              [updated.id]: data.milestones,
            };
            try {
              localStorage.setItem('hakjong_roadmaps', JSON.stringify(updatedRoadmaps));
            } catch {}
            return updatedRoadmaps;
          });
          setRoadmapSource(data.source === 'gemini' ? 'gemini' : 'local');
        }
      })
      .catch((err) => console.warn('Auto Gemini roadmap refresh failed, keeping local fallback:', err))
      .finally(() => setIsGeneratingRoadmap(false));

    // 2. Automatically regenerate inquiry activity log records tailored to new career & interest
    const newRecords = generateTailoredInquiryRecords(updated);
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.studentId !== updated.id);
      const updatedRecords = [...newRecords, ...filtered];
      try {
        localStorage.setItem('hakjong_records', JSON.stringify(updatedRecords));
      } catch {}
      return updatedRecords;
    });

    // 3. Automatically generate and update student's mindmap
    fetch('/api/ai/generate-mindmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student: updated,
        rootTopic: updated.mainInterestTopic,
        targetMajor: updated.targetMajor,
        grade: updated.grade,
        preferredSubjects: updated.preferredSubjects,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mindmap) {
          setMindmaps((prev) => ({
            ...prev,
            [updated.id]: data.mindmap,
          }));
        }
      })
      .catch((err) => console.warn('Auto mindmap refresh on profile save failed:', err));

    if (targetTab) {
      setActiveNav(targetTab);
    }
  };

  // Explicit handler to re-tailor Roadmap for current student via live Gemini AI
  const handleRegenerateRoadmap = async (): Promise<'gemini' | 'local'> => {
    setIsGeneratingRoadmap(true);
    try {
      const res = await fetch('/api/ai/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student: currentStudent }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.milestones) && data.milestones.length > 0) {
          setRoadmaps((prev) => {
            const updatedRoadmaps = {
              ...prev,
              [currentStudent.id]: data.milestones,
            };
            try {
              localStorage.setItem('hakjong_roadmaps', JSON.stringify(updatedRoadmaps));
            } catch {}
            return updatedRoadmaps;
          });
          const src = data.source === 'gemini' ? 'gemini' : 'local';
          setRoadmapSource(src);
          return src;
        }
      }
    } catch (err) {
      console.warn('Gemini roadmap generation error, using local fallback:', err);
    } finally {
      setIsGeneratingRoadmap(false);
    }

    const fallbackMilestones = generateTailoredRoadmap(currentStudent);
    setRoadmaps((prev) => {
      const updatedRoadmaps = {
        ...prev,
        [currentStudent.id]: fallbackMilestones,
      };
      try {
        localStorage.setItem('hakjong_roadmaps', JSON.stringify(updatedRoadmaps));
      } catch {}
      return updatedRoadmaps;
    });
    setRoadmapSource('local');
    return 'local';
  };

  // Explicit handler to re-tailor Inquiry Activity Records for current student
  const handleRegenerateRecords = () => {
    const newRecords = generateTailoredInquiryRecords(currentStudent);
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.studentId !== currentStudent.id);
      const updatedRecords = [...newRecords, ...filtered];
      try {
        localStorage.setItem('hakjong_records', JSON.stringify(updatedRecords));
      } catch {}
      return updatedRecords;
    });
  };

  // Classroom Student Management Handlers
  const handleUpdateStudent = (updatedStudent: Student) => {
    const updatedList = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updatedList);
    try {
      localStorage.setItem('hakjong_students', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddStudent = (newStudent: Student) => {
    const updatedList = [newStudent, ...students];
    setStudents(updatedList);
    try {
      localStorage.setItem('hakjong_students', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
    const newMilestones = generateTailoredRoadmap(newStudent);
    setRoadmaps((prev) => ({ ...prev, [newStudent.id]: newMilestones }));
    const newRecs = generateTailoredInquiryRecords(newStudent);
    setRecords((prev) => [...newRecs, ...prev]);

    fetch('/api/ai/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student: newStudent }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.milestones) && data.milestones.length > 0) {
          setRoadmaps((prev) => {
            const updatedRoadmaps = { ...prev, [newStudent.id]: data.milestones };
            try {
              localStorage.setItem('hakjong_roadmaps', JSON.stringify(updatedRoadmaps));
            } catch {}
            return updatedRoadmaps;
          });
        }
      })
      .catch(() => {});
  };

  const handleAddMultipleStudents = (newStudents: Student[]) => {
    const updatedList = [...newStudents, ...students];
    setStudents(updatedList);
    try {
      localStorage.setItem('hakjong_students', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
    newStudents.forEach((st) => {
      const ms = generateTailoredRoadmap(st);
      setRoadmaps((prev) => ({ ...prev, [st.id]: ms }));
      const recs = generateTailoredInquiryRecords(st);
      setRecords((prev) => [...recs, ...prev]);
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    const updatedList = students.filter((s) => s.id !== studentId);
    if (updatedList.length > 0) {
      setStudents(updatedList);
      if (currentStudentId === studentId) {
        setCurrentStudentId(updatedList[0].id);
      }
      try {
        localStorage.setItem('hakjong_students', JSON.stringify(updatedList));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Teacher Authentication Handlers
  const handleTeacherAuthSuccess = () => {
    setIsTeacherAuthenticated(true);
    try {
      sessionStorage.setItem('hakjong_teacher_auth', 'true');
    } catch {}
    setIsTeacherAuthModalOpen(false);
    setCurrentRole('teacher');
    setActiveNav('kanban');
  };

  const handleLockTeacherMode = () => {
    setIsTeacherAuthenticated(false);
    try {
      sessionStorage.removeItem('hakjong_teacher_auth');
    } catch {}
    setCurrentRole('student');
    setActiveNav('wizard');
  };

  // Student Approval Handlers for Teacher
  const handleApproveStudent = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;
    const updated: Student = {
      ...target,
      approvalStatus: 'approved',
      status: 'active',
      inquiryStage: target.inquiryStage || 'topic_planning',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    handleUpdateStudent(updated);

    if (!roadmaps[studentId]) {
      const ms = generateTailoredRoadmap(updated);
      setRoadmaps((prev) => ({ ...prev, [studentId]: ms }));
    }
    if (!records.some((r) => r.studentId === studentId)) {
      const recs = generateTailoredInquiryRecords(updated);
      setRecords((prev) => [...recs, ...prev]);
    }
  };

  const handleApproveAllStudents = () => {
    const pending = students.filter((s) => s.approvalStatus === 'pending');
    if (pending.length === 0) return;
    const updatedList = students.map((s) =>
      s.approvalStatus === 'pending'
        ? {
            ...s,
            approvalStatus: 'approved' as const,
            status: 'active' as const,
            inquiryStage: s.inquiryStage || 'topic_planning',
            lastUpdated: new Date().toISOString().split('T')[0],
          }
        : s
    );
    setStudents(updatedList);
    try {
      localStorage.setItem('hakjong_students', JSON.stringify(updatedList));
    } catch {}

    pending.forEach((st) => {
      if (!roadmaps[st.id]) {
        const ms = generateTailoredRoadmap(st);
        setRoadmaps((prev) => ({ ...prev, [st.id]: ms }));
      }
      if (!records.some((r) => r.studentId === st.id)) {
        const recs = generateTailoredInquiryRecords(st);
        setRecords((prev) => [...recs, ...prev]);
      }
    });
  };

  const handleRejectStudent = (studentId: string) => {
    handleDeleteStudent(studentId);
  };

  const handleStudentSubmitRegistration = (newStudent: Student) => {
    handleAddStudent(newStudent);
  };

  const currentStudentMilestones = roadmaps[currentStudentId] || generateTailoredRoadmap(currentStudent);
  const currentStudentMindMap = mindmaps[currentStudentId] || initialMindMaps['student-1'];

  // Apply MindMap from AI Generator
  const handleApplyMindMap = (newMindMap: MindMapNode) => {
    setMindmaps((prev) => ({
      ...prev,
      [currentStudentId]: newMindMap,
    }));
  };

  // Add inquiry activity from AI recommendation
  const handleAddInquiryFromTopic = (topic: SubjectInquiryTopic) => {
    const newRecord: InquiryActivityRecord = {
      id: `act-${Date.now()}`,
      studentId: currentStudentId,
      title: `[${topic.subject}] ${topic.topic}`,
      subject: topic.subject,
      category: '교과세특',
      gradeSemester: '2학년 2학기',
      date: new Date().toISOString().split('T')[0],
      motivation: `교과 수업 중 핵심 질문("${topic.inquiryQuestion}")에 대한 지적 호기심을 바탕으로 심화 탐구 기획`,
      process: `탐구 방법론: ${topic.methodology}`,
      insights: `탐구를 통해 교과 개념과 전공 융합 역량을 확인하고 후속 과제 도출 예정`,
      relatedBooks: topic.readingRecommendation,
      deliverables: '탐구 기획서 및 연구 보고서 초안',
      status: 'draft',
    };

    setRecords((prev) => [newRecord, ...prev]);
  };

  // Add manual inquiry activity
  const handleAddRecord = (record: InquiryActivityRecord) => {
    setRecords((prev) => [record, ...prev]);
  };

  // Update existing inquiry activity
  const handleUpdateRecord = (updated: InquiryActivityRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  // Submit activity for teacher review
  const handleSubmitForReview = (recordId: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: 'submitted' as const } : r))
    );

    // Auto notify in chat
    const submittedRecord = records.find((r) => r.id === recordId);
    if (submittedRecord) {
      const autoMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: currentStudent.id,
        senderName: currentStudent.name,
        senderRole: 'student',
        recipientId: teacher.id,
        content: `선생님, '${submittedRecord.title}' 탐구 일지 작성을 완료하여 검토 및 피드백을 요청드렸습니다!`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        relatedActivityId: recordId,
        tag: '세특검토',
      };
      setChatMessages((prev) => [...prev, autoMsg]);
    }
  };

  // Teacher saves feedback
  const handleSaveTeacherFeedback = (recordId: string, feedback: TeacherFeedback) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'reviewed' as const,
              teacherFeedback: feedback,
            }
          : r
      )
    );

    // Auto notification in chat
    const updatedRecord = records.find((r) => r.id === recordId);
    if (updatedRecord) {
      const autoMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: teacher.id,
        senderName: `${teacher.name} 교사`,
        senderRole: 'teacher',
        recipientId: updatedRecord.studentId,
        content: `'${updatedRecord.title}' 탐구에 대한 세특 첨삭 및 지도 코멘트를 작성해 두었습니다. 피드백 패널을 확인해 보세요!`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        relatedActivityId: recordId,
        tag: '피드백',
      };
      setChatMessages((prev) => [...prev, autoMsg]);
    }
  };

  // Roadmap updates
  const handleAddMilestone = (milestone: RoadmapMilestone) => {
    setRoadmaps((prev) => ({
      ...prev,
      [currentStudentId]: [...(prev[currentStudentId] || []), milestone],
    }));
  };

  const handleUpdateMilestoneStatus = (id: string, newStatus: RoadmapMilestone['status']) => {
    setRoadmaps((prev) => ({
      ...prev,
      [currentStudentId]: (prev[currentStudentId] || []).map((m) =>
        m.id === id ? { ...m, status: newStatus } : m
      ),
    }));
  };

  // Chat send
  const handleSendMessage = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);

    // Optional simulated smart reply when student sends a message and is in student mode
    if (msg.senderRole === 'student') {
      setTimeout(() => {
        const autoTeacherReply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          senderId: teacher.id,
          senderName: `${teacher.name} 교사`,
          senderRole: 'teacher',
          recipientId: msg.senderId,
          content: `${msg.senderName} 학생, 메시지 잘 받았습니다! 문의한 내용 검토하고 피드백 메모 남겨두겠습니다.`,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          relatedActivityId: msg.relatedActivityId,
          tag: '피드백',
        };
        setChatMessages((prev) => [...prev, autoTeacherReply]);
      }, 1500);
    }
  };

  const handleOpenChatWithActivity = (activityId: string) => {
    setChatActivityId(activityId);
    setIsChatOpen(true);
  };

  const handleOpenChatWithStudent = (studentId: string, activityId?: string) => {
    setCurrentStudentId(studentId);
    setChatActivityId(activityId);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onChangeRole={(role) => {
          if (role === 'teacher' && !isTeacherAuthenticated) {
            setIsTeacherAuthModalOpen(true);
          } else {
            setCurrentRole(role);
          }
        }}
        students={students.filter((s) => s.approvalStatus !== 'pending')}
        currentStudentId={currentStudentId}
        onSelectStudent={(id) => setCurrentStudentId(id)}
        teacher={teacher}
        activeNav={activeNav}
        onSelectNav={(nav) => setActiveNav(nav)}
        onOpenChat={() => {
          setChatActivityId(undefined);
          setIsChatOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenStudentRegistration={() => setIsStudentRegistrationModalOpen(true)}
        isTeacherAuthenticated={isTeacherAuthenticated}
        onRequestTeacherAuth={() => setIsTeacherAuthModalOpen(true)}
        onLockTeacherMode={handleLockTeacherMode}
        pendingStudentsCount={students.filter((s) => s.approvalStatus === 'pending').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Role Helper Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                currentRole === 'student' ? 'bg-indigo-600' : 'bg-emerald-600'
              } animate-pulse`}
            />
            <div className="text-xs">
              <strong className="text-slate-800">
                현재 접속: {currentRole === 'student' ? '학생 모드' : '교사 지도 모드'}
              </strong>
              <span className="text-slate-500 ml-2">
                {currentRole === 'student'
                  ? `${currentStudent.name} (${currentStudent.grade} · ${currentStudent.targetMajor})`
                  : `${teacher.name} 선생님 (${teacher.subject} · ${teacher.school})`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              포트폴리오 요약서 인쇄/PDF
            </button>
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-semibold border border-indigo-200 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              실시간 세특 상담톡
            </button>
          </div>
        </div>

        {/* Student Career & Interest Profile Card (Crucial for personalized inquiry) */}
        {currentRole === 'student' && (
          <div className="mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-indigo-900/60 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-indigo-400 animate-pulse" />
                  <span>나의 진로희망 & 관심 분야 프로필</span>
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {currentStudent.name} ({currentStudent.grade} · {currentStudent.school})
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-black text-white">
                  <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{currentStudent.targetCareer || '진로 목표를 설정하세요'}</span>
                </div>
                <span className="text-indigo-400 font-bold hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-indigo-200">
                  <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>목표 학과: {currentStudent.targetMajor || '희망 학과를 설정하세요'}</span>
                </div>
              </div>

              {/* Core Interest Topic Box */}
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3.5 text-xs text-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>내가 등록한 핵심 관심 연구 분야 / 최근 호기심:</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                  "{currentStudent.mainInterestTopic || '아직 등록된 관심사가 없습니다. 우측 버튼을 눌러 관심 분야를 등록해보세요!'}"
                </p>
              </div>

              {/* Keywords and Preferred Subjects */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {currentStudent.interestKeywords?.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-indigo-900/60 text-indigo-200 border border-indigo-700/50 px-2 py-0.5 rounded-lg font-medium"
                  >
                    #{kw}
                  </span>
                ))}
                {currentStudent.preferredSubjects?.map((subj, idx) => (
                  <span
                    key={`subj-${idx}`}
                    className="text-[10px] bg-slate-800/90 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-bold"
                  >
                    📚 {subj.split('(')[0].trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-row lg:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-3 bg-white hover:bg-slate-100 text-indigo-950 rounded-2xl text-xs font-black transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>내 진로·관심사 수정하기</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('wizard')}
                className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold border border-indigo-400/40 transition-all shadow-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>맞춤 탐구 길잡이 시작</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 0: Curriculum-First Guided Wizard */}
        {activeNav === 'wizard' && (
          <CurriculumInquiryWizard
            currentStudent={currentStudent}
            onAddInquiryRecord={handleAddInquiryFromTopic}
            onSwitchToMindmap={() => setActiveNav('ai-topics')}
            onSwitchToRefinement={() => setActiveNav('refinement')}
          />
        )}

        {/* Tab: Topic Refinement & Question Narrowing 3-Step Wizard */}
        {activeNav === 'refinement' && (
          <QuestionRefinementWizard
            student={currentStudent}
            onAddActivityRecord={(rec) => {
              handleAddRecord(rec as any);
              setActiveNav('inquiry-logs');
            }}
            onNavigateToMindmap={(_topic) => {
              setActiveNav('ai-topics');
            }}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {/* Tab 1: AI Topic Generator & Mind Map */}
        {activeNav === 'ai-topics' && (
          <AiTopicGenerator
            currentGrade={currentStudent.grade}
            defaultMajor={currentStudent.targetMajor}
            defaultInterest={currentStudent.mainInterestTopic}
            defaultKeywords={(currentStudent.interestKeywords || []).join(', ')}
            defaultSelectedSubjects={currentStudent.preferredSubjects}
            onApplyMindMap={handleApplyMindMap}
            onAddInquiryRecord={handleAddInquiryFromTopic}
            onSwitchToWizard={() => setActiveNav('wizard')}
            onSwitchToRefinement={() => setActiveNav('refinement')}
          />
        )}

        {/* Tab 2: Career Roadmap */}
        {activeNav === 'roadmap' && (
          <CareerRoadmap
            student={currentStudent}
            milestones={currentStudentMilestones}
            onAddMilestone={handleAddMilestone}
            onUpdateStatus={handleUpdateMilestoneStatus}
            onRegenerateRoadmap={handleRegenerateRoadmap}
            isGeneratingRoadmap={isGeneratingRoadmap}
            roadmapSource={roadmapSource}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {/* Tab 3: Student Inquiry Activity Logs & Portfolio */}
        {activeNav === 'inquiry-logs' && (
          <InquiryLogManager
            student={currentStudent}
            teacher={teacher}
            records={records}
            onAddRecord={handleAddRecord}
            onUpdateRecord={handleUpdateRecord}
            onSubmitForReview={handleSubmitForReview}
            onOpenChatWithActivity={handleOpenChatWithActivity}
            onRegenerateRecords={handleRegenerateRecords}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {/* Tab 4: Teacher Coaching Dashboard */}
        {activeNav === 'teacher-panel' && (
          <TeacherCoachingPanel
            teacher={teacher}
            students={students}
            records={records}
            onSaveFeedback={handleSaveTeacherFeedback}
            onOpenChatWithStudent={handleOpenChatWithStudent}
          />
        )}

        {/* Tab 5: Classroom Kanban Dashboard (교사 전용 학급 다중 관리 칸반) */}
        {activeNav === 'kanban' && (
          <ClassroomKanbanDashboard
            teacher={teacher}
            students={students}
            records={records}
            onSelectStudent={(id) => {
              setCurrentStudentId(id);
            }}
            onUpdateStudent={handleUpdateStudent}
            onAddStudent={handleAddStudent}
            onAddMultipleStudents={handleAddMultipleStudents}
            onDeleteStudent={handleDeleteStudent}
            onNavigateToCoaching={(id) => {
              setCurrentStudentId(id);
              setActiveNav('teacher-panel');
            }}
            onNavigateToRefinement={(id) => {
              setCurrentStudentId(id);
              setActiveNav('refinement');
            }}
            onApproveStudent={handleApproveStudent}
            onApproveAllStudents={handleApproveAllStudents}
            onRejectStudent={handleRejectStudent}
            onLockTeacherMode={handleLockTeacherMode}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            학종나침반 (Hakjong Compass) · 고등학교 학생부 종합전형 AI 진로·교과 연계 탐구 플랫폼
          </p>
          <p className="text-[11px] text-slate-400">
            2022/2015 개정 교육과정 및 교육부 학교생활기록부 기재요령 표준 규격 준수
          </p>
        </div>
      </footer>

      {/* Floating Chat Modal */}
      <LiveChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUserRole={currentRole}
        student={currentStudent}
        teacher={teacher}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        selectedActivityId={chatActivityId}
        activities={records}
      />

      {/* Export / Print Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        student={currentStudent}
        teacher={teacher}
        records={records}
        milestones={currentStudentMilestones}
        mindmap={currentStudentMindMap}
      />

      {/* Student Career & Interest Profile Setup Modal */}
      <StudentCareerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={currentStudent}
        onSaveProfile={handleSaveStudentProfile}
      />

      {/* Teacher Authentication Modal (비밀번호 1234) */}
      <TeacherAuthModal
        isOpen={isTeacherAuthModalOpen}
        onClose={() => setIsTeacherAuthModalOpen(false)}
        onSuccess={handleTeacherAuthSuccess}
        teacher={teacher}
      />

      {/* Student Self-Registration Modal (학생 학급 참여 신청) */}
      <StudentRegistrationModal
        isOpen={isStudentRegistrationModalOpen}
        onClose={() => setIsStudentRegistrationModalOpen(false)}
        onSubmit={handleStudentSubmitRegistration}
        teacher={teacher}
      />
    </div>
  );
}
