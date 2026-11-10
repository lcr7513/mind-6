import React, { useState, useMemo } from 'react';
import { RoadmapMilestone, Student } from '../types';
import {
  Compass,
  CheckCircle2,
  Plus,
  Sparkles,
  BookOpen,
  Award,
  TrendingUp,
  LayoutGrid,
  ListOrdered,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';

interface CareerRoadmapProps {
  student: Student;
  milestones: RoadmapMilestone[];
  onAddMilestone: (milestone: RoadmapMilestone) => void;
  onUpdateStatus: (id: string, newStatus: RoadmapMilestone['status']) => void;
  onRegenerateRoadmap?: () => void;
  onOpenProfile?: () => void;
}

export const CareerRoadmap: React.FC<CareerRoadmapProps> = ({
  student,
  milestones,
  onAddMilestone,
  onUpdateStatus,
  onRegenerateRoadmap,
  onOpenProfile,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'matrix'>('timeline');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showRegenToast, setShowRegenToast] = useState<boolean>(false);

  // New milestone form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [gradeSemester, setGradeSemester] = useState<RoadmapMilestone['gradeSemester']>('2학년 2학기');
  const [category, setCategory] = useState<RoadmapMilestone['category']>('교과세특');
  const [stage, setStage] = useState<RoadmapMilestone['stage']>('심화 탐구기');
  const [keyCompetency, setKeyCompetency] = useState<string>('진로역량 (전공 관련 교과 탐구)');
  const [linkedSubject, setLinkedSubject] = useState<string>('생명과학II');

  const semesters = ['1학년 1학기', '1학년 2학기', '2학년 1학기', '2학년 2학기', '3학년 1학기'];
  const categories: RoadmapMilestone['category'][] = ['교과세특', '동아리', '진로탐색', '심화독서'];

  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      if (selectedSemester !== 'all' && m.gradeSemester !== selectedSemester) return false;
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      return true;
    });
  }, [milestones, selectedSemester, selectedCategory]);

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMilestone: RoadmapMilestone = {
      id: `road-${Date.now()}`,
      gradeSemester,
      stage,
      category,
      title: title.trim(),
      description: description.trim(),
      status: 'planned',
      keyCompetency,
      linkedSubject: linkedSubject.trim() || undefined,
    };

    onAddMilestone(newMilestone);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleTriggerRegenerate = () => {
    if (onRegenerateRoadmap) {
      onRegenerateRoadmap();
      setShowRegenToast(true);
      setTimeout(() => setShowRegenToast(false), 3500);
    }
  };

  const getCategoryColor = (cat: RoadmapMilestone['category']) => {
    switch (cat) {
      case '교과세특':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case '동아리':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case '진로탐색':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case '심화독서':
        return 'text-purple-700 bg-purple-50 border-purple-200';
    }
  };

  const getCategoryIcon = (cat: RoadmapMilestone['category']) => {
    switch (cat) {
      case '교과세특':
        return '📚';
      case '동아리':
        return '🔬';
      case '진로탐색':
        return '🧭';
      case '심화독서':
        return '📖';
    }
  };

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const inProgressCount = milestones.filter((m) => m.status === 'in_progress').length;
  const progressPercent = Math.round((completedCount / (milestones.length || 1)) * 100);

  return (
    <div className="space-y-6" translate="no">
      {/* Student Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-100 shrink-0"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  맞춤형 진로 로드맵
                </h1>
                <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-bold">
                  {student.name} ({student.grade} · {student.classNum})
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold">
                  목표 학과: {student.targetMajor || '설정 필요'}
                </span>
              </div>

              <div className="p-3 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-slate-50 border border-indigo-200/80 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>목표 직업: <strong>{student.targetCareer || '진로 희망 설정 필요'}</strong></span>
                  </span>
                  {onOpenProfile && (
                    <button
                      type="button"
                      onClick={onOpenProfile}
                      className="text-[11px] text-indigo-700 hover:text-indigo-900 font-extrabold underline cursor-pointer"
                    >
                      진로·관심사 변경 &gt;
                    </button>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  핵심 연구 관심 주제: <strong className="text-indigo-900">"{student.mainInterestTopic || '아직 등록된 관심사가 없습니다'}"</strong>
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {student.interestKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Overall Progress Widget & Regeneration Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 min-w-[240px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">3개년 학종 로드맵 달성도</span>
                <span className="font-bold text-indigo-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>총 {milestones.length}개 과제</span>
                <span>완료 {completedCount}건 · 진행 {inProgressCount}건</span>
              </div>
            </div>

            {onRegenerateRoadmap && (
              <button
                type="button"
                onClick={handleTriggerRegenerate}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>내 진로·관심사에 맞춤 로드맵 자동 재구성</span>
              </button>
            )}
          </div>
        </div>

        {showRegenToast && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>'{student.targetCareer}' 및 '{student.mainInterestTopic?.slice(0, 25)}...' 주제에 맞춰 3개년 학기별·영역별 로드맵이 성공적으로 동적 재구성되었습니다!</span>
          </div>
        )}
      </div>

      {/* 3-Stage Narrative Architecture Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs mb-1">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>1학년: 기초 탐색기</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            공통 교육과정(통합과학, 통합사회)과 입문 독서를 통해 지적 호기심을 발현하고 전공 탐색의 닻을 올립니다.
          </p>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
              2
            </span>
            <span>2학년: 전공 심화기</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            일반·진로 선택 과목과 전공을 정밀하게 연계하여 정량적 수리 모델링, 데이터 실증 및 학술 포스터를 제작합니다.
          </p>
        </div>

        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
              3
            </span>
            <span>3학년: 융합 발전기</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            다학제적 융합과 사회적 기여를 결합하여 실천적 제도·정책 제언 보고서를 기획하고 자기주도적 성장을 완결합니다.
          </p>
        </div>
      </div>

      {/* 학기별 & 영역별 이중 필터 툴바 (Dual Filter & View Mode Controls) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        {/* Row 1: Semester Filter Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>학기별 선택:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedSemester('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSemester === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 학기 ({milestones.length})
            </button>
            {semesters.map((s) => {
              const count = milestones.filter((m) => m.gradeSemester === s).length;
              const isSelected = selectedSemester === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSemester(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{s}</span>
                  <span className={`ml-1 text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Category Filter Chips & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 mr-1">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>영역별 선택:</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 영역 ({milestones.length})
            </button>
            {categories.map((c) => {
              const count = milestones.filter((m) => m.category === c).length;
              const isSelected = selectedCategory === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{getCategoryIcon(c)}</span>
                  <span>{c}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle & Add Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="시간순 타임라인 상세 뷰"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>타임라인 뷰</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="학기 × 영역 종합 매트릭스 뷰"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>종합 매트릭스 뷰</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 과제 등록</span>
            </button>
          </div>
        </div>
      </div>

      {/* MATRIX VIEW: Semester x Category Grid */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-extrabold text-slate-900">
                고교 3개년 학기별 × 영역별 종합 매트릭스 뷰
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              각 학기별 세특·동아리·진로·독서 활동의 연속성을 한눈에 조망할 수 있습니다.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                  <th className="p-3 w-28 shrink-0">학기 구분</th>
                  <th className="p-3 w-1/4">📚 교과세특</th>
                  <th className="p-3 w-1/4">🔬 동아리활동</th>
                  <th className="p-3 w-1/4">🧭 진로탐색</th>
                  <th className="p-3 w-1/4">📖 심화독서</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {semesters.map((sem) => {
                  return (
                    <tr key={sem} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 align-top font-extrabold text-slate-900 bg-slate-50/40">
                        <div className="sticky top-0">
                          <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-100 text-[11px]">
                            {sem}
                          </span>
                        </div>
                      </td>
                      {categories.map((cat) => {
                        const items = milestones.filter(
                          (m) => m.gradeSemester === sem && m.category === cat
                        );
                        return (
                          <td key={cat} className="p-2.5 align-top">
                            {items.length > 0 ? (
                              <div className="space-y-2">
                                {items.map((it) => (
                                  <div
                                    key={it.id}
                                    className={`p-2.5 rounded-xl border text-left transition-all ${
                                      it.status === 'completed'
                                        ? 'bg-emerald-50/40 border-emerald-200'
                                        : it.status === 'in_progress'
                                        ? 'bg-amber-50/30 border-amber-200'
                                        : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                                        {it.linkedSubject || it.category}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next =
                                            it.status === 'planned'
                                              ? 'in_progress'
                                              : it.status === 'in_progress'
                                              ? 'completed'
                                              : 'planned';
                                          onUpdateStatus(it.id, next);
                                        }}
                                        className="text-[10px] font-bold cursor-pointer"
                                        title="클릭하여 상태 변경"
                                      >
                                        {it.status === 'completed' && <span className="text-emerald-600">✓ 완료</span>}
                                        {it.status === 'in_progress' && <span className="text-amber-600">⏳ 진행</span>}
                                        {it.status === 'planned' && <span className="text-slate-400">○ 계획</span>}
                                      </button>
                                    </div>
                                    <h5 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                                      {it.title}
                                    </h5>
                                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                      {it.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-full min-h-[60px] flex items-center justify-center p-2 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-400">
                                <span>과제 준비중</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TIMELINE LIST VIEW */}
      {viewMode === 'timeline' && (
        <div className="space-y-3">
          {filteredMilestones.length > 0 ? (
            filteredMilestones.map((m) => (
              <div
                key={m.id}
                className={`border rounded-2xl p-5 bg-white transition-all shadow-2xs flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  m.status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50/15'
                    : m.status === 'in_progress'
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2 flex-1 text-left">
                  {/* Header Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px]">
                      {m.gradeSemester}
                    </span>
                    <span
                      className={`font-extrabold px-2 py-0.5 rounded-md border text-[11px] flex items-center gap-1 ${getCategoryColor(
                        m.category
                      )}`}
                    >
                      <span>{getCategoryIcon(m.category)}</span>
                      <span>{m.category}</span>
                    </span>
                    {m.linkedSubject && (
                      <span className="text-indigo-700 bg-indigo-50 border border-indigo-100 font-bold px-2 py-0.5 rounded-md text-[11px]">
                        #{m.linkedSubject}
                      </span>
                    )}
                    <span className="text-slate-400 font-medium text-[11px]">
                      · {m.stage}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {m.description}
                    </p>
                  </div>

                  {/* Key Competency */}
                  <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>핵심 입증 역량: {m.keyCompetency}</span>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <span className="text-xs text-slate-400 hidden sm:inline">상태:</span>
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(m.id, 'planned')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        m.status === 'planned'
                          ? 'bg-white text-slate-800 shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      계획
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(m.id, 'in_progress')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        m.status === 'in_progress'
                          ? 'bg-amber-500 text-white shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-amber-700'
                      }`}
                    >
                      진행중
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(m.id, 'completed')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        m.status === 'completed'
                          ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-emerald-700'
                      }`}
                    >
                      완료
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-bold text-lg">
                🔍
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                선택한 조건({selectedSemester === 'all' ? '' : selectedSemester + ' '}
                {selectedCategory === 'all' ? '' : selectedCategory})에 해당하는 마일스톤이 없습니다.
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                새 로드맵 마일스톤을 추가하거나, '내 진로·관심사에 맞춤 로드맵 자동 재구성' 버튼을 눌러보세요.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSemester('all');
                    setSelectedCategory('all');
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  필터 초기화
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  새 과제 직접 등록
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>새 로드맵 마일스톤 등록</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  탐구 활동 제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`예: ${student.preferredSubjects?.[0] || '교과'}: ${student.mainInterestTopic?.slice(0, 20) || '관심 주제'} 심화 모델링`}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">학기</label>
                  <select
                    value={gradeSemester}
                    onChange={(e) => setGradeSemester(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  >
                    {semesters.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">활동 영역</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">연계 교과목</label>
                  <input
                    type="text"
                    value={linkedSubject}
                    onChange={(e) => setLinkedSubject(e.target.value)}
                    placeholder="예: 미적분, 생명과학II, 경제, 정치와법"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">핵심 입증 역량</label>
                  <input
                    type="text"
                    value={keyCompetency}
                    onChange={(e) => setKeyCompetency(e.target.value)}
                    placeholder="예: 학업역량 (수리 모델링)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  탐구 계획 및 목표 상세
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="탐구하고자 하는 핵심 질문, 사용 도구, 예상 산출물 요약"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-2xs cursor-pointer"
                >
                  마일스톤 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
