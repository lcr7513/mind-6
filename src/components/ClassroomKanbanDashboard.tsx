import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student, Teacher, InquiryActivityRecord, InquiryStage } from '../types';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  FileCheck,
  Edit3,
  Trash2,
  ExternalLink,
  Target,
  Sparkles,
  BookOpen,
  School,
  GraduationCap,
  LayoutGrid,
  List,
  AlertCircle,
  X,
  Upload,
  UserCheck,
  Lock,
  UserPlus,
  Bell,
  Check,
  Download,
  FileUp,
  FileText,
  Share2,
  Copy,
  Link,
  Send,
} from 'lucide-react';

interface ClassroomKanbanDashboardProps {
  teacher: Teacher;
  students: Student[];
  records: InquiryActivityRecord[];
  onSelectStudent: (studentId: string) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onAddStudent: (newStudent: Student) => void;
  onAddMultipleStudents: (newStudents: Student[]) => void;
  onDeleteStudent: (studentId: string) => void;
  onNavigateToCoaching: (studentId: string) => void;
  onNavigateToRefinement: (studentId: string) => void;
  onApproveStudent?: (studentId: string) => void;
  onApproveAllStudents?: () => void;
  onRejectStudent?: (studentId: string) => void;
  onLockTeacherMode?: () => void;
}

interface ColumnConfig {
  id: InquiryStage;
  title: string;
  subtitle: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  headerBorder: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'topic_planning',
    title: '1단계: 주제 기획 중',
    subtitle: '관심사 설정 및 교과 단원 연계 탐색',
    color: 'amber',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    headerBorder: 'border-amber-300',
  },
  {
    id: 'in_progress',
    title: '2단계: 탐구·실험 진행 중',
    subtitle: '공공데이터·실험·모델링 실증 분석',
    color: 'sky',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    headerBorder: 'border-sky-300',
  },
  {
    id: 'submitted',
    title: '3단계: 활동일지 제출 완료',
    subtitle: '보고서 제출 · 교사 1:1 첨삭 대기',
    color: 'purple',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    headerBorder: 'border-purple-300',
  },
  {
    id: 'finalized',
    title: '4단계: 세특 문안 확정',
    subtitle: '3대 역량 평가 완료 · 나이스 기재 준비',
    color: 'emerald',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    headerBorder: 'border-emerald-300',
  },
];

export const ClassroomKanbanDashboard: React.FC<ClassroomKanbanDashboardProps> = ({
  teacher,
  students,
  records,
  onSelectStudent,
  onUpdateStudent,
  onAddStudent,
  onAddMultipleStudents,
  onDeleteStudent,
  onNavigateToCoaching,
  onNavigateToRefinement,
  onApproveStudent,
  onApproveAllStudents,
  onRejectStudent,
  onLockTeacherMode,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [isShareLinkModalOpen, setIsShareLinkModalOpen] = useState<boolean>(false);
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State for Single Student
  const [newName, setNewName] = useState<string>('');
  const [newGrade, setNewGrade] = useState<string>('고등학교 2학년');
  const [newClassNum, setNewClassNum] = useState<string>('1반 01번');
  const [newTargetMajor, setNewTargetMajor] = useState<string>('사회과학계열 / 지리학');
  const [newTargetCareer, setNewTargetCareer] = useState<string>('도시계획가');
  const [newInterestTopic, setNewInterestTopic] = useState<string>('');
  const [newMethodology, setNewMethodology] = useState<string>('공공데이터 & 통계 분석');
  const [newStage, setNewStage] = useState<InquiryStage>('topic_planning');

  // Bulk Import State
  const [bulkTab, setBulkTab] = useState<'excel' | 'text'>('excel');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  const [bulkText, setBulkText] = useState<string>(
    `박예원, 고등학교 2학년, 2반 08번, 지리학과 / 국토도시계획, 인천 해안 매립지 생태변화와 GIS 분석, QGIS 공간분석\n` +
    `송민지, 고등학교 1학년, 4반 15번, 사회학과 / 공공정책, 청소년 대중교통 접근성과 사회적 배제 실태, 설문조사 & 통계\n` +
    `강서현, 고등학교 2학년, 3반 19번, 화학공학과 / 신소재, 친환경 바이오플라스틱 분해 속도 비교 실험, 대조군 정량계측`
  );
  const [bulkPreview, setBulkPreview] = useState<Student[]>([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Split into Approved students (Active Roster) & Pending Applicants
  const approvedStudents = useMemo(() => {
    return students.filter((s) => s.approvalStatus !== 'pending');
  }, [students]);

  const pendingStudents = useMemo(() => {
    return students.filter((s) => s.approvalStatus === 'pending');
  }, [students]);

  // Filtered Approved Students for Kanban & Table
  const filteredStudents = useMemo(() => {
    return approvedStudents.filter((s) => {
      const matchSearch =
        searchQuery === '' ||
        s.name.includes(searchQuery) ||
        (s.targetMajor || '').includes(searchQuery) ||
        (s.mainInterestTopic || '').includes(searchQuery) ||
        (s.classNum || '').includes(searchQuery);

      const matchGrade =
        selectedGradeFilter === 'all' ||
        (selectedGradeFilter === '1' && s.grade.includes('1학년')) ||
        (selectedGradeFilter === '2' && s.grade.includes('2학년')) ||
        (selectedGradeFilter === '3' && s.grade.includes('3학년'));

      return matchSearch && matchGrade;
    });
  }, [approvedStudents, searchQuery, selectedGradeFilter]);

  // Statistics calculation based on approved students
  const stageStats = useMemo(() => {
    const stats: Record<InquiryStage, number> = {
      topic_planning: 0,
      in_progress: 0,
      submitted: 0,
      finalized: 0,
    };

    approvedStudents.forEach((s) => {
      const stage = s.inquiryStage || 'topic_planning';
      stats[stage] = (stats[stage] || 0) + 1;
    });

    return stats;
  }, [approvedStudents]);

  // Handle stage change directly from Kanban
  const handleMoveStage = (student: Student, newStage: InquiryStage) => {
    const updated: Student = {
      ...student,
      inquiryStage: newStage,
      status: newStage === 'submitted' ? 'review_needed' : 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onUpdateStudent(updated);
    showToast(`${student.name} 학생이 [${COLUMNS.find((c) => c.id === newStage)?.title}]으로 이동되었습니다.`);
  };

  // Add Single Student
  const handleSaveSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('학생 이름을 입력해주세요.');
      return;
    }

    const created: Student = {
      id: `student-${Date.now()}`,
      name: newName.trim(),
      grade: newGrade,
      classNum: newClassNum.trim(),
      targetMajor: newTargetMajor.trim(),
      targetCareer: newTargetCareer.trim(),
      mainInterestTopic: newInterestTopic.trim() || '교과 연계 첨단 쟁점 탐구',
      interestKeywords: [newTargetMajor.split('/')[0].trim(), '교과연계', '탐구력'],
      preferredSubjects: ['사회 (통합사회/지리)', '수학', '국어'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      school: teacher.school || '인성여자고등학교',
      status: newStage === 'submitted' ? 'review_needed' : 'active',
      inquiryStage: newStage,
      methodologyTool: newMethodology.trim(),
      lastUpdated: new Date().toISOString().split('T')[0],
      onboardingCompleted: true,
    };

    onAddStudent(created);
    setIsAddModalOpen(false);
    setNewName('');
    setNewInterestTopic('');
    showToast(`${created.name} 학생이 학급 명단에 등록되었습니다!`);
  };

  // Bulk CSV Parse
  const handleParseBulk = () => {
    const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
    const parsed: Student[] = lines.map((line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      const name = parts[0] || `신규학생${idx + 1}`;
      const grade = parts[1] || '고등학교 2학년';
      const classNum = parts[2] || `${idx + 1}반 01번`;
      const targetMajor = parts[3] || '사회과학계열 / 지리학';
      const mainInterestTopic = parts[4] || '교과 연계 학술 탐구';
      const methodologyTool = parts[5] || '공공데이터 & 통계 분석';

      return {
        id: `student-${Date.now()}-${idx}`,
        name,
        grade,
        classNum,
        targetMajor,
        targetCareer: `${targetMajor.split('/')[0].trim()} 전문가`,
        mainInterestTopic,
        interestKeywords: [targetMajor.split('/')[0].trim(), '교과연계', '데이터실증'],
        preferredSubjects: ['사회 (통합사회/지리)', '국어', '수학'],
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        school: teacher.school || '인성여자고등학교',
        status: 'active',
        inquiryStage: 'topic_planning',
        methodologyTool,
        lastUpdated: new Date().toISOString().split('T')[0],
        onboardingCompleted: true,
      };
    });

    setBulkPreview(parsed);
  };

  // Handle Excel (.xlsx, .xls, .csv) upload
  const handleExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        alert('엑셀 시트를 찾을 수 없습니다.');
        return;
      }
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
      if (!rows || rows.length === 0) {
        alert('엑셀 파일에 데이터가 없습니다.');
        return;
      }

      // Filter out empty rows
      const validRows = rows.filter(
        (r) =>
          r &&
          r.length > 0 &&
          r.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== '')
      );

      if (validRows.length === 0) {
        alert('등록 가능한 유효한 데이터 행이 없습니다.');
        return;
      }

      // Check if first row is header
      let startIndex = 0;
      const firstRowStr = validRows[0].map((c) => String(c).trim()).join(' ');
      if (/이름|성명|name|학생/i.test(firstRowStr)) {
        startIndex = 1;
      }

      const dataRows = validRows.slice(startIndex);
      const parsed: Student[] = dataRows.map((row, idx) => {
        const name = String(row[0] || `신규학생${idx + 1}`).trim();
        let grade = String(row[1] || '고등학교 2학년').trim();
        if (!grade.includes('고등학교')) {
          if (grade.includes('1')) grade = '고등학교 1학년';
          else if (grade.includes('3')) grade = '고등학교 3학년';
          else grade = '고등학교 2학년';
        }
        const classNum = String(row[2] || `${idx + 1}반 01번`).trim();
        const targetMajor = String(row[3] || '사회과학계열 / 지리학').trim();
        const mainInterestTopic = String(row[4] || '교과 연계 학술 탐구').trim();
        const methodologyTool = String(row[5] || '공공데이터 & 통계 분석').trim();

        return {
          id: `student-${Date.now()}-${idx}`,
          name,
          grade,
          classNum,
          targetMajor,
          targetCareer: `${targetMajor.split('/')[0].trim()} 전문가`,
          mainInterestTopic,
          interestKeywords: [targetMajor.split('/')[0].trim(), '교과연계', '데이터실증'],
          preferredSubjects: ['사회 (통합사회/지리)', '국어', '수학'],
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          school: teacher.school || '인성여자고등학교',
          status: 'active',
          approvalStatus: 'approved',
          inquiryStage: 'topic_planning',
          methodologyTool,
          lastUpdated: new Date().toISOString().split('T')[0],
          onboardingCompleted: true,
        };
      });

      if (parsed.length === 0) {
        alert('추출 가능한 학생 데이터가 없습니다.');
        return;
      }

      setBulkPreview(parsed);
      setUploadedFileName(file.name);
      showToast(`${file.name}에서 학생 ${parsed.length}명을 성공적으로 불러왔습니다.`);
    } catch (err) {
      console.error('Excel parse error:', err);
      alert('엑셀 파일을 읽는 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
    }
  };

  // Download official Excel template (.xlsx)
  const handleDownloadExcelTemplate = () => {
    const headers = ['이름', '학년', '반/번호', '희망전공/계열', '핵심탐구주제', '연구방법론/도구'];
    const sampleRows = [
      ['김민서', '고등학교 2학년', '2반 14번', '사회과학계열 / 지리학', '인천 원도심 도시재생과 상권 변화 GIS 공간분석', 'QGIS 지리공간분석 & 통계청 KOSIS'],
      ['이준호', '고등학교 2학년', '4반 21번', '지리교육과 / 사회교육', '기후변화에 따른 지리적 불평등과 공간 정의', '통계청 KOSIS & 설문조사 실태분석'],
      ['박서연', '고등학교 3학년', '1반 09번', '환경경제학 / 공공정책', '탄소배출권 거래제 시장 실패 방지와 피구세 최적 모델링', '탄소배출권 통계 & 계량경제 회귀분석'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = [
      { wch: 10 },
      { wch: 16 },
      { wch: 12 },
      { wch: 24 },
      { wch: 48 },
      { wch: 32 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '학생명단');
    XLSX.writeFile(wb, '인성여고_학급_학생명단_일괄등록_서식.xlsx');
  };

  // Execute Bulk Import
  const handleConfirmBulkImport = () => {
    let listToImport = bulkPreview;
    if (listToImport.length === 0 && bulkTab === 'text') {
      const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
      listToImport = lines.map((line, idx) => {
        const parts = line.split(',').map((p) => p.trim());
        const name = parts[0] || `신규학생${idx + 1}`;
        const grade = parts[1] || '고등학교 2학년';
        const classNum = parts[2] || `${idx + 1}반 01번`;
        const targetMajor = parts[3] || '사회과학계열 / 지리학';
        const mainInterestTopic = parts[4] || '교과 연계 학술 탐구';
        const methodologyTool = parts[5] || '공공데이터 & 통계 분석';

        return {
          id: `student-${Date.now()}-${idx}`,
          name,
          grade,
          classNum,
          targetMajor,
          targetCareer: `${targetMajor.split('/')[0].trim()} 전문가`,
          mainInterestTopic,
          interestKeywords: [targetMajor.split('/')[0].trim(), '교과연계', '데이터실증'],
          preferredSubjects: ['사회 (통합사회/지리)', '국어', '수학'],
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          school: teacher.school || '인성여자고등학교',
          status: 'active',
          approvalStatus: 'approved',
          inquiryStage: 'topic_planning',
          methodologyTool,
          lastUpdated: new Date().toISOString().split('T')[0],
          onboardingCompleted: true,
        };
      });
    }

    if (!listToImport || listToImport.length === 0) {
      alert('등록할 학생 정보가 없습니다. 엑셀 파일을 업로드하거나 텍스트를 입력해 주세요.');
      return;
    }

    onAddMultipleStudents(listToImport);
    setIsBulkModalOpen(false);
    setBulkPreview([]);
    setUploadedFileName(null);
    showToast(`총 ${listToImport.length}명의 학생이 성공적으로 일괄 등록되었습니다!`);
  };

  // Save Edited Student
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    onUpdateStudent(editingStudent);
    setEditingStudent(null);
    showToast(`${editingStudent.name} 학생의 정보가 수정되었습니다.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6" translate="no">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Teacher Profile & School Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden border border-indigo-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Teacher Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-xl">
                {teacher.name.substring(0, 1)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg sm:text-xl font-black text-white">{teacher.name} 선생님</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  {teacher.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {teacher.school}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                고등학교 학생부 종합전형 교과 세특 관리 & 학급 탐구 지도 통합 관제실
              </p>
            </div>
          </div>

          {/* Action Buttons for Teacher */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {onLockTeacherMode && (
              <button
                type="button"
                onClick={onLockTeacherMode}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 hover:text-white font-bold text-xs border border-rose-400/30 transition-all cursor-pointer backdrop-blur-sm"
                title="교사 모드를 잠그고 학생 모드로 전환"
              >
                <Lock className="w-3.5 h-3.5 text-rose-300" />
                <span>교사 잠금 (로그아웃)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>개별 학생 등록</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleParseBulk();
                setIsBulkModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>명단 일괄 등록 (CSV)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareLinkModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer ring-1 ring-emerald-400/50"
              title="학생 배포용 링크 생성 및 구글 클래스룸/카카오톡 공지문 복사"
            >
              <Share2 className="w-4 h-4 text-emerald-100" />
              <span>학생 배포용 링크</span>
            </button>
          </div>
        </div>

        {/* 4-Stage Summary Metric Badges */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLUMNS.map((col) => {
            const count = stageStats[col.id] || 0;
            return (
              <div
                key={col.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-slate-400 font-extrabold">{col.title.split(':')[1]?.trim()}</div>
                  <div className="text-lg font-black text-white">{count}명</div>
                </div>
                <div className={`w-3 h-3 rounded-full ${col.id === 'finalized' ? 'bg-emerald-400' : col.id === 'submitted' ? 'bg-purple-400' : col.id === 'in_progress' ? 'bg-sky-400' : 'bg-amber-400'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* PENDING APPROVAL QUEUE (신규 학생 등록 수락 섹션) */}
      {pendingStudents.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-200">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-amber-950">
                    신규 참여 신청 학생 (승인 대기)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-2xs">
                    {pendingStudents.length}명 대기 중
                  </span>
                </div>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  학생들이 제출한 참여 신청서입니다. [수락] 버튼을 누르면 정식 학급 명단에 등록되고 1단계(주제 기획) 탐구가 시작됩니다.
                </p>
              </div>
            </div>

            {onApproveAllStudents && pendingStudents.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  onApproveAllStudents();
                  showToast(`대기 중인 학생 ${pendingStudents.length}명을 모두 일괄 수락했습니다!`);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md shadow-amber-200 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>전체 일괄 수락 ({pendingStudents.length}명)</span>
              </button>
            )}
          </div>

          {/* Pending Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {pendingStudents.map((st) => (
              <div
                key={st.id}
                className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all"
              >
                <div className="space-y-2.5">
                  {/* Top: Student Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {st.name.substring(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">{st.name}</span>
                          <span className="text-[11px] text-slate-500 font-semibold">({st.grade} {st.classNum})</span>
                        </div>
                        <div className="text-[10px] text-indigo-700 font-bold truncate max-w-[170px]">
                          {st.targetMajor}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {st.appliedAt || '방금 전'}
                    </span>
                  </div>

                  {/* Applied Message */}
                  {st.appliedMessage && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 text-[11px] text-amber-900 leading-relaxed italic">
                      "{st.appliedMessage}"
                    </div>
                  )}

                  {/* Career & Topic */}
                  <div className="space-y-1 text-[11px]">
                    <div className="text-slate-700 truncate">
                      <span className="text-slate-400 font-semibold">희망진로:</span> {st.targetCareer}
                    </div>
                    {st.mainInterestTopic && (
                      <div className="text-slate-700 font-medium line-clamp-2">
                        <span className="text-slate-400 font-semibold">관심주제:</span> {st.mainInterestTopic}
                      </div>
                    )}
                  </div>
                </div>

                {/* Approve / Reject Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (onRejectStudent) {
                        if (confirm(`${st.name} 학생의 신청을 반려(삭제)하시겠습니까?`)) {
                          onRejectStudent(st.id);
                          showToast(`${st.name} 학생의 신청을 반려했습니다.`);
                        }
                      } else {
                        onDeleteStudent(st.id);
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-500 font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    반려
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onApproveStudent) {
                        onApproveStudent(st.id);
                      } else {
                        onUpdateStudent({ ...st, approvalStatus: 'approved', inquiryStage: 'topic_planning' });
                      }
                      showToast(`${st.name} 학생의 학급 참여가 승인되었습니다!`);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>수락 (승인)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar: Search, Grade Filter & View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="학생 이름, 반/번호, 희망 전공, 탐구 키워드 검색..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-500">학년:</span>
            {['all', '1', '2', '3'].map((gr) => (
              <button
                key={gr}
                type="button"
                onClick={() => setSelectedGradeFilter(gr)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedGradeFilter === gr
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {gr === 'all' ? '전체' : `${gr}학년`}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 shrink-0 self-end md:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'kanban' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>칸반 보드</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>목록 테이블</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD (4 Columns) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {COLUMNS.map((col, colIndex) => {
            const columnStudents = filteredStudents.filter(
              (s) => (s.inquiryStage || 'topic_planning') === col.id
            );

            return (
              <div
                key={col.id}
                className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-4 flex flex-col space-y-3.5 min-h-[500px]"
              >
                {/* Column Header */}
                <div className={`pb-3 border-b-2 ${col.headerBorder} flex items-center justify-between`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText}`}>
                        {col.title.split(':')[0]}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {col.title.split(':')[1]?.trim()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{col.subtitle}</p>
                  </div>
                  <span className="text-xs font-black bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {columnStudents.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] pr-0.5 scrollbar-thin">
                  {columnStudents.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
                      해당 단계의 학생이 없습니다.
                    </div>
                  ) : (
                    columnStudents.map((st) => {
                      const studentRecordCount = records.filter((r) => r.studentId === st.id).length;
                      const hasReviewNeeded = st.status === 'review_needed';

                      return (
                        <div
                          key={st.id}
                          className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2.5 relative group"
                        >
                          {/* Card Top: Avatar, Name & Class */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {st.name.substring(0, 1)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-slate-900">{st.name}</span>
                                  <span className="text-[10px] text-slate-500 font-medium">({st.classNum})</span>
                                </div>
                                <div className="text-[10px] text-indigo-700 font-bold truncate max-w-[150px]">
                                  {st.targetMajor?.split('/')[0]?.trim()}
                                </div>
                              </div>
                            </div>

                            {/* Stage Move Dropdown Button */}
                            <div className="flex items-center gap-1">
                              {colIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStage(st, COLUMNS[colIndex - 1].id)}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                  title="이전 단계로 이동"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {colIndex < COLUMNS.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStage(st, COLUMNS[colIndex + 1].id)}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                                  title="다음 단계로 이동"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Interest Topic */}
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-800 font-medium leading-relaxed line-clamp-2">
                            "{st.mainInterestTopic || '미정'}"
                          </div>

                          {/* Methodology Tool Badge */}
                          {st.methodologyTool && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate">{st.methodologyTool}</span>
                            </div>
                          )}

                          {/* Bottom Row: Status Badge & Teacher Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
                            <div className="flex items-center gap-1">
                              {hasReviewNeeded && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                  첨삭대기
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">일지 {studentRecordCount}건</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectStudent(st.id);
                                  onNavigateToRefinement(st.id);
                                }}
                                className="p-1 rounded bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                                title="질문 좁히기 지도"
                              >
                                <Target className="w-3 h-3 text-emerald-600" />
                                <span>좁히기</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onSelectStudent(st.id);
                                  onNavigateToCoaching(st.id);
                                }}
                                className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                                title="1:1 첨삭 열기"
                              >
                                <Edit3 className="w-3 h-3 text-indigo-600" />
                                <span>첨삭</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: LIST TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4">학생명 / 반</th>
                  <th className="py-3 px-4">희망 전공 / 진로</th>
                  <th className="py-3 px-4">핵심 탐구 주제</th>
                  <th className="py-3 px-4">연구 방법론 도구</th>
                  <th className="py-3 px-4">현재 탐구 단계</th>
                  <th className="py-3 px-4 text-center">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      검색 조건에 맞는 학생이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => {
                    const currentStageConfig =
                      COLUMNS.find((c) => c.id === (st.inquiryStage || 'topic_planning')) || COLUMNS[0];

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{st.name}</span>
                            <span className="text-[11px] text-slate-500 font-medium">({st.classNum})</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{st.grade}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 max-w-[180px] truncate">
                          {st.targetMajor}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-[260px] truncate">
                          {st.mainInterestTopic}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-[160px] truncate">
                          {st.methodologyTool || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={st.inquiryStage || 'topic_planning'}
                            onChange={(e) => handleMoveStage(st, e.target.value as InquiryStage)}
                            className={`text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 focus:outline-none cursor-pointer ${currentStageConfig.badgeBg} ${currentStageConfig.badgeText}`}
                          >
                            {COLUMNS.map((col) => (
                              <option key={col.id} value={col.id}>
                                {col.title}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectStudent(st.id);
                                onNavigateToRefinement(st.id);
                              }}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              질문좁히기
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectStudent(st.id);
                                onNavigateToCoaching(st.id);
                              }}
                              className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              첨삭
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStudent(st)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="정보 수정"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`정말 ${st.name} 학생을 명단에서 삭제하시겠습니까?`)) {
                                  onDeleteStudent(st.id);
                                  showToast(`${st.name} 학생이 삭제되었습니다.`);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="학생 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD SINGLE STUDENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                신규 학생 개별 등록
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">학생 이름 *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="예: 최수진"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">반 / 번호 *</label>
                  <input
                    type="text"
                    required
                    value={newClassNum}
                    onChange={(e) => setNewClassNum(e.target.value)}
                    placeholder="예: 2반 15번"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">학년</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="고등학교 1학년">고등학교 1학년</option>
                    <option value="고등학교 2학년">고등학교 2학년</option>
                    <option value="고등학교 3학년">고등학교 3학년</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">초기 탐구 단계</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as InquiryStage)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none font-semibold cursor-pointer"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">희망 전공 / 학과</label>
                <input
                  type="text"
                  value={newTargetMajor}
                  onChange={(e) => setNewTargetMajor(e.target.value)}
                  placeholder="예: 지리학과, 도시계획학, 컴퓨터공학"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">핵심 관심 탐구 주제</label>
                <input
                  type="text"
                  value={newInterestTopic}
                  onChange={(e) => setNewInterestTopic(e.target.value)}
                  placeholder="예: 인천 원도심 쇠퇴 지역 도시재생을 위한 지리정보시스템(GIS) 공간 분석"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">선택 연구 방법론 / 도구</label>
                <input
                  type="text"
                  value={newMethodology}
                  onChange={(e) => setNewMethodology(e.target.value)}
                  placeholder="예: QGIS 지리공간분석 & 통계청 KOSIS"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-colors cursor-pointer"
                >
                  학생 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK EXCEL / CSV IMPORT */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    학생 명단 엑셀(.xlsx) / CSV 일괄 등록
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    학급 학생 명단을 엑셀 파일 업로드 또는 텍스트 붙여넣기로 한 번에 등록합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setUploadedFileName(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto space-y-4 text-xs pr-1 flex-1">
              {/* Tab Selector: Excel Upload vs Direct Text */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBulkTab('excel')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    bulkTab === 'excel'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>엑셀(.xlsx) 파일 업로드</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBulkTab('text')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    bulkTab === 'text'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>텍스트 직접 붙여넣기</span>
                </button>
              </div>

              {/* TAB 1: EXCEL FILE UPLOAD */}
              {bulkTab === 'excel' && (
                <div className="space-y-3">
                  {/* Action Banner with Template Download */}
                  <div className="bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>엑셀 표준 양식을 사용하여 간편하게 업로드하세요</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        열 순서: 이름 / 학년 / 반·번호 / 희망전공 / 핵심탐구주제 / 연구도구
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadExcelTemplate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-800 font-bold border border-emerald-300 hover:bg-emerald-100/70 transition-colors shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>표준 양식 다운로드 (.xlsx)</span>
                    </button>
                  </div>

                  {/* Drag & Drop Upload Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleExcelFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => excelFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2.5 ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-100/60 scale-[1.01]'
                        : uploadedFileName
                        ? 'border-emerald-400 bg-emerald-50/40'
                        : 'border-slate-300 bg-slate-50/70 hover:border-emerald-400 hover:bg-emerald-50/30'
                    }`}
                  >
                    <input
                      type="file"
                      ref={excelFileInputRef}
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleExcelFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                      <FileUp className="w-6 h-6" />
                    </div>

                    {uploadedFileName ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1.5 font-black text-emerald-900 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{uploadedFileName}</span>
                        </div>
                        <p className="text-xs text-emerald-700 font-medium">
                          총 <strong>{bulkPreview.length}명</strong>의 학생 데이터가 성공적으로 추출되었습니다.
                        </p>
                        <span className="inline-block text-[10px] text-slate-400 font-medium mt-1 underline hover:text-slate-600">
                          다른 파일로 변경하려면 클릭하세요
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 text-xs sm:text-sm">
                          엑셀(.xlsx, .xls) 또는 CSV 파일을 이곳에 드래그하거나 클릭하세요
                        </p>
                        <p className="text-[11px] text-slate-500">
                          NEIS 나이스 학급 명부 엑셀이나 교과 수강생 명단을 바로 올리실 수 있습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: TEXT DIRECT PASTE */}
              {bulkTab === 'text' && (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 leading-relaxed">
                    <strong>💡 텍스트 구분 가이드:</strong> 한 줄에 한 명씩 콤마(,)로 구분하여 입력하세요:
                    <div className="font-mono text-[11px] mt-1 text-indigo-700 bg-white p-2 rounded-lg border border-slate-200">
                      학생이름, 학년, 반번호, 희망전공, 핵심탐구주제, 연구방법론도구
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">학생 명단 데이터 붙여넣기:</label>
                    <textarea
                      rows={5}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      className="w-full p-3 font-mono text-[11px] bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleParseBulk}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                    >
                      미리보기 갱신
                    </button>
                  </div>
                </div>
              )}

              {/* COMMON PREVIEW TABLE */}
              {bulkPreview.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>추출 결과 미리보기 (총 {bulkPreview.length}명)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      확인 후 아래 등록 버튼을 누르면 학급 명단에 추가됩니다.
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                    {bulkPreview.map((st, i) => (
                      <div key={i} className="p-2.5 text-[11px] flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {i + 1}
                          </span>
                          <strong className="text-slate-900">{st.name}</strong>
                          <span className="text-slate-500">({st.grade} {st.classNum})</span>
                          <span className="text-indigo-600 font-semibold truncate max-w-[120px]">
                            {st.targetMajor}
                          </span>
                        </div>
                        <span className="text-slate-600 truncate max-w-[220px] font-medium">
                          {st.mainInterestTopic}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setUploadedFileName(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkImport}
                disabled={bulkPreview.length === 0}
                className={`px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  bulkPreview.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {bulkPreview.length > 0 ? `총 ${bulkPreview.length}명 일괄 등록 확정` : '등록할 학생 없음'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT STUDENT */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                {editingStudent.name} 학생 정보 수정
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">학생 이름</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">반 / 번호</label>
                  <input
                    type="text"
                    value={editingStudent.classNum}
                    onChange={(e) => setEditingStudent({ ...editingStudent, classNum: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">희망 전공</label>
                <input
                  type="text"
                  value={editingStudent.targetMajor}
                  onChange={(e) => setEditingStudent({ ...editingStudent, targetMajor: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">핵심 탐구 주제</label>
                <input
                  type="text"
                  value={editingStudent.mainInterestTopic || ''}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, mainInterestTopic: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">탐구 단계</label>
                <select
                  value={editingStudent.inquiryStage || 'topic_planning'}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      inquiryStage: e.target.value as InquiryStage,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-semibold cursor-pointer"
                >
                  {COLUMNS.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-colors cursor-pointer"
                >
                  수정 사항 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DISTRIBUTION LINK MODAL (학생 배포용 링크 생성 모달) */}
      {isShareLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      학생 배포용 링크 & 학급 참여 안내
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                      배포 준비 완료
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {teacher.school} · {teacher.subject} {teacher.name} 선생님의 학급 학생들에게 배포할 전용 링크입니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareLinkModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Links List */}
            <div className="space-y-3.5">
              {/* Link Option 1: Registration Link (Recommended) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border-2 border-emerald-400/80 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
                      ★ 가장 추천
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      1. 신규 학생 학급 참여 신청서 링크 (접속 즉시 등록 팝업)
                    </h4>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold hidden sm:inline">
                    새 학기 학생 모집용
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  학생이 이 링크를 열면 바로 <strong>[학급 참여 신청서]</strong> 팝업이 뜨며, 이름/학번/희망학과를 입력하고 제출하면 선생님의 대시보드 승인 대기열로 들어옵니다.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white px-3 py-2 rounded-xl border border-emerald-300 font-mono text-xs text-emerald-900 truncate">
                    {`${typeof window !== 'undefined' && window.location.origin.includes('ais-dev-') ? window.location.origin.replace('ais-dev-', 'ais-pre-') : (typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-gbbwrsmqpahhkyjio4q4ct-595984271067.asia-northeast1.run.app')}?register=true`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${typeof window !== 'undefined' && window.location.origin.includes('ais-dev-') ? window.location.origin.replace('ais-dev-', 'ais-pre-') : (typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-gbbwrsmqpahhkyjio4q4ct-595984271067.asia-northeast1.run.app')}?register=true`;
                      navigator.clipboard.writeText(url);
                      setCopiedLinkType('register');
                      showToast('신규 학생 학급 등록 링크가 복사되었습니다!');
                      setTimeout(() => setCopiedLinkType(null), 2500);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      copiedLinkType === 'register'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                    }`}
                  >
                    {copiedLinkType === 'register' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>링크 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Link Option 2: Student Main Workspace */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    2. 학생 메인 탐구 작업실 기본 링크 (학생 모드)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    등록 완료 학생용
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  이미 학급에 등록된 학생이 교과 위저드, 활동 일지, 진로 로드맵을 작성하고 열람할 수 있는 기본 화면입니다.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 truncate">
                    {`${typeof window !== 'undefined' && window.location.origin.includes('ais-dev-') ? window.location.origin.replace('ais-dev-', 'ais-pre-') : (typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-gbbwrsmqpahhkyjio4q4ct-595984271067.asia-northeast1.run.app')}?mode=student`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${typeof window !== 'undefined' && window.location.origin.includes('ais-dev-') ? window.location.origin.replace('ais-dev-', 'ais-pre-') : (typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-gbbwrsmqpahhkyjio4q4ct-595984271067.asia-northeast1.run.app')}?mode=student`;
                      navigator.clipboard.writeText(url);
                      setCopiedLinkType('main');
                      showToast('학생 메인 화면 링크가 복사되었습니다!');
                      setTimeout(() => setCopiedLinkType(null), 2500);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      copiedLinkType === 'main'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {copiedLinkType === 'main' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>링크 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Link Option 3: Question Refinement Wizard Direct */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>3. 질문 좁히기 3단계 위저드 직행 링크</span>
                  </h4>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">
                    AI 실시간 최적화
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  수업 중 학생의 초기 관심사를 고교 교과 단원 및 실증 방법론과 결합하는 3단계 위저드로 바로 이동합니다.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white px-3 py-2 rounded-xl border border-indigo-200 font-mono text-xs text-indigo-900 truncate">
                    {`${typeof window !== 'undefined' && window.location.origin.includes('ais-dev-') ? window.location.origin.replace('ais-dev-', 'ais-pre-') : (typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-gbbwrsmqpahhkyjio4q4ct-595984271067.asia-northeast1.run.app')}?nav=refine`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${typeof window !== 'undefined' && window.location.origin.includes('ais-dev-') ? window.location.origin.replace('ais-dev-', 'ais-pre-') : (typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-gbbwrsmqpahhkyjio4q4ct-595984271067.asia-northeast1.run.app')}?nav=refine`;
                      navigator.clipboard.writeText(url);
                      setCopiedLinkType('refine');
                      showToast('질문 좁히기 직행 링크가 복사되었습니다!');
                      setTimeout(() => setCopiedLinkType(null), 2500);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      copiedLinkType === 'refine'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {copiedLinkType === 'refine' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>링크 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Ready-to-Send Classroom/KakaoTalk Message Template */}
            <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-extrabold text-slate-200">
                    구글 클래스룸 / 카카오톡 공지문 템플릿
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const regUrl = `${typeof window !== 'undefined' && window.location.origin.includes('ais-dev-') ? window.location.origin.replace('ais-dev-', 'ais-pre-') : (typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-gbbwrsmqpahhkyjio4q4ct-595984271067.asia-northeast1.run.app')}?register=true`;
                    const template = `[${teacher.school} ${teacher.subject} ${teacher.name} 선생님 학종나침반 학급 참여 안내]\n\n학생 여러분, 학생부 종합전형 AI 심화 탐구 주제 설계 및 맞춤형 세특 관리를 위한 '학종나침반'에 접속하여 학급 참여 신청서를 제출해주세요!\n\n👉 학급 참여 신청 바로가기:\n${regUrl}\n\n■ 참여 방법:\n1) 위 링크 접속 후 본인 이름, 학년/반/번호, 희망 전공, 최근 관심사를 입력하고 [학급 참여 신청서 제출]을 누르세요.\n2) 선생님이 승인하면 본인 이름으로 탐구 활동 일지 작성과 AI 세특 문안 추천을 이용할 수 있습니다.`;
                    navigator.clipboard.writeText(template);
                    setCopiedLinkType('template');
                    showToast('클래스룸/카카오톡 공지문 전체가 복사되었습니다!');
                    setTimeout(() => setCopiedLinkType(null), 2500);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    copiedLinkType === 'template'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black'
                  }`}
                >
                  {copiedLinkType === 'template' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>공지문 복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>공지문 전체 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 text-[11px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-800 select-all">
{`[${teacher.school} ${teacher.subject} ${teacher.name} 선생님 학종나침반 학급 참여 안내]

학생 여러분, 학생부 종합전형 AI 심화 탐구 주제 설계 및 맞춤형 세특 관리를 위한 '학종나침반'에 접속하여 학급 참여 신청서를 제출해주세요!

👉 학급 참여 신청 바로가기:
${typeof window !== 'undefined' && window.location.origin.includes('ais-dev-') ? window.location.origin.replace('ais-dev-', 'ais-pre-') : (typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-gbbwrsmqpahhkyjio4q4ct-595984271067.asia-northeast1.run.app')}?register=true

■ 참여 방법:
1) 위 링크 접속 후 이름, 학번, 희망 전공, 최근 관심사를 입력하고 [학급 참여 신청서 제출]을 누르세요.
2) 선생님이 확인 후 승인하면 맞춤형 탐구 일지와 세특 문안 작성을 시작할 수 있습니다.`}
              </div>
            </div>

            {/* Teacher Guidance Note */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <span className="text-base shrink-0">💡</span>
              <div className="space-y-1">
                <span className="font-bold">선생님 확인 팁:</span>
                <p className="text-amber-800 leading-relaxed">
                  학생이 링크를 통해 신청서를 제출하면 교사 대시보드 상단의 <strong>[신규 학생 참여 신청 승인 대기]</strong> 카드에 실시간 알림과 함께 등록 요청이 뜹니다. <strong>[수락]</strong> 버튼을 누르시면 해당 학생이 학급 명단에 정식 등록되어 1:1 관리가 시작됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
