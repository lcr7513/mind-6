import React, { useState } from 'react';
import {
  X,
  UserPlus,
  GraduationCap,
  School,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Compass,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { Student, Teacher } from '../types';

interface StudentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newStudent: Student) => void;
  teacher: Teacher;
}

export const StudentRegistrationModal: React.FC<StudentRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  teacher,
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('고등학교 2학년');
  const [classNum, setClassNum] = useState('');
  const [targetMajor, setTargetMajor] = useState('');
  const [targetCareer, setTargetCareer] = useState('');
  const [interestKeywords, setInterestKeywords] = useState('');
  const [mainInterestTopic, setMainInterestTopic] = useState('');
  const [appliedMessage, setAppliedMessage] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('학생 이름을 입력해 주세요.');
      return;
    }
    if (!classNum.trim()) {
      setError('반과 번호를 입력해 주세요. (예: 2반 14번)');
      return;
    }
    if (!targetMajor.trim()) {
      setError('희망 전공 또는 관심 계열을 입력해 주세요.');
      return;
    }

    const keywords = interestKeywords
      ? interestKeywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [targetMajor, '교과 연계 탐구'];

    const newStudent: Student = {
      id: `student-applied-${Date.now()}`,
      name: name.trim(),
      grade,
      classNum: classNum.trim(),
      targetMajor: targetMajor.trim(),
      targetCareer: targetCareer.trim() || `${targetMajor} 연구원/전문가`,
      mainInterestTopic: mainInterestTopic.trim() || `${targetMajor} 관련 교과 융합 심화 탐구`,
      interestKeywords: keywords,
      preferredSubjects: ['사회 (지리/통합사회)', '수학 (확률과 통계)', '정보/AI'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      school: teacher.school || '인성여자고등학교',
      status: 'review_needed',
      approvalStatus: 'pending',
      appliedAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      appliedMessage: appliedMessage.trim() || `${teacher.name} 선생님의 지리·통합사회 탐구에 참여하고자 신청합니다.`,
      inquiryStage: 'topic_planning',
      methodologyTool: '공공데이터 & 교과 연계 문헌 분석',
      lastUpdated: new Date().toISOString().split('T')[0],
      onboardingCompleted: true,
    };

    onSubmit(newStudent);
    setIsSubmittedSuccess(true);
  };

  const handleCloseModal = () => {
    setIsSubmittedSuccess(false);
    setName('');
    setClassNum('');
    setTargetMajor('');
    setTargetCareer('');
    setInterestKeywords('');
    setMainInterestTopic('');
    setAppliedMessage('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 p-5 text-white relative shrink-0">
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">학급 탐구 참여 신청 (학생용)</h3>
              <p className="text-xs text-indigo-100 mt-0.5 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" />
                <span>{teacher.school} · {teacher.name} 선생님 ({teacher.subject})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {isSubmittedSuccess ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900">참여 신청이 정상 제출되었습니다!</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                <strong className="text-indigo-600 font-bold">{teacher.name} 선생님</strong>의 교사 관리 화면에 등록 요청이 전달되었습니다. 선생님께서 <strong className="text-emerald-700">[수락]</strong>해 주시면 정식 학급 명단에 추가되어 1:1 세특 및 탐구 지도를 받으실 수 있습니다.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
              신청 학생: <strong className="text-slate-800">{name} ({grade} {classNum})</strong>
            </div>
            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              확인
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-indigo-900 flex items-start gap-2">
              <Compass className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                학생 정보를 입력하여 제출하시면 <span className="font-bold">{teacher.name} 선생님</span>의 대시보드로 신청서가 전달되며, 교사 승인 후 정식 탐구 과정이 시작됩니다.
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-rose-700 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Row 1: Name & Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  학생 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 박민경"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  학년 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="고등학교 1학년">고등학교 1학년</option>
                  <option value="고등학교 2학년">고등학교 2학년</option>
                  <option value="고등학교 3학년">고등학교 3학년</option>
                </select>
              </div>
            </div>

            {/* Row 2: Class & Number */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                학급 및 번호 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="예: 2반 18번"
                value={classNum}
                onChange={(e) => setClassNum(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>

            {/* Row 3: Target Major & Career */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  희망 전공 / 학과 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 지리학과, 도시공학과, 경영학과"
                  value={targetMajor}
                  onChange={(e) => setTargetMajor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  희망 진로 / 직업
                </label>
                <input
                  type="text"
                  placeholder="예: GIS 공간분석가, 도시계획가"
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Main Interest Topic */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                관심 탐구 주제 (또는 고민 중인 주제)
              </label>
              <input
                type="text"
                placeholder="예: 인천 원도심 도시재생과 상권 변화 GIS 공간분석"
                value={mainInterestTopic}
                onChange={(e) => setMainInterestTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                관심 키워드 (쉼표 구분)
              </label>
              <input
                type="text"
                placeholder="예: GIS 공간분석, 도시재생, 기후변화, 빅데이터"
                value={interestKeywords}
                onChange={(e) => setInterestKeywords(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>

            {/* Message to Teacher */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                선생님께 전달할 메시지 / 신청 사유 (선택)
              </label>
              <textarea
                rows={2}
                placeholder="예: 지리 시간에 배운 내용을 바탕으로 공공데이터를 결합해 보고서를 작성해보고 싶습니다."
                value={appliedMessage}
                onChange={(e) => setAppliedMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>참여 신청서 제출</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
