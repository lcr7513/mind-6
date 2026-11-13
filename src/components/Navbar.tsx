import React from 'react';
import { UserRole, Student, Teacher } from '../types';
import {
  Compass,
  GraduationCap,
  Users,
  MessageSquare,
  Printer,
  Sparkles,
  FileText,
  ChevronDown,
  Lightbulb,
  Edit3,
  Target,
  LayoutGrid,
  UserPlus,
  Lock,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (id: string) => void;
  teacher: Teacher;
  activeNav: string;
  onSelectNav: (nav: string) => void;
  onOpenChat: () => void;
  onOpenExportModal: () => void;
  onOpenProfile?: () => void;
  unreadCount?: number;
  onOpenStudentRegistration?: () => void;
  isTeacherAuthenticated?: boolean;
  onRequestTeacherAuth?: () => void;
  onLockTeacherMode?: () => void;
  pendingStudentsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onChangeRole,
  students,
  currentStudentId,
  onSelectStudent,
  teacher: _teacher,
  activeNav,
  onSelectNav,
  onOpenChat,
  onOpenExportModal,
  onOpenProfile,
  unreadCount = 2,
  onOpenStudentRegistration,
  isTeacherAuthenticated = false,
  onRequestTeacherAuth,
  onLockTeacherMode: _onLockTeacherMode,
  pendingStudentsCount = 0,
}) => {
  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-2xs" translate="no">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ROW 1: Brand & User Controls */}
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 gap-3 flex-wrap sm:flex-nowrap">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-slate-900 whitespace-nowrap">
                  학종나침반
                </span>
                <span className="text-[10px] bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full border border-indigo-200 whitespace-nowrap">
                  AI 탐구·세특
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block whitespace-nowrap">
                고교 학생부 종합전형 AI 탐구 길잡이 & 맞춤형 진로 로드맵
              </p>
            </div>
          </div>

          {/* Right Controls: Student Persona, Profile Modal, Role Switch, Coaching Chat, Print */}
          <div className="flex items-center gap-2 ml-auto shrink-0 flex-wrap">
            {/* Student Dropdown & Profile Quick Trigger */}
            {currentRole === 'student' && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="relative">
                  <select
                    value={currentStudentId}
                    onChange={(e) => onSelectStudent(e.target.value)}
                    className="text-xs font-bold pl-2.5 pr-7 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 focus:outline-none appearance-none cursor-pointer transition-colors whitespace-nowrap"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.targetMajor?.split('/')[0]?.trim() || '학과'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={onOpenProfile}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                    title={`현재 관심사: ${currentStudent.mainInterestTopic || '설정 필요'}`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="whitespace-nowrap">관심사 설정</span>
                  </button>
                )}

                {onOpenStudentRegistration && (
                  <button
                    type="button"
                    onClick={onOpenStudentRegistration}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                    title="이창렬 선생님 학급에 신규 학생 참여 신청서 제출"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="whitespace-nowrap">학급 참여 신청</span>
                  </button>
                )}
              </div>
            )}

            {/* Role Switcher Pill (학생 모드 / 교사 모드) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => onChangeRole('student')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  currentRole === 'student'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>학생 모드</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isTeacherAuthenticated) {
                    onChangeRole('teacher');
                    onSelectNav('kanban');
                  } else if (onRequestTeacherAuth) {
                    onRequestTeacherAuth();
                  } else {
                    onChangeRole('teacher');
                    onSelectNav('kanban');
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  currentRole === 'teacher'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={isTeacherAuthenticated ? '교사 관리 모드' : '교사 관리자 비밀번호 인증 필요'}
              >
                <Users className="w-3.5 h-3.5" />
                <span>교사 모드</span>
                {!isTeacherAuthenticated && (
                  <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                {pendingStudentsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white animate-pulse">
                    {pendingStudentsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Live Chat Coaching Button */}
            <button
              type="button"
              onClick={onOpenChat}
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0 cursor-pointer"
              title="교사-학생 실시간 세특 코칭 채팅"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Export / Print Button */}
            <button
              type="button"
              onClick={onOpenExportModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors text-xs font-bold border border-slate-200 shrink-0 cursor-pointer"
              title="포트폴리오 요약서 인쇄 및 PDF 저장"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline whitespace-nowrap">보고서 인쇄</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Primary Navigation Tabs (Spacious, 2-line layout with high readability) */}
        <div className="py-2 overflow-x-auto scrollbar-thin">
          <nav className="flex items-center gap-2 min-w-max">
            {/* Tab 1: 교과 단원별 탐구 길잡이 */}
            <button
              type="button"
              onClick={() => onSelectNav('wizard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeNav === 'wizard'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-indigo-700 border border-slate-200/80'
              }`}
            >
              <Lightbulb className={`w-4 h-4 ${activeNav === 'wizard' ? 'text-amber-300' : 'text-amber-500'}`} />
              <span>교과 단원별 탐구 길잡이</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeNav === 'wizard' ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                AI 추천
              </span>
            </button>

            {/* Tab: 질문 좁히기 3단계 (주제 지도) */}
            <button
              type="button"
              onClick={() => onSelectNav('refinement')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeNav === 'refinement'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-indigo-700 border border-slate-200/80'
              }`}
            >
              <Target className={`w-4 h-4 ${activeNav === 'refinement' ? 'text-amber-300' : 'text-emerald-600'}`} />
              <span>질문 좁히기 3단계</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeNav === 'refinement' ? 'bg-white text-indigo-700' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                주제 지도
              </span>
            </button>

            {/* Tab 2: AI 교과 연계 & 마인드맵 */}
            <button
              type="button"
              onClick={() => onSelectNav('ai-topics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeNav === 'ai-topics'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-indigo-700 border border-slate-200/80'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeNav === 'ai-topics' ? 'text-amber-300' : 'text-indigo-600'}`} />
              <span>AI 교과 연계 & 마인드맵</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeNav === 'ai-topics' ? 'bg-white text-indigo-700' : 'bg-purple-100 text-purple-700'
                }`}
              >
                18개 주제
              </span>
            </button>

            {/* Tab 3: 맞춤형 진로 로드맵 (CRITICAL: Explicitly labeled without awkward line wraps) */}
            <button
              type="button"
              onClick={() => onSelectNav('roadmap')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeNav === 'roadmap'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-indigo-700 border border-slate-200/80'
              }`}
            >
              <Compass className={`w-4 h-4 ${activeNav === 'roadmap' ? 'text-cyan-300' : 'text-emerald-600'}`} />
              <span className="font-extrabold">맞춤형 진로 로드맵</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeNav === 'roadmap' ? 'bg-white text-indigo-700' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                고1~고3 학기별
              </span>
            </button>

            {/* Tab 4: 활동 일지 및 세특 */}
            <button
              type="button"
              onClick={() => onSelectNav('inquiry-logs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeNav === 'inquiry-logs'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-indigo-700 border border-slate-200/80'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeNav === 'inquiry-logs' ? 'text-amber-200' : 'text-slate-600'}`} />
              <span>활동 일지 및 세특 관리</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeNav === 'inquiry-logs' ? 'bg-white text-indigo-700' : 'bg-slate-200 text-slate-700'
                }`}
              >
                기록장
              </span>
            </button>

            {/* Tab 5: 학급 관리 칸반 및 교사 지도 대시보드 (교사 모드일 때 활성화) */}
            {currentRole === 'teacher' && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectNav('kanban')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeNav === 'kanban'
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                      : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-emerald-600" />
                  <span>학급 관리 칸반</span>
                  {pendingStudentsCount > 0 ? (
                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                      대기 {pendingStudentsCount}명
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full font-extrabold">
                      진행 모니터링
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectNav('teacher-panel')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeNav === 'teacher-panel'
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>1:1 세특 첨삭 패널</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-extrabold">
                    실시간 첨삭
                  </span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
