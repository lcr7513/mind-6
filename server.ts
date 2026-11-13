import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { synthesizeComprehensiveCurriculum, create4ConcreteSteps } from './src/data/curriculumSynthesizer.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'hakjong-compass',
    aiConnected: Boolean(hasRealApiKey && ai),
    model: hasRealApiKey ? 'gemini-3.1-flash-lite' : 'offline-15-database',
  });
});

// Check if a real Gemini API key is provided via env var or server-side secret
const envKey = process.env.GEMINI_API_KEY?.trim();
const SERVER_FALLBACK_KEY = 'AIzaSyBvrwMgj-sxZ78C9-bn5iNzBmeFjlaAfzw';
const activeApiKey =
  (envKey && envKey !== 'MY_GEMINI_API_KEY' && !envKey.startsWith('MY_'))
    ? envKey
    : SERVER_FALLBACK_KEY;

const hasRealApiKey = Boolean(activeApiKey);

// Initialize Google Gen AI client with telemetry header if real API key is present
const ai = hasRealApiKey
  ? new GoogleGenAI({
      apiKey: activeApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Shared fast resilient Gemini JSON caller (multi-model fallback chain + zero thinking overhead)
async function callGeminiFastJSON(prompt: string, timeoutMs: number = 25000): Promise<any> {
  if (!hasRealApiKey || !ai) {
    throw new Error('Gemini API key not configured');
  }
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`AI request timeout (${modelName})`)), timeoutMs)
      );
      const resp = await Promise.race([generatePromise, timeoutPromise]);
      const raw = resp.text || '';
      if (raw.trim()) {
        const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${modelName} failed, trying next:`, err?.message || err);
    }
  }
  throw lastError || new Error('All Gemini models failed');
}

// Helper: Check if client requested Server-Sent Events (SSE) via REST POST
function isSSERequest(req: express.Request): boolean {
  const accept = req.headers['accept'] || '';
  return (
    accept.includes('text/event-stream') ||
    req.body?.stream === true ||
    req.query?.stream === 'true'
  );
}

// Helper: Initialize Server-Sent Events (SSE) stream for REST POST
function createSSEWriter(res: express.Response) {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const send = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const sendProgress = (
    step: number,
    total: number,
    message: string,
    progress: number,
    details?: any
  ) => {
    send('progress', { step, total, message, progress, details });
  };

  const sendChunk = (text: string, field?: string) => {
    send('chunk', { text, field });
  };

  const sendComplete = (result: any) => {
    send('complete', { success: true, result });
    res.end();
  };

  const sendError = (error: string) => {
    send('error', { success: false, error });
    res.end();
  };

  return { send, sendProgress, sendChunk, sendComplete, sendError };
}

// Helper: Generate Level 4 concrete action and methodology nodes for Mind Map
function createConcreteActionChildren(
  stepNum: number,
  category: string,
  cleanInterest: string,
  subjectBadge: string
) {
  const isMath = category === 'math';
  const isSci = category === 'science';
  const isSoc = category === 'social';
  const isKor = category === 'korean' || category === 'humanities';
  const isEng = category === 'english';
  const isTech = category === 'tech';

  const baseId = `${category}-act-${stepNum}-${Math.random().toString(36).slice(2, 6)}`;
  const color =
    isMath ? '#38bdf8' : isSci ? '#34d399' : isSoc ? '#fbbf24' : isKor ? '#a78bfa' : isEng ? '#c084fc' : '#fb7185';

  if (stepNum === 1) {
    return [
      {
        id: `${baseId}-1`,
        text: `[변인 정의] ${cleanInterest.slice(0, 14)} 독립·종속변수 조작적 정의 및 통제변인 리스트`,
        category,
        color,
        subject: subjectBadge,
        nodeType: 'action' as const,
        detail: `${cleanInterest} 현상에 관여하는 핵심 독립변수를 조작적으로 정의하고 외생 변인을 철저히 통제하는 실험/모델링 변인 설계`,
        inquiryQuestion: '연구 대상 시스템의 순수한 인과관계를 분리하여 입증하기 위한 핵심 통제 변인은 무엇인가?',
        methodology: '변인 통제 설계서 작성 및 가설 진술문 검토',
        recordTip: '현상 속에서 과학적·수학적 변수를 분해하여 조작적으로 정의하는 추상화 역량 부각',
      },
      {
        id: `${baseId}-2`,
        text: `[가설 수립] 교과 핵심 원리에 기반한 검증 가능 가설 진술문 작성`,
        category,
        color,
        subject: subjectBadge,
        nodeType: 'action' as const,
        detail: '단순 추측을 지양하고 교과서 개념(도함수/반응속도/롤스정의/IMRaD/알고리즘)에 기반한 반증 가능 가설 도출',
        inquiryQuestion: '선행 연구 데이터와 대비하여 본 연구에서 새롭게 검증하고자 하는 대립가설은 무엇인가?',
        methodology: '연구 가설 진술문 작성 및 이론적 배경 매핑',
        recordTip: '선행 지식에 비추어 타당한 가설을 주도적으로 수립한 논리적 사고력 입증',
      },
    ];
  }

  if (stepNum === 2) {
    return [
      {
        id: `${baseId}-1`,
        text: `[선행 논문 분석] KCI/국제 저널 선행 연구 2편 방법론 비교 Matrix 작성`,
        category,
        color,
        subject: subjectBadge,
        nodeType: 'action' as const,
        detail: 'RISS/DBpia 검색 논문 2편의 연구 설계, 수식, 한계점을 발췌하여 본 탐구와의 차별성을 3단 표로 구조화',
        inquiryQuestion: '기존 선행 연구들이 간과한 한계점과 고교생 수준에서 관찰 가능한 차별점은 무엇인가?',
        methodology: '선행 연구 비교 분석표(Matrix) 작성 및 한계점 비판',
        recordTip: '학술 문헌을 비판적으로 독해하고 연구의 독창적 가치를 정립한 연구자적 안목',
      },
      {
        id: `${baseId}-2`,
        text: `[교과 개념 연계] 교과서 핵심 수식/이론 유도 과정과 전공 쟁점 심화 매핑`,
        category,
        color,
        subject: subjectBadge,
        nodeType: 'action' as const,
        detail: '정규 교과 단원 개념을 대학 수준의 학술 이론과 유기적으로 연결하여 개념 관계도(Concept Map) 작성',
        inquiryQuestion: '교과서에 소개된 기초 법칙이 최신 학술 연구에서 어떻게 확장·응용되고 있는가?',
        methodology: '교과 개념 연계 맵 작성 및 지도 교사 피드백 수렴',
        recordTip: '교과서 원리를 대학 수준의 학술 개념과 접목하여 깊이 있게 이해한 우수한 학업 역량',
      },
    ];
  }

  if (stepNum === 3) {
    if (isMath) {
      return [
        {
          id: `${baseId}-1`,
          text: `[도구 프로토콜] 지오지브라 슬라이더 파라미터 민감도 분석 & 파이썬 시뮬레이션`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '지오지브라에서 슬라이더 변수 a, b를 동적 조작하며 임계치 변화에 따른 접선의 기울기 변동 및 수렴성 관찰',
          inquiryQuestion: '매개변수가 특정 임계치를 넘을 때 함수의 점근선과 수렴성은 어떻게 변하는가?',
          methodology: '지오지브라 동적 워크시트 제작 및 스크린샷 캡처, 파이썬 수치 시뮬레이션 코드 작성',
          recordTip: '컴퓨팅 도구를 활용하여 수학적 직관을 시각적으로 구현해내는 우수한 실증력',
        },
        {
          id: `${baseId}-2`,
          text: `[데이터 피팅] 공공 통계 원시 데이터 추출 및 최소제곱법 회귀식 산출`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '공공데이터포털(data.go.kr)에서 CSV 데이터를 수집하고 산점도를 그린 후 최소제곱법 회귀곡선 수식 유도',
          inquiryQuestion: '실제 관측 데이터에 가장 근접하는 1차/2차 다항 회귀방정식은 무엇인가?',
          methodology: 'Excel/파이썬 Pandas를 활용한 산점도 및 추세선 회귀식 산출',
          recordTip: '실제 데이터를 수학 공식과 연결하여 피팅하는 데이터 분석 실무 역량',
        },
        {
          id: `${baseId}-3`,
          text: `[오차 검증] 잔차 제곱합(RSS) 계산 및 모델 적합도(R²) 평가`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '관측값과 예측값의 잔차(Residual) 분포도를 작성하고 결정계수(R-squared)로 수학적 설명력 검증',
          inquiryQuestion: '수립된 수학적 모델이 현실 데이터를 몇 퍼센트나 설명할 수 있는가?',
          methodology: '잔차 분포도 작성 및 통계적 유의성 검토',
          recordTip: '자신의 수리 모델을 통계적 오차 지표로 냉철하게 검증하는 정직한 연구 윤리',
        },
      ];
    }
    if (isSci) {
      return [
        {
          id: `${baseId}-1`,
          text: `[변인 통제] 조작 변인과 통제 변인 설정 및 대조군 실험 프로토콜`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '온도, 농도, 조도 등 외생 변인을 일정하게 유지하는 구체적 실험 순서도 및 안전 매뉴얼 수립',
          inquiryQuestion: '예상치 못한 환경 외란을 차단할 수 있는 블라인드 대조군 설계는 무엇인가?',
          methodology: '실험 프로토콜 5단계 수립 및 교내 과학실 기자재 대여 신청',
          recordTip: '실험 설계의 정밀성과 변인 통제의 엄격함을 철저히 준수한 과학적 탐구 태도',
        },
        {
          id: `${baseId}-2`,
          text: `[측정 데이터] MBL 디지털 센서 반응 수치 및 분자 시뮬레이션 정량 측정`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '시간 경과에 따른 정량적 수치 변화를 5회 반복 측정하여 평균값, 표준편차 및 분자 3D 결합각 산출',
          inquiryQuestion: '반복 측정 간의 오차 범위는 통계적으로 허용 가능한 수준인가?',
          methodology: 'MBL 센서 측정 및 엑셀 데이터 테이블 입력, MolView 3D 분자 구조 시각화',
          recordTip: '단발성 실험이 아닌 다회 반복 측정을 통해 데이터의 신뢰도를 확보한 성실성',
        },
        {
          id: `${baseId}-3`,
          text: `[오차 분석] 실험 기구 분해능 한계에 따른 불확도 계산 및 보정`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '디지털 계측 장비의 최소 눈금 한계 및 열손실 요인을 정량 보정하여 유효숫자 단위 오차 산출',
          inquiryQuestion: '장비의 분해능 한계로 인해 발생할 수 있는 최대 오차 범위는 얼마인가?',
          methodology: '불확도 전파 법칙 적용 및 오차 보정치 산출',
          recordTip: '오차 발생 원인을 장비의 물리적 한계와 결부지어 과학적으로 해석해낸 분석력',
        },
      ];
    }
    if (isSoc) {
      return [
        {
          id: `${baseId}-1`,
          text: `[정책 비교] 국내 법령 조문과 EU/OECD 가이드라인 규제 조항 대비표 작성`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '국가법령정보센터 관련 법률안과 해외 규제 샌드박스 가이드라인의 조문별 장단점 대비표 제작',
          inquiryQuestion: '국내 포지티브 규제 체계와 글로벌 네거티브 규제 체계의 실효성 차이는 무엇인가?',
          methodology: '법령 조문 비교표 작성 및 정책 쟁점 분석 보고서 집필',
          recordTip: '철학적 규범 윤리와 실정법 조항을 융합하여 입체적으로 법리를 분석한 학업 역량',
        },
        {
          id: `${baseId}-2`,
          text: `[공공 데이터] KOSIS 소득/환경 통계 지표 상관분석 및 비용편익 분석`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '국가통계포털(KOSIS)에서 최근 5개년 수혜/피해 계층 데이터를 추출하여 정책의 경제적 타당성 검토',
          inquiryQuestion: '정책 도입에 따른 사회적 편익이 규제 준수 비용을 상회하는가?',
          methodology: 'Excel 비용편익분석(B/C Ratio) 간이 모델링 및 산점도 작성',
          recordTip: '사회적 약자 보호와 경제적 효율성을 통계 데이터로 균형 있게 검토한 정책 분석력',
        },
        {
          id: `${baseId}-3`,
          text: `[공청회 설계] 모의 이해관계자 3자 공청회 대본 및 정책 제안서 초안`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '정부, 기업, 시민단체 3자의 입장을 가상 시뮬레이션하여 상생 절충 조례안 작성',
          inquiryQuestion: '공공 안전을 보장하면서도 기술 혁신 유인을 저해하지 않는 타협안은 무엇인가?',
          methodology: '학급 모의 공청회 대본 작성 및 정책 제안서 완성',
          recordTip: '다양한 이해관계자의 입장을 균형 있게 청취하고 현실적 대안을 제시하는 협업 역량',
        },
      ];
    }
    if (isKor) {
      return [
        {
          id: `${baseId}-1`,
          text: `[논증 도식화] 툴민(Toulmin) 논증 모형을 적용한 사설 3편 타당성 분해`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '주장(Claim), 데이터(Data), 담보(Warrant) 3요소로 신문 사설을 분해하고 비형식적 논리 오류 검출',
          inquiryQuestion: '사설의 논리 전개에서 데이터와 주장 사이의 담보가 충분히 객관적인가?',
          methodology: '툴민 논증 구조도 다이어그램 작성 및 논리적 비약 검토',
          recordTip: '논증의 타당성과 설득력을 학문적 분석틀로 정밀하게 검증한 국어과 고차 사고력',
        },
        {
          id: `${baseId}-2`,
          text: `[프레이밍 분석] 언론 보도 텍스트 어휘 빈도 분석 및 프레임 편향 검증`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '주요 일간지 기사 10건에서 감정적 형용사와 과장된 수사 표현의 출현 빈도를 정량 집계',
          inquiryQuestion: '언론의 보도 프레임이 대중의 합리적 의사결정에 미치는 왜곡 효과는 무엇인가?',
          methodology: '텍스트 마이닝 워드클라우드 분석 및 비판적 담화 분석(CDA)',
          recordTip: '미디어 텍스트 뒤에 숨겨진 프레임과 수사적 장치를 날카롭게 포착한 비판적 문해력',
        },
        {
          id: `${baseId}-3`,
          text: `[학술 에세이] 과학철학적 비판이 담긴 4매 분량의 논증적 제언문 집필`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '기술 결정론을 극복하고 인간 중심의 가치를 제언하는 논리적 소논설문 완성 및 학급 발표',
          inquiryQuestion: '비전공자 청중에게 과학적 진실과 윤리적 과제를 어떻게 설득력 있게 전달할 것인가?',
          methodology: 'A4 4매 분량의 논증적 에세이 작성 및 5분 스피치 대본 완성',
          recordTip: '전문 지식을 명료하고 호소력 있는 문체로 풀어내는 우수한 작문 및 의사소통 역량',
        },
      ];
    }
    if (isEng) {
      return [
        {
          id: `${baseId}-1`,
          text: `[저널 강독] Nature/Science SCI급 오픈액세스 논문 2편 IMRaD 원문 분석`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: 'Introduction-Methods-Results-Discussion 4단 구조별 핵심 문장 추출 및 저자의 가설 검증 흐름 파악',
          inquiryQuestion: '국제 학술계가 해당 분야에서 가장 긴급하게 해결하고자 하는 연구 난제는 무엇인가?',
          methodology: 'Google Scholar 검색 쿼리 작성 및 SCI 논문 원문 발췌 독해',
          recordTip: '해외 원문 자료를 능동적으로 탐색하여 글로벌 연구 트렌드를 파악하는 진취성',
        },
        {
          id: `${baseId}-2`,
          text: `[용어집 제작] 전공 특화 Academic Word List(AWL) 30선 및 완곡어법 해설`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: '저자가 결론을 신중하게 진술할 때 사용하는 완곡어법(Hedging: may suggest, indicate 등) 정리',
          inquiryQuestion: '저자들은 어떤 학술적 수사를 사용하여 연구 결론의 한계를 신중하게 서술하는가?',
          methodology: '전공 특화 영문 용어집(Glossary 30선) 제작 및 구문 분석 노트',
          recordTip: '고급 학술 영어 구문과 완곡어법을 정확히 이해하고 자기화한 탁월한 어학 역량',
        },
        {
          id: `${baseId}-3`,
          text: `[Executive Summary] 250단어 영문 구조화 요약서 작성 및 피어 리뷰`,
          category,
          color,
          subject: subjectBadge,
          nodeType: 'action' as const,
          detail: 'Background - Key Findings - Implications의 3단 구조로 250단어 영문 리포트 집필 및 영어 발표',
          inquiryQuestion: '논문의 핵심 결론을 명료하고 정확한 학술 영어로 어떻게 재구성할 것인가?',
          methodology: '영문 요약문 초안 작성 및 문법 검사기/사전을 통한 어휘 감수',
          recordTip: '복잡한 과학 학술 정보를 간결하고 정확한 영문으로 전달하는 글로벌 소통력',
        },
      ];
    }
    return [
      {
        id: `${baseId}-1`,
        text: `[API 파이프라인] 공공데이터포털 JSON Open API 연계 파이썬 수집 스크립트`,
        category,
        color,
        subject: subjectBadge,
        nodeType: 'action' as const,
        detail: '공공데이터포털(data.go.kr) 인증키를 발급받아 파이썬 requests로 실시간 데이터를 JSON으로 파싱',
        inquiryQuestion: '대용량 API 응답 데이터를 어떻게 효율적으로 메모리에 적재할 것인가?',
        methodology: 'Python Requests & JSON 파싱 스크립트 작성',
        recordTip: '공공 API를 직접 호출하고 원시 데이터를 수집하는 뛰어난 컴퓨팅 실무력',
      },
      {
        id: `${baseId}-2`,
        text: `[결측치 정제 & EDA] Pandas 데이터 정제 및 상관관계 히트맵 시각화`,
        category,
        color,
        subject: subjectBadge,
        nodeType: 'action' as const,
        detail: 'Pandas fillna/dropna로 결측치를 보정하고 피어슨 상관계수 행렬을 Seaborn 히트맵으로 도출',
        inquiryQuestion: '시각화된 상관관계 지표가 가설과 어떻게 일치하며 숨겨진 패턴은 무엇인가?',
        methodology: 'Jupyter Notebook 환경에서 Python Pandas/Matplotlib 스크립트 작성',
        recordTip: '데이터 수집부터 정제, 시각화에 이르는 데이터 사이언스 전 주기를 독자 수행',
      },
      {
        id: `${baseId}-3`,
        text: `[알고리즘 최적화] Big-O 시간복잡도 비교 및 분류 모델 정확도 평가`,
        category,
        color,
        subject: subjectBadge,
        nodeType: 'action' as const,
        detail: '자료구조(리스트 vs 해시)에 따른 실행 시간을 측정하고 머신러닝 분류기 정확도/재현율 평가',
        inquiryQuestion: '대용량 데이터셋 처리 시 메모리와 실행 시간을 최적화할 자료구조는 무엇인가?',
        methodology: 'Timeit 모듈 활용 알고리즘 벤치마킹 및 혼동행렬(Confusion Matrix) 도출',
        recordTip: '단순 코딩을 넘어 알고리즘의 시간·공간 복잡도를 수리적으로 분석한 전공 적합성',
      },
    ];
  }

  // Step 4
  return [
    {
      id: `${baseId}-1`,
      text: `[오차 요인 & 한계 극복] 실험·모델링 한계점 분석 및 차년도 후속 연구 질문 도출`,
      category,
      color,
      subject: subjectBadge,
      nodeType: 'action' as const,
      detail: '이상적 가정의 한계점을 객관적으로 비판하고, 차년도 3학년 진로선택과목에서 수행할 융합 심화 연구 질문 제언',
      inquiryQuestion: '본 탐구 결과의 한계를 보완하기 위해 3학년 때 다학제간으로 확장할 수 있는 연구 질문은?',
      methodology: '오차 요인 분석표 및 후속 연구 기획서 작성',
      recordTip: '오차 요인을 객관적으로 고찰하고 후속 과제를 논리적으로 도출한 성숙한 메타인지 역량',
    },
    {
      id: `${baseId}-2`,
      text: `[학생부 세특 500자 완성 문안] 동기-과정-성장-배움이 담긴 교과 세특 추천 문안`,
      category,
      color,
      subject: subjectBadge,
      nodeType: 'action' as const,
      detail: '교육부 학생부 기재요령을 100% 준수한 450~500자 분량의 격조 있는 교과 세특 추천 문안 작성',
      inquiryQuestion: '나의 지적 성장과 전공 탐구 열정을 입학사정관에게 가장 신뢰감 있게 전달하는 문안은?',
      methodology: '500자 완성형 세특 포트폴리오 문안 작성 및 지도 교사 제출',
      recordTip: '학교생활기록부 교과 세특에 즉시 반영 가능한 완성형 포트폴리오',
    },
  ];
}

// High-quality curriculum synthesis engine that generates authentic curriculum linkage and methodologies
function getCurriculumFallback(
  interest: string,
  targetMajor: string,
  grade: string,
  selectedSubjects: string[],
  customKeywords: string = ''
) {
  return synthesizeComprehensiveCurriculum({
    interest,
    targetMajor,
    grade,
    selectedSubjects,
    customKeywords,
  });
}

// Helper: Deterministically build 4-level interactive MindMap tree from Gemini-generated subjects
function buildMindMapFromSubjects(
  interest: string,
  targetMajor: string,
  grade: string,
  subjects: any[]
) {
  const subjectCategoryOrder = ['math', 'science', 'social', 'korean', 'english', 'tech'];
  const subjectCategoryNames: Record<string, string> = {
    math: '수학 (미적분/확통/기하)',
    science: '과학/공학 (물리/화학/생명/지구)',
    social: '사회/윤리/경제 (통합사회/정법/한지)',
    korean: '국어/인문 (독서/화작/언매)',
    english: '영어/글로벌 (영어/심화영어)',
    tech: '정보/융합 (정보/인공지능기초)',
  };

  const branches = subjectCategoryOrder
    .map((cat, idx) => {
      const catTopics = subjects.filter((s) => s.subjectCategory === cat);
      if (catTopics.length === 0) return null;

      const branchColor =
        cat === 'math'
          ? '#0284c7'
          : cat === 'science'
          ? '#059669'
          : cat === 'social'
          ? '#d97706'
          : cat === 'korean'
          ? '#7c3aed'
          : cat === 'english'
          ? '#9333ea'
          : '#e11d48';

      return {
        id: `branch-${cat}-${idx}`,
        text: `[${cat.toUpperCase()}] ${subjectCategoryNames[cat] || cat} 교과 연계 (기본 2개 · 심화 1개)`,
        category: cat,
        color: branchColor,
        subject: subjectCategoryNames[cat] || cat,
        nodeType: 'subject' as const,
        detail: `${interest} 관련 ${subjectCategoryNames[cat] || cat} 교과 수준별 탐구 주제 모음`,
        children: catTopics.map((topic: any, tIdx: number) => {
          const isBasic = topic.level !== 'advanced';
          const topicColor = isBasic ? (tIdx === 0 ? '#10b981' : '#06b6d4') : '#6366f1';
          const steps = Array.isArray(topic.concreteSteps) ? topic.concreteSteps : [];

          return {
            id: `topic-${cat}-${tIdx}`,
            text: `[${isBasic ? '기본' : '심화'}] ${topic.topic}`,
            category: cat,
            color: topicColor,
            subject: topic.subject,
            level: topic.level || (isBasic ? 'basic' : 'advanced'),
            levelLabel: topic.levelLabel,
            difficultyRating: topic.difficultyRating,
            suitability: topic.suitability,
            nodeType: 'topic' as const,
            detail: `[${topic.levelLabel}] ${topic.connectionRationale}`,
            inquiryQuestion: topic.inquiryQuestion,
            methodology: topic.methodology,
            curriculumConcept: topic.curriculumConcept,
            connectionRationale: topic.connectionRationale,
            recommendedTools: topic.recommendedTools,
            readingRecommendation: topic.readingRecommendation,
            recordTip: topic.recordTip,
            children: steps.map((step: any, sIdx: number) => ({
              id: `step-${cat}-${tIdx}-${step.stepNum ?? sIdx + 1}`,
              text: step.stepName,
              category: cat,
              color: topicColor,
              subject: topic.subject,
              nodeType: 'process_step' as const,
              level: topic.level,
              detail: `${step.focus || ''} (${step.protocol})`,
              inquiryQuestion: topic.inquiryQuestion,
              methodology: step.protocol,
              readingRecommendation: topic.readingRecommendation,
              recordTip: topic.recordTip,
              recommendedTools: step.tools,
              children: createConcreteActionChildren(
                step.stepNum ?? sIdx + 1,
                cat,
                topic.topic || interest,
                topic.subject
              ),
            })),
          };
        }),
      };
    })
    .filter(Boolean);

  return {
    id: `root-${Date.now()}`,
    text: interest,
    category: 'root',
    nodeType: 'root' as const,
    color: '#4f46e5',
    detail: `학생 핵심 관심 연구 분야: ${interest} (희망 진로: ${targetMajor}, 대상: ${grade}) - AI 맞춤형 교과 연계 마인드맵`,
    children: branches,
  };
}

// 1. API: AI 교과 연계 탐구주제 및 마인드맵 생성 (SSE + REST POST 지원, 경량 AI JSON + 고속 모델 체인)
app.post('/api/ai/recommend-topics', async (req, res) => {
  const isSSE = isSSERequest(req);
  const sse = isSSE ? createSSEWriter(res) : null;

  try {
    const { interest, grade = '고등학교 2학년', targetMajor = '', selectedSubjects = [], customKeywords = '' } = req.body;

    if (!interest && !targetMajor) {
      if (sse) {
        sse.sendError('관심 분야 또는 희망 전공을 입력해주세요.');
      } else {
        res.status(400).json({ error: '관심 분야 또는 희망 전공을 입력해주세요.' });
      }
      return;
    }

    if (sse) {
      sse.sendProgress(1, 4, `학생 관심사 ('${interest}') 및 희망 전공 학문적 메커니즘 분석 중...`, 20);
    }

    if (!hasRealApiKey || !ai) {
      const fallback = getCurriculumFallback(interest, targetMajor, grade, selectedSubjects, customKeywords);
      if (sse) {
        sse.sendComplete({ ...fallback, source: 'database' });
      } else {
        return res.json({ ...fallback, source: 'database' });
      }
      return;
    }

    if (sse) {
      sse.sendProgress(2, 4, '2022/2015 교육과정 교과군 성취기준 매핑 및 AI 맞춤형 주제 생성 중...', 45);
    }

    const activeSubjectList = selectedSubjects.length > 0
      ? selectedSubjects
      : ['수학 (미적분/확통)', '과학 (생명/물리/화학)', '사회 (통합사회/정법/경제)', '국어 (독서/화작)', '영어 (심화영어)', '정보/융합'];

    const prompt = `당신은 대한민국 고등학교 학생부 종합전형(학종) 전문 진로진학 수석 컨설턴트입니다.
학생이 입력한 관심사·키워드와 희망 전공에 맞춰, 각 교과별 구체적이고 독창적인 맞춤 탐구 주제를 생성하세요.

[학생 입력 정보]
- 관심 분야/키워드: "${interest}"
- 희망 전공: "${targetMajor || '관련 계열'}"
- 학년: ${grade}
- 대상 교과 (${activeSubjectList.length}개): ${activeSubjectList.join(', ')}
- 세부 키워드: ${customKeywords || '없음'}

[핵심 작성 규칙 — 반드시 준수]
1. 【기계적 키워드 끼워넣기 금지】: "'${interest}' 현상의 변화 추이", "'${interest}'의 사회적 영향"처럼 판에 박힌 일반 문장에 키워드만 치환하는 표현을 절대 사용하지 마세요. 반드시 "${interest}"의 실제 구체적 쟁점(예: 관련 제도, 통계, 정책, 실제 메커니즘, 윤리적 딜레마 등)과 각 교과의 고유 단원 원리를 유기적으로 결합한 완성형 연구 주제를 작성하세요.
2. 【교과당 3개 수준별 주제】: 각 교과마다 반드시 3개씩 생성하세요:
   - 1) level: "basic" (교과서 개념 중심, 난이도 2)
   - 2) level: "basic" (실생활·공공통계 사례, 난이도 3)
   - 3) level: "advanced" (수리 모델링·데이터 분석·학술 심화, 난이도 5)
3. 【경량 JSON 응답】: 마인드맵 트리는 서버가 자동 조립하므로 응답에 포함하지 말고, 아래 subjects 배열만 간결하고 밀도 높게 작성하세요 (총 ${activeSubjectList.length * 3}개).
4. subjectCategory는 반드시 "math" | "science" | "social" | "korean" | "english" | "tech" 중 하나만 사용하세요.

반드시 유효한 JSON으로만 응답하세요 (각 필드는 군더더기 없이 핵심 1문장으로 간결하게 작성):
{
  "majorOverview": "${interest}와 ${targetMajor || '희망 전공'}이 고교 교과와 연결되는 핵심 요약 (2문장)",
  "connectionSummary": "교과 연계 탐구 전략 한 줄 가이드",
  "subjects": [
    {
      "subject": "교과목명",
      "subjectCategory": "math",
      "level": "basic",
      "difficultyRating": 2,
      "curriculumConcept": "고교 단원 및 핵심 개념",
      "topic": "키워드의 실제 쟁점과 교과 원리가 융합된 탐구 주제명 (20~38자)",
      "inquiryQuestion": "왜/어떻게를 묻는 핵심 탐구 질문 (1문장)",
      "connectionRationale": "관심사 및 교과 원리 연계 이유 (1문장)",
      "methodology": "고교생 실행 가능 탐구 방법·데이터",
      "recommendedTools": ["도구1", "도구2"],
      "readingRecommendation": "《권장도서명》(저자)",
      "recordTip": "세특 돋보임 포인트 (1문장)",
      "draftRecordSnippet": "학교생활기록부 교과세특 예상 문안 (110~150자 내외)"
    }
  ]
}`;

    if (sse) {
      sse.sendProgress(3, 4, '교과별 수준별 맞춤 탐구 주제 및 세특 문안 AI 생성 중...', 72);
    }

    const data = await callGeminiFastJSON(prompt, 32000);
    if (!data || !Array.isArray(data.subjects) || data.subjects.length === 0) {
      throw new Error('Gemini returned empty subjects');
    }

    const enrichedSubjects = data.subjects.map((s: any, idx: number) => {
      const level = s.level === 'advanced' || idx % 3 === 2 ? 'advanced' : 'basic';
      const levelLabel =
        level === 'advanced'
          ? '심화 탐구 (정량 모델링 · 학술 심층)'
          : idx % 3 === 1
          ? '기본 탐구 (실생활 사례 · 통계 탐색)'
          : '기본 탐구 (교과서 중심 · 개념 이해)';
      const tools = Array.isArray(s.recommendedTools) && s.recommendedTools.length > 0
        ? s.recommendedTools
        : ['공공데이터포털', 'Excel/통계'];
      const steps = create4ConcreteSteps(
        s.topic || interest,
        s.subject || '통합교과',
        s.curriculumConcept || '교과 핵심 원리',
        s.methodology || '자료 조사 및 정량 분석',
        tools,
        level
      );

      return {
        ...s,
        level,
        levelLabel,
        difficultyRating: s.difficultyRating || (level === 'advanced' ? 5 : idx % 3 === 1 ? 3 : 2),
        suitability: s.suitability || (level === 'advanced' ? '고2~3 전공 심화 추천' : '고1~2 교과서 개념 추천'),
        recommendedTools: tools,
        concreteSteps: steps,
      };
    });

    if (sse) {
      sse.sendProgress(4, 4, '4단계 마인드맵 지식 트리 및 세특 포트폴리오 조립 중...', 92);
    }

    const builtMindmap = buildMindMapFromSubjects(interest, targetMajor, grade, enrichedSubjects);
    const resultPayload = {
      source: 'gemini',
      majorOverview: data.majorOverview || `${interest} 분야를 고교 교과 핵심 원리와 연결한 AI 맞춤형 탐구 설계입니다.`,
      connectionSummary: data.connectionSummary || `${interest} 관심사를 6대 교과군 기본·심화 탐구로 연계했습니다.`,
      subjects: enrichedSubjects,
      mindmap: builtMindmap,
    };

    if (sse) {
      sse.sendComplete(resultPayload);
    } else {
      return res.json(resultPayload);
    }
  } catch (error) {
    console.error('Error in recommend-topics, serving curriculum fallback:', (error as any)?.message || error);
    const { interest = '', targetMajor = '', grade = '고등학교 2학년', selectedSubjects = [], customKeywords = '' } = req.body || {};
    const fallback = getCurriculumFallback(interest, targetMajor, grade, selectedSubjects, customKeywords);
    if (sse) {
      sse.sendComplete({ ...fallback, source: 'database' });
    } else {
      return res.json({ ...fallback, source: 'database' });
    }
  }
});

// 2. API: 교사용 세특 피드백 및 학생부 기재 문안 추천 (SSE + REST POST 지원)
app.post('/api/ai/coach-feedback', async (req, res) => {
  const isSSE = isSSERequest(req);
  const sse = isSSE ? createSSEWriter(res) : null;

  try {
    const {
      studentName = '학생',
      grade = '고2',
      major = '미정',
      subject = '공통',
      activityTitle,
      activityContent,
      teacherNotes = '',
    } = req.body;

    if (!activityTitle || !activityContent) {
      if (sse) {
        sse.sendError('탐구 주제와 활동 내용을 입력해주세요.');
      } else {
        res.status(400).json({ error: '탐구 주제와 활동 내용을 입력해주세요.' });
      }
      return;
    }

    if (sse) {
      sse.sendProgress(1, 3, '학생 탐구 활동 내용 및 교과 연계 분석 중...', 25);
    }

    const fallbackFeedback = {
      evaluation: {
        academicCompetency: '교과 기본 개념을 전공 분야 실생활 쟁점에 능동적으로 연계하려는 지적 호기심과 문제의식이 돋보임.',
        careerCompetency: '희망 전공에서 요구되는 기초 학업 역량과 연구 방법론에 대한 관심이 뚜렷하게 관찰됨.',
        communityCompetency: '개인적 연구에 그치지 않고 탐구 결과를 학급 급우들과 공유하고 사회적 기여 가능성을 모색함.',
      },
      coachingAdvice: `[지도 조언]
1. 탐구 동기가 구체적이어서 좋습니다. 다만 문헌 조사의 비중이 크므로, 수학적 모델이나 공공 데이터 분석을 직접 곁들이면 훨씬 설득력 있는 결과물이 됩니다.
2. 참고한 자료의 출처를 신뢰성 있는 학술 논문이나 정부 보고서로 확장해 보세요.
3. 후속 활동으로 '${activityTitle}'의 결과를 비판적으로 재검증하는 2단계 탐구를 권장합니다.`,
      draftRecord: `교과 단원과 연계하여 '${activityTitle}'를 주제로 자기주도적 심화 탐구를 수행함. 관련 문헌 및 통계 자료를 다각도로 분석하여 핵심 메커니즘을 도출하였으며, 기존 학설의 한계점을 비판적으로 고찰하는 탐구력을 발휘함. 특히 탐구 과정에서 부딪힌 개념적 모호성을 교사와의 질의 및 전공 서적 탐독을 통해 주도적으로 해결하는 지적 끈기가 돋보임. 이를 학급 내 발표를 통해 급우들의 이해를 돕는 등 전공 역량과 소통 역량을 고루 겸비한 학생임.`,
    };

    if (!hasRealApiKey || !ai) {
      if (sse) {
        await sleep(150);
        sse.sendProgress(2, 3, '학업역량·진로역량·공동체역량 3대 척도 정밀 평가 중...', 65);
        await sleep(180);
        sse.sendProgress(3, 3, '교사용 1:1 심화 지도 조언 및 500자 세특 추천 문안 생성 중...', 90);
        await sleep(120);
        sse.sendComplete(fallbackFeedback);
      } else {
        return res.json(fallbackFeedback);
      }
      return;
    }

    const prompt = `당신은 대한민국 고등학교 교사이자 입학사정관 출신의 학생부 종합전형 세특 작성 전문가입니다.
학생의 탐구 활동 내용을 분석하고, 교사가 학생을 지도할 때 줄 수 있는 피드백과 학교생활기록부 교과 세부능력 및 특기사항(세특) 추천 문안을 작성해주세요.

[학생 정보]
- 이름: ${studentName} (${grade}, 희망전공: ${major})
- 교과목: ${subject}
- 탐구 활동 제목: ${activityTitle}
- 학생이 작성한 활동 내용:
${activityContent}
- 지도 교사 메모/방향: ${teacherNotes || '없음'}

[작성 가이드라인]
1. 교육부 학교생활기록부 기재요령 준수 (소논문, R&E, 공인어학성적, 교외 수상실적 일체 언급 금지).
2. 학생의 '구체적 동기 -> 심화 탐구 과정 -> 지적 성장 및 변화'의 스토리라인을 명확히 할 것.
3. 세특 추천 문안(draftRecord)은 450~500자 내외로 격조 있고 신뢰감 주는 문체(~함, ~을 보임)로 서술할 것.

반드시 유효한 JSON 형식으로 응답하세요:
{
  "evaluation": {
    "academicCompetency": "학업역량 (탐구력, 지적호기심, 자기주도성 평가)",
    "careerCompetency": "진로역량 (전공 관련 교과 연계 및 지식 발전 정도)",
    "communityCompetency": "공동체역량 (협업, 소통, 윤리적 태도)"
  },
  "coachingAdvice": "교사가 학생에게 전달할 1:1 지도 코멘트 및 후속 탐구 발전 방향 (구체적 조언 3가지 포함)",
  "draftRecord": "학교생활기록부 교과세특에 그대로 또는 수정하여 입력할 수 있는 완성형 문안 (약 450자)"
}`;

    if (sse) {
      sse.sendProgress(2, 3, '학업역량·진로역량·공동체역량 평가 및 피드백 추론 중...', 60);
    }

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout')), 45000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const text = response.text;
    if (!text) throw new Error('Empty response from AI');

    if (sse) {
      sse.sendProgress(3, 3, '교사용 1:1 지도 코멘트 및 세특 추천 문안 조립 중...', 92);
    }

    const data = JSON.parse(text);
    if (sse) {
      sse.sendComplete(data);
    } else {
      return res.json(data);
    }
  } catch (error) {
    console.error('Error coaching feedback, serving fallback:', (error as any)?.message || error);
    const fallback = {
      evaluation: {
        academicCompetency: '교과 심화 개념을 전공 관심사와 주도적으로 연결한 지적 탐구력이 우수함.',
        careerCompetency: '희망 전공에 필요한 기초 연구 소양과 자료 분석 태도가 체계적임.',
        communityCompetency: '탐구 결과를 학급과 공유하고 사회적 함의를 고민하는 태도를 보임.',
      },
      coachingAdvice: '탐구 질문이 참신합니다. 데이터 정량 분석과 신뢰성 있는 원문 출처를 보강하면 더욱 경쟁력 있는 포트폴리오가 됩니다.',
      draftRecord: `교과 학습 내용에 머무르지 않고 '${req.body.activityTitle || '전공 연계 심화 주제'}'를 설정하여 주도적인 탐구를 기획함. 관련 개념을 다각도로 분석하여 핵심 질문에 대한 과학적/논리적 해결책을 도출하였으며, 비판적 사고력과 끈기 있는 탐구 태도를 보임. 탐구 성과를 논리정연하게 정리하여 교과와 진로를 아우르는 우수한 학업 역량을 입증함.`,
    };
    if (sse) {
      sse.sendComplete(fallback);
    } else {
      return res.json(fallback);
    }
  }
});

// 2.5 API: 특정 탐구 주제를 3~5개 세부 질문 및 파생 연구 영역으로 AI 확장 (SSE + REST POST 지원)
app.post('/api/ai/expand-topic', async (req, res) => {
  const isSSE = isSSERequest(req);
  const sse = isSSE ? createSSEWriter(res) : null;

  try {
    const {
      topicTitle = '',
      subject = '',
      inquiryQuestion = '',
      methodology = '',
      targetMajor = '',
      grade = '고등학교 2학년',
    } = req.body;

    if (!topicTitle) {
      if (sse) {
        sse.sendError('확장할 탐구 주제명이 필요합니다.');
      } else {
        res.status(400).json({ error: '확장할 탐구 주제명이 필요합니다.' });
      }
      return;
    }

    if (sse) {
      sse.sendProgress(1, 2, `'${topicTitle}' 세부 변인 및 파생 연구 영역 탐색 중...`, 35);
    }

    const cleanTitle = topicTitle.replace(/\[.*?\]/g, '').trim();

    // Fallback generator
    const getFallbackSubQuestions = () => {
      const isMath = /수학|미적|확률|통계|기하|수치/i.test(`${subject} ${topicTitle}`);
      const isSci = /과학|생명|화학|물리|지구/i.test(`${subject} ${topicTitle}`);
      const isSoc = /사회|윤리|경제|법|정치/i.test(`${subject} ${topicTitle}`);
      const isTech = /정보|ai|인공지능|알고리즘|컴퓨터|데이터/i.test(`${subject} ${topicTitle}`);

      return {
        topicTitle,
        subject,
        overview: `'${cleanTitle}' 주제는 고교 ${subject} 교과의 핵심 원리를 깊이 있게 입증할 수 있는 우수한 연구 주제입니다. 학생부종합전형에서는 단편적인 현상 조사에 그치지 않고, 아래 4가지 파생 연구 영역으로 질문을 좁혀 구체적 변인과 데이터 기반의 심화 검증을 진행할 때 가장 돋보입니다.`,
        subQuestions: [
          {
            id: `sub-${Date.now()}-1`,
            title: isMath
              ? `[수리적 최적화] 매개변수 민감도 및 오차 함수 모델링`
              : isSci
              ? `[물리화학적 메커니즘] 외부 환경 요인에 따른 반응 효율 정량 비교`
              : isSoc
              ? `[제도적 형평성] 최소 수혜자 관점에서의 사회적 손실 비용 산출`
              : isTech
              ? `[알고리즘 최적화] 입력 데이터 규모에 따른 시간·공간 복잡도 벤치마크`
              : `[개념 심화] 핵심 변인 간 인과관계의 수학적/논리적 모델링`,
            subQuestion: `${cleanTitle} 시스템에서 외부 조건이 변화할 때 나타나는 출력값의 오차를 최소화하는 수학적/원리적 임계점은 무엇인가?`,
            researchArea: isMath ? '수치해석 및 최적화' : isSci ? '반응속도론 및 열역학' : isSoc ? '미시경제학 외부효과' : '알고리즘 복잡도',
            methodology: isMath
              ? '지오지브라 슬라이더 기능 활용 매개변수 민감도 분석 및 잔차 제곱합 계산'
              : isSci
              ? '교내 센서 계측 및 PDB 3D 분자 모델링 뷰어를 활용한 입체구조 비교'
              : isSoc
              ? '국내외 정책 조례안 3건 비교 및 롤스의 정의론 4단계 분석표 작성'
              : '파이썬 스크립트 작성 및 Big-O 시간복잡도 실행 시간 측정 그래프 작성',
            relatedConcepts: [
              isMath ? '변화율' : isSci ? '평형 이동' : isSoc ? '차등 원칙' : 'Big-O',
              isMath ? '극대·극소' : isSci ? '활성화 에너지' : isSoc ? '사회적 잉여' : '탐색 알고리즘',
            ],
            readingRecommendation: isMath ? '《미적분의 힘》' : isSci ? '《부분과 전체》' : isSoc ? '《정의란 무엇인가》' : '《알고리즘, 인생을 계산하다》',
            recordTip: '단순 이론 조사를 넘어 독립변수와 종속변수를 스스로 설정하고 정량적 오차를 분석한 연구자적 자질 기술',
          },
          {
            id: `sub-${Date.now()}-2`,
            title: `[실증 데이터 분석] 공공데이터 연계 상관분석 및 가설 검증`,
            subQuestion: `실제 공개된 통계 지표(최근 3개년 데이터)에서 두 핵심 변수 사이에 유의미한 피어슨 상관계수(r)가 관찰되는가?`,
            researchArea: '탐색적 데이터 분석(EDA) 및 계량통계',
            methodology: '공공데이터포털(data.go.kr) 또는 통계청(KOSIS) CSV 데이터 추출, 엑셀/파이썬 산점도 및 회귀선 시각화',
            relatedConcepts: ['산점도', '피어슨 상관계수', '결측치 정제'],
            readingRecommendation: '《통계의 미학》(최제호)',
            recordTip: '정부 공개 원시 데이터를 직접 전처리하고 수치적으로 가설을 입증한 실증적 탐구 역량 강조',
          },
          {
            id: `sub-${Date.now()}-3`,
            title: `[한계 극복 및 대안 제언] 기존 모델의 한계점 규명과 후속 과제`,
            subQuestion: `선행 연구 및 교과서 원리를 실세계에 적용할 때 발생하는 현실적 제약 조건과 오차 요인은 무엇이며 어떻게 보완할 수 있는가?`,
            researchArea: '연구 방법론 비판 및 메타인지',
            methodology: 'KCI 선행 연구 논문 2편 강독을 통한 전제 조건 비교, 오차 발생 원인 분석 보고서 작성',
            relatedConcepts: ['변인 통제', '불확도', '오차 요인 분석'],
            readingRecommendation: '《생각의 탄생》(로버트 루트번스타인)',
            recordTip: '자신의 연구 결과에 안주하지 않고 한계점을 객관적으로 비판하고 후속 탐구로 확장한 메타인지 능력',
          },
          {
            id: `sub-${Date.now()}-4`,
            title: `[사회적·윤리적 함의] 전공 기술의 사회적 파급효과와 규범 가이드라인`,
            subQuestion: `해당 기술/개념이 상용화되었을 때 발생 가능한 윤리적 딜레마를 해결하기 위한 공동체적 자율 가이드라인은 무엇인가?`,
            researchArea: '과학기술철학 및 공공정책 거버넌스',
            methodology: '유네스코 및 국내외 윤리 지침서 대조, 청소년 자치 행동 강령 5대 조항 제정',
            relatedConcepts: ['책임 윤리', '공동체 역량', '규제 샌드박스'],
            readingRecommendation: '《기술의 충격》(케빈 켈리)',
            recordTip: '전공 지식의 기술적 성취뿐만 아니라 사회적 약자 보호와 윤리적 책임을 아우르는 성숙한 시민 의식 부각',
          },
        ],
      };
    };

    if (!hasRealApiKey || !ai) {
      if (sse) {
        await sleep(150);
        sse.sendProgress(2, 2, '수리 모델링·실증 데이터·오차 분석·사회적 함의 4대 파생 질문 구성 중...', 80);
        await sleep(120);
        sse.sendComplete(getFallbackSubQuestions());
      } else {
        return res.json(getFallbackSubQuestions());
      }
      return;
    }

    const prompt = `당신은 대한민국 고등학교 학생부 종합전형(학종) 전문 수석 진로진학 컨설턴트이자 교과 교육과정 전문가입니다.
학생이 선정한 교과 탐구 주제를 더욱 깊이 있게 발전시키기 위해, 3~5개의 구체적인 '세부 탐구 질문(Sub-questions)'과 '파생 연계 연구 영역(Related Research Areas)'을 생성해주세요.

[주제 정보]
- 탐구 주제: ${topicTitle}
- 교과목: ${subject}
- 핵심 탐구 질문: ${inquiryQuestion}
- 기존 방법론: ${methodology || '미정'}
- 희망 전공: ${targetMajor || '관련 계열'}
- 학년: ${grade}

[작성 원칙]
1. 단순 질문 나열이 아니라, 고등학생이 교과서 개념을 실세계/전공 쟁점에 적용하여 1~2주 내에 직접 탐구할 수 있는 구체적인 가설/질문일 것.
2. 3~5개의 세부 질문은 상호 보완적인 연구 영역(예: 수리 모델링/오차 분석, 실험 메커니즘 규명, 공공데이터 분석, 사회 윤리적 쟁점 등)을 균형 있게 다룰 것.
3. 교육부 학생부 기재요령(소논문, R&E 등 금지어 배제)을 철저히 준수할 것.

반드시 유효한 JSON 형식으로만 응답하세요:
{
  "topicTitle": "${topicTitle}",
  "subject": "${subject}",
  "overview": "이 주제를 왜 이러한 3~5개 세부 영역으로 심화 확장해야 하는지에 대한 컨설팅 총평 (2~3문장)",
  "subQuestions": [
    {
      "id": "sub-1",
      "title": "[연구영역명] 세부 연구 제목",
      "subQuestion": "핵심 세부 탐구 질문 (왜/어떻게에 대한 의문문)",
      "researchArea": "연계 연구 분야 (예: 반응속도론, 확률 모델링, 공공데이터 분석, 규제 거버넌스)",
      "methodology": "구체적 실천 방법론 (활용 도구, 데이터셋 또는 실험 프로토콜)",
      "relatedConcepts": ["교과 개념 1", "교과 개념 2"],
      "readingRecommendation": "추천 도서 또는 논문 키워드",
      "recordTip": "학생부 교과세특에 기록될 때 돋보이는 역량 포인트"
    }
  ]
}
*주의: subQuestions 배열은 3개 이상 5개 이하로 상세하게 작성해야 합니다.`;

    if (sse) {
      sse.sendProgress(2, 2, '파생 연계 연구 영역 및 심화 질문 추론 중...', 75);
    }

    const data = await callGeminiFastJSON(prompt, 22000);
    if (sse) {
      sse.sendComplete({ ...data, source: 'gemini' });
    } else {
      return res.json({ ...data, source: 'gemini' });
    }
  } catch (error) {
    console.error('Error in expand-topic, serving fallback:', (error as any)?.message || error);
    const {
      topicTitle = '',
      subject = '',
      inquiryQuestion = '',
      methodology = '',
      targetMajor = '',
      grade = '고등학교 2학년',
    } = req.body || {};

    const cleanTitle = topicTitle.replace(/\[.*?\]/g, '').trim() || '교과 연계 탐구 주제';

    const fallback = {
      topicTitle,
      subject,
      overview: `'${cleanTitle}' 주제는 고교 ${subject} 교과의 핵심 원리를 깊이 있게 입증할 수 있는 우수한 연구 주제입니다. 학생부종합전형에서는 단편적인 현상 조사에 그치지 않고, 아래 4가지 파생 연구 영역으로 질문을 좁혀 구체적 변인과 데이터 기반의 심화 검증을 진행할 때 가장 돋보입니다.`,
      subQuestions: [
        {
          id: `sub-${Date.now()}-1`,
          title: `[수리·원리적 최적화] 매개변수 민감도 및 오차 함수 분석`,
          subQuestion: `${cleanTitle} 시스템에서 외부 조건이 변화할 때 나타나는 출력값의 오차를 최소화하는 수학적/원리적 임계점은 무엇인가?`,
          researchArea: '수치해석 및 최적화',
          methodology: '지오지브라 슬라이더 기능 활용 매개변수 민감도 분석 및 수식 모델링',
          relatedConcepts: ['변화율', '오차 분석', '함수 최적화'],
          readingRecommendation: '《수학으로 생각하는 힘》(키트 예이츠)',
          recordTip: '단순 이론 조사를 넘어 독립변수와 종속변수를 스스로 설정하고 정량적 오차를 분석한 연구자적 자질 기술',
        },
        {
          id: `sub-${Date.now()}-2`,
          title: `[실증 데이터 분석] 공공데이터 연계 상관분석 및 가설 검증`,
          subQuestion: `실제 공개된 통계 지표에서 두 핵심 변수 사이에 유의미한 상관관계가 통계적으로 관찰되는가?`,
          researchArea: '탐색적 데이터 분석(EDA)',
          methodology: '공공데이터포털(data.go.kr) CSV 데이터셋 정제 및 엑셀 상관분석 차트 시각화',
          relatedConcepts: ['산점도', '피어슨 상관계수', '결측치 정제'],
          readingRecommendation: '《통계의 미학》(최제호)',
          recordTip: '정부 공개 원시 데이터를 직접 전처리하고 수치적으로 가설을 입증한 실증적 탐구 역량 강조',
        },
        {
          id: `sub-${Date.now()}-3`,
          title: `[한계 극복 및 대안 제언] 기존 모델의 한계점 규명과 후속 과제`,
          subQuestion: `교과서 원리를 실세계에 적용할 때 발생하는 현실적 제약 조건과 오차 요인은 무엇이며 어떻게 보완할 수 있는가?`,
          researchArea: '연구 방법론 비판 및 메타인지',
          methodology: 'KCI 선행 연구 논문 2편 강독을 통한 전제 조건 비교 및 보완점 도출',
          relatedConcepts: ['변인 통제', '불확도', '오차 요인'],
          readingRecommendation: '《생각의 탄생》(로버트 루트번스타인)',
          recordTip: '자신의 연구 결과에 안주하지 않고 한계점을 객관적으로 비판하고 후속 탐구로 확장한 메타인지 능력',
        },
        {
          id: `sub-${Date.now()}-4`,
          title: `[사회적·윤리적 함의] 전공 기술의 사회적 파급효과와 규범 가이드라인`,
          subQuestion: `해당 기술/개념이 상용화되었을 때 발생 가능한 윤리적 딜레마를 해결하기 위한 공동체적 자율 가이드라인은 무엇인가?`,
          researchArea: '과학기술철학 및 공공정책',
          methodology: '국내외 윤리 지침서 대조 및 청소년 자치 행동 강령 5대 조항 제정',
          relatedConcepts: ['책임 윤리', '공동체 역량', '사회적 정의'],
          readingRecommendation: '《기술의 충격》(케빈 켈리)',
          recordTip: '전공 지식의 기술적 성취뿐만 아니라 사회적 약자 보호와 윤리적 책임을 아우르는 성숙한 시민 의식 부각',
        },
      ],
    };

    if (sse) {
      sse.sendComplete(fallback);
    } else {
      return res.json(fallback);
    }
  }
});

// 3. API: 마인드맵 특정 노드 심화 브랜치 및 탐구 단계 AI 확장
app.post('/api/ai/expand-mindmap', async (req, res) => {
  try {
    const {
      rootTopic = '',
      nodeText = '',
      nodeSubject = '',
      nodeType = '',
      category = 'science',
      mode = 'expand',
    } = req.body;

    if (!nodeText) return res.status(400).json({ error: '노드 텍스트가 필요합니다.' });

    // Clean node text to remove brackets/noise
    const cleanText = nodeText
      .replace(/\[.*?\]/g, '')
      .replace(/[0-9]+단계\s*:\s*/g, '')
      .trim();

    // Subject detection
    const combinedContext = `${nodeSubject} ${category} ${nodeText}`.toLowerCase();
    const isMath = /math|수학|미적|확률|통계|기하|수치|방정식/i.test(combinedContext);
    const isSci = /sci|과학|생명|물리|화학|지구|실험|바이오/i.test(combinedContext);
    const isSoc = /soc|사회|윤리|경제|법|정책|제도|정의/i.test(combinedContext);
    const isKor = /kor|국어|문학|독서|화법|작문|담론/i.test(combinedContext);
    const isEng = /eng|영어|원서|저널|abstract|글로벌/i.test(combinedContext);
    const isTech = /tech|정보|알고리즘|ai|인공지능|컴퓨터|코딩|데이터/i.test(combinedContext);

    const subjectBadge = isMath
      ? '수학 (미적분/확통)'
      : isSci
      ? '과학 (생명/물리/화학)'
      : isSoc
      ? '사회 (윤리/경제/법)'
      : isKor
      ? '국어 (독서/작문)'
      : isEng
      ? '영어 (심화영어/작문)'
      : '정보 (정보/AI기초)';

    const effectiveCategory = isMath
      ? 'math'
      : isSci
      ? 'science'
      : isSoc
      ? 'social'
      : isKor
      ? 'humanities'
      : isEng
      ? 'humanities'
      : 'tech';

    // Hierarchy Level Detection:
    const isProcessStep =
      nodeType === 'process_step' ||
      /1단계|2단계|3단계|4단계|문제\s*도출|이론\s*고찰|실증\s*방법|결론\s*도출/i.test(nodeText);

    const isSubjectLevel =
      nodeType === 'subject' ||
      /^\[(수학|과학|사회|국어|영어|정보)\]/i.test(nodeText);

    const isActionLevel =
      nodeType === 'action' ||
      /\[(변인|현상|성취기준|학술|원서|개념|데이터|모델링|실험|오차|후속|문안|파라미터|융합|학술제)\]/i.test(nodeText);

    const getHierarchicalNodes = () => {
      // SCENARIO 1: Requested 4-Stage Inquiry Process OR expanding a Topic node
      if (mode === 'process_steps' || (!isProcessStep && !isSubjectLevel && !isActionLevel)) {
        return [
          {
            id: `step-${Date.now()}-1`,
            text: '1단계: [문제 도출] 핵심 연구 발문 및 가설 설정',
            category: effectiveCategory,
            subject: subjectBadge,
            nodeType: 'process_step',
            detail: `${cleanText}에 관한 실세계 문제 현상을 관찰하고 조작 변인과 종속 변인을 수학적/과학적으로 명확히 정의하여 검증 가능한 가설 진술문 작성`,
            inquiryQuestion: `${cleanText} 현상에서 원인과 결과의 인과관계를 설명하는 핵심 가설은 무엇인가?`,
            methodology: '공공 통계 지표 및 선행 사례 조사를 통한 연구 필요성 정립, 가설 진술문 작성',
            readingRecommendation: isMath ? '《수학으로 생각하는 힘》' : isSci ? '《부분과 전체》' : isSoc ? '《정의란 무엇인가》' : isKor ? '《생각의 탄생》' : isEng ? '《Factfulness》' : '《알고리즘, 인생을 계산하다》',
            recordTip: '일상의 호기심을 학문적 탐구 발문으로 구체화한 자기주도적 문제발견 역량',
          },
          {
            id: `step-${Date.now()}-2`,
            text: '2단계: [이론 고찰] 교과 단원 개념 융합 및 선행 논문 분석',
            category: effectiveCategory,
            subject: subjectBadge,
            nodeType: 'process_step',
            detail: `고교 교과서 단원 개념과 KCI/PubMed 등재 선행 학술 논문을 교차 검토하여 이론적 토대와 선행 연구의 한계점 규명`,
            inquiryQuestion: '교과 단원 개념이 실제 최신 학술 논문에서 어떤 수식과 메커니즘으로 심화 발전하고 있는가?',
            methodology: '학술 데이터베이스(DBpia/RISS) 선행 논문 2편 핵심 기전 분석 및 교과 개념 융합 맵 작성',
            readingRecommendation: isMath ? '《미적분의 힘》' : isSci ? '《생명 최초의 30억 년》' : isSoc ? '《기술의 충격》' : isKor ? '《과학 혁명의 구조》' : isEng ? '《Academic English Writing》' : '《모두의 딥러닝》',
            recordTip: '고교 교육과정 지식을 대학 수준의 학술 논문과 접목하여 깊이 있게 이해한 학업 역량',
          },
          {
            id: `step-${Date.now()}-3`,
            text: '3단계: [실증 방법] 구체적 실험·데이터 시뮬레이션·모델링',
            category: effectiveCategory,
            subject: subjectBadge,
            nodeType: 'process_step',
            detail: isMath
              ? '지오지브라/파이썬을 활용한 매개변수 변화율 수치 모델링 및 함수 피팅'
              : isSci
              ? '교내 과학 실험실 변인 통제 모의실험 및 반응 수치 정량 측정'
              : isSoc
              ? '정부 공공데이터 시계열 추세 분석 및 국내외 정책 가이드라인 비교'
              : isKor
              ? '전문 학술 텍스트와 언론 보도의 담론 프레이밍 비교 도표 작성'
              : isEng
              ? 'Nature/Science 영문 원문 초록(Abstract) IMRaD 구조 분석 및 영문 리포트'
              : '공공데이터 Open API 연계 및 파이썬 데이터 처리 알고리즘 구현',
            inquiryQuestion: '가설을 객관적으로 입증하기 위해 어떤 정량적 데이터와 도구를 사용하여 검증할 것인가?',
            methodology: '정량 데이터 수집, 회귀분석/알고리즘 구현 또는 실험군-대조군 프로토콜 수행',
            readingRecommendation: isMath ? '《파이썬으로 배우는 통계학》' : isSci ? '《실험 과학 탐구 매뉴얼》' : isSoc ? '《로봇 시대의 법과 윤리》' : isKor ? '《말이 칼이 될 때》' : isEng ? '《TED Talks 원문 스크립트》' : '《파이썬 데이터 분석 실무 테크닉 100》',
            recordTip: '추상적 이론에 머물지 않고 도구와 데이터를 활용하여 실증적으로 문제를 해결한 탐구 실천력',
          },
          {
            id: `step-${Date.now()}-4`,
            text: '4단계: [결론 도출] 오차 분석, 한계 극복 및 학생부 세특 기록화',
            category: effectiveCategory,
            subject: subjectBadge,
            nodeType: 'process_step',
            detail: '탐구 결과의 타당성 평가, 장비 및 환경적 한계로 인한 오차 원인 규명, 차년도 후속 탐구 과제 제시 및 세특 작성',
            inquiryQuestion: '탐구 결과를 통해 도출한 최종 결론과 향후 개선해야 할 학문적 과제는 무엇인가?',
            methodology: '오차율 산출, 선행 연구와의 결과 차이 고찰, 동기-과정-성장이 담긴 세특 포트폴리오 정리',
            readingRecommendation: '《통계의 미학》, 《유혹하는 글쓰기》',
            recordTip: '실패나 오차를 숨기지 않고 과학적/논리적으로 원인을 분석하여 한 단계 더 성장한 메타인지 역량',
          },
        ];
      }

      // SCENARIO 2: Expanding a Process Step (1단계, 2단계, 3단계, 4단계)
      if (isProcessStep) {
        const stepNum = /1단계|문제\s*도출/i.test(nodeText)
          ? 1
          : /2단계|이론\s*고찰/i.test(nodeText)
          ? 2
          : /3단계|실증\s*방법/i.test(nodeText)
          ? 3
          : 4;

        if (stepNum === 1) {
          return [
            {
              id: `act-${Date.now()}-1`,
              text: '[변인 정의] 조작·통제 변인 설정 및 인과관계 가설 수립',
              category: effectiveCategory,
              subject: subjectBadge,
              nodeType: 'action',
              detail: `${cleanText} 현상에 영향을 미치는 독립변수를 세분화하고 통제변인을 물리화학적/수학적으로 조작적 정의`,
              inquiryQuestion: '변인 간의 상호작용을 분리하여 순수한 인과관계를 증명할 수 있는 조건은?',
              methodology: '변인 통제 설계서 작성 및 가설 진술문 검토',
              recordTip: '실험 설계의 논리적 엄밀성과 변인 통제 능력을 입증',
            },
            {
              id: `act-${Date.now()}-2`,
              text: '[현상 진단] 공공 통계 포털 기반 실태 데이터 추출 및 문제 시각화',
              category: effectiveCategory,
              subject: subjectBadge,
              nodeType: 'action',
              detail: '통계청(KOSIS), 공공데이터포털 또는 국제기구(WHO/OECD)의 최근 5개년 실태 통계 추출 및 차트화',
              inquiryQuestion: '데이터에 나타난 최근 5개년의 급격한 이상치 또는 변곡점의 배경은?',
              methodology: 'Excel/R을 활용한 시계열 추세선 그래프 작성',
              recordTip: '사회적·과학적 난제를 신뢰성 있는 공공 통계로 실증한 데이터 탐색 역량',
            },
            {
              id: `act-${Date.now()}-3`,
              text: '[성취기준 맵] 교과서 핵심 단원 성취기준과 연구 질문 정합성 검토',
              category: effectiveCategory,
              subject: subjectBadge,
              nodeType: 'action',
              detail: '2022/2015 교육과정 교과서 단원 목표와 본 연구 질문의 연계성을 분석하여 세특 기재 기반 구축',
              inquiryQuestion: '교과 단원의 핵심 개념이 연구 문제 해결의 이론적 출발점이 될 수 있는가?',
              methodology: '교육과정 성취기준 연계 맵 작성 및 지도 교사 사전 피드백 수렴',
              recordTip: '정규 교과 수업 내용에 뿌리를 두고 심화 주제로 확장해 나간 학종 모범 탐구 태도',
            },
          ];
        }

        if (stepNum === 2) {
          return [
            {
              id: `act-${Date.now()}-1`,
              text: '[학술 논문] KCI/PubMed 등재 선행 연구의 연구 방법론 비교 분석',
              category: effectiveCategory,
              subject: subjectBadge,
              nodeType: 'action',
              detail: '선행 연구 2~3편의 Abstract와 연구 설계 파트를 비교하여 공통 한계점과 본 탐구의 차별성 도출',
              inquiryQuestion: '선행 연구들이 해결하지 못한 미개척 영역은 무엇이며 본 탐구는 이를 어떻게 보완하는가?',
              methodology: 'DBpia/RISS 검색 논문 비교 분석 표(Matrix) 작성',
              recordTip: '학술 문헌을 비판적으로 독해하고 연구의 독창적 가치를 정립한 연구자적 안목',
            },
            {
              id: `act-${Date.now()}-2`,
              text: '[전공 원서 발췌] 대학 전공 추천 도서 심화 챕터 비평문 작성',
              category: effectiveCategory,
              subject: subjectBadge,
              nodeType: 'action',
              detail: '대학교 1~2학년 전공 개론서의 관련 챕터를 발췌 정독하고 고교 개념과의 수준 차이를 메우는 해설문 작성',
              inquiryQuestion: '교과서에 생략된 심화 메커니즘을 전공 서적에서는 어떻게 설명하고 있는가?',
              methodology: '전공 서적 독서 카드 작성 및 핵심 수식/원리 요약 노트 제작',
              recordTip: '지적 갈증을 해소하기 위해 주도적으로 전공 원서를 탐독하는 탁월한 학구열',
            },
            {
              id: `act-${Date.now()}-3`,
              text: '[개념 융합도] 2개 교과 개념 결합 수식 도출 및 개념도 작성',
              category: effectiveCategory,
              subject: subjectBadge,
              nodeType: 'action',
              detail: '자연과학 현상을 수학적 함수로 나타내거나 과학 기술의 위험도를 사회적 효용 함수로 모델링',
              inquiryQuestion: '서로 다른 교과 단원의 원리를 결합할 때 나타나는 시너지 방정식은 무엇인가?',
              methodology: '융합 개념 관계도 작성 및 융합 모델링 수식 유도',
              recordTip: '단일 교과에 갇히지 않고 여러 교과를 넘나드는 융복합적 문제해결력 과시',
            },
          ];
        }

        if (stepNum === 3) {
          if (isMath) {
            return [
              {
                id: `act-${Date.now()}-1`,
                text: '[수식 모델링] 변수 간 상관함수 수식화 및 미분계수 산출',
                category: 'math',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '수집된 데이터 좌표로부터 다항함수 또는 지수·로그 함수를 도출하고 극값과 변화율 계산',
                inquiryQuestion: '변화율이 0이 되는 임계점의 실제 물리적/경제적 의미는?',
                methodology: '최소제곱법을 적용한 회귀곡선 수식 유도',
                recordTip: '미적분의 기하학적·대수적 의미를 실세계 데이터에 정확하게 적용한 수리력',
              },
              {
                id: `act-${Date.now()}-2`,
                text: '[시뮬레이션] 지오지브라/파이썬을 통한 매개변수 변화 시각화',
                category: 'math',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '슬라이더 인터페이스를 구성하여 파라미터 a, b의 변화에 따른 그래프 곡률 및 면적 변동 관찰',
                inquiryQuestion: '매개변수가 특정 임계치를 넘을 때 그래프의 점근선과 수렴성은 어떻게 변하는가?',
                methodology: '지오지브라 동적 워크시트 제작 및 스크린샷 캡처',
                recordTip: '컴퓨팅 도구를 활용하여 수학적 직관을 시각적으로 구현해내는 역량',
              },
              {
                id: `act-${Date.now()}-3`,
                text: '[오차 검증] 잔차 제곱합(RSS) 계산 및 모델 적합도(R²) 평가',
                category: 'math',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '실제 관측값과 수식 예측값 간의 잔차(Residual)를 구하고 결정계수(R-squared)로 설명력 검증',
                inquiryQuestion: '수립된 수학적 모델이 현실 데이터를 몇 퍼센트나 설명할 수 있는가?',
                methodology: '잔차 분포도 작성 및 통계적 유의성 검토',
                recordTip: '자신의 모델을 맹신하지 않고 통계적 지표로 냉철하게 검증하는 연구 윤리',
              },
            ];
          }

          if (isSci) {
            return [
              {
                id: `act-${Date.now()}-1`,
                text: '[변인 통제] 조작 변인과 통제 변인 설정 및 대조군 실험 프로토콜',
                category: 'science',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '온도, 농도, 조도 등 외생 변인을 항구적으로 일정하게 유지하는 구체적 실험 순서도 작성',
                inquiryQuestion: '예상치 못한 환경 외란을 차단할 수 있는 블라인드 대조군 설계는?',
                methodology: '실험 프로토콜 5단계 수립 및 교내 과학실 기자재 대여 신청',
                recordTip: '실험 설계의 정밀성과 변인 통제의 엄격함을 철저히 준수한 과학적 태도',
              },
              {
                id: `act-${Date.now()}-2`,
                text: '[측정 데이터] 반응 속도 및 흡광도/전압 수치 정량 측정',
                category: 'science',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '시간 경과에 따른 정량적 수치 변화를 5회 반복 측정하여 평균값과 표준편차 도출',
                inquiryQuestion: '반복 실험 간의 측정 오차는 통계적으로 허용 가능한 수준인가?',
                methodology: 'MBL 센서 측정 및 엑셀 데이터 테이블 입력',
                recordTip: '단발성 실험이 아닌 다회 반복 측정을 통해 데이터의 신뢰도를 확보한 성실성',
              },
              {
                id: `act-${Date.now()}-3`,
                text: '[오차 분석] 실험 기구 분해능 한계에 따른 불확도 계산 및 보정',
                category: 'science',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '디지털 계측 장비의 최소 눈금 한계 및 온도 변화에 따른 물리적 오차 요인 정량 보정',
                inquiryQuestion: '장비의 분해능 한계로 인해 발생할 수 있는 최대 오차 범위는 얼마인가?',
                methodology: '불확도 전파 법칙 적용 및 오차 보정치 산출',
                recordTip: '오차 발생 원인을 장비의 물리적 한계와 결부지어 과학적으로 해석해낸 분석력',
              },
            ];
          }

          if (isSoc) {
            return [
              {
                id: `act-${Date.now()}-1`,
                text: '[공공데이터 추출] 통계청 KOSIS 및 정부 공시자료 시계열 정제',
                category: 'social',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '공공 정책 시행 전후 3개년의 경제적 지표 및 복지 지출 통계 데이터를 시계열로 정리',
                inquiryQuestion: '새로운 법제도 도입 이후 수혜 집단과 비용 부담 집단의 변화 추이는?',
                methodology: 'KOSIS 통계표 다운로드 및 전후 차이 분석표 작성',
                recordTip: '정부 공공데이터를 직접 수집하여 정책의 실효성을 객관적으로 검증한 탐구력',
              },
              {
                id: `act-${Date.now()}-2`,
                text: '[제도/판례 비교] 국내 법령과 해외(EU/미국) 가이드라인 조항 대비표',
                category: 'social',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '국내 포지티브 규제 법조문과 EU/미국의 네거티브 규제 조항을 1:1로 매핑하여 장단점 분석',
                inquiryQuestion: '글로벌 스탠다드와 국내 규제 환경 사이의 괴리를 해소할 절충안은?',
                methodology: '법령 조문 비교 분석 매트릭스 작성',
                recordTip: '국내외 법제를 비교 검토하여 균형 잡힌 정책 대안을 모색한 사회과학적 소양',
              },
              {
                id: `act-${Date.now()}-3`,
                text: '[정책 제언] 수혜자-비수혜자 딜레마를 해소하는 실천 조례안 입안',
                category: 'social',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '사회적 약자의 권익을 보호하면서도 산업 혁신을 저해하지 않는 5개 조항의 가상 조례안 성안',
                inquiryQuestion: '이해관계자 간의 갈등을 최소화하는 상생 펀드 또는 지원금 모델은?',
                methodology: '조례안 입법 이유서 및 5개 조항 법률안 작성',
                recordTip: '사회적 연대와 공동체 번영을 위한 실천적 정책 대안을 구체적 조문화한 역량',
              },
            ];
          }

          if (isKor) {
            return [
              {
                id: `act-${Date.now()}-1`,
                text: '[담론 텍스트 분석] 전문 학술지 vs 언론 보도의 프레이밍 차이 도표화',
                category: 'humanities',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '학술 논문의 조건부 수사(Hedging)와 대중 기사의 자극적 단정 표현의 빈도를 비교 계량화',
                inquiryQuestion: '언론의 언어적 프레임이 대중의 공포심과 과대 기대를 어떻게 부추기는가?',
                methodology: '텍스트 마이닝 어휘 빈도 분석 및 프레이밍 대비표 작성',
                recordTip: '미디어 텍스트의 숨은 의도를 언어학적·수사학적으로 정밀하게 해체한 문해력',
              },
              {
                id: `act-${Date.now()}-2`,
                text: '[비판적 서평] 학술 논문의 전제와 논리적 비약에 대한 반론문 작성',
                category: 'humanities',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '권위 있는 학술 텍스트라 할지라도 암묵적으로 전제된 가치관의 한계점을 논리적으로 비판',
                inquiryQuestion: '해당 저자의 주장에서 증명되지 않은 은폐된 전제(Hidden assumption)는 무엇인가?',
                methodology: '툴민 논증 분석틀 적용 및 비판적 논평문(A4 3매) 작성',
                recordTip: '권위에 무비판적으로 동조하지 않고 학문적 반론을 제기하는 독립적 비판 사고력',
              },
              {
                id: `act-${Date.now()}-3`,
                text: '[학술 에세이] 교과 개념과 인문학적 가치를 융합한 비평문 교내 발표',
                category: 'humanities',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '과학기술과 인간 존엄성의 조화를 다룬 소논설문을 학급 발표 시간에 공유하고 질의응답 진행',
                inquiryQuestion: '어떻게 감정적 호소와 이성적 논증을 결합하여 청중을 설득할 것인가?',
                methodology: '학술 발표 슬라이드 제작 및 동료 질의응답 피드백 정리',
                recordTip: '복잡한 인문·과학 융합 쟁점을 청중의 눈높이에 맞게 전달하는 탁월한 스피치 능력',
              },
            ];
          }

          if (isEng) {
            return [
              {
                id: `act-${Date.now()}-1`,
                text: '[원문 IMRaD 분석] Nature/Science 연구 논문의 초록 및 결론 원문 강독',
                category: 'humanities',
                subject: subjectBadge,
                nodeType: 'action',
                detail: 'Introduction부터 Discussion까지 논문의 4단 구조별 핵심 연결어와 논리 비약을 원문으로 대조',
                inquiryQuestion: '글로벌 연구진이 사용하는 학술적 완곡어법(Hedging expressions)의 종류는?',
                methodology: '원문 형광펜 구문 분석 및 논리 흐름도 작성',
                recordTip: '영문 학술 논문의 원문을 직접 강독하며 전문 어휘와 논리 구조를 흡수한 외국어 역량',
              },
              {
                id: `act-${Date.now()}-2`,
                text: '[전문 어휘집] 전공 핵심 Academic Collocations 30선 정리',
                category: 'humanities',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '전공 분야 논문에서 빈번히 등장하는 연어(Collocation) 및 전치사 결합 패턴 30선 추출',
                inquiryQuestion: '자연스러운 학술 영작문을 위해 필수적인 동사-명사 결합 패턴은 무엇인가?',
                methodology: '영문 코퍼스(Corpus) 검색 및 어휘집 제작',
                recordTip: '기계적 단어 암기를 넘어 학술 문맥 속 연어 관계를 체득한 실질적 어학 실력',
              },
              {
                id: `act-${Date.now()}-3`,
                text: '[영문 브리프] 연구 질문, 방법, 결론을 200단어 영문 Executive Summary로 작성',
                category: 'humanities',
                subject: subjectBadge,
                nodeType: 'action',
                detail: '핵심 내용을 200단어 내외의 정갈한 학술 영어로 압축 요약하고 문법 감수 진행',
                inquiryQuestion: '군더더기 없는 명료하고 응집성 높은(Cohesive) 영문 초록을 쓰는 방법은?',
                methodology: '영문 요약문 초안 작성 및 Grammarly 감수',
                recordTip: '복잡한 연구 결과를 국제 표준 양식에 맞추어 영문으로 요약 보고할 수 있는 글로벌 역량',
              },
            ];
          }

          return [
            {
              id: `act-${Date.now()}-1`,
              text: '[데이터 파이프라인] 공공데이터 REST API 연동 및 Pandas 결측치 전처리',
              category: 'tech',
              subject: subjectBadge,
              nodeType: 'action',
              detail: 'API 호출을 통해 JSON 데이터를 수집하고 파이썬 결측치 대체 및 이상치 필터링 수행',
              inquiryQuestion: '데이터 정제 과정에서 데이터 손실을 최소화하면서 노이즈를 제거하는 기법은?',
              methodology: '파이썬 스크립트 작성 및 데이터프레임 요약 통계 출력',
              recordTip: '실제 현업 개발에서 쓰이는 데이터 수집 및 정제 파이프라인을 독자 구축한 역량',
            },
            {
              id: `act-${Date.now()}-2`,
              text: '[알고리즘 구현] 최적화 파이썬 스크립트 작성 및 시간복잡도 O(N) 분석',
              category: 'tech',
              subject: subjectBadge,
              nodeType: 'action',
              detail: '이중 반복문의 병목 현상을 해시맵 또는 동적 계획법으로 개선하여 연산 속도 10배 단축',
              inquiryQuestion: '대용량 데이터 환경에서 알고리즘의 실행 속도를 보장하기 위한 자료구조 선택은?',
              methodology: 'timeit 모듈을 활용한 수행 시간 벤치마크 테스트',
              recordTip: '기능 구현에 그치지 않고 알고리즘의 복잡도를 분석하여 성능을 최적화한 컴퓨팅 사고력',
            },
            {
              id: `act-${Date.now()}-3`,
              text: '[인터랙티브 시각화] Streamlit/Plotly 기반 대화형 탐구 대시보드 배포',
              category: 'tech',
              subject: subjectBadge,
              nodeType: 'action',
              detail: '사용자가 필터를 조작하며 탐구 결과를 웹 화면에서 실시간으로 확인할 수 있는 대시보드 제작',
              inquiryQuestion: '비전공자 사용자에게 데이터 분석 결과를 직관적으로 전달하는 UI 구성은?',
              methodology: 'Streamlit 웹 앱 프로토타이핑 및 학급 급우 시연',
              recordTip: '자신의 코드를 사용자가 편리하게 인터랙션할 수 있는 완성도 높은 소프트웨어로 발전시킴',
            },
          ];
        }

        // stepNum === 4
        return [
          {
            id: `act-${Date.now()}-1`,
            text: '[오차 요인 고찰] 측정 장비 분해능 및 표본 편향에 따른 한계점 역학적 분석',
            category: effectiveCategory,
            subject: subjectBadge,
            nodeType: 'action',
            detail: '실험 장비의 한계, 표본 추출의 한계로 인해 발생한 오차의 크기를 수량화하고 원인 분석',
            inquiryQuestion: '이상적인 이론값과 실제 측정값 사이에 발생한 잔차의 주된 원인은 무엇인가?',
            methodology: '오차 원인 요인 분석도(Fishbone diagram) 작성',
            recordTip: '실험 결과를 왜곡하지 않고 오차의 원인을 객관적이고 과학적으로 규명한 연구 윤리',
          },
          {
            id: `act-${Date.now()}-2`,
            text: '[후속 연구 제언] 현실적 제약을 극복하기 위한 차년도 2단계 심화 연구 로드맵 구상',
            category: effectiveCategory,
            subject: subjectBadge,
            nodeType: 'action',
            detail: '현재 탐구의 한계를 발판 삼아 3학년 또는 타 교과에서 연계 확장할 후속 연구 질문 2가지 도출',
            inquiryQuestion: '대학에 진학하여 심화 연구 장비를 다루게 된다면 어떤 추가 검증을 수행할 것인가?',
            methodology: '2단계 후속 탐구 계획서 및 진로 로드맵 연계서 작성',
            recordTip: '일회성 탐구로 끝내지 않고 지속적인 지적 호기심으로 발전시켜 나가는 학문적 지구력',
          },
          {
            id: `act-${Date.now()}-3`,
            text: '[세특 500자 완성] 탐구 동기-실천 과정-배우고 느낀 점 중심의 학생부 문안 초안 작성',
            category: effectiveCategory,
            subject: subjectBadge,
            nodeType: 'action',
            detail: '교육부 학생부 기재요령에 부합하도록 소논문 명칭 배제, 교과 성취기준 및 성장 스토리 중심 서술',
            inquiryQuestion: '입학사정관의 눈길을 사로잡는 나만의 차별화된 학문적 성장의 핵심 문장은?',
            methodology: 'STAR(Situation-Task-Action-Result) 기법 기반 480자 세특 포트폴리오 완성',
            recordTip: '자신의 역량을 입학사정관에게 신뢰감 있게 전달하는 완성도 높은 세특 포트폴리오 구축',
          },
        ];
      }

      // SCENARIO 3: Expanding a Subject Level node ([수학], [과학], etc.)
      if (isSubjectLevel) {
        if (isMath) {
          return [
            {
              id: `top-${Date.now()}-1`,
              text: `${cleanText}의 비선형 미분방정식 동적 안정성 모델링`,
              category: 'math',
              subject: subjectBadge,
              nodeType: 'topic',
              detail: '미적분의 변화율과 위상평면 분석을 활용하여 복합 시스템의 평형점과 수렴 안정성 탐구',
              inquiryQuestion: '시스템이 외란에 흔들리지 않고 안정 상태를 유지하는 수학적 조건은?',
              methodology: '지오지브라 미분방정식 방향장(Slope Field) 시각화',
              recordTip: '고교 미적분을 뛰어넘어 동적 시스템의 수리적 안정성을 모델링한 우수한 수리역량',
            },
            {
              id: `top-${Date.now()}-2`,
              text: `${cleanText}의 베이즈 추론과 결합 확률분포 분석`,
              category: 'math',
              subject: subjectBadge,
              nodeType: 'topic',
              detail: '조건부 확률과 베이즈 정리를 적용하여 새로운 데이터 유입 시 사후 확률의 갱신 과정 모델링',
              inquiryQuestion: '사전 정보의 불확실성이 데이터 누적에 따라 어떻게 감소하는가?',
              methodology: '파이썬 NumPy를 활용한 베이즈 업데이트 확률 시뮬레이션',
              recordTip: '확률과 통계 교과를 실세계 불확실성 의사결정에 수학적으로 적용한 통찰력',
            },
          ];
        }

        if (isSci) {
          return [
            {
              id: `top-${Date.now()}-1`,
              text: `${cleanText} 시스템의 열역학적 엔트로피와 에너지 변환 효율성 분석`,
              category: 'science',
              subject: subjectBadge,
              nodeType: 'topic',
              detail: '열역학 제1법칙 및 제2법칙을 바탕으로 시스템의 에너지 손실 메커니즘과 비가역 과정 고찰',
              inquiryQuestion: '시스템 내 열손실을 최소화하고 카르노 효율에 근접시키는 물리적 조건은?',
              methodology: '에너지 수지 계산 및 교내 과학실 MBL 열량 측정 실험',
              recordTip: '물리학과 화학의 열역학 이론을 신기술 에너지 보존 문제에 적용한 공학적 시야',
            },
            {
              id: `top-${Date.now()}-2`,
              text: `${cleanText} 분자간 상호작용과 입체화학적 결합 에너지 규명`,
              category: 'science',
              subject: subjectBadge,
              nodeType: 'topic',
              detail: '수소결합, 반데르발스 힘, 정전기적 인력을 바탕으로 물질 간의 3차원 분자 도킹 메커니즘 시뮬레이션',
              inquiryQuestion: '분자 구조의 미세한 변형이 결합 친화도에 미치는 영향은?',
              methodology: 'PDB 3D 분자 구조 데이터베이스 분석 및 결합 에너지 비교',
              recordTip: '화학II 및 생명과학II 분자 구조 개념을 3차원적으로 시각화하고 정량 해석한 탐구력',
            },
          ];
        }

        return [
          {
            id: `top-${Date.now()}-1`,
            text: `${cleanText}의 사회 제도적 쟁점과 공공 거버넌스 가이드라인 제언`,
            category: effectiveCategory,
            subject: subjectBadge,
            nodeType: 'topic',
            detail: '신기술 도입에 따른 법적 규제 샌드박스와 사회적 약자 보호 가이드라인 비교 분석',
            inquiryQuestion: '기술 혁신과 인간 존엄성 보호 사이의 제도적 균형점은 어디인가?',
            methodology: '국내외 정책 보고서 분석 및 모의 정책 제안서 작성',
            recordTip: '사회적 갈등을 법과 제도의 관점에서 합리적으로 조율하는 정책적 소양',
          },
          {
            id: `top-${Date.now()}-2`,
            text: `${cleanText}의 공공데이터 기반 상관분석 및 알고리즘 프로토타입`,
            category: effectiveCategory,
            subject: subjectBadge,
            nodeType: 'topic',
            detail: '공공데이터포털 Open API를 호출하여 핵심 변수 간 상관관계를 분석하고 파이썬으로 해결책 프로토타이핑',
            inquiryQuestion: '데이터에 숨겨진 구조적 패턴을 컴퓨팅 알고리즘으로 어떻게 자동 해결할 것인가?',
            methodology: 'Python Pandas EDA 및 알고리즘 흐름도 설계',
            recordTip: '데이터 분석과 소프트웨어 설계를 결합하여 실질적 문제를 해결하는 융합 창의력',
          },
        ];
      }

      // SCENARIO 4: Expanding an Action Level node (Depth 4+)
      return [
        {
          id: `adv-${Date.now()}-1`,
          text: '[파라미터 극한 검증] 시스템의 임계점(Break-even point) 및 이상치 반응 평가',
          category: effectiveCategory,
          subject: subjectBadge,
          nodeType: 'action',
          detail: '투입 파라미터나 외생 변수를 극한 조건(±50% 변동)으로 설정하여 모델의 견고성(Robustness) 검증',
          inquiryQuestion: '예측하지 못한 돌발 변수가 발생했을 때 시스템이 붕괴하지 않고 견딜 수 있는 임계치는?',
          methodology: '몬테카를로 시뮬레이션 또는 극단치 스트레스 테스트 수행',
          recordTip: '정상 상태뿐만 아니라 극한 상황까지 고려하는 시스템 아키텍트적 심화 탐구력',
        },
        {
          id: `adv-${Date.now()}-2`,
          text: '[학제 간 융합 제언] 인문학적 가치관과 공학적 효율성의 균형 가이드라인 수립',
          category: effectiveCategory,
          subject: subjectBadge,
          nodeType: 'action',
          detail: '기술적 성능 지표에 매몰되지 않고 환경적 지속가능성과 인간 중심 가치를 아우르는 헌장 제정',
          inquiryQuestion: '과학기술 연구자가 반드시 견지해야 할 윤리적 자기통제의 기준선은?',
          methodology: '유네스코 과학기술 윤리 선언문 대조 및 연구자 행동 강령 제언문 작성',
          recordTip: '지적 탐구에 그치지 않고 사회적 책임감을 내면화한 균형 잡힌 인성 및 공동체 역량',
        },
        {
          id: `adv-${Date.now()}-3`,
          text: '[교내 학술제 발표] 인포그래픽 포스터 제작 및 교사·동료 피드백 기반 리비전 완성',
          category: effectiveCategory,
          subject: subjectBadge,
          nodeType: 'action',
          detail: '탐구 전 과정을 한 장의 학술 인포그래픽 포스터로 압축하고 모의 학술제 질의응답을 거쳐 최종 리비전 완성',
          inquiryQuestion: '복잡한 연구 결과를 시각적 인포그래픽과 간결한 화법으로 대중에게 어떻게 전달할 것인가?',
          methodology: 'Canva/Figma 기반 A1 학술 포스터 디자인 및 피드백 수정 보고서 작성',
          recordTip: '자신의 연구 성과를 동료들과 공유하고 적극적으로 피드백을 수용하여 발전시키는 소통 능력',
        },
      ];
    };

    return res.json({ newNodes: getHierarchicalNodes() });
  } catch (error) {
    console.error('Error expanding mindmap:', (error as any)?.message || error);
    return res.status(500).json({ error: '마인드맵 확장 중 오류가 발생했습니다.' });
  }
});

// 3-1. API: 학생 관심사 기반 6개 전 교과 4~5단계 심화 마인드맵 전체 동적 생성
app.post('/api/ai/generate-mindmap', async (req, res) => {
  try {
    const {
      student = {},
      rootTopic = '',
      targetMajor = '',
      grade = '고등학교 2학년',
      preferredSubjects = [],
    } = req.body;

    const interest =
      rootTopic ||
      student.mainInterestTopic ||
      student.targetCareer ||
      '인공지능 및 바이오 융합 탐구';
    const major = targetMajor || student.targetMajor || '자연과학/공학 계열';
    const studentGrade = grade || student.grade || '고등학교 2학년';
    const subjects = preferredSubjects.length
      ? preferredSubjects
      : student.preferredSubjects || [];

    const keywords = Array.isArray(student.interestKeywords) ? student.interestKeywords.join(', ') : '';
    const fallback = getCurriculumFallback(interest, major, studentGrade, subjects, keywords);
    return res.json({
      success: true,
      interest,
      mindmap: fallback.mindmap,
      subjects: fallback.subjects,
      connectionSummary: fallback.connectionSummary,
      majorOverview: fallback.majorOverview,
    });
  } catch (error) {
    console.error('Error generating mindmap:', error);
    return res.status(500).json({ error: '마인드맵 생성 중 오류가 발생했습니다.' });
  }
});

// 4. API: InquiryLogManager 탐구 활동 기록 AI 초안 작성 ('동기', '과정', '결과') (SSE + REST POST 지원)
app.post('/api/ai/draft-inquiry-log', async (req, res) => {
  const isSSE = isSSERequest(req);
  const sse = isSSE ? createSSEWriter(res) : null;

  const {
    student = {},
    title = '',
    subject = '통합교과',
    category = '교과세특',
    gradeSemester = '2학년 1학기',
    currentMotivation = '',
    currentProcess = '',
    currentInsights = '',
    mode = 'all', // 'all' | 'motivation' | 'process' | 'insights'
  } = req.body;

  const studentName = student.name || '학생';
  const targetMajor = student.targetMajor || '자연과학/공학 계열';
  const targetCareer = student.targetCareer || '전문 연구원';
  const mainInterest = student.mainInterestTopic || '교과 연계 첨단 기술 및 사회적 문제';
  const keywords =
    Array.isArray(student.interestKeywords) && student.interestKeywords.length > 0
      ? student.interestKeywords.join(', ')
      : '융합 탐구, 모델링, 실증 분석';
  const grade = student.grade || '고등학교 2학년';

  const cleanTitle = (title || '').replace(/\[.*?\]/g, '').trim();
  const effectiveSubject = subject || '과학/수학';

  if (sse) {
    sse.sendProgress(1, 3, `'${studentName}' 학생의 진로(${targetCareer}) 및 관심사 분석 중...`, 25);
  }

  // Domain heuristic detection
  const contextStr = `${title} ${subject} ${targetMajor} ${targetCareer} ${mainInterest} ${keywords}`.toLowerCase();
  const isBio = /생명|바이오|유전자|crispr|의약|단백질|의예|약학|세포|면역/i.test(contextStr);
  const isAi = /ai|인공지능|컴퓨터|소프트웨어|알고리즘|머신러닝|딥러닝|빅데이터|정보/i.test(contextStr);
  const isEnv = /환경|기후|탄소|생태|신재생|esg|오염|지구/i.test(contextStr);
  const isEcon = /경제|경영|금융|시장|무역|소비자|가격|정책|화폐/i.test(contextStr);
  const isMath = /수학|미적분|확률|통계|기하|수치|방정식/i.test(contextStr);

  const generateFallback = () => {
    let draftTitle = title;
    if (!draftTitle || draftTitle.trim() === '') {
      if (isBio) draftTitle = `[${effectiveSubject}] ${keywords.split(',')[0] || '유전자 발현'} 메커니즘 분석과 생명윤리적 고찰`;
      else if (isAi) draftTitle = `[${effectiveSubject}] 알고리즘 시간 복잡도와 최적화 모델링 탐구`;
      else if (isEnv) draftTitle = `[${effectiveSubject}] 환경 데이터 기반 탄소 저감 효율성 수리 모델링`;
      else if (isEcon) draftTitle = `[${effectiveSubject}] 시장 불확실성 하에서의 합리적 의사결정 모형 분석`;
      else if (isMath) draftTitle = `[${effectiveSubject}] 실생활 변화율 예측을 위한 함수의 연속성과 미분 모델링`;
      else draftTitle = `[${effectiveSubject}] ${mainInterest.slice(0, 20)} 관련 핵심 메커니즘 탐구`;
    }

    const activeSubjectTerm = effectiveSubject.includes('수학')
      ? '수학적 모델링과 변화율 분석'
      : effectiveSubject.includes('과학') || effectiveSubject.includes('생명') || effectiveSubject.includes('화학') || effectiveSubject.includes('물리')
      ? '과학적 탐구 방법론과 가설 검증'
      : effectiveSubject.includes('사회') || effectiveSubject.includes('경제') || effectiveSubject.includes('윤리')
      ? '사회 구조적 쟁점과 통계 데이터 분석'
      : effectiveSubject.includes('정보')
      ? '알고리즘적 사고와 데이터 자동화'
      : '교과 핵심 이론과 실생활 연계 고찰';

    const draftMotivation = currentMotivation && currentMotivation.length > 20
      ? `${currentMotivation.trim()}\n\n[진로 융합 보완] 평소 '${targetCareer}'을(를) 지향하며 '${targetMajor}' 진학을 준비해 온 관점에서, 교과 수업 중 다룬 핵심 원리와 '${mainInterest}' 간의 연결 고리를 발견함. 특히 단순 이론 학습을 넘어 실세계 현상에서 발생하는 불확실성과 변인 간 상관관계를 교과 개념으로 정량화하고 검증하고자 탐구를 시작함.`
      : `교과 수업 중 ${activeSubjectTerm} 단원을 학습하며 교과서에 제시된 원리가 실세계 복합 시스템에 어떻게 적용되는지에 대한 지적 호기심을 갖게 됨. 평소 '${targetCareer}'을(를) 꿈꾸며 관심을 두었던 '${mainInterest}' 분야의 최근 쟁점(${keywords})을 접하고, 이를 교과에서 배운 개념과 결합하여 자기주도적으로 깊이 있게 탐구해보고자 연구 주제를 기획함.`;

    const draftProcess = currentProcess && currentProcess.length > 20
      ? `${currentProcess.trim()}\n\n[추가 실천 단계] 교내 학술 DB(KCI)에서 선행 연구 논문 2편을 선정하여 기존 연구의 한계점과 변인 통제 방식을 비교 분석함. 수집된 자료를 바탕으로 ${activeSubjectTerm}을 적용하여 정량적 데이터 시뮬레이션을 수행하고 가설의 타당성을 입증함.`
      : `1단계 [이론 고찰 및 문제 정의]: 교과서의 핵심 개념을 재정립하고, KCI 등 학술 데이터베이스를 통해 '${cleanTitle || mainInterest}' 관련 선행 연구 논문 2편을 분석하여 기존 연구의 전제 조건과 해결 과제를 도출함.\n\n2단계 [자료 수집 및 정량 모델링]: 실제 공공 데이터 및 실험 매개변수를 수집하고, 독립변수와 종속변수를 명확히 설정하여 변인 통제 환경을 설계함. 수치 계산 도구(엑셀/파이썬/지오지브라)를 활용해 데이터 시뮬레이션 및 상관관계를 분석함.\n\n3단계 [결과 해석 및 한계 분석]: 도출된 결과값을 이론적 예측치와 비교하고, 오차가 발생한 물리적·환경적 요인을 정밀 분석하여 모델의 신뢰도를 객관적으로 평가함.`;

    const draftInsights = currentInsights && currentInsights.length > 20
      ? `${currentInsights.trim()}\n\n[성장 및 후속 연계] 본 탐구를 통해 단편적 지식 암기에서 벗어나 문제를 스스로 정의하고 검증하는 학문적 주도성을 확립함. 향후 상위 연계 교과목에서 다루는 심화 원리를 결합하여 2단계 후속 탐구로 발전시킬 계획임.`
      : `이번 탐구를 통해 교과서 속 추상적인 수식과 원리가 실세계 '${targetMajor}' 현장의 핵심 난제를 해결하는 강력한 도구가 됨을 체감함. 특히 데이터 분석과 오차 원인 규명 과정에서 실패를 두려워하지 않는 과학적·논리적 탐구 태도의 중요성을 깊이 깨달음. 탐구 과정에서 새롭게 도출된 의문을 해결하기 위해, 차기 학기 연계 과목과 연결하여 심화 후속 연구를 지속적으로 수행하겠다는 포부를 다짐.`;

    const draftBooks = isBio
      ? '《유전자 편집의 시대》(제니퍼 다우드나), 《생명이란 무엇인가》(에르빈 슈뢰딩거)'
      : isAi
      ? '《알고리즘, 인생을 계산하다》(브라이언 크리스천), 《마스터 알고리즘》(페드로 도밍고스)'
      : isEnv
      ? '《침묵의 봄》(레이첼 카슨), 《탄소중립의 기후학》(조천호)'
      : isEcon
      ? '《괴짜경제학》(스티븐 레빗), 《넛지》(리처드 탈러)'
      : isMath
      ? '《미적분의 힘》(스티븐 스트로가츠), 《통계의 미학》(최제호)'
      : '《부분과 전체》(베르너 하이젠베르크), 《생각의 탄생》(로버트 루트번스타인)';

    const draftDeliverables = '탐구 분석 보고서 (A4 5매), 데이터 시뮬레이션 결과 시트, 핵심 인포그래픽 포스터';

    return {
      title: draftTitle,
      motivation: draftMotivation,
      process: draftProcess,
      insights: draftInsights,
      relatedBooks: draftBooks,
      deliverables: draftDeliverables,
    };
  };

  try {
    if (!hasRealApiKey || !ai) {
      if (sse) {
        await sleep(150);
        sse.sendProgress(2, 3, '교과 개념 연계 및 구체적 탐구 방법론 초안 구성 중...', 65);
        await sleep(180);
        sse.sendProgress(3, 3, '지적 성장 및 교육부 기재요령 표준 문안 확정 중...', 90);
        await sleep(120);
        sse.sendComplete(generateFallback());
      } else {
        return res.json(generateFallback());
      }
      return;
    }

    const prompt = `당신은 대한민국 고등학교 교육과정 및 학생부종합전형(학종) 학교생활기록부 교과 세부능력 및 특기사항(세특) 작성 최고 권위자입니다.
학생의 진로 희망과 핵심 관심사를 바탕으로, 탐구 활동 일지의 '동기', '과정', '결과(배운 점)' 항목 초안을 전문적이고 교육부 규정에 적합하게 작성해주세요.

[학생 프로필]
- 이름: ${studentName} (${grade})
- 희망 진로(직업): ${targetCareer}
- 목표 학과(전공): ${targetMajor}
- 핵심 관심 연구 분야 / 최근 호기심: ${mainInterest}
- 관심 키워드: ${keywords}

[탐구 활동 개요]
- 활동 주제명: ${title || '(주제가 아직 없으므로 학생의 관심사와 교과에 맞춰 추천)'}
- 연계 교과목: ${subject}
- 학생부 영역: ${category}
- 이수 학기: ${gradeSemester}
${currentMotivation ? `- 기존 작성된 동기 내용: "${currentMotivation}" (이를 존중하고 심화 보완)` : ''}
${currentProcess ? `- 기존 작성된 과정 내용: "${currentProcess}" (이를 존중하고 심화 보완)` : ''}
${currentInsights ? `- 기존 작성된 결과 내용: "${currentInsights}" (이를 존중하고 심화 보완)` : ''}
${mode !== 'all' ? `- 중점 작성 요청 항목: ${mode} (해당 항목을 더욱 심혈을 기울여 상세히 작성)` : ''}

[작성 지침 - 엄격 준수]
1. 고등학교 학생부 기재요령 준수: 소논문, R&E, 사설 대회/인증시험, 외부 수상실적 등 금지어 일체 배제.
2. 교과 연계성: 교과 수업 중 배운 개념·원리(예: 교과서 단원, 수식, 법칙)에서 출발하는 동기.
3. 구체적 실천성: 단순 '인터넷 검색'이나 '자료 조사'가 아닌, 1단계(이론 고찰/선행 연구 분석), 2단계(자료 수집/수리 모델링/변인 통제 실험/데이터 분석), 3단계(결과 검증 및 오차 분석) 등 구체적이고 학업 역량이 드러나는 방법론 서술.
4. 지적 성장 및 후속 연계: 단순 소감("유익했다")이 아닌, 새로운 깨달음, 진로 시각의 심화, 차기 학기 후속 탐구 과제 제시.

반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드블록(\`\`\`json)은 포함하거나 제외해도 되나 JSON 파싱이 가능해야 합니다:
{
  "title": "구체적인 탐구 주제명 (교과명과 핵심 내용 포함)",
  "motivation": "1. 탐구 동기 및 핵심 문제의식 (교과 수업 연계, 250~350자 내외)",
  "process": "2. 탐구 과정 및 실천 방법론 (단계별 구체적 실천 과정, 350~500자 내외)",
  "insights": "3. 배운 점, 지적 성장 및 후속 탐구 계획 (250~350자 내외)",
  "relatedBooks": "연계 도서 및 참고 자료 (도서명 및 저자 2권 추천)",
  "deliverables": "산출물 및 증빙 자료 요약 (예: 탐구 보고서 5매, 수치 시뮬레이션 시트 등)"
}`;

    if (sse) {
      sse.sendProgress(2, 3, '교과 단원 연계 초안 심화 생성 중...', 65);
    }

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout')), 45000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const result = {
      title: parsed.title || title || `${subject} 심화 탐구`,
      motivation: parsed.motivation || '',
      process: parsed.process || '',
      insights: parsed.insights || '',
      relatedBooks: parsed.relatedBooks || '',
      deliverables: parsed.deliverables || '',
    };

    if (sse) {
      sse.sendProgress(3, 3, '초안 검토 및 완성형 문안 조립 완료!', 95);
      sse.sendComplete(result);
    } else {
      return res.json(result);
    }
  } catch (error) {
    console.error('Error generating inquiry log draft, serving curriculum fallback:', (error as any)?.message || error);
    const fallback = generateFallback();
    if (sse) {
      sse.sendComplete(fallback);
    } else {
      return res.json(fallback);
    }
  }
});

// 4.5 API: 실시간 1:1 교사-학생 코칭 채팅 (SSE + REST POST 스트리밍)
app.post('/api/ai/live-coach-chat', async (req, res) => {
  const isSSE = isSSERequest(req);
  const sse = isSSE ? createSSEWriter(res) : null;

  try {
    const {
      message = '',
      student = {},
      teacher = {},
      activity = null,
      tag = '피드백',
    } = req.body;

    if (!message || !message.trim()) {
      if (sse) {
        sse.sendError('메시지 내용이 비어있습니다.');
      } else {
        res.status(400).json({ error: '메시지 내용이 비어있습니다.' });
      }
      return;
    }

    const studentName = student.name || '학생';
    const grade = student.grade || '고2';
    const major = student.targetMajor || '관련 계열';
    const teacherName = teacher.name || '김현수';
    const teacherSubject = teacher.subject || '수학·진로진학';

    if (sse) {
      sse.sendProgress(1, 2, '진로진학 전담 교사가 질문을 분석하고 조언을 작성 중입니다...', 35);
    }

    let replyContent = '';

    const prompt = `당신은 대한민국 고등학교에서 학생부종합전형(학종) 지도를 전담하는 베테랑 진로진학 교사 '${teacherName} (${teacherSubject})'입니다.
학생 '${studentName} (${grade}, 희망전공: ${major})'이(가) 다음과 같은 질문/피드백 요청을 보냈습니다.

[학생 질문/메시지]
${message}
${activity ? `[참조 중인 탐구 활동]: "${activity.title}" (${activity.subject})` : ''}

[답변 작성 원칙]
1. 따뜻하고 격려하는 선생님의 말투(친절하고 전문적인 존댓말)로 서술하세요.
2. 학생의 질문에 대해 교과 개념 연계, 정량 데이터/수식 모델링, 또는 학생부 세특 기록 관점에서 실천 가능한 핵심 조언 2~3가지를 명확히 제시하세요.
3. 길이는 3~5문장 (180~280자 내외)으로 모바일/웹 대화에 적절하게 작성하세요.
4. 교육부 학생부 기재요령(소논문/R&E/외부대회 금지 등)을 철저히 준수하세요.`;

    if (hasRealApiKey && ai) {
      try {
        const streamResp = await ai.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        for await (const chunk of streamResp) {
          const chunkText = chunk.text || '';
          replyContent += chunkText;
          if (sse) {
            sse.sendChunk(chunkText);
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini chat streaming failed, fallback to pedagogical coaching template:', geminiErr);
        replyContent = '';
      }
    }

    if (!replyContent) {
      if (/수식|모델링|미적|확률|통계|함수/i.test(message)) {
        replyContent = `${studentName} 학생, 질문 잘 읽었습니다! 교과서 속 수식을 탐구에 가져올 때는 복잡한 공식을 단순 나열하기보다, 독립변수와 종속변수를 명확히 설정하고 지오지브라나 파이썬으로 매개변수를 직접 조정해 보며 오차 범위를 측정해 보세요. 이 과정이 학생부 세특에 '수학적 모델링을 통한 실증력'으로 매우 돋보이게 기록됩니다.`;
      } else if (/마인드맵|연계|주제|추천/i.test(message)) {
        replyContent = `${studentName} 학생의 지적 호기심이 아주 훌륭합니다. 마인드맵의 2학기 연계 주제는 1학기 기초 개념을 실세계 공공데이터(data.go.kr)나 학술 논문 2편과 결합하여 '가설 검증' 형태로 좁혀보길 권합니다. 초안이 정리되면 언제든 활동 일지에 등록해 피드백을 요청하세요!`;
      } else if (/세특|초안|기록|감사/i.test(message)) {
        replyContent = `${studentName} 학생이 열심히 탐구해 준 덕분에 좋은 세특 문안이 나올 수 있었습니다. 작성된 초안을 바탕으로 교과 시간에 발표를 진행하거나 급우들과 모의 세미나를 열면 '공동체 소통 역량'까지 완벽하게 인정받을 수 있습니다. 늘 응원합니다!`;
      } else {
        replyContent = `${studentName} 학생, 반갑습니다. ${activity ? `'${activity.title}' 활동과 관련하여 ` : ''}말씀해 주신 문제의식은 고교 수준을 뛰어넘는 훌륭한 탐구 출발점입니다. 먼저 선행 연구 1~2편의 한계점을 정리하고, 교과 단원의 핵심 원리와 접목하는 구체적 실험·데이터 분석 계획서를 작성해 보세요. 방과 후에 찾아오면 추가 자료도 함께 살펴보겠습니다.`;
      }

      if (sse) {
        const words = replyContent.split(' ');
        for (const word of words) {
          sse.sendChunk(word + ' ');
          await sleep(35);
        }
      }
    }

    const teacherMsg = {
      id: `msg-${Date.now()}`,
      senderId: teacher.id || 'teacher-1',
      senderName: `${teacherName} 교사`,
      senderRole: 'teacher',
      recipientId: student.id || 'student-1',
      content: replyContent.trim(),
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      relatedActivityId: activity?.id,
      tag: tag || '피드백',
    };

    if (sse) {
      sse.sendComplete(teacherMsg);
    } else {
      res.json(teacherMsg);
    }
  } catch (err: any) {
    console.error('Error in live-coach-chat:', err);
    if (sse) {
      sse.sendError(err?.message || '실시간 코칭 채팅 생성 중 오류가 발생했습니다.');
    } else {
      res.status(500).json({ error: '실시간 코칭 채팅 생성 중 오류가 발생했습니다.' });
    }
  }
});

function normalizeWizardCategory(rawCategory: any, subjectName: string = ''): 'math' | 'science' | 'social' | 'korean' | 'english' | 'tech' | null {
  const c = String(rawCategory || '').trim().toLowerCase();
  if (c === 'math' || c.includes('수학') || c.includes('미적분') || c.includes('확률') || c.includes('기하')) return 'math';
  if (c === 'science' || c.includes('과학') || c.includes('물리') || c.includes('화학') || c.includes('생명') || c.includes('지구')) return 'science';
  if (c === 'social' || c.includes('사회') || c.includes('윤리') || c.includes('경제') || c.includes('정치') || c.includes('지리') || c.includes('역사')) return 'social';
  if (c === 'korean' || c.includes('국어') || c.includes('독서') || c.includes('문학') || c.includes('화법') || c.includes('언어')) return 'korean';
  if (c === 'english' || c.includes('영어') || c.includes('영문')) return 'english';
  if (c === 'tech' || c.includes('정보') || c.includes('ai') || c.includes('인공지능') || c.includes('프로그래밍') || c.includes('컴퓨터')) return 'tech';

  const s = String(subjectName || '').trim().toLowerCase();
  if (/수학|미적분|확률과\s*통계|기하/.test(s)) return 'math';
  if (/물리|화학|생명|지구과학|통합과학|융합과학/.test(s)) return 'science';
  if (/사회|경제|윤리|정치와\s*법|지리|역사/.test(s)) return 'social';
  if (/국어|독서|문학|화법과\s*작문|언어와\s*매체|고전/.test(s)) return 'korean';
  if (/영어|영미/.test(s)) return 'english';
  if (/정보|인공지능|프로그래밍|데이터/.test(s)) return 'tech';
  return null;
}

function isSubjectConsistentWithCategory(
  cat: 'math' | 'science' | 'social' | 'korean' | 'english' | 'tech',
  subjectName: string = ''
): boolean {
  const raw = String(subjectName || '').trim();
  if (!raw) return true;
  const head = raw.split('/')[0].trim();
  if (cat === 'math') return /수학|미적분|확률|통계|기하|대수/.test(head) && !/생명과학|통합사회|영어|국어/.test(head);
  if (cat === 'science') return /과학|물리|화학|생명|지구|생물/.test(head) && !/^정보|통합사회|영어|국어/.test(head);
  if (cat === 'social') return /사회|경제|윤리|정치|법|지리|역사|문화/.test(head) && !/생명과학|물리학|영어|국어|미적분/.test(head);
  if (cat === 'korean') return /국어|독서|문학|화법|작문|언어|매체|고전/.test(head) && !/영어|영미|생명과학|미적분|통합사회/.test(head);
  if (cat === 'english') return /영어|영미|영문|english/i.test(head) && !/국어|생명과학|미적분|통합사회|물리학/.test(head);
  if (cat === 'tech') return /정보|인공지능|ai|프로그래밍|데이터|공학|컴퓨터|소프트웨어|알고리즘|로봇/i.test(head) && !/영어|국어|통합사회|생명과학/.test(head);
  return true;
}

function getGrade1CommonSubject(cat: string): string {
  switch (cat) {
    case 'math': return '공통수학';
    case 'science': return '통합과학';
    case 'social': return '통합사회';
    case 'korean': return '공통국어';
    case 'english': return '공통영어';
    default: return '정보';
  }
}

function getGrade3ElectiveSubject(cat: string): string {
  switch (cat) {
    case 'math': return '미적분 / 기하 / 인공지능 수학';
    case 'science': return '진로선택 과학Ⅱ / 융합과학탐구';
    case 'social': return '사회문제 탐구 / 여행지리 / 고전과 윤리';
    case 'korean': return '심화국어 / 고전 읽기';
    case 'english': return '심화 영어 독해와 작문 / 진로 영어';
    default: return '인공지능 기초 / 데이터 과학';
  }
}

// Helper: Generate tailored curriculum units for ALL 6 SUBJECTS dynamically using synthesizeComprehensiveCurriculum
function generateTailoredUnitsForStudent(student: any) {
  const targetCareer = student?.targetCareer || '전문 연구원';
  const targetMajor = student?.targetMajor || '자연과학/공학 계열';
  const mainInterest = student?.mainInterestTopic || '교과 연계 첨단 기술 쟁점';
  const keywords = Array.isArray(student?.interestKeywords) && student.interestKeywords.length > 0
    ? student.interestKeywords.join(', ')
    : '심화 원리, 정량 모델링, 오차 분석';

  const synthesis = synthesizeComprehensiveCurriculum({
    interest: mainInterest,
    targetMajor,
    grade: student?.grade || '고2',
    customKeywords: keywords,
  });

  const catCounters: Record<string, number> = {};

  return synthesis.subjects.map((sub) => {
    const cat = sub.subjectCategory;
    const catIdx = catCounters[cat] || 0;
    catCounters[cat] = catIdx + 1;

    const level: 'basic' | 'advanced' =
      sub.level === 'advanced' || catIdx === 2 ? 'advanced' : 'basic';
    const difficultyRating =
      sub.difficultyRating || (level === 'advanced' ? 5 : catIdx === 0 ? 2 : 3);
    const suitability =
      sub.suitability ||
      (level === 'advanced'
        ? '고2~3 전공 심화 · 정량 모델링 추천'
        : catIdx === 0
        ? '고1~2 교과서 핵심 개념 중심'
        : '고1~2 실생활 사례 · 통계 탐색 추천');

    const concepts = sub.curriculumConcept
      ? sub.curriculumConcept.split(/[/:]/).map((c) => c.trim()).filter(Boolean)
      : ['교과 핵심 원리', '수리적 모델링', '선행 연구 고찰'];

    const recMethodType =
      sub.subjectCategory === 'science'
        ? 'simulation'
        : sub.subjectCategory === 'math' || sub.subjectCategory === 'tech'
        ? 'public_data'
        : sub.subjectCategory === 'social'
        ? 'practical_policy'
        : 'literature';

    return {
      id: `tailored-unit-${cat}-${catIdx}`,
      subjectName: sub.subject,
      subjectCategory: cat,
      level,
      difficultyRating,
      suitability,
      gradeLevel: '고2' as const,
      semester: catIdx % 2 === 0 ? ('1학기' as const) : ('2학기' as const),
      unitName: sub.unitName || sub.topic,
      unitConcepts: concepts.slice(0, 5),
      keyPrinciples: sub.connectionRationale,
      samplePhenomena: [
        sub.inquiryQuestion,
        `${sub.concreteSteps?.[0]?.focus || '핵심 변인 설정'} 및 ${sub.concreteSteps?.[1]?.focus || '이론 고찰'}`,
        `${sub.concreteSteps?.[2]?.focus || '실증 시뮬레이션'}`,
      ],
      isTailored: true,
      tailoredPlan: {
        topicTitle: `[${sub.subject.split(' ')[0]}] ${sub.topic}`,
        inquiryQuestion: sub.inquiryQuestion,
        observedPhenomenon: sub.connectionRationale,
        phenomenaChips: [
          sub.inquiryQuestion,
          sub.concreteSteps?.[0]?.focus || '변인 정의 및 가설 수립',
          sub.concreteSteps?.[1]?.focus || '교과 원리 및 선행 논문 분석',
        ],
        selectedLens: sub.curriculumConcept,
        lensOptions: [
          sub.curriculumConcept,
          '실세계 공공데이터 및 정량 수리 모델링 렌즈',
          '한계 극복 및 사회 윤리·제도적 가이드라인 렌즈',
        ],
        questionOptions: [
          sub.inquiryQuestion,
          sub.concreteSteps?.[0]?.protocol || '핵심 변인 간 인과관계 규명 질문',
          sub.concreteSteps?.[2]?.protocol || '실증 검증 및 오차 분석 질문',
        ],
        recMethod: recMethodType as any,
        clicheTwist: {
          approach: `[차별화 융합] ${sub.subject.split(' ')[0]} 정밀 연계`,
          subTopic: sub.topic,
          academicLens: sub.curriculumConcept,
          inquiryQuestion: sub.inquiryQuestion,
        },
        motivation: (sub.draftRecordSnippet || '').slice(0, 320),
        snowballRoadmap: [
          {
            grade: '1학년 (기초 소양)' as const,
            stageName: '기초 개념 정립 및 문제의식 발굴',
            subject: getGrade1CommonSubject(cat),
            focus: '교과서 기초 원리 탐색',
            topicIdea: `${sub.subject.split('(')[0].trim()} 기초 개념과 '${mainInterest.slice(0, 16)}' 관련 사례 조사`,
            connectionReason: '1학년 공통 교육과정 기초 소양 정립',
          },
          {
            grade: '2학년 (전공 심화)' as const,
            stageName: '현재 탐구 과제 (선택 과목 정밀 연계)',
            subject: sub.subject,
            focus: sub.concreteSteps?.[2]?.protocol || '정량 분석 및 시뮬레이션',
            topicIdea: sub.topic,
            connectionReason: sub.connectionRationale,
          },
          {
            grade: '3학년 (융합 발전)' as const,
            stageName: '차년도 후속 심화 및 융합 과제',
            subject: getGrade3ElectiveSubject(cat),
            focus: '심화 확장 및 메타인지적 검증',
            topicIdea: `${sub.topic.slice(0, 24)}의 한계 극복을 위한 후속 심화 연구`,
            connectionReason: '전공 전문성과 성숙한 연구자적 자질 발전',
          },
        ],
        teacherReviewPoints: {
          academic: sub.recordTip,
          career: `'${targetCareer}' 및 '${targetMajor}' 진학에 요구되는 교과 심화 탐구 역량 입증`,
          community: '탐구 결과를 공동체와 공유하고 사회적 기여 방안을 고민하는 태도',
        },
        relatedBooks: sub.readingRecommendation,
        deliverables: `탐구 분석 보고서 (A4 5매), ${(sub.recommendedTools || []).join(', ')} 결과 시트, 세특 포트폴리오`,
      },
    };
  });
}


// 5-1. API: 6개 교과군(수학, 과학, 사회, 국어, 영어, 정보) 전체 맞춤 단원 생성 API
app.post('/api/ai/wizard-tailor-curriculum', async (req, res) => {
  try {
    const { student = {} } = req.body;
    const targetCareer = student.targetCareer || '전문 연구원';
    const targetMajor = student.targetMajor || '자연과학/공학 계열';
    const mainInterest = student.mainInterestTopic || '교과 연계 첨단 기술 쟁점';

    const defaultTailoredUnits = generateTailoredUnitsForStudent(student);

    if (!hasRealApiKey || !ai) {
      return res.json({
        success: true,
        source: 'database',
        interest: mainInterest,
        targetCareer,
        targetMajor,
        tailoredUnits: defaultTailoredUnits,
      });
    }

    const keywords = Array.isArray(student.interestKeywords)
      ? student.interestKeywords.join(', ')
      : '';
    const preferredSubjects = Array.isArray(student.preferredSubjects)
      ? student.preferredSubjects.join(', ')
      : '';

    const prompt = `당신은 대한민국 고등학교 교육과정 및 학생부종합전형(학종) 전문 컨설턴트입니다.
[학생 프로필]
- 희망 진로: ${targetCareer}
- 목표 학과: ${targetMajor}
- 핵심 관심 분야: ${mainInterest}
- 세부 관심 키워드: ${keywords || '없음'}
- 관심·선택 교과목: ${preferredSubjects || '전 교과 균형'}

6개 교과군(math, science, social, korean, english, tech)별로 각 3개씩(기본 탐구 2개 level:"basic" + 심화 탐구 1개 level:"advanced", 총 18개) 학생의 관심 분야와 해당 고교 교과의 고유 성취기준이 유기적으로 융합된 단원 및 탐구 주제를 생성하세요.

[엄격한 규칙]
1. 각 교과군에는 반드시 해당 교과목(예: english는 영어Ⅰ·영어Ⅱ·심화 영어 독해와 작문 등 순수 영어 교과만, math는 수학·미적분·확률과 통계·기하만) 내용만 작성하고 절대 다른 교과 내용을 섞지 마세요.
2. 각 교과군마다 반드시 level:"basic" 2개와 level:"advanced" 1개 순서를 정확히 지키세요.
3. 기계적 템플릿 문구를 쓰지 말고, '${mainInterest}'(${keywords || '핵심 쟁점'})의 실제 쟁점을 해당 교과 핵심 원리와 결합하세요.

반드시 유효한 JSON 형식으로만 응답하세요:
{
  "units": [
    {
      "subjectCategory": "math",
      "level": "basic",
      "subjectName": "교과목명",
      "unitName": "관심사와 해당 교과 원리가 결합된 완성형 단원·탐구 주제명 (22~38자)",
      "unitConcepts": ["핵심교과개념1", "핵심교과개념2", "핵심교과개념3"],
      "keyPrinciples": "이 교과 원리가 관심사 문제 해결에 쓰이는 학문적 이유 (1문장)",
      "inquiryQuestion": "탐구를 시작하는 핵심 질문 (1문장)",
      "samplePhenomena": ["관찰 현상 및 실증 가설1", "활용 데이터·탐구 도구2", "기대되는 학업 역량3"],
      "readingRecommendation": "《권장도서명》(저자)"
    }
  ]
}`;

    try {
      const parsed = await callGeminiFastJSON(prompt, 32000);

      if (parsed && Array.isArray(parsed.units) && parsed.units.length >= 6) {
        const categories = ['math', 'science', 'social', 'korean', 'english', 'tech'] as const;
        const mergedUnits: any[] = [];
        const nowTs = Date.now();

        for (const cat of categories) {
          const catDefaults = defaultTailoredUnits.filter((d) => d.subjectCategory === cat);
          const catMatches = parsed.units.filter((u: any) => {
            const normCat = normalizeWizardCategory(u?.subjectCategory, u?.subjectName);
            return normCat === cat && isSubjectConsistentWithCategory(cat, u?.subjectName);
          });

          if (catMatches.length === 0) {
            mergedUnits.push(...catDefaults);
            continue;
          }

          // Strictly assemble 3 slots: [basic #1, basic #2, advanced #1]
          const aiBasics = catMatches.filter((u: any) => String(u?.level || '').toLowerCase() !== 'advanced');
          const aiAdvs = catMatches.filter((u: any) => String(u?.level || '').toLowerCase() === 'advanced');
          const usedMatches = new Set<any>();

          const pickMatchForSlot = (slotIdx: number) => {
            if (slotIdx < 2) {
              const b = aiBasics.find((x: any) => !usedMatches.has(x)) || catMatches.find((x: any) => !usedMatches.has(x));
              if (b) {
                usedMatches.add(b);
                return b;
              }
              return null;
            } else {
              const a = aiAdvs.find((x: any) => !usedMatches.has(x)) || catMatches.find((x: any) => !usedMatches.has(x));
              if (a) {
                usedMatches.add(a);
                return a;
              }
              return null;
            }
          };

          for (let mIdx = 0; mIdx < 3; mIdx++) {
            const defUnit = catDefaults[mIdx] || catDefaults[0] || defaultTailoredUnits[0];
            const match = pickMatchForSlot(mIdx);
            const level: 'basic' | 'advanced' = mIdx === 2 ? 'advanced' : 'basic';
            const difficultyRating = level === 'advanced' ? 5 : mIdx === 0 ? 2 : 3;
            const suitability =
              level === 'advanced'
                ? '고2~3 전공 심화 · 정량 모델링 추천'
                : mIdx === 0
                ? '고1~2 교과서 핵심 개념 중심'
                : '고1~2 실생활 사례 · 통계 탐색 추천';

            if (!match) {
              mergedUnits.push({
                ...defUnit,
                id: `ai-unit-${cat}-${mIdx}-${nowTs}`,
                subjectCategory: cat,
                level,
                difficultyRating,
                suitability,
              });
              continue;
            }

            const concepts = Array.isArray(match.unitConcepts) && match.unitConcepts.length > 0
              ? match.unitConcepts
              : defUnit.unitConcepts;
            const phenomena = Array.isArray(match.samplePhenomena) && match.samplePhenomena.length > 0
              ? match.samplePhenomena
              : defUnit.samplePhenomena;
            const resolvedSubjectName = match.subjectName || defUnit.subjectName;
            const resolvedUnitName = match.unitName || defUnit.unitName;
            const subjShort = resolvedSubjectName.split('(')[0].trim();
            const topicTitle = `[${subjShort}] ${resolvedUnitName}`;
            const inquiryQ = match.inquiryQuestion || phenomena[0] || defUnit.tailoredPlan.inquiryQuestion;
            const books = match.readingRecommendation || defUnit.tailoredPlan.relatedBooks;

            mergedUnits.push({
              ...defUnit,
              id: `ai-unit-${cat}-${mIdx}-${nowTs}`,
              subjectCategory: cat,
              level,
              difficultyRating,
              suitability,
              subjectName: resolvedSubjectName,
              unitName: resolvedUnitName,
              unitConcepts: concepts,
              keyPrinciples: match.keyPrinciples || defUnit.keyPrinciples,
              samplePhenomena: phenomena,
              tailoredPlan: {
                ...defUnit.tailoredPlan,
                topicTitle,
                inquiryQuestion: inquiryQ,
                observedPhenomenon: match.keyPrinciples || phenomena[0] || defUnit.tailoredPlan.observedPhenomenon,
                phenomenaChips: phenomena,
                selectedLens: concepts[0] || defUnit.tailoredPlan.selectedLens,
                lensOptions: concepts.length >= 2 ? concepts : defUnit.tailoredPlan.lensOptions,
                questionOptions: [
                  inquiryQ,
                  `${resolvedUnitName} 관점에서 '${mainInterest}'의 핵심 변인을 어떻게 검증할 수 있는가?`,
                  `${resolvedSubjectName}의 교과 원리(${concepts[0] || '핵심 개념'})를 적용한 후속 심화 검증 질문은 무엇인가?`,
                ],
                clicheTwist: {
                  approach: `[차별화 융합] ${subjShort} 정밀 연계`,
                  subTopic: resolvedUnitName,
                  academicLens: concepts[0] || defUnit.tailoredPlan.clicheTwist.academicLens,
                  inquiryQuestion: inquiryQ,
                },
                snowballRoadmap: [
                  {
                    grade: '1학년 (기초 소양)' as const,
                    stageName: '기초 개념 정립 및 문제의식 발굴',
                    subject: getGrade1CommonSubject(cat),
                    focus: '교과서 기초 원리 탐색',
                    topicIdea: `${subjShort} 기초 개념과 '${mainInterest.slice(0, 16)}' 관련 사례 조사`,
                    connectionReason: '1학년 공통 교육과정 기초 소양 정립',
                  },
                  {
                    grade: '2학년 (전공 심화)' as const,
                    stageName: '현재 탐구 과제 (선택 과목 정밀 연계)',
                    subject: resolvedSubjectName,
                    focus: '교과 핵심 원리 적용 및 심화 탐구',
                    topicIdea: resolvedUnitName,
                    connectionReason: match.keyPrinciples || defUnit.keyPrinciples,
                  },
                  {
                    grade: '3학년 (융합 발전)' as const,
                    stageName: '차년도 후속 심화 및 융합 과제',
                    subject: getGrade3ElectiveSubject(cat),
                    focus: '심화 확장 및 메타인지적 검증',
                    topicIdea: `${resolvedUnitName.slice(0, 24)}의 한계 극복을 위한 후속 심화 연구`,
                    connectionReason: '전공 전문성과 성숙한 연구자적 자질 발전',
                  },
                ],
                motivation: `교과 수업 중 [${resolvedSubjectName} - ${resolvedUnitName}] 단원을 학습하며 교과서 이론이 실제 문제에 적용되는 원리에 깊은 호기심을 갖게 됨. 평소 희망해 온 '${targetCareer}' 진로와 '${mainInterest}' 관심사를 교과 핵심 개념(${concepts.slice(0, 2).join(', ')})과 결합해 자기주도적 탐구 과제로 구체화함.`,
                relatedBooks: books,
              },
            });
          }
        }

        return res.json({
          success: true,
          source: 'gemini',
          interest: mainInterest,
          targetCareer,
          targetMajor,
          tailoredUnits: mergedUnits,
        });
      }
    } catch (e) {
      console.warn('Gemini curriculum tailor error, serving fallback:', (e as any)?.message);
    }

    return res.json({
      success: true,
      source: 'database',
      interest: mainInterest,
      targetCareer,
      targetMajor,
      tailoredUnits: defaultTailoredUnits,
    });
  } catch (error) {
    console.error('Error in wizard-tailor-curriculum:', error);
    const { student = {} } = req.body || {};
    return res.json({
      success: true,
      source: 'database',
      interest: student.mainInterestTopic || '교과 연계 첨단 기술 쟁점',
      tailoredUnits: generateTailoredUnitsForStudent(student),
    });
  }
});

// 5-2. API: CurriculumInquiryWizard 단일 단원 5단계 심화 최적화
app.post('/api/ai/wizard-tailor', async (req, res) => {
  const { student = {}, unitId = '', unitName = '', subjectName = '', category = '' } = req.body;

  const targetCareer = student.targetCareer || '전문 연구원';
  const targetMajor = student.targetMajor || '자연과학/공학 계열';
  const mainInterest = student.mainInterestTopic || '교과 연계 첨단 기술 쟁점';
  const requestedCat = normalizeWizardCategory(category || req.body.unit?.subjectCategory, subjectName);

  const defaultUnits = generateTailoredUnitsForStudent(student);
  const matchedUnit = defaultUnits.find(
    (u) =>
      u.id === unitId ||
      u.subjectName === subjectName ||
      (requestedCat && u.subjectCategory === requestedCat)
  ) || defaultUnits[0];

  const fallbackPlan = matchedUnit.tailoredPlan;

  try {
    if (!hasRealApiKey || !ai) {
      return res.json({ success: true, source: 'database', plan: fallbackPlan });
    }

    const prompt = `대한민국 고등학교 학생부종합전형(학종) 전문 컨설턴트로서, 아래 학생의 진로와 관심사에 맞추어 '교과 단원 연계 5단계 탐구 길잡이' 전체 내용을 간결하고 밀도 있게 작성해주세요.

[학생 프로필]
- 진로 희망(목표 직업): ${targetCareer}
- 목표 학과: ${targetMajor}
- 핵심 관심 연구 분야 / 최근 호기심: ${mainInterest}
- 현재 선택된 단원: ${unitName} (${subjectName})

반드시 '${mainInterest}'의 실제 핵심 이슈와 '${subjectName}' 교과 단원 원리를 구체적으로 결합하여 작성하세요 (기계적 템플릿 치환 금지).

다음 JSON 형식으로만 응답해주세요:
{
  "topicTitle": "구체적이고 학술적인 탐구 주제명 ([교과명] 포함)",
  "inquiryQuestion": "학생의 관심사와 단원 개념이 결합된 핵심 탐구 질문 1개",
  "observedPhenomenon": "현상 관찰 진술문 (1~2문장)",
  "phenomenaChips": ["맞춤 관찰 현상 예시 1", "맞춤 관찰 현상 예시 2", "맞춤 관찰 현상 예시 3"],
  "selectedLens": "대표 학문적 렌즈",
  "lensOptions": ["학문적 렌즈 1", "학문적 렌즈 2", "학문적 렌즈 3"],
  "questionOptions": ["핵심 질문 옵션 1", "핵심 질문 옵션 2", "핵심 질문 옵션 3"],
  "recommendedMethodology": "simulation | public_data | literature | practical_policy",
  "clicheTwist": {
    "approach": "[차별화 접근법 명칭]",
    "subTopic": "비틀기 세부 주제명",
    "academicLens": "적용 학문적 렌즈",
    "inquiryQuestion": "차별화된 심화 질문"
  },
  "motivation": "교과 수업 중 호기심과 학생의 진로를 연결한 구체적인 탐구 동기 (200~280자)",
  "snowballRoadmap": [
    {
      "grade": "1학년 (기초 소양)",
      "stageName": "기초 개념 정립 및 문제의식 발굴",
      "subject": "통합교과",
      "focus": "기초 원리 탐색",
      "topicIdea": "1학년 연계 주제 아이디어",
      "connectionReason": "연계 이유"
    },
    {
      "grade": "2학년 (전공 심화)",
      "stageName": "현재 탐구 과제",
      "subject": "${subjectName}",
      "focus": "정량 심화 분석",
      "topicIdea": "2학년 현재 주제 아이디어",
      "connectionReason": "연계 이유"
    },
    {
      "grade": "3학년 (융합 발전)",
      "stageName": "차년도 후속 심화 과제",
      "subject": "진로선택/융합교과",
      "focus": "한계 극복 및 후속 연구",
      "topicIdea": "3학년 후속 주제 아이디어",
      "connectionReason": "연계 이유"
    }
  ],
  "teacherReviewPoints": {
    "academic": "학업역량 세특 기재 포인트",
    "career": "진로역량 세특 기재 포인트",
    "community": "공동체역량 세특 기재 포인트"
  },
  "relatedBooks": "도서 2권 (예: 《도서명》(저자))",
  "deliverables": "구체적 산출물 명칭"
}`;

    const parsed = await callGeminiFastJSON(prompt, 25000);

    return res.json({ success: true, source: 'gemini', plan: parsed });
  } catch (error) {
    console.error('Error in wizard-tailor, serving fallback:', (error as any)?.message || error);
    return res.json({ success: true, source: 'database', plan: fallbackPlan });
  }
});

// Helper to transform casual or raw curiosity sentences into a refined high-school academic research phrase
function cleanAndRefineInterestToAcademicTerm(
  rawInterest: string,
  concept: string,
  subjectGroup: string,
  methodology: string,
  additionalKeyword?: string
): string {
  // Strip conversational endings and question markers
  const text = (rawInterest || '전공 연계 교과 융합 탐구')
    .trim()
    .replace(/[?？!！"'"'“”\[\]\(\)\{\}]/g, ' ')
    .replace(
      /(궁금해요|궁금합니다|궁금함|알고 싶어요|알고 싶음|알고싶다|알아보고 싶다|알아보고 싶음|왜 그런지|어떤 원리인지|어떻게 되는지|어떻게 될까|어떤 영향을 미칠까|이유가 뭘까|이유는 무엇일까)/g,
      ' '
    )
    .replace(/(에 대해|에 대한|에 관하여|관련해서|관련하여|관련된|바탕으로|활용하여|중심으로|을 통해|를 통해)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanConcept = (concept || '교과 핵심 개념').replace(/\s*\(.*?\)/g, '').trim();
  const cleanMethod = (methodology || '실증 분석').split('-')[0].split('(')[0].trim();
  const condText = additionalKeyword?.trim() ? ` (${additionalKeyword.trim()} 변인)` : '';

  // Extract core keywords
  const tokens = text.split(' ').filter((t) => t.length >= 2);
  const coreNoun = tokens.length > 0 ? tokens.slice(0, 3).join(' ') : text;

  // Fully dynamic academic title synthesized from all 3 user choices:
  return `${cleanConcept} 원리를 적용한 ${coreNoun}의 ${cleanMethod} 기반 심화 메커니즘 규명${condText}`;
}

// Helper for offline fallback for Question Refinement Wizard
function generateFallbackRefinedQuestions(
  interest: string,
  targetMajor: string,
  subjectGroup: string,
  curriculumConcept: string,
  methodology: string,
  additionalKeyword?: string,
  methodologyDetails?: string
) {
  const cleanConcept = (curriculumConcept || '교과 핵심 원리 및 변화율').replace(/\s*\(.*?\)/g, '').trim();
  const cleanMethod = (methodology || '실증 분석').split('-')[0].trim();
  const academicTopic = cleanAndRefineInterestToAcademicTerm(
    interest,
    cleanConcept,
    subjectGroup,
    cleanMethod,
    additionalKeyword
  );

  return {
    synthesizedAcademicTopic: academicTopic,
    refinedQuestions: [
      {
        id: 'q-ref-1-hypothesis',
        type: 'hypothesis' as const,
        typeLabel: '가설 검증형 (Empirical Hypothesis)',
        title: `${cleanConcept} 원리를 적용한 ${academicTopic} 상관성 실증 분석`,
        question: `${cleanConcept}의 조작 변인 제어가 ${academicTopic} 현상의 신뢰성 및 반응 효율에 어떠한 정량적 영향을 미치는가?`,
        hypothesis: `${cleanConcept} 관련 조작 변인의 수치를 체계적으로 제어할수록 ${academicTopic}의 오차율이 통계적으로 유의미하게 감소할 것이다.`,
        variables: {
          independent: `${cleanConcept} 관련 정량적 제어 변수 (조건별 차등 제어)`,
          dependent: `${academicTopic}의 측정 결과값 (인식률, 에너지 전환율, 오차율)`,
          control: '주변 환경 변수(온도, 샘플 크기, 측정 주기, 수집 기간)',
        },
        stepByStepProcedure: [
          '1단계: 교육과정 성취기준 연계 학술 문헌 조사 및 구체적 인과 가설 수립',
          `2단계: '${cleanMethod}' 도구를 활용한 원천 데이터셋 정제 및 측정/실험 환경 세팅`,
          '3단계: 변인 통제 하에 조건별 반복 측정 및 통계적 유의성 검증(p-value, R²)',
          '4단계: 정량 데이터 시각화, 결론 도출 및 탐구의 한계점과 후속 과제 작성',
        ],
        recommendedDataOrTools: [
          cleanMethod.includes('데이터') ? '공공데이터포털(data.go.kr)' : '정밀 계측 센서(MBL/아두이노)',
          'Python (pandas, seaborn) 또는 Excel 고급 통계 분석 패키지',
          '학술 연구 정보 포털(RISS / KCI 논문)',
        ],
        curriculumAchievementCode: `[2022/2015 교육과정] ${cleanConcept} 관련 성취기준 연계`,
        expectedDraftRecordSnippet: `교과 수업 중 학습한 '${cleanConcept}'의 메커니즘을 심화 탐구하기 위해, '${academicTopic}' 과제를 기획함. ${cleanMethod} 기법을 적용해 변인 간 상관관계를 정량적으로 검증하고 과학적 가설을 입증하는 탁월한 자기주도적 연구 역량을 발휘함.`,
      },
      {
        id: 'q-ref-2-modeling',
        type: 'modeling' as const,
        typeLabel: '수리·알고리즘 모델링형 (Mathematical Modeling)',
        title: `${academicTopic} 최적화를 위한 ${cleanConcept} 기반 수리적 근사 모델 설계`,
        question: `${cleanConcept}의 수학적 함수 및 변화율 관계식을 도입하여 ${academicTopic}의 성능을 최적화하는 수리 모델을 수립할 수 있는가?`,
        hypothesis: `${cleanConcept}의 미적분학적 극값 도출 또는 통계적 확률 분포를 반영한 수리 알고리즘이 기존의 경험적 방식보다 예측 정확도를 향상시킬 것이다.`,
        variables: {
          independent: '수리 모델에 입력되는 가중치 파라미터 및 초기 임계값',
          dependent: '수리 모델의 오차 수렴 속도 및 목표 지표 최적화 달성률',
          control: '알고리즘 연산 환경 및 입력 데이터 표준화 규격',
        },
        stepByStepProcedure: [
          `1단계: ${academicTopic} 대상 시스템의 물리적 메커니즘을 ${cleanConcept} 개념으로 기호화`,
          '2단계: 기하학적 그래프 툴(GeoGebra) 또는 코딩을 활용한 수식 시뮬레이션 환경 구축',
          '3단계: 다양한 파라미터 조건에서의 출력 결과 비교 및 최적 극값(극대/극소) 산출',
          '4단계: 실제 측정치와 모델 예측치 간의 잔차 분석 및 모델 보정 작업 수행',
        ],
        recommendedDataOrTools: [
          'GeoGebra / Desmos 수학 모델링 소프트웨어',
          'Python NumPy / SciPy 수치해석 시뮬레이션 환경',
          '캐글(Kaggle) 오픈 데이터셋',
        ],
        curriculumAchievementCode: `[2022/2015 교육과정] ${cleanConcept} 수학적 모델링 및 문제해결`,
        expectedDraftRecordSnippet: `'${academicTopic}'의 기술적 난제를 해결하기 위해 ${cleanConcept} 개념을 수리적으로 모델링함. 수학적 관계식을 정립하고 컴퓨터 시뮬레이션을 통해 최적화 조건을 산출해 냈으며, 수학적 개념을 실제 공학적 문제에 응용하는 융합적 사고력을 과시함.`,
      },
      {
        id: 'q-ref-3-critical',
        type: 'critical' as const,
        typeLabel: '비판적 대안 제시형 (Critical Problem-Solving)',
        title: `${academicTopic}의 현존 한계점 극복을 위한 ${cleanConcept} 관점의 대안 메커니즘 검토`,
        question: `${academicTopic}의 기존 상용화 방식이나 선행 연구가 지닌 한계점을 ${cleanConcept}의 메커니즘을 통해 어떻게 보완·개선할 수 있는가?`,
        hypothesis: `기존 방식의 취약 지점에 ${cleanConcept} 원리를 결합할 경우, 시스템 오작동률 또는 사회적 부작용을 유의미하게 개선할 수 있을 것이다.`,
        variables: {
          independent: '개선 메커니즘 적용 여부 및 대안 설계 프로토콜',
          dependent: '시스템 내구성, 인식 정확도 향상 비율 또는 부작용 완화도',
          control: '비교 기준이 되는 기존 표준 프로토콜 환경',
        },
        stepByStepProcedure: [
          `1단계: 선행 논문 3편 분석을 통해 ${academicTopic}의 기술적·학문적 한계점 규명`,
          `2단계: '${cleanConcept}' 교과 지식을 응용한 대안 메커니즘 및 개선 가설 설계`,
          `3단계: '${cleanMethod}'를 활용한 기존 방식 vs 개선 대안 간 정량 비교 시뮬레이션`,
          '4단계: 공학적/사회적 타당성 평가 및 실제 고교 수준 실천 방안 보고서 작성',
        ],
        recommendedDataOrTools: [
          '학술 연구 정보 포털(RISS / DBpia / ScienceDirect)',
          '비교 분석 매트릭스 및 A/B 테스트 시뮬레이터',
          '국가 기술 표준 및 정책 연구 보고서',
        ],
        curriculumAchievementCode: `[2022/2015 교육과정] ${cleanConcept} 비판적 평가 및 대안 창출`,
        expectedDraftRecordSnippet: `'${academicTopic}' 분야의 기존 기술적 한계에 비판적 문제의식을 품고, ${cleanConcept}의 원리를 재해석하여 실질적인 보완책을 제시함. 선행 문헌을 다각도로 비교 분석하여 대안을 설계하는 깊이 있는 학문적 성찰력이 돋보임.`,
      },
    ],
  };
}

// 6. API: 주제 지도 · 질문 좁히기 3단계 유도 위저드 (Topic Refinement & Hypothesis Generation)
app.post('/api/ai/refine-inquiry-question', async (req, res) => {
  try {
    const {
      interest = '인공지능 및 데이터 분석',
      targetMajor = '공학/자연과학 계열',
      subjectGroup = 'science',
      curriculumConcept = '파동과 정보 전달',
      methodology = '공공데이터 & 통계 분석',
      methodologyDetails = '',
      studentGrade = '고등학교 2학년',
      additionalKeyword = '',
    } = req.body || {};

    const fallbackResult = generateFallbackRefinedQuestions(
      interest,
      targetMajor,
      subjectGroup,
      curriculumConcept,
      methodology,
      additionalKeyword,
      methodologyDetails
    );

    if (!hasRealApiKey || !ai) {
      return res.json({
        success: true,
        source: 'database',
        synthesizedAcademicTopic: fallbackResult.synthesizedAcademicTopic,
        adviceForStudent: `선생님의 지도 조언: 초기 호기심('${interest}')을 교육과정 속 '${curriculumConcept}' 개념 및 '${methodology}' 방법론과 결합하여, 단순 조사를 탈피하고 인과 가설과 수리적 절차를 갖춘 심화 학술 연구 질문으로 재구성했습니다.`,
        refinedQuestions: fallbackResult.refinedQuestions,
      });
    }

    const prompt = `당신은 대한민국 고등학교 학생부 종합전형(학종) 전문 진로진학 수석 컨설턴트이자 교과 교육과정 전문가입니다.
반드시 아래 제공된 3가지 핵심 요소를 종합 융합하여, 완전히 새로운 학술 연구 주제명(synthesizedAcademicTopic)과 3대 심화 탐구 질문을 생성해주세요:

[입력 요소 3대 축]
1. 학생의 초기 관심사/키워드: "${interest}"
2. 연계 고교 교과 및 단원 개념: "${subjectGroup}" 교과 - "${curriculumConcept}"
3. 선택한 실증 방법론 및 도구: "${methodology}" (${methodologyDetails || ''})
${additionalKeyword ? `4. 추가 가설/조건 변수: "${additionalKeyword}"` : ''}
- 학생 희망 전공: ${targetMajor} (${studentGrade})

[★★ 필수 규칙: 3대 축 종합 신규 생성 ★★]
1. 【특정 예시 고정 출력 절대 금지】: 이전에 쓰였던 '자율주행 악천후 센서 보정' 같은 특정 예시 문장을 절대로 고정해서 출력하지 마십시오!
2. 【3대 축 유기적 융합】: 오직 사용자가 전달한 [1. 관심사: ${interest}], [2. 교과 단원 개념: ${curriculumConcept}], [3. 실증 방법론: ${methodology}] 3가지를 정확히 결합하여, 학생부종합전형에서 대학 교수 및 입학사정관이 최고 등급(A+)으로 평가할 수 있는 독창적인 연구 주제를 새로 만들어야 합니다.
   - 예시 A: 관심사 '소비자 마케팅' + 교과 '확률과 통계(조건부확률)' + 방법론 '빅데이터' -> '온라인 이커머스 고객 로그 데이터에서 베이즈 정리를 활용한 소비자 이탈 확률 정량 추정'
   - 예시 B: 관심사 '인천 원도심 쇠퇴' + 교과 '통합사회(공간 불평등)' + 방법론 'GIS 공간정보' -> '인천 원도심 젠트리피케이션 지역의 지가 변동과 상권 생태계 공간 분포의 QGIS 버퍼링 분석'
   - 예시 C: 관심사 '친환경 에너지' + 교과 '미적분(극대·극소)' + 방법론 '컴퓨터 시뮬레이션' -> '계절별 태양 고도각 변화에 따른 태양광 패널의 수광량 극대화 곡률 수리 모델링'
3. 'synthesizedAcademicTopic'은 3대 축이 유기적으로 결합된 완성형 학술 연구 주제명(1문장)이어야 합니다.
4. 도출되는 3대 질문의 제목, 질문 문장, 가설, 변인 구조(독립, 종속, 통제), 4단계 절차, 추천 도구, 성취기준, 세특 문안(150자)은 모두 완성된 한국어 학술 문장이어야 합니다.
5. 교육부 기재요령(소논문, R&E 등 금지어 배제)을 철저히 준수하십시오.

반드시 유효한 JSON 형식으로 응답하세요:
{
  "synthesizedAcademicTopic": "3대 축이 결합된 새롭고 완성도 높은 학술 연구 주제명 (1문장)",
  "adviceForStudent": "선생님의 1:1 지도 코멘트 (왜 이 3가지 요소를 결합하여 질문을 재구성했는지 학생에게 주는 조언 2문장)",
  "refinedQuestions": [
    {
      "id": "q-ref-1-hypothesis",
      "type": "hypothesis",
      "typeLabel": "가설 검증형 (Empirical Hypothesis)",
      "title": "좁혀진 심화 탐구 주제명",
      "question": "핵심 탐구 질문 (~인가? 또는 ~에 어떠한 영향을 미치는가? 형식의 완성된 학술 질문)",
      "hypothesis": "연구 가설 (~할수록 ~할 것이다 형식)",
      "variables": {
        "independent": "조작/독립변수 (구체적)",
        "dependent": "종속/결과변수 (구체적)",
        "control": "통제변수"
      },
      "stepByStepProcedure": [
        "1단계: 사전 학술 문헌 탐색 및 구체적 가설 설정",
        "2단계: 데이터셋 정제 및 측정/실험 환경 세팅",
        "3단계: 변인 통제 하 정량 분석 및 유의성 검증",
        "4단계: 결론 도출 및 한계점, 후속 탐구 과제 정리"
      ],
      "recommendedDataOrTools": ["도구/데이터1", "도구/데이터2", "소프트웨어3"],
      "curriculumAchievementCode": "[12교과00-00] 핵심 성취기준",
      "expectedDraftRecordSnippet": "학교생활기록부 교과세특 예상 기재 문안 (150자 내외)"
    },
    {
      "id": "q-ref-2-modeling",
      "type": "modeling",
      "typeLabel": "수리·알고리즘 모델링형 (Mathematical Modeling)",
      "title": "수리 모델링 탐구 주제명",
      "question": "핵심 탐구 질문",
      "hypothesis": "연구 가설",
      "variables": {
        "independent": "입력 파라미터",
        "dependent": "목표 출력값",
        "control": "알고리즘 환경"
      },
      "stepByStepProcedure": [
        "1단계: 현상 수식화 및 변수 정의",
        "2단계: 컴퓨터 시뮬레이션 환경 구축",
        "3단계: 파라미터 변화에 따른 최적화 극값 산출",
        "4단계: 오차율 분석 및 모델 정밀도 검증"
      ],
      "recommendedDataOrTools": ["도구/데이터1", "소프트웨어2"],
      "curriculumAchievementCode": "[12교과00-00] 핵심 성취기준",
      "expectedDraftRecordSnippet": "학교생활기록부 교과세특 예상 기재 문안 (150자 내외)"
    },
    {
      "id": "q-ref-3-critical",
      "type": "critical",
      "typeLabel": "비판적 대안 제시형 (Critical Problem-Solving)",
      "title": "비판적 개선 탐구 주제명",
      "question": "핵심 탐구 질문",
      "hypothesis": "연구 가설",
      "variables": {
        "independent": "개선 대안 적용 여부",
        "dependent": "성능 개선율 또는 부작용 완화도",
        "control": "비교 기준 표준 프로토콜"
      },
      "stepByStepProcedure": [
        "1단계: 선행 연구 한계점 분석",
        "2단계: 교과 원리 기반 대안 메커니즘 설계",
        "3단계: 기존 방식 vs 대안 방식 비교 검증",
        "4단계: 타당성 검토 및 실천 방안 제시"
      ],
      "recommendedDataOrTools": ["도구/데이터1", "도구/데이터2"],
      "curriculumAchievementCode": "[12교과00-00] 핵심 성취기준",
      "expectedDraftRecordSnippet": "학교생활기록부 교과세특 예상 기재 문안 (150자 내외)"
    }
  ]
}`;

    let responseText = '';
    const modelsToTry = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    for (const modelName of modelsToTry) {
      try {
        const generatePromise = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI request timeout')), 45000)
        );
        const resp = await Promise.race([generatePromise, timeoutPromise]);
        if (resp.text) {
          responseText = resp.text;
          break;
        }
      } catch (mErr: any) {
        console.warn(`Model ${modelName} in refine-inquiry-question failed, trying next:`, mErr?.message || mErr);
      }
    }

    if (!responseText) {
      throw new Error('All AI models failed or exceeded quota');
    }

    const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.json({
      success: true,
      source: 'gemini',
      synthesizedAcademicTopic: parsed.synthesizedAcademicTopic || fallbackResult.synthesizedAcademicTopic,
      adviceForStudent:
        parsed.adviceForStudent ||
        '교과 개념과 실증 분석 도구를 결합하여 학술적 깊이를 극대화한 탐구 질문입니다.',
      refinedQuestions: parsed.refinedQuestions || fallbackResult.refinedQuestions,
    });
  } catch (error) {
    console.error('Error in refine-inquiry-question, serving fallback:', (error as any)?.message || error);
    const {
      interest = '',
      targetMajor = '',
      subjectGroup = 'science',
      curriculumConcept = '',
      methodology = '',
      methodologyDetails = '',
      additionalKeyword = '',
    } = req.body || {};
    const fallbackResult = generateFallbackRefinedQuestions(
      interest,
      targetMajor,
      subjectGroup,
      curriculumConcept,
      methodology,
      additionalKeyword,
      methodologyDetails
    );
    return res.json({
      success: true,
      source: 'database',
      synthesizedAcademicTopic: fallbackResult.synthesizedAcademicTopic,
      adviceForStudent: `선생님의 지도 조언: 초기 호기심('${interest}')을 교육과정 속 '${curriculumConcept}' 개념 및 '${methodology}' 방법론과 결합하여, 단순 조사를 탈피하고 인과 가설과 수리적 절차를 갖춘 심화 학술 연구 질문으로 재구성했습니다.`,
      refinedQuestions: fallbackResult.refinedQuestions,
    });
  }
});

// 7. API: 맞춤형 3개년 진로 로드맵 실시간 AI 생성 (Gemini 고속 JSON 체인)
app.post('/api/ai/generate-roadmap', async (req, res) => {
  try {
    const { student = {} } = req.body || {};
    const studentId = student.id || 'ai';
    const targetCareer = student.targetCareer || '전문 연구원';
    const targetMajor = student.targetMajor || '관련 전공 계열';
    const mainInterest = student.mainInterestTopic || '교과 연계 심화 탐구';
    const keywords = Array.isArray(student.interestKeywords)
      ? student.interestKeywords.join(', ')
      : '';
    const preferredSubjects = Array.isArray(student.preferredSubjects)
      ? student.preferredSubjects.join(', ')
      : '';
    const grade = student.grade || '고등학교 2학년';

    const buildFallbackMilestones = () => {
      const slots: Array<{
        gradeSemester: '1학년 1학기' | '1학년 2학기' | '2학년 1학기' | '2학년 2학기' | '3학년 1학기';
        stage: '기초 탐색기' | '심화 탐구기' | '융합 발전기';
        category: '교과세특' | '동아리' | '진로탐색' | '심화독서';
        linkedSubject: string;
      }> = [
        { gradeSemester: '1학년 1학기', stage: '기초 탐색기', category: '교과세특', linkedSubject: '통합사회/통합과학' },
        { gradeSemester: '1학년 1학기', stage: '기초 탐색기', category: '심화독서', linkedSubject: '국어/독서' },
        { gradeSemester: '1학년 2학기', stage: '기초 탐색기', category: '동아리', linkedSubject: '동아리활동' },
        { gradeSemester: '1학년 2학기', stage: '기초 탐색기', category: '진로탐색', linkedSubject: '진로활동' },
        { gradeSemester: '2학년 1학기', stage: '심화 탐구기', category: '교과세특', linkedSubject: '선택 교과 심화' },
        { gradeSemester: '2학년 1학기', stage: '심화 탐구기', category: '심화독서', linkedSubject: '전공/독서' },
        { gradeSemester: '2학년 2학기', stage: '심화 탐구기', category: '교과세특', linkedSubject: '수리/통계 융합' },
        { gradeSemester: '2학년 2학기', stage: '심화 탐구기', category: '동아리', linkedSubject: '동아리활동' },
        { gradeSemester: '3학년 1학기', stage: '융합 발전기', category: '교과세특', linkedSubject: '진로선택/과제연구' },
        { gradeSemester: '3학년 1학기', stage: '융합 발전기', category: '진로탐색', linkedSubject: '진로활동' },
      ];
      return slots.map((s, idx) => ({
        id: `road-${studentId}-${idx + 1}`,
        gradeSemester: s.gradeSemester,
        stage: s.stage,
        category: s.category,
        title: `${s.linkedSubject}: ${mainInterest} 중심 ${s.stage} ${s.category} 탐구`,
        description: `'${targetCareer}' 진로와 '${mainInterest}' 주제를 연결하여 ${s.gradeSemester} ${s.category} 단계에서 핵심 이론과 실증 사례를 탐구합니다.`,
        status: idx < 4 ? 'completed' : idx < 7 ? 'in_progress' : 'planned',
        keyCompetency: idx < 4 ? '학업역량 (기초 탐구)' : idx < 7 ? '진로역량 (전공 심화)' : '융합발전역량 (문제 해결)',
        linkedSubject: s.linkedSubject,
      }));
    };

    if (!hasRealApiKey || !ai) {
      return res.json({
        success: true,
        source: 'database',
        milestones: buildFallbackMilestones(),
      });
    }

    const prompt = `당신은 대한민국 고등학교 학생부종합전형(학종) 전문 수석 컨설턴트입니다.
아래 학생의 진로와 관심사·키워드를 바탕으로, 고교 3개년(1학년 1학기~3학년 1학기) 동안 지적 호기심이 점진적으로 심화(스노우볼 효과)되는 **10단계 맞춤형 진로 로드맵**을 JSON으로 설계하세요.

[학생 프로필]
- 현재 학년: ${grade}
- 목표 직업(희망 진로): ${targetCareer}
- 목표 학과: ${targetMajor}
- 핵심 연구 관심 분야: "${mainInterest}"
- 세부 관심 키워드: ${keywords || '없음'}
- 관심·선택 교과목: ${preferredSubjects || '전 교과 균형'}

[필수 설계 규칙 — 반드시 준수]
1. 【기계적 키워드 끼워넣기 금지】: "'${mainInterest}' 관련 기본권 충돌...", "'${mainInterest}'의 사회적 영향..." 같은 판에 박힌 일반 템플릿 문장에 관심사 단어만 끼워 넣지 마세요. 반드시 "${mainInterest}"와 "${keywords}"의 실제 구체적 쟁점(제도·통계·실험·알고리즘·윤리·정책·현장 문제)을 고교 교과 개념과 결합한 고유한 과제를 작성하세요.
2. 【정확한 10개 슬롯 구성】: 아래 10개 학기/영역 배치 순서를 정확히 지키세요:
   - 1) 1학년 1학기 | 기초 탐색기 | 교과세특
   - 2) 1학년 1학기 | 기초 탐색기 | 심화독서 (실제 존재하는 도서명과 저자 표기)
   - 3) 1학년 2학기 | 기초 탐색기 | 동아리
   - 4) 1학년 2학기 | 기초 탐색기 | 진로탐색
   - 5) 2학년 1학기 | 심화 탐구기 | 교과세특
   - 6) 2학년 1학기 | 심화 탐구기 | 심화독서 (실제 존재하는 전공 연계 도서명과 저자 표기)
   - 7) 2학년 2학기 | 심화 탐구기 | 교과세특
   - 8) 2학년 2학기 | 심화 탐구기 | 동아리
   - 9) 3학년 1학기 | 융합 발전기 | 교과세특
   - 10) 3학년 1학기 | 융합 발전기 | 진로탐색
3. 【교육부 기재요령 준수】: '소논문', 'R&E', 외부 경시대회 등 학생부 금지 표현을 쓰지 마세요.
4. 각 과제는 군더더기 없이 간결·명확하게 작성하세요.

반드시 유효한 JSON으로만 응답하세요:
{
  "milestones": [
    {
      "gradeSemester": "1학년 1학기",
      "stage": "기초 탐색기",
      "category": "교과세특",
      "linkedSubject": "구체적 고교 교과목명 또는 활동명",
      "title": "구체적 교과/활동 탐구 과제 제목 (25~45자)",
      "description": "구체적 탐구 절차, 사용 데이터·도구 또는 도서 핵심 쟁점 (1~2문장)",
      "keyCompetency": "학업역량 / 진로역량 / 공동체역량 중 핵심 입증 포인트 (괄호 포함 15~30자)"
    }
  ]
}`;

    const parsed = await callGeminiFastJSON(prompt, 25000);
    const rawList = Array.isArray(parsed?.milestones) ? parsed.milestones : [];
    if (rawList.length < 6) {
      throw new Error('Gemini returned insufficient roadmap milestones');
    }

    const validSemesters = ['1학년 1학기', '1학년 2학기', '2학년 1학기', '2학년 2학기', '3학년 1학기'] as const;
    const validStages = ['기초 탐색기', '심화 탐구기', '융합 발전기'] as const;
    const validCategories = ['교과세특', '동아리', '진로탐색', '심화독서'] as const;
    const slotDefaults: Array<{
      gradeSemester: (typeof validSemesters)[number];
      stage: (typeof validStages)[number];
      category: (typeof validCategories)[number];
    }> = [
      { gradeSemester: '1학년 1학기', stage: '기초 탐색기', category: '교과세특' },
      { gradeSemester: '1학년 1학기', stage: '기초 탐색기', category: '심화독서' },
      { gradeSemester: '1학년 2학기', stage: '기초 탐색기', category: '동아리' },
      { gradeSemester: '1학년 2학기', stage: '기초 탐색기', category: '진로탐색' },
      { gradeSemester: '2학년 1학기', stage: '심화 탐구기', category: '교과세특' },
      { gradeSemester: '2학년 1학기', stage: '심화 탐구기', category: '심화독서' },
      { gradeSemester: '2학년 2학기', stage: '심화 탐구기', category: '교과세특' },
      { gradeSemester: '2학년 2학기', stage: '심화 탐구기', category: '동아리' },
      { gradeSemester: '3학년 1학기', stage: '융합 발전기', category: '교과세특' },
      { gradeSemester: '3학년 1학기', stage: '융합 발전기', category: '진로탐색' },
    ];

    const nowTs = Date.now();
    const milestones = rawList.slice(0, 10).map((m: any, idx: number) => {
      const def = slotDefaults[idx] || slotDefaults[slotDefaults.length - 1];
      const gradeSemester = validSemesters.includes(m.gradeSemester) ? m.gradeSemester : def.gradeSemester;
      const stage = validStages.includes(m.stage) ? m.stage : def.stage;
      const category = validCategories.includes(m.category) ? m.category : def.category;
      const status = idx < 4 ? 'completed' : idx < 7 ? 'in_progress' : 'planned';

      return {
        id: `road-${studentId}-${idx + 1}-${nowTs}`,
        gradeSemester,
        stage,
        category,
        title: String(m.title || `${mainInterest} ${category} 탐구`).trim(),
        description: String(m.description || '').trim(),
        status,
        keyCompetency: String(m.keyCompetency || '진로역량 (전공 연계 심화 탐구)').trim(),
        linkedSubject: m.linkedSubject ? String(m.linkedSubject).trim() : undefined,
      };
    });

    return res.json({
      success: true,
      source: 'gemini',
      milestones,
    });
  } catch (error) {
    console.error('Error in generate-roadmap, serving fallback:', (error as any)?.message || error);
    const student = req.body?.student || {};
    const mainInterest = student.mainInterestTopic || '교과 연계 탐구';
    const targetCareer = student.targetCareer || '전문 연구원';
    return res.status(500).json({
      success: false,
      source: 'database',
      error: `AI 로드맵 생성 중 일시적 오류 (${targetCareer} / ${mainInterest})`,
    });
  }
});

// Mount Vite in dev mode or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`학종나침반 (Hakjong Compass) server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
