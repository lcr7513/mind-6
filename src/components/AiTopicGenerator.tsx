import React, { useState } from 'react';
import { SubjectInquiryTopic, MindMapNode } from '../types';
import { presetFields } from '../data/mockData';
import { synthesizeComprehensiveCurriculum } from '../data/curriculumSynthesizer';
import { MindMapCanvas } from './MindMapCanvas';
import { fetchSSE, SSEProgressEvent } from '../utils/sseClient';
import {
  Sparkles,
  BookOpen,
  Compass,
  ArrowRight,
  Filter,
  Layers,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Share2,
  BookmarkPlus,
  HelpCircle,
  Lightbulb,
  Edit3,
  Eraser,
  CheckCircle2,
  GitBranch,
  Maximize2,
  Plus,
  X,
  ExternalLink,
  Copy,
  ListChecks,
  Target,
  FlaskConical,
  Cpu,
  Wand2,
  ClipboardCheck,
  Zap,
} from 'lucide-react';

export interface TopicSubQuestion {
  id: string;
  title: string;
  subQuestion: string;
  researchArea: string;
  methodology: string;
  relatedConcepts: string[];
  readingRecommendation: string;
  recordTip: string;
}

export interface TopicExpansionData {
  topicTitle: string;
  subject: string;
  overview: string;
  subQuestions: TopicSubQuestion[];
}

interface AiTopicGeneratorProps {
  currentGrade: string;
  defaultMajor?: string;
  defaultInterest?: string;
  defaultKeywords?: string;
  defaultSelectedSubjects?: string[];
  onApplyMindMap: (mindmap: MindMapNode) => void;
  onAddInquiryRecord: (topic: SubjectInquiryTopic) => void;
  onSwitchToWizard?: () => void;
}

export const AiTopicGenerator: React.FC<AiTopicGeneratorProps> = ({
  currentGrade,
  defaultMajor = '',
  defaultInterest = '',
  defaultKeywords = '',
  defaultSelectedSubjects,
  onApplyMindMap,
  onAddInquiryRecord,
  onSwitchToWizard,
}) => {
  const [interest, setInterest] = useState<string>(
    defaultInterest || '크리스퍼 유전자 가위와 난치병 치료 메커니즘'
  );
  const [targetMajor, setTargetMajor] = useState<string>(
    defaultMajor || '생명공학과 / 의생명과학'
  );
  const [grade, setGrade] = useState<string>(currentGrade || '고등학교 2학년');
  const [customKeywords, setCustomKeywords] = useState<string>(
    defaultKeywords || '수학적 모델링, 오프타깃 부작용, 생명윤리'
  );
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    defaultSelectedSubjects && defaultSelectedSubjects.length > 0
      ? defaultSelectedSubjects
      : [
          '수학 (미적분/확률과 통계)',
          '과학 (생명과학/화학)',
          '사회 (생활과 윤리/정치와 법)',
          '국어 (독서/화법과 작문)',
          '영어 (심화영어)',
          '정보/융합',
        ]
  );

  // Sync when student's recorded career profile changes or on initial mount
  React.useEffect(() => {
    if (defaultInterest) setInterest(defaultInterest);
    if (defaultMajor) setTargetMajor(defaultMajor);
    if (defaultKeywords) setCustomKeywords(defaultKeywords);
    if (defaultSelectedSubjects && defaultSelectedSubjects.length > 0) {
      setSelectedSubjects(defaultSelectedSubjects);
    }

    const curInterest = defaultInterest || interest || '크리스퍼 유전자 가위와 난치병 치료 메커니즘';
    const curMajor = defaultMajor || targetMajor || '생명공학과 / 의생명과학';
    const curGrade = currentGrade || grade || '고등학교 2학년';
    const curSubjs = defaultSelectedSubjects && defaultSelectedSubjects.length > 0 ? defaultSelectedSubjects : selectedSubjects;
    const curKeywords = defaultKeywords || customKeywords || '';

    const synthesized = synthesizeComprehensiveCurriculum(
      curInterest,
      curMajor,
      curGrade,
      curSubjs,
      curKeywords
    );
    setGeneratedOverview(synthesized.majorOverview);
    setConnectionSummary(synthesized.connectionSummary);
    setGeneratedSubjects(synthesized.subjects);
    if (synthesized.mindmap) {
      setGeneratedMindMap(synthesized.mindmap);
    }
  }, [defaultInterest, defaultMajor, defaultKeywords, defaultSelectedSubjects]);

  const [showPresetExplorer, setShowPresetExplorer] = useState<boolean>(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sseProgress, setSseProgress] = useState<SSEProgressEvent | null>(null);
  const [generatedOverview, setGeneratedOverview] = useState<string | null>(null);
  const [generatedSubjects, setGeneratedSubjects] = useState<SubjectInquiryTopic[]>([]);
  const [generatedMindMap, setGeneratedMindMap] = useState<MindMapNode | null>(null);
  const [activeTab, setActiveTab] = useState<'mindmap' | 'curriculum'>('mindmap');
  const [curriculumLevelFilter, setCurriculumLevelFilter] = useState<'all' | 'basic' | 'advanced'>('all');
  const [addedTopicIds, setAddedTopicIds] = useState<Set<string>>(new Set());
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  // Topic AI Expansion State (3-5 Sub-questions & related research areas)
  const [expandedModalTopic, setExpandedModalTopic] = useState<SubjectInquiryTopic | null>(null);
  const [isExpandingTopic, setIsExpandingTopic] = useState<boolean>(false);
  const [sseExpandProgress, setSseExpandProgress] = useState<SSEProgressEvent | null>(null);
  const [expansionDataMap, setExpansionDataMap] = useState<Record<string, TopicExpansionData>>({});
  const [addedSubQuestionIds, setAddedSubQuestionIds] = useState<Set<string>>(new Set());
  const [addedMindMapSubIds, setAddedMindMapSubIds] = useState<Set<string>>(new Set());

  // Comprehensive Curriculum & Methodology States
  const [connectionSummary, setConnectionSummary] = useState<string | null>(null);
  const [expandedStepsTopicId, setExpandedStepsTopicId] = useState<string | null>(null);
  const [expandedDraftTopicId, setExpandedDraftTopicId] = useState<string | null>(null);
  const [selectedTopicForGuide, setSelectedTopicForGuide] = useState<SubjectInquiryTopic | null>(null);
  const [copiedPortfolio, setCopiedPortfolio] = useState<boolean>(false);
  const [copiedGuideProposal, setCopiedGuideProposal] = useState<boolean>(false);

  const availableSubjects = [
    '수학 (미적분/확률과 통계)',
    '과학 (생명과학/화학)',
    '사회 (생활과 윤리/정치와 법)',
    '국어 (독서/화법과 작문)',
    '영어 (심화영어)',
    '정보/융합',
  ];

  const toggleSubject = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleClearInputs = () => {
    setInterest('');
    setTargetMajor('');
    setCustomKeywords('');
  };

  // AI Expand Topic into 3-5 Sub-questions (SSE + REST POST)
  const handleExpandTopic = async (topic: SubjectInquiryTopic) => {
    setExpandedModalTopic(topic);
    if (expansionDataMap[topic.id]) {
      return;
    }

    setIsExpandingTopic(true);
    setSseExpandProgress({
      step: 1,
      total: 2,
      message: `'${topic.topic}' 세부 변인 및 연구 영역 탐색 중...`,
      progress: 30,
    });

    try {
      const data = await fetchSSE<TopicExpansionData>(
        '/api/ai/expand-topic',
        {
          topicTitle: topic.topic,
          subject: topic.subject,
          subjectCategory: topic.subjectCategory,
          inquiryQuestion: topic.inquiryQuestion,
          methodology: topic.methodology,
          targetMajor,
          grade,
        },
        {
          onProgress: (p) => setSseExpandProgress(p),
        }
      );

      setExpansionDataMap((prev) => ({
        ...prev,
        [topic.id]: data,
      }));
    } catch (err) {
      console.error('Failed to expand topic with AI:', err);
    } finally {
      setIsExpandingTopic(false);
      setSseExpandProgress(null);
    }
  };

  // Add generated sub-question to inquiry activity records
  const handleAddSubQuestionToRecord = (topic: SubjectInquiryTopic, sub: TopicSubQuestion) => {
    const cleanTitle = sub.title.replace(/\[.*?\]/g, '').trim();
    const newRecordTopic: SubjectInquiryTopic = {
      id: `sub-topic-${Date.now()}`,
      subject: topic.subject,
      subjectCategory: topic.subjectCategory,
      topic: `[${topic.subject} 세부과제] ${cleanTitle}`,
      inquiryQuestion: sub.subQuestion,
      methodology: `${sub.researchArea} (${sub.methodology})`,
      readingRecommendation: sub.readingRecommendation || topic.readingRecommendation,
      recordTip: sub.recordTip,
    };

    onAddInquiryRecord(newRecordTopic);
    setAddedSubQuestionIds((prev) => new Set([...prev, sub.id]));
  };

  // Add generated sub-question as sub-branch to current MindMap
  const handleAddSubQuestionToMindMap = (topic: SubjectInquiryTopic, sub: TopicSubQuestion) => {
    if (!generatedMindMap) return;

    const newSubNode: MindMapNode = {
      id: `subnode-${Date.now()}`,
      text: sub.title,
      category: topic.subjectCategory,
      color: '#6366f1',
      subject: topic.subject,
      nodeType: 'topic',
      detail: sub.researchArea,
      inquiryQuestion: sub.subQuestion,
      methodology: sub.methodology,
      readingRecommendation: sub.readingRecommendation,
      recordTip: sub.recordTip,
    };

    const updateTree = (node: MindMapNode): MindMapNode => {
      // Find matching branch or topic
      if (
        node.text.includes(topic.subject) ||
        node.text.includes(topic.topic.slice(0, 15)) ||
        (node.subject && node.subject.includes(topic.subject))
      ) {
        return {
          ...node,
          children: [...(node.children || []), newSubNode],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateTree),
        };
      }
      return node;
    };

    const updated = updateTree(generatedMindMap);
    setGeneratedMindMap(updated);
    onApplyMindMap(updated);
    setAddedMindMapSubIds((prev) => new Set([...prev, sub.id]));
  };

  const handleGenerate = async () => {
    if (!interest.trim() && !targetMajor.trim()) return;
    setIsLoading(true);
    setAppliedNotice(false);
    setSseProgress({
      step: 1,
      total: 4,
      message: '학생 관심 분야 및 전공 연계 메커니즘 분석 중...',
      progress: 15,
    });

    try {
      const data = await fetchSSE(
        '/api/ai/recommend-topics',
        {
          interest: interest.trim(),
          targetMajor: targetMajor.trim(),
          grade,
          selectedSubjects,
          customKeywords: customKeywords.trim(),
        },
        {
          onProgress: (p) => setSseProgress(p),
        }
      );

      setGeneratedOverview(data.majorOverview || '');
      setConnectionSummary(data.connectionSummary || null);
      const mappedTopics: SubjectInquiryTopic[] = (data.subjects || []).map((s: any, idx: number) => ({
        id: `topic-${Date.now()}-${idx}`,
        subject: s.subject,
        subjectCategory: s.subjectCategory || 'science',
        level: s.level || (idx % 3 === 2 ? 'advanced' : 'basic'),
        levelLabel: s.levelLabel || (s.level === 'advanced' || idx % 3 === 2 ? '심화 탐구 (데이터·수리 모델링)' : '기본 탐구 (교과서 중심·개념 이해)'),
        difficultyRating: s.difficultyRating || (s.level === 'advanced' || idx % 3 === 2 ? 5 : (idx % 3 === 0 ? 2 : 3)),
        suitability: s.suitability || (s.level === 'advanced' || idx % 3 === 2 ? '고2~3 전공 심화 및 정량적 탐구 추천' : '고1~2 교과서 개념 중심 추천'),
        topic: s.topic,
        inquiryQuestion: s.inquiryQuestion,
        methodology: s.methodology,
        readingRecommendation: s.readingRecommendation,
        recordTip: s.recordTip,
        curriculumConcept: s.curriculumConcept,
        connectionRationale: s.connectionRationale,
        recommendedTools: s.recommendedTools || [],
        concreteSteps: s.concreteSteps || [],
        draftRecordSnippet: s.draftRecordSnippet || '',
      }));
      setGeneratedSubjects(mappedTopics);
      if (data.mindmap) {
        setGeneratedMindMap(data.mindmap);
      }
    } catch (err) {
      console.error('Error generating topics with SSE:', err);
    } finally {
      setIsLoading(false);
      setSseProgress(null);
    }
  };

  const handleCopyAllPortfolio = () => {
    if (!generatedSubjects.length) return;

    let text = `=================================================================\n`;
    text += `[학종나침반] 학생 맞춤 교과 연계 탐구 로드맵 및 방법론 포트폴리오\n`;
    text += `=================================================================\n\n`;
    text += `● 학생 관심 연구 분야: ${interest}\n`;
    text += `● 희망 전공: ${targetMajor}\n`;
    text += `● 학생 학년: ${grade}\n`;
    if (customKeywords) text += `● 강조 키워드: ${customKeywords}\n`;
    text += `\n`;

    if (generatedOverview) {
      text += `[1. 대입 입학사정관 및 교육과정 연계 총평]\n${generatedOverview}\n\n`;
    }
    if (connectionSummary) {
      text += `[2. 관심사-교과 융합 연계 원리 요약]\n${connectionSummary}\n\n`;
    }

    text += `[3. 교과별 맞춤 심화 탐구 과제 및 구체적 방법론]\n`;
    text += `-----------------------------------------------------------------\n`;

    generatedSubjects.forEach((topic, idx) => {
      const levelTag = topic.level === 'basic' ? '🟢 기본 탐구 (교과서 중심)' : '🟣 심화 탐구 (데이터·수리)';
      const stars = '★'.repeat(topic.difficultyRating || 3) + '☆'.repeat(5 - (topic.difficultyRating || 3));
      text += `[과제 ${idx + 1}] ${topic.subject} | ${levelTag} (난이도: ${stars})\n`;
      text += `▶ 탐구 주제명: ${topic.topic}\n`;
      if (topic.suitability) text += `▶ 추천 대상: ${topic.suitability}\n`;
      if (topic.curriculumConcept) text += `▶ 연계 교육과정 단원/개념: ${topic.curriculumConcept}\n`;
      if (topic.connectionRationale) text += `▶ 교과 연계 원리: ${topic.connectionRationale}\n`;
      text += `▶ 핵심 탐구 질문: ${topic.inquiryQuestion}\n`;
      text += `▶ 실천 탐구 방법론: ${topic.methodology}\n`;
      if (topic.recommendedTools && topic.recommendedTools.length > 0) {
        text += `▶ 추천 분석 도구: ${topic.recommendedTools.join(', ')}\n`;
      }
      if (topic.concreteSteps && topic.concreteSteps.length > 0) {
        text += `▶ 4단계 실천 프로토콜:\n`;
        topic.concreteSteps.forEach((s) => {
          text += `   - ${s.stepName}: ${s.focus || s.detail || ''} (${s.protocol})\n`;
        });
      }
      text += `▶ 추천 도서/문헌: ${topic.readingRecommendation}\n`;
      text += `▶ 학생부 세특 기록 포인트: ${topic.recordTip}\n`;
      if (topic.draftRecordSnippet) {
        text += `▶ 세특 추천 문안 (예시):\n"${topic.draftRecordSnippet}"\n`;
      }
      text += `\n-----------------------------------------------------------------\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedPortfolio(true);
    setTimeout(() => setCopiedPortfolio(false), 3000);
  };

  const handleApplyToStudentMindMap = () => {
    if (generatedMindMap) {
      onApplyMindMap(generatedMindMap);
      setAppliedNotice(true);
      setTimeout(() => setAppliedNotice(false), 3000);
    }
  };

  const handleAddActivity = (topic: SubjectInquiryTopic) => {
    onAddInquiryRecord(topic);
    setAddedTopicIds((prev) => new Set([...prev, topic.id]));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Strategy Description */}
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>AI 교과 연계 탐구 네비게이터 & 마인드맵</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            학생의 관심 분야를 국어·수학·영어·사회·과학·정보 교과별 탐구 주제와 마인드맵으로 전환합니다
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              대학 입학사정관은 단순한 전공 지식 나열보다, <strong>'고등학교 정규 수업 시간에 배운 교과 개념을 자신의 진로 관심사와 융합하여 스스로 심화 탐구한 과정'</strong>을 가장 높이 평가합니다.
              자유롭게 관심 연구 주제를 입력하시면 각 교과목별 실천 과제와 직관적인 마인드맵을 즉시 구성합니다.
            </p>
            {onSwitchToWizard && (
              <button
                type="button"
                onClick={onSwitchToWizard}
                className="flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs shadow-md shrink-0 transition-all"
              >
                <Lightbulb className="w-4 h-4 text-slate-950" />
                <span>주제 잡기 어렵다면? 단원별 길잡이</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Input Form Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
        {/* Freedom of Custom Input Callout Notice */}
        <div className="bg-indigo-50/70 border border-indigo-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
              ✍️
            </span>
            <div className="text-xs text-indigo-950">
              <strong className="font-extrabold text-indigo-900 text-sm block mb-0.5">
                관심 연구 분야는 100% 자유 직접 입력이 가능합니다!
              </strong>
              <p className="text-indigo-800 leading-relaxed">
                아래 예시 키워드에 국한되지 않습니다. 인문, 사회, 자연과학, 공학, 의약학, 예술, 융합 등 학생이 탐구하고자 하는 어떤 독창적인 주제도 직접 타이핑하여 입력하실 수 있습니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearInputs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <Eraser className="w-3.5 h-3.5 text-slate-500" />
            입력창 비우기 (초기화)
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>1. 관심 연구 분야 / 자유 연구 주제</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[11px] text-indigo-600 font-medium">자유 입력창</span>
            </div>
            <input
              type="text"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="예: 식물 유전자 교정과 스마트팜 수확량 예측, 자율주행 트롤리 딜레마, 행동경제학 넛지 등"
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              2. 희망 전공 / 학과 계열 <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={targetMajor}
              onChange={(e) => setTargetMajor(e.target.value)}
              placeholder="예: 생명공학과 / 컴퓨터공학과 / 환경경제학과 / 자유전공학부"
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">학생 학년</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
            >
              <option value="고등학교 1학년">고등학교 1학년 (기초 소양 & 융합)</option>
              <option value="고등학교 2학년">고등학교 2학년 (전공 심화 & 교과 연계)</option>
              <option value="고등학교 3학년">고등학교 3학년 (개별 심층 연구 & 융합 발전)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              강조하고 싶은 세부 역량 / 보강 키워드
            </label>
            <input
              type="text"
              value={customKeywords}
              onChange={(e) => setCustomKeywords(e.target.value)}
              placeholder="예: 수리적 모델링, 오프타깃 부작용 분석, 생명윤리, 실험 설계 등"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Collapsible Inspiration Presets */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPresetExplorer(!showPresetExplorer)}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>주제 선정이 고민된다면? 6개 계열별 추천 키워드 모음 (클릭하여 열기)</span>
            </span>
            {showPresetExplorer ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showPresetExplorer && (
            <div className="p-4 bg-white border-t border-slate-200 space-y-3">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-2.5">
                {presetFields.map((p, idx) => (
                  <button
                    key={p.category}
                    type="button"
                    onClick={() => setActiveCategoryIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeCategoryIndex === idx
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p.category}
                  </button>
                ))}
              </div>

              {/* Category chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {presetFields[activeCategoryIndex].fields.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setInterest(f);
                      setShowPresetExplorer(false);
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 rounded-xl border border-slate-200 transition-all font-medium flex items-center gap-1"
                  >
                    <span>{f}</span>
                    <span className="text-[10px] text-indigo-400">적용</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Select Subjects */}
        <div>
          <span className="block text-xs font-bold text-slate-800 mb-2">
            교과별 탐구 추천을 생성할 고교 과목:
          </span>
          <div className="flex flex-wrap gap-2">
            {availableSubjects.map((subj) => {
              const active = selectedSubjects.includes(subj);
              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => toggleSubject(subj)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {subj} {active ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>

        {/* SSE Streaming Progress Indicator */}
        {isLoading && sseProgress && (
          <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl text-white shadow-xl space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-white font-extrabold tracking-wide">
                  SSE + REST POST 실시간 스트리밍
                </span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  HTTP POST 스트림 연결됨
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-indigo-200">
                  단계 {sseProgress.step}/{sseProgress.total || 4}
                </span>
                <span className="font-extrabold text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  {sseProgress.progress}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className="bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
                style={{ width: `${Math.max(6, sseProgress.progress)}%` }}
              />
            </div>

            <p className="text-xs text-slate-200 flex items-center gap-2 pt-0.5 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
              <span>{sseProgress.message}</span>
            </p>
          </div>
        )}

        {/* Generate Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isLoading || (!interest.trim() && !targetMajor.trim())}
            className="flex items-center gap-2 py-3.5 px-7 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI가 교과별 심화 주제 및 마인드맵을 설계하는 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>'{interest || '입력한 주제'}' 교과 연계 마인드맵 및 탐구 추천 생성</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Section */}
      {(generatedOverview || generatedSubjects.length > 0) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          {/* Result Header & Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>AI 교과 연계 탐구 분석 완료</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                '{interest}' 중심 고교 교과별 연계 탐구 마인드맵
              </h3>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveTab('mindmap')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'mindmap'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  교과별 마인드맵
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'curriculum'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  교과별 세특 카드 ({generatedSubjects.length})
                </button>
              </div>

              {generatedMindMap && (
                <button
                  onClick={handleApplyToStudentMindMap}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors"
                  title="현재 생성된 마인드맵을 학생의 대표 탐구 맵으로 확정 저장합니다"
                >
                  {appliedNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      내 마인드맵에 저장 완료!
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      내 마인드맵에 저장
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Connection Summary Strategy Box */}
          {connectionSummary && (
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-extrabold">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>학생 관심사-교과 융합 연계 원리 총평 (Connection Strategy)</span>
              </div>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                {connectionSummary}
              </p>
            </div>
          )}

          {/* Academic Overview Box */}
          {generatedOverview && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs sm:text-sm text-indigo-950 leading-relaxed flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1">
                  입학사정관 및 교육과정 연계 관점 총평:
                </strong>
                {generatedOverview}
              </div>
            </div>
          )}

          {/* Tab 1: Interactive Mind Map */}
          {activeTab === 'mindmap' && (
            <div>
              {generatedMindMap ? (
                <MindMapCanvas
                  rootNode={generatedMindMap}
                  onUpdateMindMap={(updated) => setGeneratedMindMap(updated)}
                  onAddInquiryRecord={onAddInquiryRecord}
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                  마인드맵 데이터를 생성 중입니다...
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Detailed Cross-Curricular Cards (Grouped by Subject with 3 Topics: Basic & Advanced) */}
          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              {/* Friendly Guidance Callout for Basic vs Advanced Levels */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
                <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-base shadow-xs">
                  💡
                </span>
                <div className="text-xs text-slate-800 space-y-1">
                  <strong className="text-emerald-950 font-extrabold text-sm block">
                    주제가 어렵게 느껴지셨나요? — 고교 교과서 중심 [🟢 기본 탐구] & 데이터·수리 융합 [🟣 심화 탐구]
                  </strong>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    기존 대학 수준의 어려운 논문 주제 대신, 고등학교 <strong>교과서 핵심 개념과 친숙한 일상 사례</strong>로 바로 탐구할 수 있는 <strong>'🟢 기본 탐구 (과목당 2개)'</strong>와 데이터 분석·수리 모델링 중심의 <strong>'🟣 심화 탐구 (과목당 1개)'</strong>로 세분화했습니다. 과목별로 <strong>3가지 탐구 주제</strong>가 준비되어 있으니 자신의 학업 역량과 호기심에 맞춰 선택의 폭을 넓혀보세요!
                  </p>
                </div>
              </div>

              {/* Level Filter & Copy Portfolio Action Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-600 mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-indigo-600" />
                    탐구 수준 필터:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurriculumLevelFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      curriculumLevelFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    전체 3가지 주제 ({generatedSubjects.length}개)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurriculumLevelFilter('basic')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      curriculumLevelFilter === 'basic'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                    }`}
                  >
                    <span>🟢 기본 탐구만</span>
                    <span className="text-[10px] opacity-90">
                      (교과서 중심 · {generatedSubjects.filter((t) => t.level === 'basic').length}개)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurriculumLevelFilter('advanced')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      curriculumLevelFilter === 'advanced'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100/70'
                    }`}
                  >
                    <span>🟣 심화 탐구만</span>
                    <span className="text-[10px] opacity-90">
                      (데이터·수리 · {generatedSubjects.filter((t) => t.level === 'advanced').length}개)
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyAllPortfolio}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-2xs transition-all"
                  >
                    {copiedPortfolio ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>전체 계획서 복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>전체 계획서 복사하기</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Grouped by Subject Sections */}
              <div className="space-y-6">
                {(() => {
                  const subjectMap = new Map<string, SubjectInquiryTopic[]>();
                  generatedSubjects.forEach((t) => {
                    const list = subjectMap.get(t.subject) || [];
                    list.push(t);
                    subjectMap.set(t.subject, list);
                  });

                  return Array.from(subjectMap.entries()).map(([subj, topics]) => {
                    const visibleTopics = topics.filter((t) => {
                      if (curriculumLevelFilter === 'basic') return t.level !== 'advanced';
                      if (curriculumLevelFilter === 'advanced') return t.level !== 'basic';
                      return true;
                    });
                    if (visibleTopics.length === 0) return null;

                    const subjIcon = subj.includes('수학')
                      ? '📐'
                      : subj.includes('과학')
                      ? '🔬'
                      : subj.includes('사회')
                      ? '⚖️'
                      : subj.includes('국어')
                      ? '📖'
                      : subj.includes('영어')
                      ? '🌍'
                      : '💻';

                    return (
                      <div
                        key={subj}
                        className="bg-slate-50/70 border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4"
                      >
                        {/* Subject Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                              {subjIcon}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-slate-900">{subj}</h3>
                                <span className="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
                                  {visibleTopics.length}가지 추천 과제
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                정규 교과 개념과 학생 관심사를 융합한 수준별 맞춤 탐구 포트폴리오
                              </p>
                            </div>
                          </div>

                          {/* Level Summary Pills */}
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              🟢 기본 {topics.filter((t) => t.level === 'basic').length}개
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                              🟣 심화 {topics.filter((t) => t.level === 'advanced').length}개
                            </span>
                          </div>
                        </div>

                        {/* Topics Grid for this subject */}
                        <div
                          className={`grid grid-cols-1 ${
                            visibleTopics.length === 1
                              ? 'md:grid-cols-1'
                              : visibleTopics.length === 2
                              ? 'md:grid-cols-2'
                              : 'md:grid-cols-3'
                          } gap-4`}
                        >
                          {visibleTopics.map((topic) => {
                            const isAdded = addedTopicIds.has(topic.id);
                            const isStepsOpen = expandedStepsTopicId === topic.id;
                            const isDraftOpen = expandedDraftTopicId === topic.id;
                            const isBasic = topic.level === 'basic';

                            return (
                              <div
                                key={topic.id}
                                className={`rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 border ${
                                  isBasic
                                    ? 'border-emerald-200/90 hover:border-emerald-400'
                                    : 'border-purple-200/90 hover:border-purple-400'
                                }`}
                              >
                                <div className="space-y-3">
                                  {/* Level Badge, Stars & Guide Action */}
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className={`text-xs font-black px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                                          isBasic
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                            : 'bg-purple-50 text-purple-800 border-purple-300'
                                        }`}
                                      >
                                        <span>{isBasic ? '🟢 기본 탐구' : '🟣 심화 탐구'}</span>
                                      </span>
                                      {topic.difficultyRating && (
                                        <span className="text-[10px] text-amber-500 font-mono font-bold">
                                          {'★'.repeat(topic.difficultyRating)}
                                          {'☆'.repeat(5 - topic.difficultyRating)}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedTopicForGuide(topic)}
                                        className="p-1.5 text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                                        title="탐구 방법 종합 가이드"
                                      >
                                        <ListChecks className="w-3.5 h-3.5 text-amber-700" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleExpandTopic(topic)}
                                        className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="AI 세부 질문 확장"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Suitability recommendation note */}
                                  {topic.suitability && (
                                    <div
                                      className={`p-2 rounded-xl border text-[11px] leading-relaxed font-medium ${
                                        isBasic
                                          ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
                                          : 'bg-purple-50/70 border-purple-100 text-purple-950'
                                      }`}
                                    >
                                      <strong>💡 추천:</strong> {topic.suitability}
                                    </div>
                                  )}

                                  {/* Topic Title */}
                                  <h4
                                    onClick={() => setSelectedTopicForGuide(topic)}
                                    className="text-sm font-extrabold text-slate-900 leading-snug hover:text-indigo-600 cursor-pointer transition-colors flex items-start justify-between group"
                                    title="클릭하여 탐구 방법 종합 가이드 열기"
                                  >
                                    <span>{topic.topic}</span>
                                    <Maximize2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 shrink-0 ml-1.5 mt-0.5" />
                                  </h4>

                                  {/* Curriculum Concept & Standard */}
                                  {topic.curriculumConcept && (
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-800">
                                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 mb-0.5">
                                        <BookOpen className="w-3 h-3 text-indigo-600" />
                                        <span>연계 고교 단원 및 성취기준:</span>
                                      </div>
                                      <div className="font-semibold text-slate-900 text-[11.5px]">
                                        {topic.curriculumConcept}
                                      </div>
                                    </div>
                                  )}

                                  {/* Connection Rationale */}
                                  {topic.connectionRationale && (
                                    <div className="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 text-xs text-indigo-950">
                                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-800 mb-0.5">
                                        <Target className="w-3 h-3 text-indigo-600" />
                                        <span>관심사-교과 연계 이유 (융합 원리):</span>
                                      </div>
                                      <p className="text-[11.5px] leading-relaxed text-indigo-900">
                                        {topic.connectionRationale}
                                      </p>
                                    </div>
                                  )}

                                  {/* Inquiry Question */}
                                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70 text-xs text-amber-950">
                                    <span className="font-bold block mb-0.5 text-amber-900 flex items-center gap-1">
                                      <Lightbulb className="w-3 h-3 text-amber-600" />
                                      <span>핵심 탐구 질문 (Inquiry Question):</span>
                                    </span>
                                    <p className="leading-relaxed text-[11.5px] font-medium">
                                      {topic.inquiryQuestion}
                                    </p>
                                  </div>

                                  {/* Methodology & Recommended Tools */}
                                  <div className="space-y-2 text-xs text-slate-600">
                                    <div>
                                      <div className="flex items-center gap-1 text-slate-800 font-bold mb-0.5">
                                        <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>실천 탐구 방법론:</span>
                                      </div>
                                      <p className="text-slate-700 text-xs leading-relaxed">
                                        {topic.methodology}
                                      </p>
                                    </div>

                                    {topic.recommendedTools && topic.recommendedTools.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                        <span className="text-[10px] font-bold text-slate-500">
                                          추천 도구:
                                        </span>
                                        {topic.recommendedTools.map((tool, tIdx) => (
                                          <span
                                            key={tIdx}
                                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-200"
                                          >
                                            {tool}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {/* 4-Step Concrete Action Protocol Toggle */}
                                    {topic.concreteSteps && topic.concreteSteps.length > 0 && (
                                      <div className="pt-0.5">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setExpandedStepsTopicId(
                                              isStepsOpen ? null : topic.id
                                            )
                                          }
                                          className="flex items-center justify-between w-full px-2.5 py-1.5 bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                                        >
                                          <span className="flex items-center gap-1.5">
                                            <ListChecks className="w-3 h-3 text-indigo-600" />
                                            <span>
                                              4단계 실천 프로토콜 ({isStepsOpen ? '접기' : '상세보기'})
                                            </span>
                                          </span>
                                          {isStepsOpen ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          )}
                                        </button>

                                        {isStepsOpen && (
                                          <div className="mt-2 space-y-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                                            {topic.concreteSteps.map((step, sIdx) => (
                                              <div
                                                key={sIdx}
                                                className="border-b border-slate-100 last:border-b-0 pb-1.5 last:pb-0"
                                              >
                                                <div className="font-extrabold text-indigo-800">
                                                  {step.stepName}
                                                </div>
                                                <div className="text-slate-700 mt-0.5">
                                                  <strong>핵심:</strong> {step.focus || step.detail}
                                                </div>
                                                <div className="text-slate-600 text-[10.5px]">
                                                  <strong>실행:</strong> {step.protocol}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div>
                                      <strong className="text-slate-800">📚 추천 도서: </strong>
                                      <span className="text-indigo-600 font-semibold text-[11.5px]">
                                        {topic.readingRecommendation}
                                      </span>
                                    </div>

                                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-900">
                                      <strong className="font-bold">📝 학생부 세특 기록 포인트: </strong>
                                      <span>{topic.recordTip}</span>
                                    </div>

                                    {/* Exemplary Draft Record Toggle */}
                                    {topic.draftRecordSnippet && (
                                      <div className="pt-0.5">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setExpandedDraftTopicId(
                                              isDraftOpen ? null : topic.id
                                            )
                                          }
                                          className="flex items-center justify-between w-full px-2.5 py-1 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900 rounded-lg text-[10.5px] font-bold transition-colors"
                                        >
                                          <span>
                                            ✍️ 세특 500자 추천 문안 {isDraftOpen ? '접기' : '미리보기'}
                                          </span>
                                          {isDraftOpen ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          )}
                                        </button>
                                        {isDraftOpen && (
                                          <div className="mt-1.5 p-2.5 bg-white border border-emerald-200 rounded-xl text-[11px] text-slate-800 leading-relaxed shadow-2xs">
                                            "{topic.draftRecordSnippet}"
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTopicForGuide(topic)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-xl text-[11px] font-bold border border-amber-200 transition-all shadow-2xs"
                                  >
                                    <FileText className="w-3 h-3 text-amber-700" />
                                    <span>가이드</span>
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleExpandTopic(topic)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[11px] font-bold border border-indigo-200 transition-all shadow-2xs"
                                    >
                                      <GitBranch className="w-3 h-3 text-indigo-600" />
                                      <span>질문확장</span>
                                    </button>

                                    <button
                                      onClick={() => handleAddActivity(topic)}
                                      disabled={isAdded}
                                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        isAdded
                                          ? 'bg-slate-100 text-slate-500 cursor-default'
                                          : isBasic
                                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                                          : 'bg-purple-600 text-white hover:bg-purple-700 shadow-2xs'
                                      }`}
                                    >
                                      {isAdded ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          담김
                                        </>
                                      ) : (
                                        <>
                                          <BookmarkPlus className="w-3 h-3" />
                                          일지에 담기
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topic AI Expansion Modal (3-5 Sub-questions & Related Research Areas) */}
      {expandedModalTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    {expandedModalTopic.subject}
                  </span>
                  <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI 세부 연구 질문·연계 확장 (Topic Expansion)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {expandedModalTopic.topic}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExpandedModalTopic(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loading state with SSE Progress */}
            {isExpandingTopic && !expansionDataMap[expandedModalTopic.id] ? (
              <div className="py-10 text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700">
                  <Zap className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                  <span>SSE 실시간 스트림 확장 중</span>
                </div>
                <RefreshCw className="w-9 h-9 text-indigo-600 animate-spin mx-auto" />
                <div className="text-sm font-bold text-slate-800">
                  '{expandedModalTopic.topic}' 세부 연구 질문 도출 중...
                </div>

                {sseExpandProgress && (
                  <div className="max-w-md mx-auto space-y-2 px-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>{sseExpandProgress.message}</span>
                      <span className="text-indigo-600 font-bold">{sseExpandProgress.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${sseExpandProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  교과서 개념과 전공 쟁점을 융합하여 입학사정관이 주목하는 구체적인 실천 질문과 파생 연구 영역을 설계하고 있습니다.
                </p>
              </div>
            ) : (
              <>
                {/* Overview Note */}
                {expansionDataMap[expandedModalTopic.id]?.overview && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-2xl p-4 text-xs text-indigo-950 flex items-start gap-2.5 leading-relaxed">
                    <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold block mb-0.5">
                        AI 진로진학 수석 컨설턴트 확장 조언:
                      </strong>
                      {expansionDataMap[expandedModalTopic.id].overview}
                    </div>
                  </div>
                )}

                {/* 3-5 Sub-Questions List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-indigo-600" />
                      <span>
                        파생 연구 영역 및 세부 탐구 질문 (
                        {expansionDataMap[expandedModalTopic.id]?.subQuestions.length || 0}개):
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      관심 있는 세부 질문을 골라 활동 일지에 추가하세요
                    </span>
                  </div>

                  {expansionDataMap[expandedModalTopic.id]?.subQuestions.map((sub, sIdx) => {
                    const isSubAdded = addedSubQuestionIds.has(sub.id);
                    const isMindMapAdded = addedMindMapSubIds.has(sub.id);
                    return (
                      <div
                        key={sub.id || sIdx}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-black text-slate-900 leading-snug">
                            {sub.title}
                          </h4>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full shrink-0">
                            {sub.researchArea}
                          </span>
                        </div>

                        {/* Core Sub-Question */}
                        <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 text-xs text-amber-950">
                          <strong className="block mb-0.5 font-bold text-amber-900">
                            💡 세부 탐구 질문:
                          </strong>
                          {sub.subQuestion}
                        </div>

                        {/* Methodology & Concepts */}
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div>
                            <strong className="text-slate-700">🔬 실천 방법론: </strong>
                            <span>{sub.methodology}</span>
                          </div>
                          {sub.readingRecommendation && (
                            <div>
                              <strong className="text-slate-700">📚 추천 문헌: </strong>
                              <span className="text-indigo-600 font-semibold">
                                {sub.readingRecommendation}
                              </span>
                            </div>
                          )}
                          <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-100 text-[11px] text-emerald-950">
                            <strong className="font-bold">📝 세특 기재 포인트: </strong>
                            {sub.recordTip}
                          </div>
                        </div>

                        {/* Concept chips */}
                        {sub.relatedConcepts && sub.relatedConcepts.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {sub.relatedConcepts.map((concept, cIdx) => (
                              <span
                                key={cIdx}
                                className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium"
                              >
                                #{concept}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddSubQuestionToMindMap(expandedModalTopic, sub)}
                            disabled={isMindMapAdded}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isMindMapAdded
                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {isMindMapAdded ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>마인드맵에 추가됨</span>
                              </>
                            ) : (
                              <>
                                <GitBranch className="w-3 h-3 text-indigo-600" />
                                <span>마인드맵에 브랜치로 추가</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddSubQuestionToRecord(expandedModalTopic, sub)}
                            disabled={isSubAdded}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isSubAdded
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                            }`}
                          >
                            {isSubAdded ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>활동 일지에 추가 완료</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>이 세부 질문으로 일지 담기</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                확장된 질문은 교과 세특 일지 및 마인드맵에 즉시 연동됩니다
              </span>
              <button
                type="button"
                onClick={() => setExpandedModalTopic(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Inquiry Methodology Guide Modal */}
      {selectedTopicForGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    {selectedTopicForGuide.subject}
                  </span>
                  <span className="text-xs text-amber-800 font-extrabold flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    <ListChecks className="w-3.5 h-3.5 text-amber-600" />
                    <span>탐구 방법론 & 프로토콜 종합 가이드</span>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {selectedTopicForGuide.topic}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTopicForGuide(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rationale & Question */}
            <div className="space-y-3">
              {selectedTopicForGuide.connectionRationale && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-950">
                  <strong className="block font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>관심사-교과 연계 이유 (융합 설계 원리):</span>
                  </strong>
                  <p className="leading-relaxed">{selectedTopicForGuide.connectionRationale}</p>
                </div>
              )}

              {selectedTopicForGuide.curriculumConcept && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800">
                  <strong className="block font-bold text-slate-900 mb-0.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>연계 고교 교과 단원 및 성취기준:</span>
                  </strong>
                  <div>{selectedTopicForGuide.curriculumConcept}</div>
                </div>
              )}

              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-950">
                <strong className="block font-bold text-amber-900 mb-0.5 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>핵심 탐구 질문 (Inquiry Question):</span>
                </strong>
                <p className="leading-relaxed font-medium">{selectedTopicForGuide.inquiryQuestion}</p>
              </div>
            </div>

            {/* 4-Step Concrete Action Protocol */}
            {selectedTopicForGuide.concreteSteps && selectedTopicForGuide.concreteSteps.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-indigo-600" />
                  <span>4단계 실천 탐구 프로토콜 (Actionable Roadmap)</span>
                </h4>
                <div className="space-y-2">
                  {selectedTopicForGuide.concreteSteps.map((step, sIdx) => (
                    <div key={step.stepNum ?? sIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-indigo-800">{step.stepName}</span>
                        {step.tools && step.tools.length > 0 && (
                          <div className="flex gap-1">
                            {step.tools.map((t, idx) => (
                              <span key={idx} className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-600">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-slate-800">
                        <strong className="text-slate-900">연구 초점: </strong>
                        <span>{step.focus}</span>
                      </div>
                      <div className="text-slate-600 text-[11.5px] leading-relaxed">
                        <strong className="text-slate-700">실행 절차: </strong>
                        <span>{step.protocol}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exemplary Draft Record */}
            {selectedTopicForGuide.draftRecordSnippet && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1.5">
                <strong className="block font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>학교생활기록부 교과 세특 500자 완성형 추천 문안</span>
                </strong>
                <p className="text-[11.5px] leading-relaxed text-slate-800 bg-white p-3 rounded-xl border border-emerald-100">
                  "{selectedTopicForGuide.draftRecordSnippet}"
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const textToCopy = `[학종나침반 교과 연계 탐구 가이드]\n교과목: ${selectedTopicForGuide.subject}\n주제명: ${selectedTopicForGuide.topic}\n연계 개념: ${selectedTopicForGuide.curriculumConcept || ''}\n핵심 질문: ${selectedTopicForGuide.inquiryQuestion}\n탐구 방법론: ${selectedTopicForGuide.methodology}\n세특 추천문안: ${selectedTopicForGuide.draftRecordSnippet || ''}`;
                  navigator.clipboard.writeText(textToCopy);
                  setCopiedGuideProposal(true);
                  setTimeout(() => setCopiedGuideProposal(false), 2500);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                {copiedGuideProposal ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>가이드 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>탐구 가이드 텍스트 복사</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleAddActivity(selectedTopicForGuide);
                    setSelectedTopicForGuide(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-2xs"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>내 활동 일지에 담기</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTopicForGuide(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
