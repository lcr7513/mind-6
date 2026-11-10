import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import {
  Compass,
  Target,
  Sparkles,
  BookOpen,
  CheckCircle2,
  X,
  Lightbulb,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Layers,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface StudentCareerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSaveProfile: (
    updated: Student,
    targetTab?: 'wizard' | 'ai-topics' | 'roadmap' | 'inquiry-log'
  ) => void;
}

export const StudentCareerProfileModal: React.FC<StudentCareerProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaveProfile,
}) => {
  const [name, setName] = useState<string>(student.name || '');
  const [grade, setGrade] = useState<string>(student.grade || '고등학교 2학년');
  const [school, setSchool] = useState<string>(student.school || '한국과학예술고등학교');
  const [targetCareer, setTargetCareer] = useState<string>(student.targetCareer || '');
  const [targetMajor, setTargetMajor] = useState<string>(student.targetMajor || '');
  const [mainInterestTopic, setMainInterestTopic] = useState<string>(
    student.mainInterestTopic || ''
  );
  const [keywordsText, setKeywordsText] = useState<string>(
    (student.interestKeywords || []).join(', ')
  );
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>(
    student.preferredSubjects || [
      '수학 (미적분/확률과 통계)',
      '과학 (생명과학/화학)',
      '사회 (생활과 윤리/경제)',
      '정보/AI',
    ]
  );

  const [activeStep, setActiveStep] = useState<number>(1);

  // Sync state whenever student prop changes
  useEffect(() => {
    if (student) {
      setName(student.name);
      setGrade(student.grade);
      setSchool(student.school);
      setTargetCareer(student.targetCareer);
      setTargetMajor(student.targetMajor);
      setMainInterestTopic(
        student.mainInterestTopic ||
          (student.interestKeywords && student.interestKeywords[0]
            ? `${student.interestKeywords[0]} 관련 심화 탐구`
            : '')
      );
      setKeywordsText((student.interestKeywords || []).join(', '));
      setPreferredSubjects(
        student.preferredSubjects || [
          '수학 (미적분/확률과 통계)',
          '과학 (생명과학/화학)',
          '사회 (생활과 윤리/경제)',
          '정보/AI',
        ]
      );
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const quickCareerPresets = [
    { label: '간호·보건의료', career: '전문 간호사 / 감염관리전문가', major: '간호학과 / 보건관리학과' },
    { label: '의예·치의예', career: '외과 전문의 / 임상의과학자', major: '의예과 / 의학과' },
    { label: '약학·생명공학', career: '바이오 신약 개발자 / 연구약사', major: '약학과 / 생명공학과' },
    { label: '기계·로봇·모빌리티', career: '로봇 제어 공학자 / 자율주행 엔지니어', major: '기계공학과 / 로봇공학과' },
    { label: '전기전자·반도체', career: '시스템반도체 회로설계사 / 칩 아키텍트', major: '전기전자공학과 / 반도체공학과' },
    { label: '컴퓨터공학·AI', career: 'AI 시스템 연구원 / 소프트웨어 엔지니어', major: '컴퓨터공학과 / 인공지능학과' },
    { label: '화학공학·이차전지', career: '차세대 배터리 소재 연구원 / 화공 엔지니어', major: '화학공학과 / 신소재공학과' },
    { label: '건축·도시·공간', career: '친환경 패시브 건축가 / 스마트시티 플래너', major: '건축학과 / 도시공학과' },
    { label: '환경공학·기후기술', career: '탄소중립 기술 연구원 / 환경영향평가사', major: '환경공학과 / 지구환경과학과' },
    { label: '경영·마케팅', career: '데이터 마케팅 디렉터 / 스타트업 창업가', major: '경영학과 / 글로벌경영' },
    { label: '경제·금융·핀테크', career: '금융공학 퀀트 애널리스트 / 핀테크 개발자', major: '경제학과 / 금융공학과' },
    { label: '미디어·커뮤니케이션', career: '탐사보도 저널리스트 / 콘텐츠 디렉터', major: '미디어커뮤니케이션학과 / 신문방송' },
    { label: '심리·인지과학·뇌과학', career: '인지과학 연구원 / 임상심리전문가', major: '심리학과 / 뇌인지과학과' },
    { label: '사범대·교육학·에듀테크', career: '중등 교과 정교사 / 에듀테크 학습설계자', major: '사범대학 교육학과 / 국어·수학교육' },
    { label: '법학·행정·공공정책', career: '공공인재 / 로스쿨 법률전문가 / 외교관', major: '법학과 / 행정학과 / 공공정책학' },
  ];

  const quickInterestThemes = [
    '지수함수 감쇄 모델을 활용한 정맥 주사 약물 체내 잔존 농도 및 감염관리 프로토콜',
    '심전도 삼각함수 파형 모델링 및 암세포 표적 면역관문억제제 분자 메커니즘',
    '미카엘리스-멘텐 효소 반응속도론 및 mRNA 지질나노입자(LNP) 약물전달체',
    '로봇 머니퓰레이터 역기구학 좌표 변환 및 자율주행 PID 모터 제어',
    'RLC 공진 회로 임피던스 및 MOSFET 에너지 밴드갭 나노 스위칭',
    '이진 탐색 시간복잡도 로그 분석 및 트랜스포머 어텐션 자연어 딥러닝',
    '아레니우스 반응속도론 및 전고체 배터리 리튬 이온 확산 계면 열역학',
    '트러스 구조 인장력 평형 벡터 역학 및 15분 도시 보행 유니버설 디자인',
    'Lotka-Volterra 생태계 연립 미분방정식 및 탄소국경조정제도(CBAM) 분석',
    '손익분기점(BEP) 연립방정식 및 A/B 테스트 가설검정 기반 이커머스 최적화',
    '무차별곡선 한계대체율 미적분 및 몬테카를로 자산배분 포트폴리오',
    '소셜 미디어 바이럴 확산 지수함수 및 딥페이크 위변조 탐지 저널리즘',
    '베버-페히너 로그 지각 법칙 및 fMRI BOLD 신호 신경가소성 분석',
    '문항반응이론(IRT) 로지스틱 수리 및 망각 곡선 미적분 기반 적응형 학습',
    '헌법 과잉금지원칙 4단계 판례 분석 및 법률 자연어 처리(Legal NLP) 연구',
  ];

  const availableSubjectsList = [
    '수학 (미적분/확률과 통계)',
    '과학 (생명과학/화학/물리)',
    '사회 (생활과 윤리/경제/정치와 법)',
    '국어 (독서/화법과 작문)',
    '영어 (심화영어/독해와 작문)',
    '정보/AI (인공지능 기초/데이터)',
  ];

  const toggleSubject = (s: string) => {
    setPreferredSubjects((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleSave = (
    targetTab: 'wizard' | 'ai-topics' | 'roadmap' | 'inquiry-log' = 'wizard'
  ) => {
    const parsedKeywords = keywordsText
      .split(',')
      .map((k) => k.replace(/#/g, '').trim())
      .filter(Boolean);

    const updated: Student = {
      ...student,
      name: name.trim() || student.name,
      grade,
      school: school.trim() || student.school,
      targetCareer: targetCareer.trim() || '전문 연구원',
      targetMajor: targetMajor.trim() || '관련 학과 계열',
      mainInterestTopic:
        mainInterestTopic.trim() ||
        `${targetCareer} 분야의 핵심 교과 연계 심화 탐구`,
      interestKeywords:
        parsedKeywords.length > 0 ? parsedKeywords : ['교과연계', '심화탐구', '학업역량'],
      preferredSubjects:
        preferredSubjects.length > 0 ? preferredSubjects : availableSubjectsList.slice(0, 3),
      onboardingCompleted: true,
    };

    onSaveProfile(updated, targetTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  나의 진로희망 & 관심사 맞춤 프로필
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full border border-indigo-100">
                  탐구 맞춤 설정
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                학생의 진로 목표와 진짜 관심사를 먼저 기록하고, 이에 꼭 맞는 교과 연계 탐구를 시작합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { step: 1, label: '1. 희망 진로 & 목표 학과' },
            { step: 2, label: '2. 관심 연구 분야 & 호기심' },
            { step: 3, label: '3. 연계 교과 & 강조 역량' },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveStep(item.step)}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                activeStep === item.step
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="text-[11px] leading-tight">{item.label}</div>
            </button>
          ))}
        </div>

        {/* STEP 1: Career Hope & Target Major */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  학생 이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 김민서"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  학년 선택
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                >
                  <option value="고등학교 1학년">고등학교 1학년 (기초 소양 탐색)</option>
                  <option value="고등학교 2학년">고등학교 2학년 (선택 과목 심화)</option>
                  <option value="고등학교 3학년">고등학교 3학년 (개별 심층 융합)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  소속 고등학교
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="예: 한국과학예술고"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>희망 진로 / 직업 목표</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[11px] text-indigo-600 font-medium">자유 입력</span>
              </div>
              <input
                type="text"
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                placeholder="예: 유전자 치료제 연구원, 바이오 신약 개발자, AI 시스템 아키텍트, 친환경 에너지 공학자"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>목표 희망 전공 / 학과 계열</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[11px] text-indigo-600 font-medium">자유 입력</span>
              </div>
              <input
                type="text"
                value={targetMajor}
                onChange={(e) => setTargetMajor(e.target.value)}
                placeholder="예: 생명공학과 / 바이오시스템공학, 컴퓨터공학과 / 인공지능융합, 환경경제학과"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
              />
            </div>

            {/* Quick Career Presets */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>추천 진로·학과 예시 (클릭하면 바로 채워집니다):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickCareerPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTargetCareer(preset.career);
                      setTargetMajor(preset.major);
                    }}
                    className="text-left p-2.5 bg-white hover:bg-indigo-50/70 hover:border-indigo-300 border border-slate-200 rounded-xl text-xs transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                        {preset.label}
                      </span>
                    </div>
                    <strong className="block text-slate-900 truncate">{preset.career}</strong>
                    <span className="text-[11px] text-indigo-600 truncate block">
                      {preset.major}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>다음: 관심 연구 분야 설정</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Main Interest Field & Recent Curiosity */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>내가 가장 관심 있는 핵심 연구 분야 / 일상 속 호기심 주제</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <span className="text-[11px] text-indigo-600 font-semibold">자유 상세 입력</span>
              </div>
              <textarea
                rows={3}
                value={mainInterestTopic}
                onChange={(e) => setMainInterestTopic(e.target.value)}
                placeholder="수업 시간, 뉴스, 독서 등에서 가장 깊이 탐구해보고 싶었던 쟁점이나 호기심을 적어보세요. (예: 크리스퍼 유전자 가위의 오프타깃 부작용 극복과 난치병 치료 메커니즘)"
                className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 leading-relaxed"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                💡 입력하신 이 관심사가 <strong>[교과 단원별 탐구 길잡이]</strong> 및 <strong>[AI 교과 연계 마인드맵]</strong>의 기준 테마로 활용됩니다.
              </span>
            </div>

            {/* Quick Themes */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>관심 분야가 고민된다면? 인기 탐구 테마 예시:</span>
              </span>
              <div className="space-y-1.5">
                {quickInterestThemes.map((theme, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMainInterestTopic(theme)}
                    className="w-full text-left p-2 bg-white hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 rounded-xl text-xs text-slate-700 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{theme}</span>
                    <span className="text-[10px] text-indigo-600 font-bold shrink-0 ml-2">선택</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← 이전
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>다음: 연계 교과 및 키워드 설정</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Subjects & Keywords */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                강조하고 싶은 세부 역량 키워드 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="예: #수리모델링, #오차분석, #약물전달체계, #생명윤리, #공공데이터시각화"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                나의 관심사를 우선 연계하여 탐구하고 싶은 교과목:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSubjectsList.map((subj) => {
                  const isChecked = preferredSubjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => toggleSubject(subj)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{subj}</span>
                      {isChecked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />
                      ) : (
                        <span className="text-slate-300 text-xs shrink-0 ml-1">+</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs space-y-2">
              <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">
                ✨ 내 맞춤 탐구 설정 요약
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-800">
                <div>
                  <span className="text-slate-500">희망 진로: </span>
                  <strong>{targetCareer || '미입력'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">목표 학과: </span>
                  <strong className="text-indigo-700">{targetMajor || '미입력'}</strong>
                </div>
              </div>
              <div className="text-slate-800">
                <span className="text-slate-500">핵심 관심 연구: </span>
                <strong className="text-slate-900">{mainInterestTopic || '미입력'}</strong>
              </div>
            </div>

            {/* Completion Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← 이전
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSave('roadmap')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>맞춤 로드맵 확인</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave('wizard')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>단원별 탐구 길잡이</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave('ai-topics')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>AI 마인드맵</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
