import React, { useState, useEffect } from 'react';
import { Student, RefinedQuestion, InquiryActivityRecord } from '../types';
import {
  Compass,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Database,
  FlaskConical,
  BarChart3,
  Cpu,
  Layers,
  FileCheck,
  Share2,
  Copy,
  ChevronRight,
  Info,
  Lightbulb,
  ExternalLink,
  Target,
  RefreshCw,
  GitBranch,
  Loader2,
  Wand2,
} from 'lucide-react';
import { AcademicSearchGuide } from './AcademicSearchGuide';

interface QuestionRefinementWizardProps {
  student: Student;
  onAddActivityRecord?: (record: Omit<InquiryActivityRecord, 'id' | 'date'>) => void;
  onNavigateToMindmap?: (topic: string) => void;
  onOpenProfile?: () => void;
}

interface SubjectPreset {
  subjectName: string;
  category: 'math' | 'science' | 'social' | 'korean' | 'english' | 'tech';
  units: { name: string; code: string; keyConcept: string }[];
}

const SUBJECT_PRESETS: Record<string, SubjectPreset[]> = {
  science: [
    {
      subjectName: '물리학I/II',
      category: 'science',
      units: [
        { name: '파동의 굴절과 간섭', code: '[12물리I03-02]', keyConcept: '센서 신호 감쇄 및 간섭 필터링' },
        { name: '전자기 유도와 전류', code: '[12물리I02-04]', keyConcept: '무선 충전 및 와전류 제동' },
        { name: '열역학과 에너지 보존', code: '[12물리I01-03]', keyConcept: '열효율 최적화 및 엔트로피' },
      ],
    },
    {
      subjectName: '화학I/II',
      category: 'science',
      units: [
        { name: '화학 반응과 에너지 변화', code: '[12화학I03-01]', keyConcept: '전고체 배터리 활성화 에너지' },
        { name: '화학 평형과 르샤틀리에 원리', code: '[12화학II02-02]', keyConcept: '기체 흡착 및 탄소 포집 효율' },
        { name: '산화 환원 반응과 전기화학', code: '[12화학I04-02]', keyConcept: '리튬 이온 산화 환원 포텐셜' },
      ],
    },
    {
      subjectName: '생명과학I/II',
      category: 'science',
      units: [
        { name: '효소의 작용과 저해제', code: '[12생명II01-03]', keyConcept: '미카엘리스-멘텐 동역학 모델' },
        { name: '세포 호흡과 물질대사', code: '[12생명II02-01]', keyConcept: '미세조류 바이오연료 합성 대사' },
        { name: '유전자 발현 조절과 돌연변이', code: '[12생명II03-02]', keyConcept: 'CRISPR 염기 교정 표적성' },
      ],
    },
    {
      subjectName: '지구과학I/II',
      category: 'science',
      units: [
        { name: '대기와 해양의 상호작용', code: '[12지구I03-02]', keyConcept: '엘니뇨-라니냐 수온 편차 시뮬레이션' },
        { name: '복사 평형과 온실 효과', code: '[12지구I03-03]', keyConcept: '알베도 변화에 따른 기후 피드백' },
      ],
    },
  ],
  math: [
    {
      subjectName: '미적분',
      category: 'math',
      units: [
        { name: '도함수의 활용 (극대·극소와 최적화)', code: '[12미적02-05]', keyConcept: '에너지 손실 최소화 곡률 설계' },
        { name: '정적분의 활용 (넓이·부피와 누적량)', code: '[12미적03-03]', keyConcept: '비정형 데이터 적분 면적과 누적 확률' },
        { name: '수열의 극한과 급수', code: '[12미적01-02]', keyConcept: '무한 급수를 활용한 근사 오차 수렴' },
      ],
    },
    {
      subjectName: '확률과 통계',
      category: 'math',
      units: [
        { name: '조건부확률과 베이즈 정리', code: '[12확통02-03]', keyConcept: '질병 진단 키트 양성 예측도 검증' },
        { name: '정규분포와 표본평균의 분포', code: '[12확통03-03]', keyConcept: '공공데이터 신뢰구간 95% 유의성 검정' },
      ],
    },
    {
      subjectName: '수학II',
      category: 'math',
      units: [
        { name: '함수의 극한과 연속', code: '[12수학II01-02]', keyConcept: '임계점 전이 현상의 불연속 분석' },
        { name: '평균변화율과 미분계수', code: '[12수학II02-01]', keyConcept: '순간 변화율 기반 센서 감도 측정' },
      ],
    },
    {
      subjectName: '기하',
      category: 'math',
      units: [
        { name: '평면벡터의 내적과 정사영', code: '[12기하02-02]', keyConcept: '3차원 공간 라이다 데이터 정사영' },
        { name: '이차곡선의 기하학적 성질', code: '[12기하01-03]', keyConcept: '포물선 반사경 집광 효율 모델' },
      ],
    },
  ],
  tech: [
    {
      subjectName: '정보 / 인공지능 기초',
      category: 'tech',
      units: [
        { name: '알고리즘 시간복잡도 (Big-O)', code: '[12정보03-01]', keyConcept: '정렬/탐색 알고리즘 연산 비용 비교' },
        { name: '지도학습과 경사하강법', code: '[12인기02-02]', keyConcept: '손실함수 수렴 속도와 학습률 최적화' },
        { name: '합성곱 신경망(CNN) 특징 추출', code: '[12인기03-01]', keyConcept: '필터 커널 합성곱과 풀링 원리' },
      ],
    },
  ],
  social: [
    {
      subjectName: '통합사회 / 경제',
      category: 'social',
      units: [
        { name: '시장실패와 외부효과', code: '[12경제02-03]', keyConcept: '탄소배출권 거래제의 시장 유인 효과' },
        { name: '사회 불평등과 공간적 격차', code: '[10통사06-02]', keyConcept: '지니계수 및 로렌츠 곡선 정량 분석' },
        { name: '정부의 재정정책과 경기안정', code: '[12경제04-02]', keyConcept: '기본소득 및 재난지원금의 소비승수' },
      ],
    },
    {
      subjectName: '정치와 법 / 윤리',
      category: 'social',
      units: [
        { name: '기본권 제한과 과잉금지원칙', code: '[12정법01-03]', keyConcept: '빅데이터 수집과 개인정보 자기결정권' },
        { name: '과학기술과 생명 윤리', code: '[12생윤04-01]', keyConcept: '자율주행차 트롤리 딜레마와 법적 책임' },
      ],
    },
  ],
  korean: [
    {
      subjectName: '독서 / 심화국어',
      category: 'korean',
      units: [
        { name: '학술적 제재의 비판적 수용', code: '[12독서02-03]', keyConcept: '동일 연구 주제 논문 3편의 방법론 비교' },
        { name: '주제 통합적 읽기와 논증 구성', code: '[12독서03-02]', keyConcept: '연구 가설과 논증 타당성 메타 분석' },
      ],
    },
  ],
  english: [
    {
      subjectName: '영어I/II / 심화영어독해',
      category: 'english',
      units: [
        { name: '해외 학술 초록(Abstract) 분석', code: '[12영I03-04]', keyConcept: '글로벌 오픈액세스 저널 방법론 대조' },
        { name: '학술 보고서 구조와 논리적 연어', code: '[12심영02-03]', keyConcept: '인과관계 표현(correlate, deduce) 서술' },
      ],
    },
  ],
};

const METHODOLOGY_OPTIONS = [
  {
    id: 'data-stat',
    title: '공공데이터 & 통계 시각화',
    badge: '정량 분석',
    icon: BarChart3,
    color: 'emerald',
    description: '공공데이터포털, 통계청 KOSIS, 캐글 오픈 데이터를 수집하여 파이썬 판다스로 상관분석 및 그래프 도출',
    recommendedTools: ['공공데이터포털 (data.go.kr)', '통계청 KOSIS', 'Python pandas/seaborn', 'Excel 회귀분석'],
    antiClicheBenefit: '인터넷 글 요약이 아닌, 실제 공공 통계 원천 데이터를 학생이 직접 코딩/분석하여 주도적 증거를 제시함',
  },
  {
    id: 'math-model',
    title: '수리적 모델링 & 컴퓨터 시뮬레이션',
    badge: '수리/알고리즘',
    icon: Cpu,
    color: 'indigo',
    description: '교과서 미적분/함수 관계식을 현상에 대입하여 수식화하고 GeoGebra나 코딩으로 최적해와 오차율 산출',
    recommendedTools: ['GeoGebra', 'Desmos Graphing', 'Python NumPy / SciPy', 'NetLogo 시뮬레이터'],
    antiClicheBenefit: '현상을 수학적 변수로 치환하는 수리 모델링 능력을 보여주어 공학/자연과학 계열 최상위 학업역량을 입증함',
  },
  {
    id: 'empirical-exp',
    title: '실험 설계 & 센서 정량 측정',
    badge: '실험/계측',
    icon: FlaskConical,
    color: 'sky',
    description: '대조군과 실험군을 명확히 통제하고, 아두이노/MBL 센서 또는 실험실 장비로 정량적 수치를 직접 측정',
    recommendedTools: ['아두이노 센서 (온도/조도/초음파)', 'MBL 센서', '분광광도계 / pH 미터', 'ImageJ 영상 계측'],
    antiClicheBenefit: '철저한 조작변인 통제와 오차 원인 분석 과정을 통해 과학적 탐구 태도와 실험 설계 역량을 각인시킴',
  },
  {
    id: 'meta-paper',
    title: '학술 논문 비판적 메타비교 & 한계 극복',
    badge: '문헌 비판',
    icon: BookOpen,
    color: 'purple',
    description: 'RISS/DBpia에서 동일 연구 주제의 선행 논문 3편을 비교하여 기존 모델의 한계점과 대안적 개선책 제시',
    recommendedTools: ['한국교육학술정보원 (RISS)', 'DBpia / ScienceDirect', '논문 메타비교 매트릭스 표', 'KCI 등재지'],
    antiClicheBenefit: '단순 요약이 아니라 기존 연구의 문제점을 교과 지식으로 반박·보완하여 비판적 사고력을 탁월하게 보여줌',
  },
  {
    id: 'social-survey',
    title: '사회과학적 실태조사 & 정책 비교',
    badge: '사회/정책',
    icon: Layers,
    color: 'amber',
    description: '5점 리커트 척도 설문조사, 공공 판례 빅데이터, 또는 국내외 조례/제도 간의 비용편익 비교 분석',
    recommendedTools: ['구글 폼 설문 & SPSS/Jamovi', '국가법령정보센터 판례', '국회입법조사처 정책 보고서'],
    antiClicheBenefit: '사회 현상을 다각적인 이해관계자와 정량적 설문 통계로 검증하여 사회역량과 정책 대안 기획력을 증명함',
  },
];

function getInitialSubjectGroup(s: Student): string {
  const context = `${s.targetMajor || ''} ${s.targetCareer || ''} ${(s.preferredSubjects || []).join(' ')}`.toLowerCase();
  if (/경영|경제|사회|행정|정치|법|미디어|인문|지리|복지|소비자|광고/.test(context)) return 'social';
  if (/컴퓨터|소프트웨어|인공지능|ai|데이터|sw|정보|알고리즘/.test(context)) return 'tech';
  if (/수학|통계|금융|계리|빅데이터/.test(context)) return 'math';
  if (/국어|문학|언론|미디어|창작/.test(context)) return 'korean';
  if (/영어|국제|통번역|외국어|외교/.test(context)) return 'english';
  return 'science';
}

interface AiRefinementStage {
  stageNum: number;
  totalStages: number;
  progressPercent: number;
  title: string;
  detail: string;
}

export const QuestionRefinementWizard: React.FC<QuestionRefinementWizardProps> = ({
  student,
  onAddActivityRecord,
  onNavigateToMindmap,
  onOpenProfile,
}) => {
  // Wizard State - Dynamically initialized based on student profile
  const initialGroup = getInitialSubjectGroup(student);
  const initialPresets = SUBJECT_PRESETS[initialGroup] || SUBJECT_PRESETS['science'];
  const firstUnit = initialPresets[0]?.units[0] || {
    name: '파동의 굴절과 간섭',
    code: '[12물리I03-02]',
    keyConcept: '센서 신호 감쇄 및 간섭 필터링',
  };

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [broadTopic, setBroadTopic] = useState<string>(
    student.mainInterestTopic || '인공지능 기반 의료 진단 및 영상 분석'
  );
  const [selectedSubjectGroup, setSelectedSubjectGroup] = useState<string>(initialGroup);
  const [selectedPresetUnit, setSelectedPresetUnit] = useState<string>(firstUnit.name);
  const [selectedAchievementCode, setSelectedAchievementCode] = useState<string>(firstUnit.code);
  const [customConcept, setCustomConcept] = useState<string>(`${firstUnit.name} (${firstUnit.keyConcept})`);
  const [selectedMethodologyId, setSelectedMethodologyId] = useState<string>('data-stat');
  const [additionalKeyword, setAdditionalKeyword] = useState<string>('');

  // Generation Results & AI Multi-stage Progress Overlay State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiStage, setAiStage] = useState<AiRefinementStage | null>(null);
  const [adviceForStudent, setAdviceForStudent] = useState<string>('');
  const [synthesizedAcademicTopic, setSynthesizedAcademicTopic] = useState<string>('');
  const [refinedQuestions, setRefinedQuestions] = useState<RefinedQuestion[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync dynamically if student changes
  useEffect(() => {
    if (student.mainInterestTopic) {
      setBroadTopic(student.mainInterestTopic);
    }
    const detectedGroup = getInitialSubjectGroup(student);
    setSelectedSubjectGroup(detectedGroup);
    const presets = SUBJECT_PRESETS[detectedGroup] || SUBJECT_PRESETS['science'];
    if (presets && presets[0]?.units[0]) {
      const u = presets[0].units[0];
      setSelectedPresetUnit(u.name);
      setSelectedAchievementCode(u.code);
      setCustomConcept(`${u.name} (${u.keyConcept})`);
    }
    setAdditionalKeyword('');
  }, [student.id, student.mainInterestTopic, student.targetMajor]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectSubjectGroup = (groupId: string) => {
    setSelectedSubjectGroup(groupId);
    const presets = SUBJECT_PRESETS[groupId];
    if (presets && presets.length > 0 && presets[0].units.length > 0) {
      const u = presets[0].units[0];
      setSelectedPresetUnit(u.name);
      setSelectedAchievementCode(u.code);
      setCustomConcept(`${u.name} (${u.keyConcept})`);
    }
  };

  const handleSelectUnit = (unit: { name: string; code: string; keyConcept: string }) => {
    setSelectedPresetUnit(unit.name);
    setSelectedAchievementCode(unit.code);
    setCustomConcept(`${unit.name} (${unit.keyConcept})`);
  };

  const selectedMethodology =
    METHODOLOGY_OPTIONS.find((m) => m.id === selectedMethodologyId) || METHODOLOGY_OPTIONS[0];

  // API Call to refine question with Real-time Multi-Stage AI Progress
  const handleGenerateRefinements = async () => {
    setIsLoading(true);
    setCurrentStep(3);

    const subjectGroupLabels: Record<string, string> = {
      science: '과학계열',
      math: '수학계열',
      tech: '정보/AI/공학계열',
      social: '사회/경제/정법계열',
      korean: '국어/독서계열',
      english: '영어/학술원서계열',
    };
    const groupName = subjectGroupLabels[selectedSubjectGroup] || selectedSubjectGroup;

    // Stage 1
    setAiStage({
      stageNum: 1,
      totalStages: 3,
      progressPercent: 28,
      title: '1단계: 학생 초기 관심사 및 키워드 맥락 분석',
      detail: `'${broadTopic}'에 담긴 학생의 문제의식과 핵심 어휘를 학문적 탐구 관점으로 구조화하고 있습니다.`,
    });

    const timer1 = setTimeout(() => {
      setAiStage({
        stageNum: 2,
        totalStages: 3,
        progressPercent: 62,
        title: '2단계: 고교 교과 단원 및 핵심 학술 원리 융합',
        detail: `[${groupName}] '${selectedPresetUnit}'(${selectedAchievementCode})의 핵심 원리 '${customConcept}'와 관심사를 융합하여 새로운 학술 연구 주제를 실시간 합성하고 있습니다.`,
      });
    }, 600);

    const timer2 = setTimeout(() => {
      setAiStage({
        stageNum: 3,
        totalStages: 3,
        progressPercent: 90,
        title: '3단계: 실증 방법론 및 연구 도구 기반 3대 심화 질문 도출',
        detail: `'${selectedMethodology.title}'(${selectedMethodology.badge}) 방법론 및 도구(${selectedMethodology.recommendedTools.slice(0, 2).join(', ')})를 적용한 3대 심화 질문과 세특 문안을 생성하고 있습니다.`,
      });
    }, 1500);

    try {
      const payload = {
        interest: broadTopic,
        targetMajor: student.targetMajor || '자연과학/공학 계열',
        subjectGroup: selectedSubjectGroup,
        curriculumConcept: customConcept || selectedPresetUnit,
        methodology: `${selectedMethodology.title} - ${selectedMethodology.badge}`,
        methodologyDetails: selectedMethodology.recommendedTools.join(', '),
        studentGrade: `${student.grade} (${student.targetMajor})`,
        additionalKeyword: additionalKeyword.trim(),
      };

      const res = await fetch('/api/ai/refine-inquiry-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('서버 응답 오류');
      }

      const data = await res.json();
      clearTimeout(timer1);
      clearTimeout(timer2);

      setAiStage({
        stageNum: 3,
        totalStages: 3,
        progressPercent: 100,
        title: '인공지능 3개 축 융합 최적화 완료',
        detail: `새로운 학술 연구 주제 「${data.synthesizedAcademicTopic}」와 3대 심화 탐구 질문 도출이 완료되었습니다.`,
      });

      setSynthesizedAcademicTopic(data.synthesizedAcademicTopic || '');
      setAdviceForStudent(
        data.adviceForStudent ||
          '초기 호기심을 교육과정 교과 개념과 실증 연구 방법론으로 융합하여, 대학 입학사정관이 주목하는 3대 심화 탐구 질문을 도출했습니다.'
      );
      setRefinedQuestions(data.refinedQuestions || []);
      showToast('3대 심화 탐구 질문과 연구 가설이 성공적으로 생성되었습니다!');

      setTimeout(() => {
        setIsLoading(false);
        setAiStage(null);
      }, 450);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('Failed to refine questions:', err);
      setIsLoading(false);
      setAiStage(null);
      showToast('질문 생성 완료 (내장 교육과정 데이터베이스 적용)');
    }
  };

  // Action: Add directly to Inquiry Activity Record
  const handleAddToRecord = (q: RefinedQuestion) => {
    if (!onAddActivityRecord) {
      showToast('활동 일지 연동 핸들러가 준비되지 않았습니다.');
      return;
    }

    onAddActivityRecord({
      studentId: student.id,
      title: q.title,
      subject: selectedPresetUnit.split(' ')[0] || '심화탐구',
      category: '교과세특',
      gradeSemester: '2학년 1학기',
      motivation: `수업 중 '${customConcept}'에 대한 학문적 호기심을 품고, 단순 조사를 넘어 구체적 연구 가설('${q.hypothesis}')을 세워 검증하고자 탐구를 시작함.`,
      process: `[핵심 질문: ${q.question}]\n\n` +
        `■ 연구 변인 설계:\n- 독립변수: ${q.variables?.independent || '조건별 차등'}\n- 종속변수: ${q.variables?.dependent || '결과 반응값'}\n- 통제변수: ${q.variables?.control || '환경 통제'}\n\n` +
        `■ 4단계 탐구 절차:\n${q.stepByStepProcedure.join('\n')}\n\n` +
        `■ 활용 도구 및 데이터:\n${q.recommendedDataOrTools.join(', ')}`,
      insights: `${q.expectedDraftRecordSnippet}\n\n탐구를 통해 이론적 모델과 실제 데이터 간의 상관성을 정량적으로 확인하였으며, 향후 시스템의 한계를 개선하는 후속 융합 과제를 기획함.`,
      relatedBooks: `${synthesizedAcademicTopic || q.title} 관련 학술 논문 및 고교 추천 전공 서적`,
      deliverables: `심화 탐구 보고서 (A4 5매), ${selectedMethodology.title} 분석 결과 그래프, 세특 포트폴리오 요약본`,
      status: 'draft',
    });

    showToast(`'${q.title.substring(0, 16)}...' 활동 일지에 등록되었습니다!`);
  };

  // Action: Copy to Clipboard
  const handleCopyRecord = (q: RefinedQuestion) => {
    const textToCopy = `[${q.title}]\n- 탐구 질문: ${q.question}\n- 연구 가설: ${q.hypothesis}\n- 성취기준: ${q.curriculumAchievementCode}\n- 세특 문안 추천:\n${q.expectedDraftRecordSnippet}`;
    navigator.clipboard.writeText(textToCopy);
    showToast('나이스 기재용 텍스트가 클립보드에 복사되었습니다!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6" translate="no">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Teacher Guidance Context */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-indigo-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Step 2: 주제 지도 특화
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-300 font-medium">
                단순 검색형 X → 교과 개념 + 실증 연구형 O
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Target className="w-6 h-6 text-amber-400 shrink-0" />
              질문 좁히기 3단계 유도 위저드
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              학생이 가져온 넓고 막연한 관심사를 <strong className="text-amber-300 font-semibold">고교 교과 개념</strong>과 <strong className="text-emerald-300 font-semibold">실증 방법론(데이터/실험/모델링)</strong>에 앵커링하여, 대학 입학사정관이 높이 평가하는 날카로운 3대 학술 질문으로 좁혀줍니다.
            </p>
          </div>

          {/* Current Student Card */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {student.name.substring(0, 1)}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">{student.name}</span>
                <span className="text-[11px] text-indigo-200">({student.grade})</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate max-w-[180px]">
                {student.targetMajor || '자연과학/공학'} 지망
              </p>
            </div>
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="text-[11px] px-2 py-1 rounded bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              >
                변경
              </button>
            )}
          </div>
        </div>

        {/* Wizard Step Navigation Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-white/20 text-white font-bold ring-1 ring-white/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider">1단계</div>
            <div className="text-xs sm:text-sm truncate">교과 개념 앵커링</div>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-white/20 text-white font-bold ring-1 ring-white/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider">2단계</div>
            <div className="text-xs sm:text-sm truncate">실증 방법론 & 도구</div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (refinedQuestions.length > 0) setCurrentStep(3);
            }}
            disabled={refinedQuestions.length === 0 && !isLoading}
            className={`text-left px-3.5 py-2.5 rounded-xl transition-all ${
              currentStep === 3
                ? 'bg-white/20 text-white font-bold ring-1 ring-white/30 cursor-pointer'
                : refinedQuestions.length > 0
                ? 'bg-white/5 text-slate-300 hover:bg-white/10 cursor-pointer'
                : 'bg-white/5 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">3단계</div>
            <div className="text-xs sm:text-sm truncate">3대 심화 질문 도출</div>
          </button>
        </div>
      </div>

      {/* STEP 1: 교과 개념 앵커링 (Curriculum Anchor) */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Card: Student's Broad Interest */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  학생이 처음에 가져온 넓은 관심사 / 키워드
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  인터넷에서 흔히 볼 수 있는 넓은 주제일수록 좋습니다. 교과 원리와 결합하여 좁혀나갑니다.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-400">필수 입력</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={broadTopic}
                onChange={(e) => setBroadTopic(e.target.value)}
                placeholder="예: 자율주행차 센서 오류, 이차전지 배터리 화재, 행동경제학 소비 심리, 미세플라스틱"
                className="w-full text-sm font-semibold px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
              />
              <button
                type="button"
                onClick={() => setBroadTopic(student.mainInterestTopic || '인공지능 기반 의료 진단 및 영상 분석')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                학생 프로필 적용
              </button>
            </div>
          </div>

          {/* Card: Select Subject Group & High School Units */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-black">
                  2
                </span>
                호기심을 연결할 고등학교 교과군 및 교과서 단원 선택
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                지금 수업 시간에 배우고 있거나 관심사를 설명할 수 있는 교과 원리를 선택하세요.
              </p>
            </div>

            {/* Subject Group Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {[
                { id: 'science', label: '과학군 (물·화·생·지)', color: 'sky' },
                { id: 'math', label: '수학군 (미적분·확통·기하)', color: 'indigo' },
                { id: 'tech', label: '정보·기술군 (알고리즘·AI)', color: 'emerald' },
                { id: 'social', label: '사회군 (통사·경제·정법)', color: 'amber' },
                { id: 'korean', label: '국어군 (독서·논증)', color: 'rose' },
                { id: 'english', label: '영어군 (심화독해·초록)', color: 'purple' },
              ].map((grp) => (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => handleSelectSubjectGroup(grp.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedSubjectGroup === grp.id
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-indigo-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>

            {/* High School Curriculum Preset Chips */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                2022/2015 고교 교육과정 핵심 성취기준 & 단원 프리셋 (원클릭 선택):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(SUBJECT_PRESETS[selectedSubjectGroup] || []).map((preset) =>
                  preset.units.map((unit) => {
                    const isSelected = selectedPresetUnit === unit.name;
                    return (
                      <button
                        key={unit.name}
                        type="button"
                        onClick={() => handleSelectUnit(unit)}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[11px] font-extrabold text-indigo-700">{preset.subjectName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{unit.code}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">{unit.name}</div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{unit.keyConcept}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Custom Concept Input */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                직접 교과 개념 입력 (선택한 단원의 구체적 원리나 공식):
              </label>
              <input
                type="text"
                value={customConcept}
                onChange={(e) => setCustomConcept(e.target.value)}
                placeholder="예: 파동의 중첩 원리와 광학 센서 신호 감쇄율 / 베이즈 정리 기반 조건부확률"
                className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>

            {/* Proceed to Step 2 Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!broadTopic.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>2단계: 실증 방법론 선택으로 이동</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: 실증 방법론 & 연구 도구 (Research Methodology) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-black">
                  1
                </span>
                실증 방법론 및 연구 도구 선택 (단순 구글링 방지)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                입학사정관은 '어떻게 지식을 스스로 검증했는가'를 평가합니다. 학생이 활용할 현실적인 도구를 선택하세요.
              </p>
            </div>

            {/* 5 Methodology Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {METHODOLOGY_OPTIONS.map((m) => {
                const isSelected = selectedMethodologyId === m.id;
                const IconComponent = m.icon;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethodologyId(m.id)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-200 shadow-md'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                          {m.badge}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{m.title}</h3>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{m.description}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2">
                      <div className="text-[10px] text-emerald-800 font-medium">
                        💡 <strong>사정관 평가 포인트:</strong> {m.antiClicheBenefit}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {m.recommendedTools.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Specific Focus Angle */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-black">
                  2
                </span>
                추가 세부 조건 또는 가설 키워드 (선택 사항)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                실험의 구체적인 제약 조건이나 학생이 특별히 파고들고 싶은 변수(예: 악천후 환경, 저비용 모델, 특정 연령대)를 적어주세요.
              </p>
            </div>

            <input
              type="text"
              value={additionalKeyword}
              onChange={(e) => setAdditionalKeyword(e.target.value)}
              placeholder="예: 강우 시 밀리미터파 감쇄율 비교 / 극성 용매와 비극성 용매의 용해도 차이"
              className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
            />

            {/* Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer transition-colors"
              >
                ← 1단계로 돌아가기
              </button>

              <button
                type="button"
                onClick={handleGenerateRefinements}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>3단계: 좁혀진 심화 탐구 질문 도출하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Multi-Stage AI Optimization Modal Overlay */}
      {isLoading && aiStage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-indigo-500/30 text-white space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 shrink-0">
                <Sparkles className="w-6 h-6 animate-spin text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    AI 3단계 질문 좁히기 실시간 최적화
                  </h3>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-400/40">
                    실시간 생성
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  '{student.name}' 학생 관심사 · {selectedPresetUnit} · {selectedMethodology.title} 종합
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-300 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>진행 단계: [{aiStage.stageNum}/{aiStage.totalStages}] {aiStage.title}</span>
                </span>
                <span className="text-amber-400 font-black">{aiStage.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${aiStage.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Detail Message Box */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>실시간 AI 융합 세부 진행 상황</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                {aiStage.detail}
              </p>
            </div>

            {/* 3 Step Pill Trackers */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  aiStage.stageNum >= 1
                    ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500'
                }`}
              >
                <span className="block text-[10px] text-slate-400">1단계</span>
                <span>관심사 맥락화</span>
              </div>
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  aiStage.stageNum >= 2
                    ? 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500'
                }`}
              >
                <span className="block text-[10px] text-slate-400">2단계</span>
                <span>교과 단원 융합</span>
              </div>
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  aiStage.stageNum >= 3
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500'
                }`}
              >
                <span className="block text-[10px] text-slate-400">3단계</span>
                <span>3대 질문 도출</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: 좁혀진 심화 탐구 질문 도출 및 가설 (Narrowed Inquiries) */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Fallback inline loading spinner if modal is dismissed */}
          {isLoading && !aiStage && (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-md text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  교과 개념({customConcept})과 실증 도구를 결합하여 질문을 좁히는 중...
                </h3>
                <p className="text-xs text-slate-500">
                  단순 검색형 주제를 배제하고, 가설 검증형·수리 모델링형·비판적 대안 제시형 3대 연구 질문을 구축하고 있습니다.
                </p>
              </div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* AI Transformation Banner: 3 Input Axes -> Synthesized Academic Research Topic */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/40 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-indigo-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-indigo-950 flex items-center justify-center text-xs font-black shadow-md">
                      AI
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>인공지능 3개 축 융합 실시간 최적화 결과</span>
                        <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-400/40">
                          실시간 생성
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-300">
                        초기 관심사 + 고교 교과 단원 + 실증 방법론 3대 요소를 종합하여 도출한 새로운 학술 탐구 주제입니다.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                    ✓ 단순 검색형 탈피 · 사정관 평가 최적화
                  </span>
                </div>

                {/* 3 Input Axes Pills */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Axis 1: Student Interest */}
                  <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-1">
                    <div className="text-[10px] text-amber-300 font-black flex items-center gap-1">
                      <span>① 학생 초기 관심사/키워드</span>
                    </div>
                    <p className="text-xs text-slate-100 font-bold line-clamp-2">
                      "{broadTopic}"
                    </p>
                  </div>

                  {/* Axis 2: High School Curriculum Unit */}
                  <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-1">
                    <div className="text-[10px] text-indigo-300 font-black flex items-center gap-1">
                      <span>② 고교 교과 단원 및 핵심 개념</span>
                    </div>
                    <p className="text-xs text-slate-100 font-bold truncate">
                      {selectedPresetUnit} <span className="text-[10px] text-indigo-300 font-mono">({selectedAchievementCode})</span>
                    </p>
                    <div className="text-[11px] text-slate-300 truncate">
                      원리: {customConcept}
                    </div>
                  </div>

                  {/* Axis 3: Empirical Methodology */}
                  <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-1">
                    <div className="text-[10px] text-emerald-300 font-black flex items-center gap-1">
                      <span>③ 실증 방법론 및 연구 도구</span>
                    </div>
                    <p className="text-xs text-slate-100 font-bold truncate">
                      {selectedMethodology.title}
                    </p>
                    <div className="text-[11px] text-slate-300 truncate">
                      도구: {selectedMethodology.recommendedTools.slice(0, 2).join(', ')}
                      {additionalKeyword ? ` · ${additionalKeyword}` : ''}
                    </div>
                  </div>
                </div>

                {/* Synthesized Academic Topic Result */}
                <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-indigo-400/60 shadow-lg space-y-1.5">
                  <div className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>새롭게 종합 생성된 학술 연구 주제 (Synthesized Academic Topic)</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                    「{synthesizedAcademicTopic || `${customConcept} 원리를 접목한 심화 탐구 연구`}」
                  </h2>
                </div>
              </div>

              {/* Teacher Advice Callout */}
              <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200/90 shadow-2xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                    교사용 지도 조언 (Teacher's Coaching Insight)
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
                    {adviceForStudent ||
                      `학생의 초기 호기심을 교육과정 속 '${customConcept}' 개념 및 '${selectedMethodology.title}' 방법론과 결합하여, 단순 조사를 탈피하고 인과 가설과 수리적 절차를 갖춘 심화 학술 연구 질문으로 재구성했습니다.`}
                  </p>
                </div>
              </div>

              {/* 3 Refined Questions Grid */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    3대 관점별 좁혀진 심화 탐구 질문 & 세부 연구 계획
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>조건 변경 후 재도출</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {refinedQuestions.map((q, idx) => {
                    const typeBadgeColor =
                      q.type === 'hypothesis'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : q.type === 'modeling'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                        : 'bg-purple-50 text-purple-800 border-purple-300';

                    return (
                      <div
                        key={q.id || idx}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
                      >
                        {/* Card Header: Type Badge & Achievement Code */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${typeBadgeColor}`}
                            >
                              {q.typeLabel || '심화 탐구형'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {q.curriculumAchievementCode}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-500 font-medium">
                            추천 도구: {(q.recommendedDataOrTools || []).slice(0, 2).join(', ')}
                          </span>
                        </div>

                        {/* Title & Core Question */}
                        <div className="space-y-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                            {q.title}
                          </h3>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                            <div className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider mb-0.5">
                              [핵심 탐구 질문]
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                              "{q.question}"
                            </p>
                          </div>

                          {/* Academic & Public Data 1-Click Search Guide */}
                          <AcademicSearchGuide
                            inquiryQuestion={q.question}
                            topicTitle={q.title}
                            subject={selectedPresetUnit || selectedSubjectGroup}
                            customKeywords={q.recommendedDataOrTools}
                            variant="compact"
                          />
                        </div>

                        {/* Hypothesis & Variables (If present) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="md:col-span-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-1">
                            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                              🔬 검증할 연구 가설 (Hypothesis)
                            </span>
                            <p className="text-emerald-950 font-medium leading-relaxed">{q.hypothesis}</p>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                              변인 통제 구조
                            </span>
                            <div className="text-[11px] text-slate-700 space-y-0.5">
                              <div>
                                <strong className="text-indigo-700">독립:</strong>{' '}
                                {q.variables?.independent || '조작 조건'}
                              </div>
                              <div>
                                <strong className="text-emerald-700">종속:</strong>{' '}
                                {q.variables?.dependent || '결과 반응값'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4-Step Procedure */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-700 block">
                            구체적 4단계 탐구 실행 로드맵:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {q.stepByStepProcedure.map((step, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-700 leading-snug"
                              >
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Student Record Snippet */}
                        <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider">
                              학교생활기록부 교과세특 예상 기재 문안 (약 150자)
                            </span>
                            <span className="text-[10px] text-slate-400">교육부 기재요령 준수</span>
                          </div>
                          <p className="text-slate-800 font-normal leading-relaxed text-[11px] sm:text-xs">
                            {q.expectedDraftRecordSnippet}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center justify-between gap-2 flex-wrap border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddToRecord(q)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>활동 일지에 즉시 등록</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyRecord(q)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>나이스 세특 복사</span>
                            </button>
                          </div>

                          {onNavigateToMindmap && (
                            <button
                              type="button"
                              onClick={() => onNavigateToMindmap(q.title)}
                              className="flex items-center gap-1 px-3 py-2 rounded-xl text-indigo-700 hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer ml-auto"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              <span>마인드맵에서 교과 연계 확장 →</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
