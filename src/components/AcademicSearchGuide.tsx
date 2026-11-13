import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  BookOpen,
  Database,
  Newspaper,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  X,
  Info,
  TrendingUp,
  BarChart3,
  ShieldAlert,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export interface AcademicSearchGuideProps {
  inquiryQuestion: string;
  topicTitle?: string;
  subject?: string;
  customKeywords?: string[];
  variant?: 'full' | 'compact' | 'card';
  className?: string;
}

/**
 * Intelligent helper to extract high-yield academic keywords from Korean inquiry questions
 */
export function extractAcademicKeywords(
  question: string,
  topicTitle?: string,
  subject?: string,
  customKeywords?: string[]
): string[] {
  if (customKeywords && customKeywords.length > 0) {
    return Array.from(new Set(customKeywords));
  }

  const combinedText = `${topicTitle || ''} ${question || ''}`;
  if (!combinedText.trim()) {
    return ['공공데이터 분석', '청소년 탐구', '교과 심화'];
  }

  // Common question ending patterns in Korean to remove
  let cleaned = combinedText
    .replace(/[?？!！"'"'“”\[\]\(\)\{\}]/g, ' ')
    .replace(/(어떻게|어떤|무엇인가|있는가|하는가|인가|는가|일까|미치는|영향은|비교하고|검증하기|설명할|계산할|설계되는|도출할|나타나는가|분석할|규명할|통해|위한|바탕으로|활용하여|관점에서|사례는|수치로|조건에서)/g, ' ')
    .replace(/(대한|과의|과의|사이의|에서|으로|에게|에서|까지|부터|하고|하며|하여|하게)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract meaningful words (length >= 2, non-generic)
  const stopwords = new Set([
    '연구', '탐구', '보고서', '분석', '사례', '현상', '문제', '이유', '원인', '결과',
    '방법', '방안', '특징', '이해', '효과', '고찰', '조사', '검토', '평가', '확인',
    '우리', '학교', '학생', '교과서', '수업', '단원', '핵심', '질문'
  ]);

  const rawTokens = cleaned
    .split(' ')
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !stopwords.has(w));

  const uniqueTokens = Array.from(new Set(rawTokens));

  const suggestions: string[] = [];

  // 1. Primary multi-term query (first 2-3 tokens)
  if (uniqueTokens.length >= 2) {
    suggestions.push(uniqueTokens.slice(0, 2).join(' '));
  }
  if (uniqueTokens.length >= 3) {
    suggestions.push(uniqueTokens.slice(0, 3).join(' '));
  }

  // 2. Pair with subject or core discipline if available
  if (subject) {
    const cleanSub = subject.replace(/[\(\)IⅠⅡ]/g, '').trim();
    if (uniqueTokens.length > 0) {
      suggestions.push(`${uniqueTokens[0]} ${cleanSub}`);
    }
  }

  // 3. Fallbacks or individual high-value tokens
  uniqueTokens.slice(0, 4).forEach((t) => {
    if (!suggestions.includes(t)) {
      suggestions.push(t);
    }
  });

  // Ensure at least 3 distinct keyword suggestions
  if (suggestions.length === 0) {
    suggestions.push(cleaned.slice(0, 15) || '공공데이터');
  }

  return suggestions.slice(0, 4);
}

/**
 * 1-Click Search URL Builders
 */
export function buildRissSearchUrl(query: string): string {
  return `https://www.riss.kr/search/Search.do?queryText=${encodeURIComponent(query.trim())}`;
}

export function buildKosisSearchUrl(query: string): string {
  return `https://kosis.kr/search/search.do?query=${encodeURIComponent(query.trim())}`;
}

export function buildBigKindsSearchUrl(query: string): string {
  return `https://www.bigkinds.or.kr/v2/news/search.do?keyword=${encodeURIComponent(query.trim())}`;
}

/**
 * Academic Search Guide Modal
 */
export const AcademicSearchGuideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeQuery?: string;
}> = ({ isOpen, onClose, activeQuery = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wide">
                Teacher's Research Guide
              </div>
              <h3 className="text-lg font-black text-slate-900">
                신뢰할 수 있는 학술 논문 & 공공데이터 검색 가이드
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Major Portals Breakdown */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-sky-600" />
                1. RISS 학술연구정보서비스 (한국교육학술정보원 KERIS)
              </span>
              <a
                href={buildRissSearchUrl(activeQuery || '지리')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-0.5 underline"
              >
                <span>RISS 바로가기</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-sky-950 leading-relaxed font-medium">
              국내 석·박사 학위논문과 학술지(KCI 등재지) 논문을 무료로 열람할 수 있는 국가 대표 학술 포털입니다.
            </p>
            <div className="text-[11px] text-sky-800 bg-white/80 p-2.5 rounded-xl border border-sky-100 space-y-1">
              <strong>💡 고교생 RISS 열람 팁:</strong>
              <div>• 논문 전체를 다 읽지 말고 <strong>초록(Abstract)</strong>과 <strong>연구 방법(Methodology)</strong>, <strong>결론(Conclusion)</strong> 위주로 빠르게 훑어보세요.</div>
              <div>• '학위논문' 탭은 연구 배경과 선행연구 정리가 고교생이 읽기 쉽게 상세히 서술되어 있습니다.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                2. 국가통계포털 KOSIS (통계청)
              </span>
              <a
                href={buildKosisSearchUrl(activeQuery || '인구')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 underline"
              >
                <span>KOSIS 바로가기</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed font-medium">
              대한민국 중앙행정기관, 지자체, 공공기관이 생산한 공식 통계 자료를 시계열 데이터로 제공합니다.
            </p>
            <div className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-100 space-y-1">
              <strong>💡 고교생 KOSIS 활용 팁:</strong>
              <div>• [통계표 조회]에서 원하는 시·군·구 단위와 최근 5개년 시계열을 설정한 후 <strong>Excel 다운로드</strong>하여 직접 분산 차트나 상관분석 그래프를 그려보세요.</div>
              <div>• 인성여고 지리/통합사회 탐구 시 <strong>SGIS(통계지리정보서비스)</strong>와 연계하면 공간 시각화 격차를 완벽히 증명할 수 있습니다.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                <Newspaper className="w-4 h-4 text-purple-600" />
                3. 빅카인즈 BIG KINDS 뉴스 빅데이터 (한국언론진흥재단)
              </span>
              <a
                href={buildBigKindsSearchUrl(activeQuery || '기후변화')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-0.5 underline"
              >
                <span>빅카인즈 바로가기</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-purple-950 leading-relaxed font-medium">
              국내 54개 주요 언론사의 기사를 빅데이터로 분석하여 연관어 시각화(워드클라우드/관계도), 키워드 트렌드 그래프를 제공합니다.
            </p>
            <div className="text-[11px] text-purple-800 bg-white/80 p-2.5 rounded-xl border border-purple-100 space-y-1">
              <strong>💡 고교생 빅카인즈 활용 팁:</strong>
              <div>• [관계도 분석]을 통해 특정 사회적 이슈와 얽힌 이해관계자(정부, 기업, 주민 등)의 갈등 요소를 한눈에 파악하세요.</div>
              <div>• 탐구 동기 항목에서 "해당 이슈에 대한 최근 3년간 언론 보도량 추이 분석을 통해 문제의 시급성을 체감하고~"로 작성하면 논리성이 극대화됩니다.</div>
            </div>
          </div>
        </div>

        {/* MOE Guideline Warning */}
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <strong className="text-amber-900 font-bold block">
              ⚠️ 교육부 학교생활기록부 기재요령 주의사항
            </strong>
            <p className="text-amber-800 leading-relaxed">
              학교생활기록부 세특에는 논문 제목, 저자명, ISBN, 공인 학술지 명칭을 직접 기재할 수 없습니다. 
              대신 <strong>"~관련 국가 공공데이터 시계열 추이를 분석하고, 선행 학술 연구의 방법론을 참고하여 고교 수준의 가설을 설정함"</strong>과 같이 
              학생의 <strong>자기주도적 연구 역량과 비판적 사고 과정</strong> 중심으로 기술해야 평가에서 최고점을 받습니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Academic Search Guide Component
 * Embedded right next to inquiry questions
 */
export const AcademicSearchGuide: React.FC<AcademicSearchGuideProps> = ({
  inquiryQuestion,
  topicTitle,
  subject,
  customKeywords,
  variant = 'full',
  className = '',
}) => {
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState<number>(0);
  const [customInputKeyword, setCustomInputKeyword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Derive academic keywords from question
  const keywords = useMemo(() => {
    return extractAcademicKeywords(inquiryQuestion, topicTitle, subject, customKeywords);
  }, [inquiryQuestion, topicTitle, subject, customKeywords]);

  const activeKeyword = customInputKeyword.trim() || keywords[selectedKeywordIndex] || inquiryQuestion.slice(0, 15);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rissUrl = buildRissSearchUrl(activeKeyword);
  const kosisUrl = buildKosisSearchUrl(activeKeyword);
  const bigKindsUrl = buildBigKindsSearchUrl(activeKeyword);

  // Compact Variant (Inline mini bar next to question)
  if (variant === 'compact') {
    return (
      <div className={`p-3 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5 ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>추천 학술 검색어:</span>
            <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg text-[11px]">
              "{activeKeyword}"
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="text-[11px] text-slate-500 hover:text-indigo-600 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            <span>검색 가이드</span>
          </button>
        </div>

        {/* 3 One-Click Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={rissUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold shadow-2xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>RISS 학술논문 검색</span>
            <ArrowUpRight className="w-3 h-3 text-sky-200" />
          </a>

          <a
            href={kosisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>국가통계포털 KOSIS 바로가기</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-200" />
          </a>

          <a
            href={bigKindsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-2xs transition-colors"
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>빅카인즈 뉴스 빅데이터 검색</span>
            <ArrowUpRight className="w-3 h-3 text-purple-200" />
          </a>
        </div>

        <AcademicSearchGuideModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
          activeQuery={activeKeyword}
        />
      </div>
    );
  }

  // Full / Card Variant
  return (
    <div
      className={`bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>신뢰할 수 있는 학술 논문 & 공공데이터 원클릭 검색 가이드</span>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.2 rounded-full">
                실증 검증용
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              블로그 짜깁기 대신 정부 공인 통계와 한국교육학술정보원 논문으로 탐구의 신뢰도를 입증하세요.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsGuideModalOpen(true)}
          className="self-start sm:self-auto text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>연구 검색 꿀팁 가이드</span>
        </button>
      </div>

      {/* Recommended Academic Keywords Selection Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-extrabold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>추천 학술 검색 키워드 (원클릭 선택):</span>
          </label>
          <button
            type="button"
            onClick={() => handleCopy(activeKeyword)}
            className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600 font-bold">복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>검색어 복사</span>
              </>
            )}
          </button>
        </div>

        {/* Keyword Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {keywords.map((kw, idx) => {
            const isSelected = selectedKeywordIndex === idx && !customInputKeyword.trim();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedKeywordIndex(idx);
                  setCustomInputKeyword('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-200'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>#{kw}</span>
                {isSelected && <span className="text-[10px] text-indigo-200">선택됨</span>}
              </button>
            );
          })}
        </div>

        {/* Custom refinement input */}
        <div className="pt-1 flex items-center gap-2">
          <input
            type="text"
            value={customInputKeyword}
            onChange={(e) => setCustomInputKeyword(e.target.value)}
            placeholder="직접 검색어 입력 또는 수정 (예: 인천 원도심 젠트리피케이션, 태양광 발전 효율)"
            className="flex-1 text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400"
          />
          {customInputKeyword && (
            <button
              type="button"
              onClick={() => setCustomInputKeyword('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 cursor-pointer"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* The 3 Core 1-Click Launch Action Buttons */}
      <div className="pt-1">
        <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
          <span>선택된 키워드:</span>
          <span className="text-indigo-700 font-extrabold underline">"{activeKeyword}"</span>
          <span>(으)로 1초 만에 공인 DB 직행:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Button 1: RISS */}
          <a
            href={rissUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-2xs hover:shadow-sm transition-all group cursor-pointer"
            title="한국교육학술정보원(KERIS) 학술연구정보서비스에서 논문 검색"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black leading-tight flex items-center gap-1">
                  <span>RISS 학술연구정보서비스</span>
                </div>
                <div className="text-[10px] text-sky-100">국내 석·박사 학위 및 학술지 논문</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-sky-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </a>

          {/* Button 2: KOSIS */}
          <a
            href={kosisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-2xs hover:shadow-sm transition-all group cursor-pointer"
            title="통계청 국가통계포털에서 시계열 공공데이터 통계표 검색"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black leading-tight">
                  국가통계포털 KOSIS 바로가기
                </div>
                <div className="text-[10px] text-emerald-100">통계청 공인 시계열 통계표</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </a>

          {/* Button 3: BIG KINDS */}
          <a
            href={bigKindsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-2xs hover:shadow-sm transition-all group cursor-pointer"
            title="한국언론진흥재단 빅카인즈에서 54개 언론사 뉴스 빅데이터 및 관계도 분석"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Newspaper className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black leading-tight">
                  빅카인즈 뉴스 빅데이터 검색
                </div>
                <div className="text-[10px] text-purple-100">54개 언론사 트렌드 & 관계도</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-purple-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </a>
        </div>
      </div>

      {/* Modal */}
      <AcademicSearchGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        activeQuery={activeKeyword}
      />
    </div>
  );
};
