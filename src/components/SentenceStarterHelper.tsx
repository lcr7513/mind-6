import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Copy,
  Check,
  X,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  Search,
  CheckCircle2,
  Bookmark,
  Layers,
} from 'lucide-react';

export interface SentenceStarter {
  id: string;
  category: 'motivation' | 'process' | 'insights';
  categoryLabel: string;
  tag: string;
  patternName: string;
  starterTemplate: string;
  exampleFilled: string;
  tip: string;
}

export const SENTENCE_STARTERS: SentenceStarter[] = [
  // 1. MOTIVATION (탐구 동기)
  {
    id: 'mot-1',
    category: 'motivation',
    categoryLabel: '1단계: 탐구 동기',
    tag: '교과 수업 연계형',
    patternName: '교과 개념의 현실 쟁점 확장',
    starterTemplate: `[교과목] 수업 중 '[학습 개념]' 단원을 학습하며, 교과서의 이론이 실제 현대 사회의 '[현실 쟁점/문제]'에 어떻게 적용되고 영향을 미치는지 깊은 지적 호기심을 품고 탐구를 기획함.`,
    exampleFilled: `통합사회 수업 중 '기후변화와 공간 불평등' 단원을 학습하며, 교과서의 온실가스 감축 이론이 실제 인천 지역 산업단지와 주거 지역 간의 미세먼지 노출 격차에 어떻게 적용되는지 깊은 지적 호기심을 품고 탐구를 기획함.`,
    tip: '수업 시간에 배운 구체적인 교과 개념이나 법칙을 첫머리에 명시하면 교과 세특의 진정성이 입증됩니다.',
  },
  {
    id: 'mot-2',
    category: 'motivation',
    categoryLabel: '1단계: 탐구 동기',
    tag: '비판적 문제의식형',
    patternName: '당연시되던 통념에 대한 재검토',
    starterTemplate: `일반적으로 널리 알려진 '[통념/기존 통계]'에 대해 무비판적으로 수용하지 않고, '[핵심 의문점/한계]'이라는 비판적 시각을 바탕으로 인과관계를 검증하고자 탐구에 착수함.`,
    exampleFilled: `일반적으로 널리 알려진 '원도심 도시재생 사업이 항상 지역 상권을 활성화시킨다'는 통념에 대해 무비판적으로 수용하지 않고, '임대료 급상승으로 인한 원주민 둥지 내몰림(젠트리피케이션)'이라는 비판적 시각을 바탕으로 인과관계를 검증하고자 탐구에 착수함.`,
    tip: '단순한 흥미가 아니라 기존 지식의 맹점이나 한계를 포착하는 비판적 사고력을 보여줍니다.',
  },
  {
    id: 'mot-3',
    category: 'motivation',
    categoryLabel: '1단계: 탐구 동기',
    tag: '학제간 융합형',
    patternName: '이종 교과 지식 간의 유기적 결합',
    starterTemplate: `[A 교과]에서 배운 '[A 개념]' 원리를 [B 교과]의 첨단 난제인 '[B 쟁점]'에 접목할 수 있지 않을까 하는 융합적 가설을 세우고 연구를 시작함.`,
    exampleFilled: `수학(확률과 통계)에서 배운 '베이즈 정리와 조건부 확률' 원리를 사회(지리/도시공학)의 '대중교통 사각지대 및 이동 취약성 판별'에 접목할 수 있지 않을까 하는 융합적 가설을 세우고 연구를 시작함.`,
    tip: '수학과 사회, 과학과 인문학 등 2개 교과 이상의 융합적 사고력(학업역량)을 가장 잘 드러내는 문장입니다.',
  },
  {
    id: 'mot-4',
    category: 'motivation',
    categoryLabel: '1단계: 탐구 동기',
    tag: '로컬/사회 참여형',
    patternName: '지역사회 현안과 생활공간 연계',
    starterTemplate: `우리 지역(인천/학교 주변)에서 발생하고 있는 '[지역 현안 이슈]'를 접하고, 시민들의 삶의 질 향상을 위한 실질적인 해법을 교과 원리인 '[교과 개념]'으로 모색하고자 함.`,
    exampleFilled: `우리 지역(인천)에서 발생하고 있는 '원도심 노후화 및 청년 인구 유출' 문제를 접하고, 시민들의 삶의 질 향상을 위한 실질적인 해법을 교과 원리인 '스마트시티 입지 계수와 공간 접근성 분석'으로 모색하고자 함.`,
    tip: '자신이 살고 있는 지역의 문제에 주도적으로 관심을 갖는 공동체 역량을 어필할 수 있습니다.',
  },

  // 2. PROCESS (탐구 과정 및 방법론)
  {
    id: 'prc-1',
    category: 'process',
    categoryLabel: '2단계: 탐구 과정',
    tag: '공공데이터 실증형',
    patternName: '국가 공공데이터 추출 및 계량 분석',
    starterTemplate: `1. 통계청(KOSIS) 및 공공데이터포털에서 최근 5개년 '[데이터명]' 자료를 추출함.\n2. [엑셀/파이썬] 소프트웨어를 활용하여 변인 간의 상관계수(r)와 추세 회귀선을 산출함.\n3. 통계적 유의성을 검증하고 매개변수 변동에 따른 민감도 곡선을 도출함.`,
    exampleFilled: `1. 통계청(KOSIS) 및 공공데이터포털에서 최근 5개년 '인천 기초지자체별 청년 1인 가구 수 및 대중교통 노선 밀도' 자료를 추출함.\n2. 엑셀 스프레드시트를 활용하여 주거비와 역세권 접근성 간의 피어슨 상관계수(r=-0.72)와 추세 회귀선을 산출함.\n3. 통계적 유의성을 검증하고 대중교통 취약 지수 히트맵을 도출함.`,
    tip: '1, 2, 3 단계 번호 매기기를 통해 연구의 체계성과 데이터 분석 역량을 객관적으로 입증합니다.',
  },
  {
    id: 'prc-2',
    category: 'process',
    categoryLabel: '2단계: 탐구 과정',
    tag: '공간정보(GIS) 분석형',
    patternName: '지리정보시스템 공간 매핑 및 시각화',
    starterTemplate: `1. 국토지리정보원 및 통계지리정보서비스(SGIS)에서 '[공간 데이터]'를 수집함.\n2. QGIS(지리정보시스템) 프로그램을 이용하여 [버퍼 분석/밀도 분석] 공간 레이어를 중첩(Overlay)함.\n3. 취약 지점과 사각지대를 등치선 지도로 시각화하고 최적 입지 조건을 도출함.`,
    exampleFilled: `1. 통계지리정보서비스(SGIS)에서 '인천 중구 고령 인구 밀도 및 보건의료시설 위치' 데이터를 수집함.\n2. QGIS 프로그램을 이용하여 보건소 반경 500m 보행 버퍼(Buffer) 분석 레이어를 중첩함.\n3. 도보 15분 이상 소요되는 의료 취약 사각지대를 적색 히트맵으로 시각화하고 공공 셔틀버스 신설 노선을 도출함.`,
    tip: '지리, 통합사회 및 도시·공학 계열 진로에서 최고의 평가를 받는 GIS 실증 분석 패턴입니다.',
  },
  {
    id: 'prc-3',
    category: 'process',
    categoryLabel: '2단계: 탐구 과정',
    tag: '학술 논문 메타분석형',
    patternName: '선행 연구 논문 비교 및 한계 극복',
    starterTemplate: `1. RISS 및 DBpia 학술 데이터베이스에서 '[핵심 키워드]' 관련 선행 KCI 논문 3편을 분석함.\n2. 각 연구의 방법론적 한계와 표본 편향을 비교 분석표로 정리함.\n3. 기존 연구가 다루지 못한 '[신규 변인]'을 추가하여 수정된 분석 프레임워크를 제안함.`,
    exampleFilled: `1. RISS 학술 데이터베이스에서 '배출권 거래제와 기업 감축 유인' 관련 선행 KCI 논문 3편을 분석함.\n2. 각 연구의 비용 추정 방식과 탄소세율 산출식의 가정을 비교 분석표로 정리함.\n3. 기존 연구가 간과한 '중소기업 설비 전환 보조금' 변수를 추가하여 수정된 정책 평가 프레임워크를 제안함.`,
    tip: '단순 요약이 아니라 선행 연구의 한계를 짚고 자신만의 보완점을 제시하는 연구자적 면모를 보여줍니다.',
  },
  {
    id: 'prc-4',
    category: 'process',
    categoryLabel: '2단계: 탐구 과정',
    tag: '실험/시뮬레이션형',
    patternName: '변인 통제 기반 모의 실험',
    starterTemplate: `1. 조작 변인인 '[A 변인]'과 통제 변인인 '[B, C 변인]'을 엄격히 설정함.\n2. [실험 기구/지오지브라 시뮬레이션]을 활용하여 N회 반복 측정한 평균값과 오차 범위를 기록함.\n3. 가설과 실제 측정값의 잔차(Residual)를 계산하여 원인을 과학적으로 분석함.`,
    exampleFilled: `1. 조작 변인인 '불일치 염기 위치'와 통제 변인인 '반응 온도 및 버퍼 농도'를 엄격히 설정함.\n2. 지오지브라 시뮬레이션 및 스프레드시트를 활용하여 10회 반복 모의 연산한 절단 확률 평균값을 기록함.\n3. 가설값과 실제 시뮬레이션값의 잔차 제곱합을 계산하여 오차 원인을 수리적으로 분석함.`,
    tip: '자연과학, 의약학, 공학 계열 탐구에서 엄밀한 변인 통제 능력을 증명하는 모범 서술입니다.',
  },

  // 3. INSIGHTS & GROWTH (배운 점, 지적 성장, 후속 탐구)
  {
    id: 'ins-1',
    category: 'insights',
    categoryLabel: '3단계: 배운 점 및 성장',
    tag: '학업 역량 심화형',
    patternName: '표면적 지식을 넘어선 본질적 원리 체득',
    starterTemplate: `단순한 사실 관계의 나열을 넘어, 현상의 이면에 작용하는 '[핵심 원리/메커니즘]'을 수치와 논리로 규명해내는 지적 희열을 느낌. 특히 이상적인 공식과 현실 데이터 간의 오차를 분석하는 과정에서 엄밀한 학문적 비판력을 기름.`,
    exampleFilled: `단순한 지리적 현상의 나열을 넘어, 도시 공간의 불평등 이면에 작용하는 '자본 이동과 입지 지대의 공간적 역학'을 수치와 데이터로 규명해내는 지적 희열을 느낌. 특히 이상적인 도시 모델과 현실 도시 간의 오차를 분석하며 엄밀한 학문적 비판력을 기름.`,
    tip: '배운 점을 단순 감상("재미있었다")이 아닌 인지적·학문적 성장으로 승화시킵니다.',
  },
  {
    id: 'ins-2',
    category: 'insights',
    categoryLabel: '3단계: 배운 점 및 성장',
    tag: '전공 통찰/자기효능감형',
    patternName: '예비 전문가로서의 연구 윤리와 안목',
    starterTemplate: `희망 진로인 '[목표 전공/직업]' 연구자에게 필수적인 '[요구 역량: 데이터 해석력/공학적 직관]'의 중요성을 체감함. 단편적 지식 습득에 머무르지 않고 현실의 복합적 난제를 스스로 정의하고 해결하는 자기주도적 연구 역량을 확립함.`,
    exampleFilled: `희망 진로인 'GIS 공간 데이터 분석가 및 도시계획가'에게 필수적인 '공간 통계 해석력과 현장 데이터 검증 태도'의 중요성을 체감함. 단편적 암기에 머무르지 않고 현실의 복합적 도시 문제를 스스로 정의하고 해법을 모색하는 연구 역량을 확립함.`,
    tip: '자신의 진로에 대한 확신과 해당 전공에서 요구하는 핵심 자질을 능동적으로 증명합니다.',
  },
  {
    id: 'ins-3',
    category: 'insights',
    categoryLabel: '3단계: 배운 점 및 성장',
    tag: '공동체 기여 및 나눔형',
    patternName: '학습 성과의 공유와 포용적 성숙',
    starterTemplate: `탐구 결과를 학급 급우들이 직관적으로 이해할 수 있도록 '[산출물 형태: 인포그래픽/워크시트/발표]'로 재구성하여 공유함. 개인의 지적 탐구가 공동체의 이해를 돕고 공공의 가치로 확장될 때 학문의 진정한 보람이 있음을 깨달음.`,
    exampleFilled: `탐구 결과를 학급 급우들이 직관적으로 이해할 수 있도록 '인천 원도심 공간 격차 인포그래픽 리포트'로 재구성하여 학급에 발표함. 개인의 지적 탐구가 급우들의 지역 문제 공감을 이끌어내고 공공의 가치로 확장될 때 학문의 진정한 보람이 있음을 깨달음.`,
    tip: '학생부 평가 3대 요소 중 하나인 ‘공동체 역량(협력과 나눔, 소통)’을 자연스럽게 증명합니다.',
  },
  {
    id: 'ins-4',
    category: 'insights',
    categoryLabel: '3단계: 배운 점 및 성장',
    tag: '후속 탐구 연계형',
    patternName: '다음 학기 심화 탐구로의 지적 꼬리물기',
    starterTemplate: `본 연구에서 확인한 '[발견한 점]'에 만족하지 않고, 데이터 수집의 한계로 다루지 못한 '[미해결 질문]'에 지속적인 호기심이 생김. 차기 학기에는 '[후속 교과목]'과 연계하여 '[후속 심화 주제]'로 연구를 확장해보고자 계획함.`,
    exampleFilled: `본 연구에서 확인한 '대중교통 접근성 격차'에 만족하지 않고, 시간대별(심야/출퇴근) 배차 간격의 한계로 다루지 못한 '교통 약자의 심야 이동권'에 지속적인 호기심이 생김. 2학기에는 사회문화 및 정보 교과와 연계하여 '실시간 버스 GPS 빅데이터 기반 다이내믹 라우팅'으로 연구를 확장해보고자 계획함.`,
    tip: '입학사정관들이 가장 주목하는 ‘탐구의 연속성(학년/학기간 심화 연계)’을 직접 보여줍니다.',
  },
];

interface SentenceStarterHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStarter?: (text: string, category: 'motivation' | 'process' | 'insights') => void;
}

export const SentenceStarterHelperModal: React.FC<SentenceStarterHelperModalProps> = ({
  isOpen,
  onClose,
  onApplyStarter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'motivation' | 'process' | 'insights'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredStarters = SENTENCE_STARTERS.filter((st) => {
    const matchCategory = selectedCategory === 'all' || st.category === selectedCategory;
    const matchSearch =
      searchKeyword === '' ||
      st.patternName.includes(searchKeyword) ||
      st.tag.includes(searchKeyword) ||
      st.starterTemplate.includes(searchKeyword) ||
      st.exampleFilled.includes(searchKeyword);
    return matchCategory && matchSearch;
  });

  const handleCopy = (st: SentenceStarter) => {
    navigator.clipboard.writeText(st.starterTemplate);
    setCopiedId(st.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleApply = (st: SentenceStarter) => {
    if (onApplyStarter) {
      onApplyStarter(st.starterTemplate, st.category);
      setAppliedId(st.id);
      setTimeout(() => {
        setAppliedId(null);
        onClose();
      }, 700);
    } else {
      handleCopy(st);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  세특 문장 시작 도우미 (Sentence Starters)
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                  교육부 기재요령 표준 규격
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                막막한 빈칸을 수준 높은 '동기 ➔ 과정 ➔ 성장' 문장으로 채워주는 12가지 모범 템플릿
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: '전체 보기' },
              { id: 'motivation', label: '💡 1. 동기' },
              { id: 'process', label: '🔬 2. 과정' },
              { id: 'insights', label: '🌱 3. 배운점/성장' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === tab.id
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="패턴명, 키워드 검색 (예: 통계, GIS, 비판)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
        </div>

        {/* Cards List */}
        <div className="overflow-y-auto space-y-3.5 pr-1 flex-1">
          {filteredStarters.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              검색 조건에 맞는 문장 도우미 패턴이 없습니다.
            </div>
          ) : (
            filteredStarters.map((st) => {
              const isCopied = copiedId === st.id;
              const isApplied = appliedId === st.id;

              return (
                <div
                  key={st.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all space-y-3"
                >
                  {/* Top: Category Badge, Tag, Pattern Name */}
                  <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg ${
                          st.category === 'motivation'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : st.category === 'process'
                            ? 'bg-sky-100 text-sky-900 border border-sky-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {st.categoryLabel}
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-lg">
                        #{st.tag}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">
                        {st.patternName}
                      </h4>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleCopy(st)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                        title="클립보드에 서식 복사"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? '복사 완료!' : '양식 복사'}</span>
                      </button>

                      {onApplyStarter && (
                        <button
                          type="button"
                          onClick={() => handleApply(st)}
                          className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                            isApplied
                              ? 'bg-emerald-600'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                          title="작성 중인 일지 입력창에 바로 대입"
                        >
                          {isApplied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                          <span>{isApplied ? '적용 완료!' : '내 일지에 바로 적용'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Template Box */}
                  <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200 text-xs text-slate-900 font-sans leading-relaxed whitespace-pre-line font-medium">
                    {st.starterTemplate}
                  </div>

                  {/* Real Example Accordion/Preview */}
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/70 text-xs space-y-1">
                    <span className="font-extrabold text-indigo-900 flex items-center gap-1.5 text-[11px]">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      실제 우수 기재 예시:
                    </span>
                    <p className="text-slate-700 leading-relaxed italic text-[11px] whitespace-pre-line">
                      "{st.exampleFilled}"
                    </p>
                  </div>

                  {/* Teacher Tip */}
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="font-bold text-slate-700">💡 작성 팁:</span> {st.tip}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            총 <strong>{SENTENCE_STARTERS.length}개</strong>의 세특 표준 문장 템플릿 제공 중
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
