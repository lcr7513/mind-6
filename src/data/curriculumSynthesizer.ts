import type { MindMapNode, SubjectCategory, SubjectInquiryTopic, InquiryLevel } from '../types/index.ts';

export interface ComprehensiveSubjectPlan {
  id?: string;
  subject: string;
  subjectCategory: SubjectCategory;
  level: InquiryLevel;
  levelLabel: string;
  difficultyRating: number;
  suitability: string;
  curriculumConcept: string;
  unitName?: string;
  topic: string;
  inquiryQuestion: string;
  connectionRationale: string;
  methodology: string;
  recommendedTools: string[];
  readingRecommendation: string;
  recordTip: string;
  draftRecordSnippet: string;
  concreteSteps: {
    stepNum: number;
    stepName: string;
    focus: string;
    protocol: string;
    tools: string[];
  }[];
}

export interface ComprehensiveCurriculumResult {
  majorOverview: string;
  connectionSummary: string;
  subjects: SubjectInquiryTopic[];
  mindmap: MindMapNode;
}

// Domain detection helper
export function detectDomainProfiles(text: string) {
  const lower = text.toLowerCase();

  return {
    isGeographyOrUrban: /지역|도시|공간|지리|불평등|인구소멸|소멸|도시계획|행정|지방|인프라|국토|교통|정주|소외|주거|슬럼|젠트리피케이션|국토교통|생활권|거점/i.test(lower),
    isBio: /생명|바이오|유전자|crispr|크리스퍼|의약|단백질|세포|의예|약학|간호|면역|치료|dna|rna|질환|뇌|신경|효소/i.test(lower),
    isAi: /ai|인공지능|컴퓨터|소프트웨어|알고리즘|머신러닝|딥러닝|빅데이터|코딩|데이터|언어모델|llm|트랜스포머|로봇/i.test(lower),
    isBatteryOrSemiconductor: /배터리|이차전지|전고체|반도체|리소그래피|양자|소재|신소재|나노|물성|회로|집적/i.test(lower),
    isEnvOrClimate: /환경|기후|탄소|생태|신재생|esg|지구|오염|미세플라스틱|배출권|피구세|해양|대기|생물다양성/i.test(lower),
    isEconOrBiz: /경제|경영|금융|시장|핀테크|무역|소비자|가격|게임이론|행동경제|넛지|화폐|인플레이션|주식|투자/i.test(lower),
    isLawOrPolitics: /법|정치|사회|정의|윤리|인권|헌법|규제|공공|거버넌스|민주주의|복지|행정|조례|롤스/i.test(lower),
    isPhysicsOrAero: /물리|우주|항공|역학|전자기|광학|상대성|유체|열역학|인공위성|발사체/i.test(lower),
    isPsychOrEdu: /심리|인지|교육|학습|기억|뇌과학|발달|정서|행동|도파민/i.test(lower),
    isMediaOrHumanities: /미디어|언론|문학|어학|철학|역사|문화|담론|프레임|번역|텍스트/i.test(lower),
    isChem: /화학|유기화학|산염기|평형|반응속도|완충|촉매|결합|고분자/i.test(lower),
  };
}

// Helper to create 4 standard concrete steps tailored to difficulty
export function create4ConcreteSteps(
  topicTitle: string,
  subjectName: string,
  curriculumConcept: string,
  methodology: string,
  tools: string[],
  level: InquiryLevel
) {
  const isBasic = level === 'basic';
  const tool1 = tools[0] || (isBasic ? '교과서 및 포털 자료' : '전문 분석 도구');
  const tool2 = tools[1] || (isBasic ? 'Excel' : '파이썬/지오지브라');

  return [
    {
      stepNum: 1,
      stepName: `1단계: [변인·개념] ${isBasic ? '교과서 핵심 개념 정리 및 관찰 대상 정의' : '독립·종속변수 조작적 정의 및 가설 설정'}`,
      focus: isBasic
        ? `${subjectName} 교과서 속 기본 원리를 바탕으로 친숙한 현상 연계 탐구 질문 도출`
        : `변인 통제 설계서 작성 및 반증 가능한 학술적 가설 수립`,
      protocol: isBasic
        ? `교과서 단원 개념 정리 및 일상 관찰 현상과의 연결점 리스트 작성`
        : `통제변인과 조작변인을 명확히 분리하고 연구 가설 진술문 검토`,
      tools: [tool1, '학습 노트'],
    },
    {
      stepNum: 2,
      stepName: `2단계: [자료·이론] ${isBasic ? '실생활 사례 조사 및 교양 서적·뉴스 분석' : '선행 학술 논문 분석 및 교과 개념 융합'}`,
      focus: isBasic
        ? `신문 기사, 공공 통계 인포그래픽, 관련 교양 도서 발췌 독해`
        : `KCI 선행 연구 2편 방법론 비교 Matrix 및 수식 유도`,
      protocol: isBasic
        ? `사례 분석 비교표 작성 및 교과 개념과의 유사점 분석`
        : `선행 문헌 데이터와 고교 교육과정 성취기준 매핑`,
      tools: ['공공 포털', '도서 자료'],
    },
    {
      stepNum: 3,
      stepName: `3단계: [실행·실증] ${isBasic ? '데이터 시각화 및 간이 모의 관찰/비교' : '정량 시뮬레이션 및 수치 모델 검증'}`,
      focus: isBasic
        ? `표와 차트를 활용한 현상 비교 및 통계적 평균·경향성 파악`
        : `${tools.join(', ')}를 활용한 수식 피팅 및 오차(R²) 검증`,
      protocol: isBasic
        ? `엑셀 또는 시각화 도구로 데이터 입력 및 경향 그래프 작성`
        : `${methodology} 실행 및 정량 수치 도출`,
      tools: tools.length > 0 ? tools : [tool2],
    },
    {
      stepNum: 4,
      stepName: `4단계: [성찰·세특] ${isBasic ? '탐구 결과 정리 및 배운 점 바탕 세특 문안 작성' : '오차 요인 분석 및 500자 완성형 세특 포트폴리오'}`,
      focus: isBasic
        ? `수업 시간 배운 내용이 실생활에 적용되는 방식 성찰 및 세특 기재`
        : `모델의 현실적 한계 비판 및 차년도 후속 심화 과제 제언`,
      protocol: `450~500자 분량의 학교생활기록부 교과 세특 추천 문안 완성`,
      tools: ['세특 문안', '탐구 보고서'],
    },
  ];
}

// Helper to create tailored Level 4 actions in MindMap for each specific subject & domain
function createTailoredActionChildren(
  stepNum: number,
  category: SubjectCategory,
  topicTitle: string,
  subjectName: string,
  curriculumConcept: string,
  methodology: string,
  tools: string[],
  cleanInterest: string,
  level: InquiryLevel
): MindMapNode[] {
  const baseId = `${category}-act-${stepNum}-${Math.random().toString(36).slice(2, 7)}`;
  const color =
    level === 'basic'
      ? '#10b981'
      : category === 'math'
      ? '#38bdf8'
      : category === 'science'
      ? '#34d399'
      : category === 'social'
      ? '#fbbf24'
      : category === 'korean'
      ? '#a78bfa'
      : category === 'english'
      ? '#c084fc'
      : '#fb7185';

  const toolStr = tools.length > 0 ? tools.join(', ') : '전용 분석 도구';

  if (stepNum === 1) {
    return [
      {
        id: `${baseId}-1`,
        text: level === 'basic' ? `[기본 관찰] ${subjectName.split(' ')[0]} 교과서 개념 정리 및 현상 매핑` : `[변인 도출] 독립·종속변수 조작적 정의 및 통제변인 설계`,
        category,
        color,
        subject: subjectName,
        nodeType: 'action',
        level,
        detail: `'${cleanInterest}'의 핵심 현상을 관찰하고, ${curriculumConcept} 원리와 결합하여 탐구 가설 설정`,
        inquiryQuestion: `이 현상에서 교과서 원리가 어떻게 직관적으로 작동하는가?`,
        methodology: `가설 진술문 작성 및 교과 개념 매핑`,
        recordTip: `교과서 기본 개념을 주도적으로 해석하고 실생활에 적용한 성실한 학업 역량`,
      },
      {
        id: `${baseId}-2`,
        text: level === 'basic' ? `[핵심 질문] 단원 개념과 결합된 관찰 질문 구체화` : `[가설 수립] ${curriculumConcept.split('/')[0].trim()} 기반 검증 가능 가설`,
        category,
        color,
        subject: subjectName,
        nodeType: 'action',
        level,
        detail: `교과 이론(${curriculumConcept})에 근거하여 검증 가능한 탐구 질문 구체화`,
        inquiryQuestion: `현상 관찰을 통해 확인하고자 하는 핵심 의문점은 무엇인가?`,
        methodology: `탐구 설계서 작성`,
        recordTip: `교과 지식을 바탕으로 타당한 질문을 스스로 도출한 탐구력`,
      },
    ];
  }

  if (stepNum === 2) {
    return [
      {
        id: `${baseId}-1`,
        text: level === 'basic' ? `[자료 수집] 일상 사례 및 뉴스·공공 통계 인포그래픽 조사` : `[선행 연구 분석] KCI/국제 저널 선행 연구 2편 방법론 비교 Matrix`,
        category,
        color,
        subject: subjectName,
        nodeType: 'action',
        level,
        detail: level === 'basic' ? `관련 신문 기사와 공공 지표를 수집하여 비교표로 정리` : `선행 논문 2편을 발췌하여 연구 설계, 수식 모델, 한계점을 3단 Matrix로 구조화`,
        inquiryQuestion: `기존 자료에서 나타나는 공통적인 경향성과 차이점은 무엇인가?`,
        methodology: `자료 비교표 작성`,
        recordTip: `다양한 출처의 자료를 비판적으로 독해하고 정리한 정보 해석력`,
      },
      {
        id: `${baseId}-2`,
        text: `[교과 개념 융합] ${curriculumConcept.split('/')[0]} 핵심 원리 연계 매핑`,
        category,
        color,
        subject: subjectName,
        nodeType: 'action',
        level,
        detail: `수업 시간 배운 내용과 실제 사례 사이의 인과관계를 개념 맵으로 시각화`,
        inquiryQuestion: `교과서 원리가 실제 문제 상황에서 어떻게 발현되는가?`,
        methodology: `개념 연계 맵 작성`,
        recordTip: `교과서 지식을 실제 사례와 유기적으로 접목한 융합적 사고력`,
      },
    ];
  }

  if (stepNum === 3) {
    return [
      {
        id: `${baseId}-1`,
        text: level === 'basic' ? `[시각화] ${toolStr} 활용 데이터 차트 작성 및 평균·비율 비교` : `[실증 도구 적용] ${toolStr} 활용 데이터 수집 및 정량 시뮬레이션`,
        category,
        color,
        subject: subjectName,
        nodeType: 'action',
        level,
        detail: `${toolStr}을 활용하여 데이터를 정리하고 핵심 경향성을 차트/수치로 도출`,
        inquiryQuestion: `도출된 결과가 초기 가설과 얼마나 부합하는가?`,
        methodology,
        recordTip: `도구를 활용하여 탐구 결과를 객관적으로 입증한 실행력`,
      },
      {
        id: `${baseId}-2`,
        text: level === 'basic' ? `[결과 해석] 현상의 규칙성과 사회적/과학적 의미 정리` : `[시각화 및 상관분석] 함수 그래프 피팅 및 정량 지표 산출`,
        category,
        color,
        subject: subjectName,
        nodeType: 'action',
        level,
        detail: `데이터에서 관찰되는 패턴의 의미를 해석하고 결론 도출`,
        inquiryQuestion: `이 탐구 결과가 시사하는 핵심 함의는 무엇인가?`,
        methodology: `결과 분석 보고서 작성`,
        recordTip: `관측 결과를 논리적으로 해석하여 유의미한 시사점을 이끌어낸 분석력`,
      },
    ];
  }

  // Step 4
  return [
    {
      id: `${baseId}-1`,
      text: level === 'basic' ? `[배운 점 성찰] 탐구 활동을 통한 지적 성장 및 성찰 일지 작성` : `[오차 요인 분석] 모델의 현실적 한계점 분석 및 차년도 후속 연구 제언`,
      category,
      color,
      subject: subjectName,
      nodeType: 'action',
      level,
      detail: `탐구 과정에서 겪은 모호성 해결과정과 배운 점을 메타인지적으로 성찰`,
      inquiryQuestion: `이 탐구를 통해 나의 진로 및 학업 시야가 어떻게 확장되었는가?`,
      methodology: `성찰 일지 및 후속 탐구 기획서 작성`,
      recordTip: `활동을 통한 지적 성장과 배움을 구체적으로 성찰한 메타인지 역량`,
    },
    {
      id: `${baseId}-2`,
      text: `[학생부 세특 500자] 동기-과정-성장-배움이 담긴 완성형 세특 문안`,
      category,
      color,
      subject: subjectName,
      nodeType: 'action',
      level,
      detail: `교육부 기재요령을 100% 준수한 450~500자 완성형 세특 문안 정리`,
      inquiryQuestion: `나의 학업 열정을 학생부에 가장 신뢰감 있게 표현하는 문안은?`,
      methodology: `완성형 세특 포트폴리오 문안 작성`,
      recordTip: `학교생활기록부 교과 세특에 즉시 반영 가능한 완성형 포트폴리오`,
    },
  ];
}

// Main Synthesis Function with 3 Topics Per Subject (2 Basic + 1 Advanced)
export function synthesizeComprehensiveCurriculum(
  argsOrInterest:
    | string
    | {
        interest: string;
        targetMajor?: string;
        grade?: string;
        selectedSubjects?: string[];
        customKeywords?: string;
      },
  targetMajorArg?: string,
  gradeArg?: string,
  selectedSubjectsArg?: string[],
  customKeywordsArg?: string
): ComprehensiveCurriculumResult {
  let interest = '';
  let targetMajor = '';
  let grade = '고등학교 2학년';
  let selectedSubjects: string[] = [];
  let customKeywords = '';

  if (typeof argsOrInterest === 'object' && argsOrInterest !== null) {
    interest = argsOrInterest.interest || '';
    targetMajor = argsOrInterest.targetMajor || '';
    grade = argsOrInterest.grade || '고등학교 2학년';
    selectedSubjects = argsOrInterest.selectedSubjects || [];
    customKeywords = argsOrInterest.customKeywords || '';
  } else {
    interest = typeof argsOrInterest === 'string' ? argsOrInterest : '';
    targetMajor = targetMajorArg || '';
    grade = gradeArg || '고등학교 2학년';
    selectedSubjects = selectedSubjectsArg || [];
    customKeywords = customKeywordsArg || '';
  }

  const cleanInterest = (interest || targetMajor || '융합 학문 및 신기술 탐구').trim();
  const cleanMajor = (targetMajor || '자연과학/공학 계열').trim();
  const contextStr = `${cleanInterest} ${cleanMajor} ${customKeywords}`.toLowerCase();
  const profile = detectDomainProfiles(contextStr);

  let majorOverview = '';
  let connectionSummary = '';
  const subjects: ComprehensiveSubjectPlan[] = [];

  const interestClean = cleanInterest.length > 35 ? cleanInterest.slice(0, 32) + '...' : cleanInterest;

  // Domain 0: Geography / Urban
  if (profile.isGeographyOrUrban) {
    majorOverview = `'${cleanInterest}' 분야는 공간적 불평등과 자원 배분의 문제를 다루는 현대 사회의 대표적인 융합 연구 영역입니다. 학생들의 수준에 맞춰 고교 교과서 속 기본 개념과 친숙한 일상 사례부터, 지니계수 정적분 모델링과 인공위성 열적외선 데이터 분석에 이르는 심화 탐구까지 교과별로 3가지 수준(기본 2개, 심화 1개)의 폭넓은 탐구 선택지를 제공합니다.`;
    connectionSummary = `학생의 관심 분야인 '${cleanInterest}'을 6개 교과와 융합하여, 수학에서는 친숙한 평균·분산부터 정적분 지니계수 모델링까지, 과학에서는 일상 열섬 관찰부터 복사 평형 수식 분석까지, 사회는 지역 인프라 설문부터 롤스 차등 원칙 정책 설계까지 난이도별 3가지 주제로 폭넓게 확장합니다.`;

    // Math 3 topics
    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 교과서 함수 개념 및 친숙한 거리 감쇠 관찰',
      curriculumConcept: '수학: 함수의 그래프와 연속성 / 공통수학: 거리 공식과 좌표평면',
      topic: '교과서 속 좌표평면 거리 공식과 함수의 연속성을 활용한 지역 거점별 이동 시간 기초 함수 비교',
      inquiryQuestion: '교과서에서 배운 두 점 사이의 거리 공식과 함수의 연속성으로 지리적 접근성의 기본 변화를 어떻게 직관적으로 설명할 수 있는가?',
      connectionRationale: '어려운 적분 공식에 앞서, 교과서 기본 거리 공식과 일차함수를 통해 공간적 거리와 이동 시간의 기초 상관성을 누구나 쉽게 모델링할 수 있습니다.',
      methodology: '지도 앱(네이버/카카오맵)을 활용해 교내 및 주요 거점 5곳 사이의 거리와 대중교통 소요 시간을 측정하고 엑셀 산점도 작성',
      recommendedTools: ['네이버/카카오 지도 앱', 'Excel 스프레드시트', '수학 교과서'],
      readingRecommendation: '《수학, 인문으로 수를 읽다》(이광연), 《지도의 배신》(마크 모니에)',
      recordTip: '고교 수학 기본 개념인 좌표와 거리를 실제 생활 공간의 이동 시간과 연결하여 직관적으로 풀어낸 성실한 수학적 탐구 태도 기술',
      draftRecordSnippet: `수학 수업에서 '좌표평면 위의 두 점 사이의 거리'를 학습한 후, 평소 관심 분야인 지역 인프라 격차에 접목해 봄. 학교를 중심으로 관내 5개 주요 거점 시설까지의 대중교통 소요 시간을 측정하고, 거리와 이동 시간 사이의 일차함수적 관계를 도출함. 직관적인 기초 수학 개념을 통해 생활 속 공간 접근성 격차를 객관적으로 분석해내는 관찰력과 수학적 사고력을 발휘함.`,
      concreteSteps: create4ConcreteSteps('기초 거리 함수 탐구', '수학', '좌표평면 거리 공식', '지도 앱 측정 및 엑셀 산점도', ['지도 앱', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 통계 탐색)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 통계청 공공데이터를 활용한 평균·분산 비교',
      curriculumConcept: '확률과 통계: 대푯값(평균, 중앙값)과 산포도(분산, 표준편차) / 히스토그램 작성',
      topic: '통계청 공공데이터를 활용한 전국 시·도별 응급의료 인프라 접근 소요 시간의 평균 및 표준편차 비교 분석',
      inquiryQuestion: '수도권과 비수도권 지자체의 실제 공공 통계에서 응급의료 접근 시간의 평균값과 표준편차(산포도)는 어떤 격차를 나타내는가?',
      connectionRationale: '복잡한 회귀분석 없이도 교과서에서 배운 평균과 표준편차, 히스토그램만으로 지역 간 의료 인프라의 불균형을 신뢰성 있게 증명할 수 있습니다.',
      methodology: '통계청 KOSIS 국가통계포털에서 시·도별 응급의료센터 도달 시간 CSV 데이터를 다운로드하고 엑셀 히스토그램 및 상자수염그림(Boxplot) 제작',
      recommendedTools: ['KOSIS 국가통계포털 (kosis.kr)', 'Excel 통계 차트 도구'],
      readingRecommendation: '《통계의 미학》(최제호), 《팩트풀니스》(한스 로슬링)',
      recordTip: '정부 공개 통계 자료를 스스로 수집하여 교과서 속 대푯값과 산포도 지표로 지역 간 의료 격차를 명확히 입증한 데이터 분석 역량 강조',
      draftRecordSnippet: `확률과 통계 시간에 '대푯값과 산포도' 단원을 이수하며, 통계청 국가통계포털(KOSIS)에서 전국 17개 시·도의 응급의료 시설 접근 시간 데이터를 직접 수집함. 수도권과 지방 광역시, 농어촌 지역의 평균값과 표준편차를 각각 산출하여 비교하고, 상자수염그림으로 데이터의 산포도를 시각화함. 지역별 편차가 단순한 평균 차이를 넘어 산포도에서도 극심하게 나타남을 통계적으로 입증함.`,
      concreteSteps: create4ConcreteSteps('응급의료 통계 산포도 분석', '수학', '대푯값과 산포도', 'KOSIS 데이터 정제 및 Boxplot 작성', ['KOSIS', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 정적분을 활용한 로렌츠 곡선 및 거리 감쇠 회귀분석',
      curriculumConcept: '미적분: 정적분의 기하학적 정의와 곡선 사이의 넓이 / 확률과 통계: 최소제곱법 선형 회귀분석 및 결정계수(R²)',
      topic: '로렌츠 곡선과 지니계수(Gini Index)의 정적분을 활용한 수도권-비수도권 응급의료 인프라 불평등 지수 정량화 및 거리 감쇠 회귀분석',
      inquiryQuestion: '지리적 공간 좌표와 인구 밀도 데이터를 정적분 넓이로 환원할 때, 공간적 불평등을 나타내는 지니계수와 거리 감쇠 함수의 최적 파라미터는 어떻게 산출되는가?',
      connectionRationale: '공간 불평등과 자원 배분의 불균형은 직관적 관찰을 넘어 정적분을 통한 로렌츠 곡선 면적비(지니계수)로 수치화할 때 비로소 객관적 정책 설득력을 가집니다.',
      methodology: '통계청 e-지방지표 및 공공데이터포털에서 시·군·구별 10만 명당 응급의료센터 수와 이동시간 데이터를 수집하고, 엑셀/지오지브라로 누적 인구-누적 시설 로렌츠 곡선을 피팅하여 정적분 면적비 계산',
      recommendedTools: ['공공데이터포털 (data.go.kr)', '지오지브라 (GeoGebra)', 'Excel 통계 분석 툴', '파이썬 NumPy'],
      readingRecommendation: '《지리의 힘》(팀 마샬), 《수학으로 생각하는 힘》(키트 예이츠)',
      recordTip: '지리적 공간 불평등이라는 사회적 난제를 교과서 속 정적분 넓이 계산과 통계 회귀분석으로 모델링해낸 뛰어난 수리적 문제 해결력 및 융합 학업 역량 기술',
      draftRecordSnippet: `미적분 수업에서 '정적분을 이용한 도형의 넓이'를 학습한 후, 평소 관심 분야인 '지역연구, 공간 불평등' 문제에 적용해 봄. 통계청 공공데이터를 활용해 전국 250개 시·군·구의 필수 의료 인프라 분포 데이터를 수집하고, 누적 인구 비율에 대한 누적 인프라 비율을 나타내는 로렌츠 곡선을 도출함. 완전 균등선과 로렌츠 곡선 사이의 면적을 정적분하여 지니계수를 직접 산출함으로써, 지역 간 의료 격차를 정량적인 수치로 입증하는 뛰어난 수리 모델링 능력을 발휘함.`,
      concreteSteps: create4ConcreteSteps('로렌츠 곡선 정적분 모델링', '수학', '정적분의 기하학적 활용', '지오지브라 적분 공식 유도 및 회귀 피팅', ['지오지브라', '공공데이터포털'], 'advanced'),
    });

    // Science 3 topics
    subjects.push({
      subject: '과학/환경 (지구과학Ⅰ / 통합과학 / 물리학Ⅰ)',
      subjectCategory: 'science',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 통합과학 지구 시스템 복사 평형과 도심 열 축적 이해',
      curriculumConcept: '통합과학: 지구 시스템의 에너지 흐름 / 물리학: 열의 이동(전도, 대류, 복사)',
      topic: '통합과학 지구 시스템 에너지 흐름 단원을 통한 아스팔트와 교내 화단 흙의 온도 상승 비교 및 기초 열 흡수 원리 탐구',
      inquiryQuestion: '햇빛을 받았을 때 아스팔트와 흙, 잔디의 표면 온도가 다르게 상승하는 이유는 열의 전도와 복사 개념으로 어떻게 설명되는가?',
      connectionRationale: '도심 열섬 현상이라는 거대한 주제를 학교 운동장, 아스팔트, 화단 흙의 온도 차이라는 교내 관찰 실험으로 쉽게 환원하여 학습할 수 있습니다.',
      methodology: '맑은 날 정오에 알코올 온도계 또는 스마트폰 적외선 온도계를 활용하여 학교 아스팔트와 화단 표면 온도를 30분 간격으로 3회 측정 및 기록',
      recommendedTools: ['디지털/알코올 온도계', '스마트폰 측정 앱', '과학 교과서'],
      readingRecommendation: '《지구온난화 이야기》(팀 플래너리), 《모두를 위한 물리학》',
      recordTip: '교과서 속 열의 이동과 에너지 평형 원리를 교내 주변 물질의 온도 측정 실험으로 직접 검증한 능동적인 과학 탐구 태도 부각',
      draftRecordSnippet: `통합과학 '지구 시스템의 에너지 흐름' 단원을 학습하며, 도시 지역의 기온이 주변보다 높아지는 현상에 호기심을 가짐. 교내 운동장 아스팔트와 화단 토양을 대상으로 일조 시간대별 표면 온도를 직접 계측함. 비열과 열전도도의 차이로 인해 인공 포장재가 자연 토양보다 급격히 가열됨을 실험적으로 확인하고, 도심 녹지의 온도 완충 역할을 과학적으로 이해함.`,
      concreteSteps: create4ConcreteSteps('지표면 열 흡수 간이 관찰', '과학', '열의 이동과 비열', '교내 아스팔트·화단 온도 비교 측정', ['온도계', '노트'], 'basic'),
    });

    subjects.push({
      subject: '과학/환경 (지구과학Ⅰ / 통합과학 / 물리학Ⅰ)',
      subjectCategory: 'science',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 모의 관찰)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 기상청 관측망 데이터를 활용한 도심과 공원 기온 비교',
      curriculumConcept: '지구과학Ⅰ: 대기 순환과 국지풍 / 기상 관측 자료 해석',
      topic: '기상청 기상자료개방포털 관측 데이터를 활용한 도심 상업지구와 근린공원 간 일교차 및 녹지 냉각 효과 비교',
      inquiryQuestion: '실제 우리 지역 기상 관측소 데이터에서 고층 빌딩 밀집 구역과 대형 공원 구역의 최고 기온과 최저 기온 차이는 어느 정도인가?',
      connectionRationale: '인공위성 원격탐사라는 어려운 기술 대신, 기상청이 무료 공개하는 동네별 자동기상관측(AWS) 데이터를 활용하여 누구나 쉽게 도심 냉각 효과를 검증합니다.',
      methodology: '기상청 기상자료개방포털에서 도심 내 AWS 관측소 2곳의 최근 여름철 일별 최고·최저 기온 데이터를 추출하고 엑셀 비교 꺾은선그래프 작성',
      recommendedTools: ['기상청 기상자료개방포털 (data.kma.go.kr)', 'Excel 차트 도구'],
      readingRecommendation: '《기후변화의 심리학》(조지 마셜), 《지구온난화의 부메랑》',
      recordTip: '공공 기상 관측 데이터를 주도적으로 가공하여 도시 녹지의 미기후 조절 기능을 실증한 데이터 해석 능력 기술',
      draftRecordSnippet: `지구과학Ⅰ '대기 순환' 단원을 배우며 기상청 기상자료개방포털을 활용해 거주 지역 도심 상업지구와 생태공원 내 관측소의 8월 일별 기온 데이터를 비교 분석함. 야간 최저기온이 도심 구역에서 평균 2.3도 높게 유지되는 열섬 현상을 꺾은선그래프로 시각화하고, 식생의 증발산 작용과 바람길 형성이 국지적 열환경 완화에 미치는 중요성을 도출함.`,
      concreteSteps: create4ConcreteSteps('공공 기상데이터 열섬 분석', '과학', '국지풍과 대기 순환', '기상청 AWS 데이터 비교 분석', ['기상청 포털', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '과학/환경 (지구과학Ⅰ / 통합과학 / 물리학Ⅰ)',
      subjectCategory: 'science',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 위성 열적외선 데이터와 지표 열수지 방정식 융합 분석',
      curriculumConcept: '지구과학Ⅰ: 대기 순환과 지표 복사 평형 / 물리학Ⅰ: 열전도도와 비열, 비가역 열교환',
      topic: '인공위성 지표면 온도(LST) 데이터와 지자체 불투수면 비율의 열역학적 상관관계 분석 및 도심 바람길 조성을 통한 열환경 불평등 완화 탐구',
      inquiryQuestion: '도시 내 아스팔트·콘크리트 등 불투수면 비율과 건축물 밀도가 지표면 알베도(반사율) 및 국지적 열순환에 미치는 영향과 환경 불평등 완화 메커니즘은 무엇인가?',
      connectionRationale: '공간적 격차는 기후 환경 취약성(열섬 현상, 침수 위험)과 직결됩니다. 과학 교과의 복사 평형과 열전도 원리를 지리적 토지이용 데이터와 결합하여 환경 정의(Environmental Justice)를 과학적으로 규명합니다.',
      methodology: 'NASA USGS Landsat-8 열적외선(TIR) 밴드 지표 온도 데이터와 환경부 토지피복지도 중첩 분석, 아스팔트·녹지·수계의 비열 차이에 따른 냉각 속도 MBL 센서 간이 실험',
      recommendedTools: ['NASA Landsat 열적외선 위성 데이터', '국가환경정보포털 토지피복지도', 'MBL 디지털 온도 센서', 'QGIS'],
      readingRecommendation: '《기후변화의 심리학》(조지 마셜), 《지구온난화의 부메랑》(크리스천 파렌티)',
      recordTip: '공간 불평등 문제를 단순 사회학적 관점에 머무르지 않고 지구 복사 평형과 열역학적 비열 개념을 도입해 과학적으로 실증한 다학제 융합 역량 강조',
      draftRecordSnippet: `지구과학의 '대기 순환과 복사 평형' 단원을 이수하며, 도시 취약계층 거주 지역이 녹지 부족으로 인해 더 극심한 폭염에 노출되는 '환경 불평등' 현상에 주목함. Landsat 위성 열적외선 데이터와 공공 토지피복지도를 대조하여 불투수면 비율과 지표면 온도(LST) 간의 양의 상관관계를 통계적으로 확인하고, 도심 하천과 바람길이 국지적 열 순환에 미치는 물리적 냉각 효과를 열수지 방정식으로 정밀 분석함.`,
      concreteSteps: create4ConcreteSteps('위성 LST 및 열수지 모델링', '과학', '복사 평형과 열역학', '위성 열적외선 분석 및 QGIS 중첩', ['NASA Landsat', 'QGIS'], 'advanced'),
    });

    // Social 3 topics
    subjects.push({
      subject: '사회/지리 (통합사회 / 한국지리 / 경제 / 생활과 윤리)',
      subjectCategory: 'social',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 통합사회 헌법상 기본권과 주거권 개념 이해',
      curriculumConcept: '통합사회: 인권 보장과 헌법 / 기본권의 종류와 제한의 한계',
      topic: '통합사회 헌법상 기본권 단원을 기반으로 살펴본 거주 지역에 따른 의료·교통 서비스 향유권과 주거권의 윤리적 가치',
      inquiryQuestion: '대한민국 헌법 제34조와 제35조에 명시된 인간다운 생활권과 주거권은 지리적 위치에 따라 어떻게 평등하게 보장되어야 하는가?',
      connectionRationale: '법 조문이나 정치철학의 난해한 이론 대신, 고1 통합사회 헌법과 기본권 단원에서 배운 조항을 토대로 지역 격차를 인권의 문제로 쉽게 이해할 수 있습니다.',
      methodology: '국가법령정보센터에서 헌법 제34조(인간다운 생활을 할 권리) 및 제35조(환경권과 주거권) 조문을 발췌하고 모의 헌법재판소 권리침해 의견서 작성',
      recommendedTools: ['국가법령정보센터 (law.go.kr)', '통합사회 교과서'],
      readingRecommendation: '《지금 다시, 헌법》(차병직), 《인권이란 무엇인가》',
      recordTip: '헌법에 보장된 기본권 개념을 생활 속 지역 인프라 격차 문제와 결부지어 탐구한 성숙한 시민 의식 기술',
      draftRecordSnippet: `통합사회 수업에서 '인권 보장과 기본권' 단원을 학습한 후, 지리적 거주지에 따른 필수 서비스 접근성 차이를 헌법적 관점에서 탐구함. 헌법 제34조와 제35조의 인간다운 생활권 및 쾌적한 주거권 조항을 분석하고, 필수 공공 인프라의 결핍이 시민의 헌법상 기본권을 침해할 수 있음을 지적하는 모의 권리구제 의견서를 설득력 있게 작성함.`,
      concreteSteps: create4ConcreteSteps('헌법상 주거권 분석', '사회', '인권 보장과 기본권', '헌법 조문 발췌 및 의견서 작성', ['국가법령정보센터', '교과서'], 'basic'),
    });

    subjects.push({
      subject: '사회/지리 (통합사회 / 한국지리 / 경제 / 생활과 윤리)',
      subjectCategory: 'social',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 정책 비교)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 지자체 청년 지원 조례 비교 및 학급 설문',
      curriculumConcept: '한국지리: 인구 이동 요인(흡인요인과 배출요인) / 지방자치단체의 역할',
      topic: '비수도권 지자체의 청년 정주 지원금 조례 현황 비교와 청소년 진로 선택 시 지역 잔류 의사에 관한 학급 설문 분석',
      inquiryQuestion: '지자체가 추진 중인 청년 주거·정착 지원 정책은 실제 청소년과 청년들의 지역 잔류 결정(흡인요인)에 얼마나 영향을 미치는가?',
      connectionRationale: '어려운 경제 모형 대신, 학생들이 직접 체감하는 청년 유출 문제와 지자체 지원 조례를 설문 조사와 인터뷰로 흥미롭게 조사할 수 있습니다.',
      methodology: '지자체 자치법규 정보시스템에서 청년 지원 조례 2건을 비교하고, 학급 급우 30명을 대상으로 지역 잔류 의향 구글 설문 폼 제작 및 결과 통계 집계',
      recommendedTools: ['자치법규정보시스템 (elis.go.kr)', '구글 설문 폼 (Google Forms)'],
      readingRecommendation: '《지방도시 살생부》(마강래), 《로컬의 미래》',
      recordTip: '지리 교과의 인구 이동 이론을 바탕으로 학급 설문과 자치 조례를 직접 비교 분석한 실천적 사회과학 탐구력 부각',
      draftRecordSnippet: `한국지리의 '인구 이동의 흡인과 배출 요인' 개념을 적용하여, 지자체 청년 정주 지원금 조례의 실효성을 조사함. 자치법규정보시스템에서 관련 조례 2건을 발췌 비교하고, 교내 학생 30명을 대상으로 진로 선택 시 지방 잔류 조건을 묻는 설문 조사를 직접 실시함. 단순 현금성 지원보다 일자리와 문화 인프라가 청년층의 핵심 흡인 요인임을 밝혀냄.`,
      concreteSteps: create4ConcreteSteps('청년 지원 조례 설문 분석', '사회', '인구 이동의 흡인·배출 요인', '조례 비교 및 구글 설문 폼 통계', ['Google Forms', '자치법규정보'], 'basic'),
    });

    subjects.push({
      subject: '사회/지리 (통합사회 / 한국지리 / 경제 / 생활과 윤리)',
      subjectCategory: 'social',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 지방소멸위험지수 시계열 분석과 롤스 차등의 원칙 정책 설계',
      curriculumConcept: '한국지리: 인구 구조 변화와 지역 분화 / 경제: 외부불경제와 시장 실패 / 생활과 윤리: 롤스의 사회 정의와 차등의 원칙',
      topic: '지방소멸위험지수(20~39세 가임여성/65세 이상 인구)와 수도권 집중의 외부불경제 분석 및 롤스 정의론에 기반한 거점도시 인프라 배분 정책 설계',
      inquiryQuestion: '수도권 집중으로 인한 교통 혼잡·집값 상승(외부불경제)과 지방의 인구 공동화(지방 소멸)를 시장 실패로 규정할 때, 롤스의 차등의 원칙을 적용한 공공자원 재배치 기준은 무엇인가?',
      connectionRationale: '지역 소멸과 공간 불평등은 시장 메커니즘의 실패이자 시민 기본권의 문제입니다. 사회과의 인구 구조 분석과 경제적 외부효과, 분배적 정의론을 결합하여 실질적 대안을 도출합니다.',
      methodology: '한국고용정보원 전국 시군구 소멸위험지수 시계열 데이터(2010~2025) 분석, 지자체 재정자립도와 1인당 인프라 예산의 상관분석, 광역 거점화 정책 모의 공청회 제안서 작성',
      recommendedTools: ['KOSIS 국가통계포털', '한국고용정보원 고용동향', '지자체 자치법규 정보시스템'],
      readingRecommendation: '《지방도시 살생부》(마강래), 《정의론》(존 롤스)',
      recordTip: '지리·경제·윤리 교과를 종합하여 통계적 인구 지표와 규범적 정의론을 결합한 정책적 대안을 스스로 도출한 탁월한 사회과학적 통찰력 기술',
      draftRecordSnippet: `한국지리 및 통합사회 수업에서 '지역 분화와 공간 불평등' 단원을 학습하며, 수도권 과밀화가 낳는 외부불경제와 지방 소멸의 상관성에 깊은 문제의식을 가짐. 한국고용정보원 지방소멸위험지수 데이터를 바탕으로 인구 유출 원인을 분석하고, 롤스의 '차등의 원칙'을 원용하여 가장 열악한 최소 수혜 지역에 필수 의료·교통을 우선 배분하는 공공 인프라 배치 기준을 논리적으로 정립함.`,
      concreteSteps: create4ConcreteSteps('소멸위험지수와 롤스 정의론', '사회', '인구 구조 변화와 차등 원칙', '소멸지수 분석 및 공청회 제안서', ['KOSIS', '정의론 원전'], 'advanced'),
    });

    // Korean 3 topics
    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 교과서 독서 단원 연계 공간 교양서 서평 작성',
      curriculumConcept: '독서: 사실적 읽기(주제 및 핵심 정보 요약) / 비판적 읽기(저자의 관점 평가)',
      topic: '독서 교과서의 사실적·비판적 읽기 방법을 적용한 공간 불평등 교양 도서 요약 및 학급 독서 서평 작성',
      inquiryQuestion: '저자가 제시하는 현대 도시의 불평등 문제 원인과 해결 방안을 사실적으로 요약하고 비판적으로 검토할 때 가장 설득력 있는 부분은 무엇인가?',
      connectionRationale: '어려운 담화 분석 대신, 고1 국어/독서 교과서에 소개된 독서 전략(요약하기, 질문하며 읽기)을 통해 누구나 쉽게 주제를 자기화할 수 있습니다.',
      methodology: '도시 지리 교양서 1권을 선정하여 장별 핵심 문장을 발췌하고, 저자의 주장에 대한 자신의 견해를 담은 A4 2매 서평 작성',
      recommendedTools: ['교내 도서관 추천 도서', '독서 활동 기록장', '국어 교과서'],
      readingRecommendation: '《도시의 승리》(에드워드 글레이저), 《모든 공간의 역사》',
      recordTip: '텍스트의 핵심 내용을 정확하게 구조화하여 요약하고 논리적인 자기 주장을 펼친 우수한 독서 문해력과 작문 능력 기술',
      draftRecordSnippet: `독서 수업에서 '비판적 독서와 서평 쓰기' 단원을 학습하며, 도시 공간 불평등을 다룬 교양 도서를 탐독함. 저자가 제시한 도시 집적의 장점과 이면에 숨겨진 소외 계층의 박탈감 문제를 사실적으로 요약하고, 이에 대한 대안을 청소년의 시각에서 비판적으로 고찰한 서평을 작성하여 학급 독서 게시판에 공유함.`,
      concreteSteps: create4ConcreteSteps('공간 도서 비판적 서평', '국어', '사실적·비판적 독서', '도서 발췌 및 2매 서평 작성', ['도서관 도서', '작문 노트'], 'basic'),
    });

    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 언론 분석)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 신문 기사 헤드라인 어휘 및 지역 이미지 분석',
      curriculumConcept: '언어와 매체: 매체 언어의 특성과 수용자의 비판적 수용 태도',
      topic: '주요 일간지 포털 뉴스 기사 헤드라인에서 나타나는 수도권과 지방 관련 표현의 어휘적 감정가 및 보도 태도 비교',
      inquiryQuestion: '인터넷 포털 언론 보도에서 수도권과 비수도권을 묘사할 때 사용되는 감정적 수식어(예: 핫플레이스 vs 소멸 위기)는 어떤 고정관념을 강화하는가?',
      connectionRationale: '뉴스 포털에서 쉽게 검색할 수 있는 기사 제목 10건을 비교 분석함으로써 미디어 리터러시 역량을 교과와 직접 연결할 수 있습니다.',
      methodology: '네이버 뉴스 검색을 통해 최근 3개월간 "지방" 및 "수도권" 키워드가 들어간 기사 제목 각각 10건을 수집하고 긍정/부정 어휘 빈도표 작성',
      recommendedTools: ['포털 뉴스 검색 (Naver/Daum News)', 'Excel 어휘 빈도표'],
      readingRecommendation: '《뉴스가 세상을 바꿀 수 있을까》(강준만), 《미디어 리터러시》(데이비드 버킹엄)',
      recordTip: '미디어 텍스트 뒤에 숨겨진 프레이밍과 감정적 수사법을 날카롭게 포착하여 비판적 수용 태도를 입증한 국어과 역량 부각',
      draftRecordSnippet: `언어와 매체 수업에서 '매체 텍스트의 수용과 생산'을 학습한 후, 인터넷 포털 기사 헤드라인 20건을 수집하여 지역 관련 어휘의 감정적 함의를 분석함. 수도권 관련 기사에는 '활력, 트렌드' 등 긍정적 어휘가 빈출된 반면 지방 기사에는 '소멸, 침체' 등 결핍 중심 어휘가 지배적임을 표로 정리하고, 균형 잡힌 보도의 필요성을 논리적으로 역설함.`,
      concreteSteps: create4ConcreteSteps('뉴스 헤드라인 어휘 분석', '국어', '매체 언어의 수용 태도', '포털 기사 20건 어휘 빈도 비교', ['포털 뉴스', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 툴민 논증 모형과 비판적 담화 분석(CDA) 적용',
      curriculumConcept: '화법과 작문: 논증의 타당성 평가와 오류 검출 / 독서: 비판적 담화 분석(CDA)',
      topic: '툴민(Toulmin) 논증 모형을 적용한 지방 소멸 관련 사설 타당성 분해 및 비판적 담화 분석(CDA)',
      inquiryQuestion: '사설의 논리 전개에서 데이터와 주장 사이의 담보(Warrant)가 충분히 객관적인가, 아니면 수도권 중심주의 담론을 무비판적으로 전제하는가?',
      connectionRationale: '지역 문제에 관한 여론은 언론의 언어적 프레이밍에 큰 영향을 받습니다. 국어과의 툴민 논증 모델과 비판적 담화 분석을 활용해 텍스트 이면의 이데올로기를 해체합니다.',
      methodology: '주요 일간지 사설 3편을 주장(Claim), 데이터(Data), 담보(Warrant), 보강(Backing)으로 도식화하고, 수도권 중심 담론을 비판하는 반박문 집필',
      recommendedTools: ['BigKinds 빅카인즈 뉴스 빅데이터 분석기', '툴민 논증 구조도 템플릿'],
      readingRecommendation: '《프레임》(조지 레이코프), 《비판적 담화 분석》(노먼 페어클러프)',
      recordTip: '고급 논증 분석틀(Toulmin)을 활용하여 언론 텍스트의 논리적 허점을 날카롭게 지적하고 대안적 담론을 제시한 고차 사고력 기술',
      draftRecordSnippet: `화법과 작문 시간 '논증의 타당성 평가' 단원을 이수하며, 일간지 사설 3편을 선정해 툴민(Toulmin) 논증 모형으로 분해함. 지방 소멸 현상을 단순한 경제성 논리로 접근하는 논증에서 데이터와 주장 사이의 '담보(Warrant)'가 수도권 효율성 지상주의에 편향되어 있음을 논리적으로 규명하고, 공간 정의의 가치를 반영한 4매 분량의 논증적 반박문을 완성함.`,
      concreteSteps: create4ConcreteSteps('툴민 논증 모형 사설 분석', '국어', '논증 타당성과 비판적 담화', '빅카인즈 사설 분석 및 반박문 작성', ['빅카인즈', '논증 시트'], 'advanced'),
    });

    // English 3 topics
    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 청소년용 영문 기사를 활용한 도시 재생 필수 어휘 학습',
      curriculumConcept: '영어: 맥락 속에서 어휘의 의미 추론하기 / 중심 내용 파악하기',
      topic: '청소년용 글로벌 영문 뉴스(BBC News for Youth)를 활용한 도시 재생 및 공간 문제 핵심 어휘 학습과 단어장 제작',
      inquiryQuestion: '해외 청소년을 대상으로 한 도시 재생 기사에서 빈출되는 글로벌 도시 관련 핵심 어휘(infrastructure, urban renewal 등)의 의미와 활용법은 무엇인가?',
      connectionRationale: '대학원 수준의 저널 대신 고교생 수준에 최적화된 청소년 영문 기사를 통해 어휘력과 독해력을 동시에 키울 수 있습니다.',
      methodology: 'BBC News for Youth 또는 CNN 10 웹사이트에서 도시 관련 기사 1편을 정독하고 핵심 단어 20개와 예문을 정리한 영문 단어장 제작',
      recommendedTools: ['BBC Newsround / CNN 10', '영어 사전 앱'],
      readingRecommendation: '《Oxford Learner\"s Wordfinder Dictionary》',
      recordTip: '청소년용 해외 시사 텍스트를 주도적으로 찾아 읽고 어휘를 체계적으로 정리한 성실한 자기주도적 어학 역량 기술',
      draftRecordSnippet: `영어 수업에서 '주제별 어휘 확장'을 실천하기 위해 해외 청소년 뉴스(BBC Newsround)의 도시 재생 프로젝트 기사를 스스로 탐색해 읽음. 'infrastructure, revitalization, sustainability' 등 핵심 어휘 20개를 추출하여 문맥 속 의미와 유의어를 정리한 영문 단어장을 제작하고, 기사의 핵심 요지를 3문장의 명료한 영어로 요약함.`,
      concreteSteps: create4ConcreteSteps('청소년 영문 뉴스 어휘 정리', '영어', '어휘 추론과 중심 내용 파악', 'BBC 기사 독해 및 20선 단어장 제작', ['BBC News', '영어사전'], 'basic'),
    });

    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 인포그래픽 번역)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 국제기구 영문 인포그래픽 번역 및 학급 발표',
      curriculumConcept: '영어: 시각 자료(그래프, 인포그래픽)와 연계된 텍스트 정보 파악하기 / 전달하기',
      topic: 'UN-Habitat의 세계 도시화 보고서 속 영문 인포그래픽 자료 해독 및 한국어 카드뉴스 번역 제작',
      inquiryQuestion: '국제기구 인포그래픽의 핵심 슬로건과 통계 수치를 한국어로 가장 정확하고 자연스럽게 번역하는 표현 기법은 무엇인가?',
      connectionRationale: '방대한 영문 보고서 원문 대신 직관적인 인포그래픽의 영어 텍스트를 번역하면서 실용 영어 소통 역량을 입증할 수 있습니다.',
      methodology: 'UN-Habitat 공식 웹사이트에서 도시 불평등 인포그래픽 1장을 다운로드하여 영문 캡션 번역 및 4컷 한국어 카드뉴스 제작',
      recommendedTools: ['UN-Habitat 공식 웹사이트 (unhabitat.org)', '미리캔버스/캔바 디자인 툴'],
      readingRecommendation: '《번역의 탄생》(이희재)',
      recordTip: '시각 자료와 결합된 고급 영문 정보를 정확히 독해하고 대중적인 우리말 카드뉴스로 재가공한 훌륭한 소통 능력 기술',
      draftRecordSnippet: `영어 교과의 '시각 자료 연계 텍스트 독해' 활동의 일환으로 UN-Habitat 공식 인포그래픽 자료를 탐색함. 글로벌 도시 빈곤과 인프라 격차를 다룬 영문 통계 그래프와 슬로건을 우리말로 정밀하게 번역하여 4컷 카드뉴스를 제작함. 원문의 어감과 통계적 의미를 왜곡 없이 전달하는 뛰어난 다국어 전달력을 발휘함.`,
      concreteSteps: create4ConcreteSteps('영문 인포그래픽 카드뉴스 번역', '영어', '시각 자료 연계 텍스트 전달', '인포그래픽 번역 및 4컷 카드뉴스 제작', ['UN-Habitat', 'Canva'], 'basic'),
    });

    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · UN-Habitat 국제 정책 리포트 IMRaD 원문 분석',
      curriculumConcept: '심화영어: 학술 영어 어휘(AWL)와 IMRaD 구조 독해 / Executive Summary 작성',
      topic: 'UN-Habitat 국제 정책 리포트 "Right to the City(도시권)" 원문 강독 및 250단어 영문 Executive Summary 작성',
      inquiryQuestion: '국제기구의 공식 리포트는 도시 거주민의 기본권을 어떤 법적·사회적 언어(Academic English)로 규정하고 있는가?',
      connectionRationale: '글로벌 사회에서도 공간 불평등은 지속가능발전목표(SDG 11: Sustainable Cities)의 핵심 과제입니다. 국제기구 공식 정책 보고서를 원문으로 독해하여 글로벌 소통 역량을 입증합니다.',
      methodology: 'UN Habitat "World Cities Report" 중 공간적 불평등 챕터를 발췌하여 Academic Word List(AWL) 30개 추출 및 250단어 영문 요약 리포트 집필',
      recommendedTools: ['UN Habitat Digital Library', 'Google Scholar 원문 검색', 'Grammarly 문법 검사기'],
      readingRecommendation: '《Triumph of the City》(Edward Glaeser), 《Rebel Cities》(David Harvey)',
      recordTip: '해외 국제기구의 심도 있는 정책 리포트 원문을 완독하고 이를 학술적 영어로 구조화하여 요약해낸 탁월한 글로벌 소통 역량 강조',
      draftRecordSnippet: `심화영어 수업 중 UN-Habitat의 "World Cities Report" 원문을 강독하며, 전 세계적 공간 불평등 실태와 해결 정책을 분석함. 학술 어휘(AWL)를 정리하며 논리적 문장 구조를 학습하고, 보고서의 핵심 제언을 'Background - Key Findings - Policy Recommendations'의 3단 구조로 250단어 영문 Executive Summary로 집필해 영어 발표를 주도함.`,
      concreteSteps: create4ConcreteSteps('UN 리포트 원문 요약서 집필', '영어', '학술 영어와 IMRaD 구조', 'UN-Habitat 리포트 분석 및 영문 에세이', ['UN Habitat', 'Grammarly'], 'advanced'),
    });

    // Tech 3 topics
    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 융합과학탐구)',
      subjectCategory: 'tech',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 엔트리 블록 코딩을 활용한 지역 인구 이동 시뮬레이터 제작',
      curriculumConcept: '정보: 변수와 연산 / 조건문과 반복문을 활용한 알고리즘 구현',
      topic: '엔트리(Entry) 블록 코딩 또는 스프레드시트를 활용한 기초 지역 인구 증감 모의 시뮬레이터 제작',
      inquiryQuestion: '출생률과 청년 전입·전출률 변수를 슬라이더로 조작할 때, 10년 후 기초지자체의 인구 변화 곡선은 어떻게 시각화되는가?',
      connectionRationale: '어려운 파이썬 코드 대신 고교 정보 교과서에서 배우는 블록 코딩(엔트리)으로 누구나 변수와 알고리즘의 작동 방식을 체험할 수 있습니다.',
      methodology: '엔트리 웹사이트에서 슬라이더 변수(출생률, 전입률, 전출률)를 생성하고 10회 반복 연산을 통해 10년 뒤 인구를 그래프로 그리는 프로그램 작성',
      recommendedTools: ['엔트리 (playentry.org)', '정보 교과서'],
      readingRecommendation: '《코딩하는 공익》(이두희), 《소프트웨어가 미래다》',
      recordTip: '정보 교과의 핵심 개념인 변수와 조건문을 활용하여 사회적 인구 변화 현상을 직접 프로그래밍으로 구현한 컴퓨팅 사고력 부각',
      draftRecordSnippet: `정보 수업에서 '알고리즘과 프로그래밍' 단원을 이수하며, 엔트리(Entry)를 활용한 '지역 인구 증감 시뮬레이터'를 직접 코딩함. 출생률과 청년 유출입률을 조작 변수로 설정하고, 반복문과 조건문을 통해 10년간의 인구 변화 추이를 동적으로 시각화함. 복잡한 사회 문제를 컴퓨팅 알고리즘으로 구조화하여 해결책을 모색하는 역량을 보임.`,
      concreteSteps: create4ConcreteSteps('엔트리 인구 시뮬레이터 코딩', 'tech', '변수와 반복문 알고리즘', '엔트리 블록 코딩 및 슬라이더 구현', ['엔트리', '교과서'], 'basic'),
    });

    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 융합과학탐구)',
      subjectCategory: 'tech',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 데이터 시각화)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 엑셀 조건부 서식과 피벗테이블을 활용한 문화시설 지도 시각화',
      curriculumConcept: '정보: 데이터의 수집과 관리 / 스프레드시트를 활용한 데이터 정제 및 시각화',
      topic: '공공데이터포털 전국 공공도서관 및 체육시설 CSV 데이터를 활용한 엑셀 피벗테이블 지역별 문화 인프라 분포도 제작',
      inquiryQuestion: '공공데이터포털의 원시 CSV 파일에서 결측치를 제거하고 피벗테이블로 집계했을 때 지역별 1인당 문화시설 편차는 어떻게 나타나는가?',
      connectionRationale: '코딩 프로그램 설치 없이도 엑셀 스프레드시트의 필터와 피벗테이블만으로 실제 공공 빅데이터를 다루는 데이터 리터러시를 입증합니다.',
      methodology: '공공데이터포털(data.go.kr)에서 전국 공공도서관 표준데이터 CSV를 다운로드하여 엑셀 조건부 서식과 지도 차트로 지역별 인프라 밀도 시각화',
      recommendedTools: ['공공데이터포털 (data.go.kr)', 'Excel 피벗테이블 및 지도 차트'],
      readingRecommendation: '《빅데이터 인문학》(에레즈 에이든), 《데이터 읽어주는 남자》',
      recordTip: '정부 공개 CSV 원시 데이터를 스스로 수집·정제하고 피벗테이블로 통계적 규칙성을 도출해낸 뛰어난 실무 데이터 분석 역량 기술',
      draftRecordSnippet: `정보 시간에 '스프레드시트를 이용한 데이터 관리'를 학습한 후, 공공데이터포털에서 전국 공공도서관 표준데이터 CSV(약 3,000건)를 다운로드함. 엑셀 피벗테이블을 활용해 지자체별 시설 수를 자동 집계하고, 결측치를 정제한 후 조건부 서식 지도 차트로 시각화함. 대규모 원시 데이터를 체계적으로 가공하여 지역별 문화 격차를 명확히 도출해냄.`,
      concreteSteps: create4ConcreteSteps('엑셀 피벗테이블 인프라 시각화', 'tech', '스프레드시트 데이터 관리', 'CSV 정제 및 피벗테이블 지도 작성', ['공공데이터포털', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 융합과학탐구)',
      subjectCategory: 'tech',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 파이썬 GeoPandas 공간 좌표 및 QGIS 버퍼 알고리즘 구현',
      curriculumConcept: '정보: 자료구조와 알고리즘 / 인공지능 기초: 공간 데이터 분석 및 파이썬 라이브러리 활용',
      topic: '파이썬 GeoPandas 공간 좌표 라이브러리와 QGIS를 활용한 대중교통 사각지대 반경 버퍼(Buffer) 알고리즘 분석',
      inquiryQuestion: '공공 버스정류장 및 지하철역 위·경도 좌표 데이터를 반경 500m 원형 버퍼로 연산할 때, 실제 도보 도달 불가능 영역(사각지대)을 어떻게 수리적으로 추출할 것인가?',
      connectionRationale: '지리 공간 정보(GIS)는 현대 빅데이터 분석의 핵심 영역입니다. 정보 교과의 알고리즘과 파이썬 GeoPandas/QGIS 도구를 활용하여 교통 약자 거주지의 사각지대를 정량 연산합니다.',
      methodology: '공공데이터포털에서 시내버스 정류소 위경도 좌표 CSV를 수집하고, 파이썬 GeoPandas로 500m 버퍼 생성 후 주거 지역 Shapefile과의 교집합/차집합 연산 수행',
      recommendedTools: ['파이썬 (GeoPandas, Shapely)', 'QGIS 지리정보시스템', '공공데이터포털'],
      readingRecommendation: '《지리정보시스템(GIS) 개론》, 《파이썬을 활용한 지리공간 데이터 분석》',
      recordTip: '공간 데이터를 프로그래밍 언어로 능숙하게 다루고 버퍼 알고리즘을 적용하여 교통 취약 지점을 정확하게 찾아낸 뛰어난 컴퓨팅 및 융합 실무 역량 기술',
      draftRecordSnippet: `정보 및 인공지능 기초 수업에서 '알고리즘의 구현' 단원을 심화하여, 거주 지역 대중교통 사각지대 분석 프로젝트를 수행함. 공공데이터포털에서 버스 정류소 좌표 CSV를 수집하고, 파이썬 GeoPandas를 이용해 반경 500m 버퍼 연산을 적용함. 주거 구역 폴리곤과의 차집합을 계산해 대중교통 소외 구역을 정확히 추출하고 대중교통 노선 재배치 알고리즘을 제안함.`,
      concreteSteps: create4ConcreteSteps('파이썬 GeoPandas 공간 분석', 'tech', '공간 자료구조와 버퍼 연산', '파이썬 스크립트 작성 및 QGIS 시각화', ['GeoPandas', 'QGIS'], 'advanced'),
    });
  }

  // Domain 1: Bio & Biomedical / Genetics
  else if (profile.isBio) {
    majorOverview = `'${cleanInterest}' 분야는 분자생물학적 메커니즘 규명부터 유전자 가위의 수학적 오차율, 환자 접근성 정책까지 아우르는 대표적인 미래 의약학 융합 영역입니다. 기초 교과서 개념에 충실한 친근한 실험·문헌 탐구(기본 2개)부터, 가이드 RNA 오프타깃 베이즈 추론 및 단백질 3D 분자 모델링에 이르는 심층 탐구(심화 1개)까지 각 교과별 3가지 주제를 폭넓게 제시합니다.`;
    connectionSummary = `학생의 관심사인 '${cleanInterest}'을 6개 교과와 융합할 때, 수학에서는 염기 조합 가짓수 계산부터 베이즈 오프타깃 확률 모델링까지, 과학에서는 교내 DNA 추출 실험부터 Cas9 3차원 분자 구조 분석까지, 사회에서는 치료제 환자 접근성 실태 조사부터 생명윤리법 개정 공청회까지 수준별 3가지 탐구 선택지를 제공합니다.`;

    // Math 3 topics
    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 교과서 경우의 수와 순열을 활용한 DNA 염기서열 조합 계산',
      curriculumConcept: '수학: 경우의 수와 순열, 조합 / 확률의 기본 성질',
      topic: '고교 수학 "경우의 수와 순열" 단원을 활용한 DNA 4가지 염기(A, T, G, C)의 코돈(Codon) 조합 가짓수 및 서열 출현 확률 기초 계산',
      inquiryQuestion: '4가지 염기가 3개씩 짝을 이루어 20가지 아미노산을 암호화할 때, 중복 순열을 통해 계산되는 64가지 코돈 조합의 수학적 원리는 무엇인가?',
      connectionRationale: '어려운 미분방정식에 앞서, 고1 수학의 순열과 조합 공식만으로도 유전 정보 암호화의 기초 수학적 메커니즘을 명쾌하게 이해할 수 있습니다.',
      methodology: '수학 교과서 중복순열 공식을 적용하여 20개 아미노산에 대응하는 코돈 중복성(Degeneracy) 표를 직접 계산 및 작성',
      recommendedTools: ['수학 교과서', '계산기', '코돈 매핑 차트'],
      readingRecommendation: '《수학, 인문으로 수를 읽다》(이광연), 《생명의 수학》(이언 스튜어트)',
      recordTip: '고교 수학의 순열과 조합 개념을 생명과학의 유전 암호 체계에 직접 적용하여 유전 정보의 다양성을 수학적으로 입증한 학업 역량 부각',
      draftRecordSnippet: `수학 시간에 '경우의 수와 중복순열' 단원을 학습하며 생명과학의 코돈(Codon) 번역 체계에 주목함. 4가지 염기가 3개씩 조합되는 가짓수가 4의 3제곱(64가지)임을 수학적으로 유도하고, 이것이 20가지 아미노산을 암호화하는 과정에서 나타나는 축퇴(Degeneracy) 현상을 확률표로 정리하여 생명 정보의 오류 방지 원리를 수학적으로 명료하게 설명함.`,
      concreteSteps: create4ConcreteSteps('코돈 순열 조합 계산', '수학', '경우의 수와 중복순열', '코돈 64가지 조합 수식화', ['수학 교과서', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 통계 탐색)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 질병관리청 국가 통계를 활용한 유전 질환 발생률 비교',
      curriculumConcept: '확률과 통계: 조건부 확률의 기본 개념 / 통계적 확률과 수학적 확률의 관계',
      topic: '질병관리청 국가 희귀질환 헬프라인 통계를 활용한 주요 유전 질환의 인구 집단별 발병 확률 및 가족력 조건부 확률 비교',
      inquiryQuestion: '공개된 국가 희귀질환 통계에서 부모의 유전인자 보유 여부에 따라 자녀에게 질환이 발현될 조건부 확률은 통계적으로 어떻게 계산되는가?',
      connectionRationale: '실제 공개된 국가 보건 통계 자료를 활용하여 교과서 속 조건부 확률의 개념을 의학적 진단 및 예방의 관점에서 친근하게 적용합니다.',
      methodology: '질병관리청 희귀질환 헬프라인에서 질환별 통계 자료를 발췌하고 멘델의 유전 확률과 실제 등록 환자 수 비율을 엑셀 표로 비교',
      recommendedTools: ['질병관리청 희귀질환 헬프라인 (helpline.kdca.go.kr)', 'Excel'],
      readingRecommendation: '《통계의 미학》(최제호), 《유전자의 눈호강》(매트 리들리)',
      recordTip: '국가 공공 보건 통계를 직접 탐색하여 조건부 확률 개념으로 유전 질환의 가족력 위험도를 객관적으로 분석한 우수한 통계 활용 능력 기술',
      draftRecordSnippet: `확률과 통계의 "조건부 확률" 단원을 이수하며, 질병관리청 희귀질환 헬프라인 통계를 활용해 상염색체 열성 유전 질환의 가족력 발현 확률을 분석함. 보인자 부모 사이에서 자녀에게 질환이 나타날 이론적 확률과 실제 등록 환자 통계치 사이의 상관성을 비교 분석하여, 유전 상담에서 조건부 확률이 환자의 불안을 해소하는 객관적 도구임을 확인함.`,
      concreteSteps: create4ConcreteSteps('희귀질환 조건부 확률 분석', '수학', '조건부 확률과 통계적 확률', '질병관리청 데이터 분석 및 확률표 작성', ['질병관리청', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 오프타깃 베이즈 추론과 미카엘리스-멘텐 반응속도 모델링',
      curriculumConcept: '확률과 통계: 조건부 확률과 베이즈 정리 / 미적분: 효소 반응속도식(미카엘리스-멘텐)의 도함수',
      topic: '가이드 RNA 염기 불일치에 따른 오프타깃 절단 확률의 베이즈 추론 및 미카엘리스-멘텐 반응속도 모델링',
      inquiryQuestion: '인간 게놈 30억 염기쌍 중 가이드 RNA가 비표적 부위를 오인 절단할 확률을 조건부 확률과 지수함수로 모델링할 때 오차를 최소화하는 방안은 무엇인가?',
      connectionRationale: '유전자 치료의 최대 난제인 "오프타깃(비표적 절단)"은 결합 친화도와 불일치 염기 개수에 따른 확률적 사건입니다. 이를 교과의 "조건부 확률"과 "도함수를 이용한 반응 포화점 도출"로 수학화하여 질병 치료의 안정성을 수치적으로 검증합니다.',
      methodology: '선행 논문 데이터의 결합 해리 상수(Kd) 추출, 엑셀/지오지브라를 활용한 베이즈 조건부 확률 시뮬레이션 및 미분 반응속도 곡선 피팅',
      recommendedTools: ['지오지브라 (GeoGebra)', 'Excel 통계 분석 도구', '파이썬 SciPy'],
      readingRecommendation: '《통계의 미학》(최제호), 《미적분의 힘》(스티븐 스트로가츠)',
      recordTip: '단순 생명 지식 나열을 넘어 오프타깃 위험도를 조건부 확률과 미분 반응속도식으로 정량화해내는 탁월한 수리적 탐구역량 부각',
      draftRecordSnippet: `교과 수업 중 "조건부 확률"과 '도함수의 활용' 단원을 학습한 후, '${cleanInterest}'의 최대 난제인 오프타깃 부작용에 주목함. 가이드 RNA 염기 불일치 개수에 따른 결합 확률을 베이즈 정리를 적용하여 수식화하고, 지오지브라를 활용해 기질 농도에 따른 반응 포화 곡선을 성공적으로 시뮬레이션함. 이를 통해 생명현상의 불확실성을 수학적으로 엄밀하게 해석해내는 뛰어난 학문 융합 역량을 발휘함.`,
      concreteSteps: create4ConcreteSteps('오프타깃 베이즈 모델링', '수학', '조건부 확률과 도함수 활용', '지오지브라 반응속도 피팅', ['지오지브라', '선행 논문'], 'advanced'),
    });

    // Science 3 topics
    subjects.push({
      subject: '과학 (생명과학Ⅰ / 생명과학Ⅱ / 화학Ⅱ)',
      subjectCategory: 'science',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 생명과학I 유전 정보 흐름과 유전자 가위의 원리 개념도 작성',
      curriculumConcept: '생명과학Ⅰ: 유전 정보의 흐름(DNA-RNA-단백질) / 염색체와 유전체',
      topic: '생명과학I 유전 정보 중심 원리(Central Dogma)를 바탕으로 비교한 제한효소와 크리스퍼 유전자 가위의 절단 원리 개념도 작성',
      inquiryQuestion: '고교 교과서에 소개된 전통적인 제한효소와 3세대 유전자 가위(CRISPR-Cas9)는 DNA 염기서열 인식 방식에서 어떤 혁신적 차이가 있는가?',
      connectionRationale: '복잡한 단백질 3D 결정학 대신, 교과서 속 중심원리와 제한효소 개념을 토대로 유전자 가위의 작동 기전을 한눈에 들어오는 개념도로 정리할 수 있습니다.',
      methodology: '교과서 유전 단원 그림을 참조하여 제한효소의 회문 서열 인식과 가이드 RNA의 염기 상보적 결합 방식을 비교하는 2단 개념 관계도(Concept Map) 작성',
      recommendedTools: ['생명과학 교과서', '개념 맵 작성 도구'],
      readingRecommendation: '《크랙 인 크리에이션》(제니퍼 다우드나), 《생명 최초의 30억 년》',
      recordTip: '생명과학 교과서 속 유전 개념을 정확히 이해하고 차세대 생명공학 기술과의 차별점을 개념도로 명료하게 시각화한 학업 역량 기술',
      draftRecordSnippet: `생명과학Ⅰ '유전 정보의 흐름' 단원을 배우며, 전통적 제한효소와 3세대 크리스퍼 유전자 가위의 작동 메커니즘을 비교하는 개념도를 작성함. 제한효소가 고정된 염기서열만을 인식하는 한계를 가이드 RNA의 상보적 결합 설계가 어떻게 극복했는지 단계별로 시각화하고, 이를 학급 친구들에게 알기 쉽게 설명하여 호평을 받음.`,
      concreteSteps: create4ConcreteSteps('유전자 가위 개념도 비교', '과학', '유전 정보의 흐름', '제한효소 vs CRISPR 개념도 작성', ['교과서', '스케치 도구'], 'basic'),
    });

    subjects.push({
      subject: '과학 (생명과학Ⅰ / 생명과학Ⅱ / 화학Ⅱ)',
      subjectCategory: 'science',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 간이 실험)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 교내 식물 세포 DNA 추출 간이 실험 및 시약 원리 탐구',
      curriculumConcept: '통합과학/생명과학: 세포막과 핵막의 구조 / 물질의 화학적 성질(극성과 무극성)',
      topic: '바나나 또는 브로콜리 세포의 DNA 추출 간이 실험을 통한 세포막 용해 시약(계면활성제, 소금, 에탄올)의 화학적 원리 규명',
      inquiryQuestion: '일상에서 구하기 쉬운 주방세제와 소금, 차가운 에탄올은 인지질 2중층 세포막을 어떻게 분해하고 DNA를 하얗게 석출시키는가?',
      connectionRationale: '실제 유전자 교정에 앞서 유전 물질인 DNA를 직접 눈으로 확인하는 간이 실험을 통해 생명과학과 화학의 융합 원리를 체득합니다.',
      methodology: '학교 과학실에서 브로콜리를 막자사발에 빻은 후 세제-소금 용액을 넣고 거름망으로 걸러 차가운 에탄올로 DNA 침전물을 관찰하고 사진 기록',
      recommendedTools: ['브로콜리/바나나', '주방세제, 소금, 소독용 에탄올', '비커, 유리막대'],
      readingRecommendation: '《세포의 반란》, 《화학으로 이루어진 세상》',
      recordTip: '간이 추출 실험에서 각 시약의 물리화학적 역할을 인지질 구조와 전하 중화 관점에서 엄밀히 해석해낸 우수한 실험 탐구력 부각',
      draftRecordSnippet: `통합과학 '세포와 물질대사' 단원에서 브로콜리 세포의 DNA 추출 실험을 직접 수행함. 주방세제가 인지질 2중층을 용해하고 소금의 나트륨 이온이 DNA 인산기의 음전하를 중화시켜 엉기게 하며, 에탄올의 극성 차이로 DNA가 침전되는 화학적 메커니즘을 시약별로 꼼꼼히 정리하여 실험 보고서를 완성함.`,
      concreteSteps: create4ConcreteSteps('세포 DNA 추출 간이 실험', '과학', '인지질 막 구조와 용해 원리', '교내 브로콜리 DNA 추출 실험', ['비커', '에탄올', '세제'], 'basic'),
    });

    subjects.push({
      subject: '과학 (생명과학Ⅰ / 생명과학Ⅱ / 화학Ⅱ)',
      subjectCategory: 'science',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · PDB 3D 분자 모델링과 PAM 서열 인식 결합 에너지 분석',
      curriculumConcept: '생명과학Ⅱ: 유전자 발현 조절과 효소의 입체구조 / 화학Ⅱ: 분자 간 상호작용(수소결합, 반데르발스 힘)',
      topic: 'Cas9 단백질 3차원 입체구조(PDB)와 PAM 서열 인식 메커니즘 규명 및 지질나노입자(LNP) 전달체의 물리화학적 특성 분석',
      inquiryQuestion: 'Cas9 단백질의 HNH 및 RuvC 뉴클레아제 도메인은 이중가닥 DNA를 어떻게 물리화학적으로 절단하며, 지질나노입자는 생체막을 어떻게 투과하는가?',
      connectionRationale: '유전자가위의 분자생물학적 절단 메커니즘과 지질나노입자(LNP) 약물 전달 원리를 화학II의 "수소결합 및 소수성 상호작용"과 결합하여 대학 수준의 전공 적합성을 확보합니다.',
      methodology: 'RCSB PDB(Protein Data Bank) 웹 뷰어를 통해 Cas9-gRNA-DNA 복합체(PDB ID: 4UN3)의 수소결합 및 염류교(Salt bridge) 결합 부위 시각화 분석',
      recommendedTools: ['RCSB PDB (rcsb.org)', 'Mol* 3D 분자 구조 뷰어', 'NCBI PubMed'],
      readingRecommendation: '《크랙 인 크리에이션》(제니퍼 다우드나), 《분자세포생물학》(Lodish)',
      recordTip: '단백질 입체구조 3D 시각화 도구를 직접 조작하고 아미노산 잔기 간의 수소결합을 화학적으로 해석해낸 심화 전공 탐구력 기술',
      draftRecordSnippet: `생명과학Ⅱ '효소와 단백질 구조' 단원을 심화하여, RCSB PDB 분자 뷰어로 Cas9 단백질의 3차원 입체구조(4UN3)를 정밀 분석함. 가이드 RNA와 표적 DNA가 결합할 때 나타나는 구조적 형태 변화(Conformational change)와 PAM 서열을 인식하는 아르기닌 잔기의 수소결합 네트워크를 분자 수준에서 규명하여 수준 높은 의생명 탐구 보고서를 작성함.`,
      concreteSteps: create4ConcreteSteps('Cas9 3D 분자 구조 규명', '과학', '단백질 입체구조와 수소결합', 'PDB 4UN3 뷰어 결합 부위 분석', ['RCSB PDB', 'Mol*'], 'advanced'),
    });

    // Social 3 topics
    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 정치와 법)',
      subjectCategory: 'social',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 통합사회/생활과 윤리 교과서 속 생명존중 사상 이해',
      curriculumConcept: '생활과 윤리: 생명 윤리와 과학 기술 / 인간 생명의 존엄성',
      topic: '생활과 윤리 교과서 속 생명 존엄성 원칙으로 바라본 유전자 치료의 질병 극복 기대와 생명 경시 우려점 비교',
      inquiryQuestion: '난치병 치료라는 인도주의적 목적과 인간 배아 유전자 조작이라는 윤리적 우려 사이에서 균형을 잡는 교과서적 판단 기준은 무엇인가?',
      connectionRationale: '복잡한 법률 조항 대신 고교 생활과 윤리 교과서의 "생명 윤리" 단원에 소개된 찬반 쟁점을 통해 누구나 명확한 가치 판단 역량을 기를 수 있습니다.',
      methodology: '생활과 윤리 교과서의 유전공학 쟁점 페이지를 정독하고, 찬성 측(난치병 완치)과 반대 측(생명 조작 우려)의 3대 핵심 근거를 대비표로 작성',
      recommendedTools: ['생활과 윤리 교과서', '윤리적 의사결정 워크시트'],
      readingRecommendation: '《생명의 윤리를 말한다》(마이클 샌델), 《정의란 무엇인가》',
      recordTip: '생명공학 기술의 명암을 교과서 윤리 사상에 입각하여 균형 잡힌 시각으로 성찰한 인문학적·윤리적 소양 부각',
      draftRecordSnippet: `생활과 윤리 수업에서 '생명 공학과 윤리' 단원을 이수하며, 유전자 가위 기술 도입에 따른 윤리적 쟁점을 다각도로 검토함. 칸트의 의무론적 관점과 공리주의적 관점을 대비하여, 난치병 환자의 고통 경감이라는 이익과 유전자 결정론 및 인간 존엄성 훼손 위험 사이의 균형점을 모색하는 균형 잡힌 성찰 보고서를 완성함.`,
      concreteSteps: create4ConcreteSteps('생명윤리 찬반 대비표 작성', 'social', '생명 윤리와 인간 존엄성', '교과서 쟁점 발췌 및 찬반 표 작성', ['교과서', '윤리 노트'], 'basic'),
    });

    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 정치와 법)',
      subjectCategory: 'social',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 보건 정책)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 초고가 유전자 치료제 건강보험 급여화 환자 접근성 실태 조사',
      curriculumConcept: '통합사회: 복지 제도와 사회 보장 / 경제: 공공재와 건강보험 재정',
      topic: '원샷(One-shot) 유전자 치료제(졸겐스마 등)의 건강보험 급여 적용 현황과 희귀질환 환자 의료 접근성 개선 방안 조사',
      inquiryQuestion: '수십억 원에 달하는 초고가 첨단 바이오 의약품에 대한 건강보험 지원은 재정 건전성과 환자 생명권 보장 사이에서 어떻게 조화될 수 있는가?',
      connectionRationale: '실제 뉴스에 자주 등장하는 수십억 원대 유전자 치료제의 건강보험 급여화 논쟁을 통해 경제와 복지 제도의 현실적 딜레마를 쉽게 이해합니다.',
      methodology: '건강보험심사평가원 보도자료를 검색하여 유전자 치료제 급여 적용 사례(졸겐스마)를 조사하고 선진국의 성과기반 지불제도를 비교 분석',
      recommendedTools: ['건강보험심사평가원 (hira.or.kr)', '보건복지부 보도자료'],
      readingRecommendation: '《아파도 미안하지 않습니다》(조한진희), 《의료의 질》(아툴 가완디)',
      recordTip: '고가의 바이오 신약과 사회적 복지 안전망의 충돌을 현실 통계와 정책 자료로 균형 있게 분석한 사회과학적 통찰력 기술',
      draftRecordSnippet: `통합사회 '사회 복지와 정의' 단원을 학습하며, 1회 투약 비용이 20억 원에 달하는 유전자 치료제의 건강보험 적용 사례를 조사함. 건강보험심사평가원 자료를 바탕으로 '성과 기반 환급제' 등 재정 부담을 완화하면서 환자의 생명권을 보장하는 해외 선진 제도를 분석하여, 공공 보건의료의 분배 정의를 심도 있게 성찰함.`,
      concreteSteps: create4ConcreteSteps('유전자 치료제 건보 급여화 조사', 'social', '사회보장과 보건 복지', '심평원 보도자료 분석 및 제도 비교', ['심평원', '보건복지부'], 'basic'),
    });

    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 정치와 법)',
      subjectCategory: 'social',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 생명윤리안전법 제47조 및 롤스 정의론 기반 규제 거버넌스 설계',
      curriculumConcept: '정치와 법: 기본권 제한의 한계(과잉금지원칙) / 생활과 윤리: 롤스의 최소수혜자 배려와 우생학적 유전 개량 비판',
      topic: '생명윤리및안전법 제47조(유전자치료 제한 규정)의 규제 방식(포지티브 vs 네거티브) 비교와 롤스 정의론 기반 임상 가이드라인 정책 설계',
      inquiryQuestion: '유전질환 치료 목적의 배아 유전자 교정을 전면 금지하는 현행 생명윤리법 제47조는 과잉금지원칙에 위배되는가, 그리고 유전적 불평등(유전적 카스트)을 방지하기 위한 최소 규제 기준은 무엇인가?',
      connectionRationale: '생명공학 기술의 발전 속도와 법률 규제 사이의 "지체 현상(Lag)"을 정치와 법의 "과잉금지원칙" 및 생활과 윤리의 "롤스 정의론"으로 입체적으로 분석합니다.',
      methodology: '국가법령정보센터 생명윤리안전법 제47조와 영국의 HFEA(인간수정배아관리국) 가이드라인 조문을 1:1 대비표로 작성하고 모의 규제개혁 제안서 완성',
      recommendedTools: ['국가법령정보센터 (law.go.kr)', 'UK HFEA Guideline Database'],
      readingRecommendation: '《유전체 시대의 법과 윤리》, 《정의론》(존 롤스)',
      recordTip: '국내외 법령 조문을 비교 분석하고 헌법상 기본권과 분배 정의론을 접목하여 입법적 대안을 제시한 뛰어난 법·정책 분석력 기술',
      draftRecordSnippet: `정치와 법 및 생활과 윤리를 융합하여, '생명윤리 및 안전에 관한 법률 제47조'의 포지티브 규제 체계가 지닌 한계를 법리적으로 분석함. 영국의 유연한 규제 샌드박스 제도와 대조하여, 난치성 질환에 한해 치료적 유전자 교정을 허용하되 우생학적 개량을 엄격히 통제하는 조례 수정안을 작성함. 롤스의 차등 원칙을 법제화에 접목하는 우수한 융합 법학 역량을 입증함.`,
      concreteSteps: create4ConcreteSteps('생명윤리법 규제 분석', 'social', '과잉금지원칙과 롤스 정의론', '영국 HFEA 비교 및 조례 수정안', ['국가법령정보센터', 'HFEA'], 'advanced'),
    });

    // Korean 3 topics
    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 대중 과학 교양서(《크랙 인 크리에이션》 등) 발췌 독해 및 서평',
      curriculumConcept: '독서: 글쓴이의 관점 파악하기 / 독서 에세이 집필',
      topic: '노벨화학상 수상자 제니퍼 다우드나의 자서전 《크랙 인 크리에이션》 강독을 통한 과학자의 사회적 책임 고찰 서평 작성',
      inquiryQuestion: '새로운 생명공학 기술을 개발한 과학자가 기술의 악용 가능성에 대해 지녀야 할 도덕적 책무는 무엇인가?',
      connectionRationale: '전문 논문 대신 노벨상 수상 과학자의 친근한 자서전을 읽고, 국어 교과서의 서평 쓰기 지침에 따라 알기 쉽게 생각을 정리할 수 있습니다.',
      methodology: '《크랙 인 크리에이션》 중 과학자 모라토리엄(잠정 유예 선언) 챕터를 발췌 독해하고 1,000자 분량의 성찰적 서평 작성',
      recommendedTools: ['《크랙 인 크리에이션》 도서', '독서 노트'],
      readingRecommendation: '《크랙 인 크리에이션》(제니퍼 다우드나), 《이중나선》(제임스 왓슨)',
      recordTip: '과학자의 내면적 고뇌와 책임 의식을 독서 텍스트 속에서 깊이 있게 성찰하여 글로 표현해낸 우수한 작문 역량 기술',
      draftRecordSnippet: `독서 수업에서 '과학·기술 분야의 글 읽기' 단원을 이수하며, 유전자 가위 개발자 제니퍼 다우드나의 저서를 탐독함. 과학적 발견의 희열 뒤에 찾아온 사회적 악용에 대한 두려움과, 전 세계 과학자들에게 잠정 유예를 촉구한 책임 있는 행동을 인상 깊게 서술함. 기술 발전과 인간의 책무에 관한 깊이 있는 성찰을 담은 서평을 집필함.`,
      concreteSteps: create4ConcreteSteps('과학자 자서전 서평 집필', 'korean', '과학 글 읽기와 서평 쓰기', '도서 발췌 및 1000자 서평 작성', ['교양 도서', '작문 노트'], 'basic'),
    });

    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 언론 분석)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 신문 보도의 과장된 감정 어휘(기적의 완치 vs 맞춤아기 공포) 분석',
      curriculumConcept: '화법과 작문: 설득 전략의 타당성 평가 / 언어와 매체: 매체 어휘의 정서적 효과',
      topic: '유전자 편집 치료 임상 성공 관련 국내 주요 일간지 기사의 헤드라인 어휘 분석 및 감정적 프레이밍 비교',
      inquiryQuestion: '언론 기사들이 첨단 바이오 기술을 다룰 때 "기적"이라는 희망적 수사와 "프랑켄슈타인"이라는 공포적 수사를 어떻게 대립적으로 사용하는가?',
      connectionRationale: '실제 포털에 보도된 기사 10건을 발췌하여 긍정적·부정적 감정 어휘를 집계함으로써 언어의 프레이밍 효과를 쉽게 체감합니다.',
      methodology: '포털 뉴스에서 유전자 치료 관련 기사 10건을 수집하고 제목에 쓰인 형용사·부사의 긍정/부정 감정 점수를 분류하여 표로 정리',
      recommendedTools: ['네이버 뉴스 검색', 'Excel 감정 어휘 분류표'],
      readingRecommendation: '《언어의 온도》(이기주), 《미디어 리터러시》',
      recordTip: '미디어가 대중의 감정을 자극하는 수사적 장치를 객관적으로 분석해내는 비판적 언어 수용 역량 부각',
      draftRecordSnippet: `언어와 매체의 '매체 언어의 비판적 수용' 단원을 학습하며, 유전자 가위 치료제 승인 관련 언론 기사 10건의 헤드라인을 분석함. 과도한 기대감을 조성하는 '기적의 신약' 프레임과 막연한 공포를 유발하는 '유전자 조작의 덫' 프레임으로 양극화되어 있음을 밝혀내고, 객관적 정보 전달을 위한 미디어 가이드라인을 제안함.`,
      concreteSteps: create4ConcreteSteps('뉴스 감정 어휘 분석', 'korean', '매체 언어와 설득 전략', '기사 10건 어휘 분류 및 보고서', ['포털 뉴스', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 과학철학적 비판 및 툴민 논증 모델 기반 소논설문 집필',
      curriculumConcept: '화법과 작문: 논증의 구조화 및 반론 꺾기 / 독서: 과학철학 텍스트(기술결정론 비판) 심층 독해',
      topic: '생명공학 기술 결정론에 대한 과학철학적 비판 및 툴민(Toulmin) 논증 모델 기반의 심층 논증적 에세이 집필',
      inquiryQuestion: '기술이 인류의 모든 문제를 해결한다는 "기술 결정론"의 논리적 오류를 툴민 논증 모델로 어떻게 반박하고 인간 중심의 가치를 정립할 것인가?',
      connectionRationale: '생명과학의 성취를 맹목적으로 추종하는 기술 만능주의를 비판하고, 국어과의 툴민 논증 모델을 적용해 탄탄한 논리적 반론을 전개합니다.',
      methodology: '과학철학 서적(《생각의 탄생》, 《기술의 충격》)을 바탕으로 기술 결정론의 전제를 분석하고, A4 4매 분량의 논증적 에세이 작성 및 학급 발표 대본 구성',
      recommendedTools: ['RISS 학술 논문 검색', '툴민 논증 구조 분석 템플릿'],
      readingRecommendation: '《부분과 전체》(하이젠베르크), 《기술의 충격》(케빈 켈리)',
      recordTip: '전문 과학 지식을 인문학적 깊이와 명료하고 설득력 있는 문체로 엮어낸 최고 수준의 논증 및 작문 역량 기술',
      draftRecordSnippet: `화법과 작문 수업에서 툴민(Toulmin) 논증 구조를 적용하여, 유전자 교정 기술 만능주의에 경종을 울리는 논증적 소논설문을 작성함. '기술의 발전이 곧 인간 행복의 증진인가'라는 질문을 던지고, 유전적 불평등 심화라는 숨겨진 전제를 학술적 데이터로 논파함. 주장에 대한 반론을 사전에 검토하고 재반론하는 탄탄한 논리 전개로 탁월한 글쓰기 역량을 과시함.`,
      concreteSteps: create4ConcreteSteps('기술결정론 비판 학술 에세이', 'korean', '툴민 논증과 과학철학', '논증 구조도 설계 및 4매 에세이 집필', ['RISS', '작문 노트'], 'advanced'),
    });

    // English 3 topics
    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 청소년용 과학 영문 기사(Science News for Students) 기초 어휘 학습',
      curriculumConcept: '영어: 맥락 속에서 다의어 및 전공 기초 어휘 의미 파악',
      topic: '청소년용 해외 과학 매체(Science News Explores)의 크리스퍼 기사를 활용한 생명과학 기초 영단어 30선 단어장 제작',
      inquiryQuestion: '생명공학 기사에서 자주 등장하는 "strand, cleave, enzyme, mutation" 등의 단어가 일상 영어와 어떻게 다르게 쓰이는가?',
      connectionRationale: '대학원 논문 대신 고교생 수준에 최적화된 Science News Explores 기사를 통해 생명과학 영어 어휘의 기초 체력을 탄탄히 다집니다.',
      methodology: 'Science News Explores 웹사이트에서 CRISPR 관련 기사 1편을 출력하여 모르는 어휘 형광펜 표시 및 어원 분석 단어장 작성',
      recommendedTools: ['Science News Explores (snexplores.org)', '영어 어원 사전'],
      readingRecommendation: '《Word Power Made Easy》',
      recordTip: '해외 청소년 과학 저널을 주도적으로 탐독하고 다의어의 과학적 맥락을 정확히 분류하여 정리한 성실한 어학 탐구력 기술',
      draftRecordSnippet: `영어 교과의 '어휘 확장 및 맥락 추론'을 실천하기 위해 청소년 과학 매체(Science News Explores)의 크리스퍼 기술 해설 기사를 정독함. 일상 단어 'strand(가닥), target(표적)'이 유전체학에서 쓰이는 전문적 용례를 비교 분석하고, 30개의 핵심 과학 어휘를 예문과 함께 단어장으로 정리하여 학급 어휘 학습에 기여함.`,
      concreteSteps: create4ConcreteSteps('청소년 과학 영어 어휘 정리', 'english', '맥락 속 어휘 추론', 'Science News 기사 및 어휘 30선', ['snexplores.org', '영어사전'], 'basic'),
    });

    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · WHO 가이드라인)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 세계보건기구(WHO) 인간 유전체 편집 인포그래픽 번역',
      curriculumConcept: '영어: 공공 포스터 및 인포그래픽 영문 정보의 핵심 내용 파악 및 우리말 전달',
      topic: '세계보건기구(WHO)의 인간 유전체 편집 거버넌스 팩트시트(Fact sheet) 핵심 조항 영문 번역 및 안내 카드뉴스 제작',
      inquiryQuestion: 'WHO가 제시하는 글로벌 유전자 편집 6대 기본 원칙을 어떻게 가장 정확하고 알기 쉬운 한국어로 번역할 수 있는가?',
      connectionRationale: '국제기구의 공식 Fact sheet를 번역하며 글로벌 보건 이슈를 접하고, 실용적 번역 능력을 기를 수 있습니다.',
      methodology: 'WHO 공식 홈페이지에서 "Human Genome Editing Fact Sheet"를 다운로드하여 5대 원칙을 번역하고 캔바(Canva)로 요약 카드뉴스 제작',
      recommendedTools: ['WHO Human Genome Editing Fact Sheets (who.int)', 'Canva'],
      readingRecommendation: '《글로벌 보건과 번역》',
      recordTip: '국제 공공 보건 기구의 전문 영문 텍스트를 정확하게 독해하고 청소년 눈높이에 맞게 재가공한 실용 번역 및 소통 역량 부각',
      draftRecordSnippet: `영어 시간에 '국제기구 텍스트 독해와 번역' 활동을 수행하며, WHO 공식 웹사이트의 인간 유전체 편집 가이드라인 Fact Sheet를 직접 분석함. 'safety, efficacy, ethical oversight' 등 글로벌 거버넌스 핵심 원칙을 한국어로 번역하고, 학급 급우들이 한눈에 볼 수 있도록 시각적 요약 포스터를 제작하여 글로벌 보건 쟁점을 공유함.`,
      concreteSteps: create4ConcreteSteps('WHO 유전체 가이드라인 번역', 'english', '국제기구 팩트시트 번역', 'WHO 자료 분석 및 카드뉴스 제작', ['WHO 웹사이트', 'Canva'], 'basic'),
    });

    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · Nature/Science SCI급 오픈액세스 IMRaD 원문 분석',
      curriculumConcept: '심화영어: Academic Word List(AWL)와 완곡어법(Hedging) 분석 / IMRaD 구조 요약',
      topic: 'Nature/Science SCI급 오픈액세스 논문 2편 IMRaD 원문 분석 및 250단어 영문 Executive Summary 작성',
      inquiryQuestion: '국제 학술계가 해당 분야에서 가장 긴급하게 해결하고자 하는 연구 난제(오프타깃 저감 및 전달체 효율)는 어떤 학술 영어 수사로 서술되는가?',
      connectionRationale: '국제 학술 저널(Nature/Science)의 원문 구조(IMRaD)를 해독하고, 저자의 완곡어법(Hedging)을 분석하여 대학 수준의 학술 영어 역량을 증명합니다.',
      methodology: 'Google Scholar에서 크리스퍼 최신 오픈액세스 논문 초록과 결론을 발췌하여 학술 어휘 30개 및 완곡어법(may indicate 등) 분석 후 요약서 집필',
      recommendedTools: ['Google Scholar 원문 검색', 'Nature/Science Open Access', 'Grammarly'],
      readingRecommendation: '《The Elements of Style》(Strunk & White)',
      recordTip: '해외 SCI급 원문 자료를 능동적으로 탐색하여 글로벌 연구 트렌드를 정확한 학술 영어로 재구성해낸 우수한 글로벌 학술 역량 기술',
      draftRecordSnippet: `심화영어 수업에서 Nature 지의 크리스퍼 유전자 치료 관련 원문 논문을 IMRaD 구조로 강독함. 저자가 연구 결론의 한계를 신중하게 진술할 때 사용한 학술적 완곡어법(Hedging: 'suggests, potentially')을 분석하고, 핵심 발견을 250단어 영문 Executive Summary로 완벽하게 작성해 영어 프레젠테이션을 성공적으로 수행함.`,
      concreteSteps: create4ConcreteSteps('SCI 원문 IMRaD 강독 요약', 'english', '학술 영어와 완곡어법', 'Google Scholar 논문 분석 및 요약서', ['Google Scholar', 'Grammarly'], 'advanced'),
    });

    // Tech 3 topics
    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 융합과학탐구)',
      subjectCategory: 'tech',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 엔트리 블록 코딩으로 구현하는 DNA 상보 결합 게임 제작',
      curriculumConcept: '정보: 조건문과 리스트 자료구조를 활용한 규칙 기반 시뮬레이션',
      topic: '엔트리(Entry) 블록 코딩 리스트 자료구조를 활용한 DNA 상보적 염기(A-T, G-C) 짝맞추기 게임 및 전사 시뮬레이터 제작',
      inquiryQuestion: 'A는 T와, G는 C와만 결합하는 생명과학의 규칙을 정보 교과의 리스트와 조건문 블록으로 어떻게 구현할 수 있는가?',
      connectionRationale: '어려운 알고리즘 대신 교과서의 리스트와 조건문 블록을 사용하여 누구나 DNA 복제와 전사 과정을 게임처럼 재미있게 코딩할 수 있습니다.',
      methodology: '엔트리에서 4개의 염기 리스트를 생성하고, 사용자가 입력한 염기에 상보적인 RNA 염기(A→U, T→A, G→C, C→G)를 출력하는 프로그램 제작',
      recommendedTools: ['엔트리 (playentry.org)', '정보 교과서'],
      readingRecommendation: '《코딩하는 공익》(이두희)',
      recordTip: '생명과학의 상보적 염기쌍 규칙을 정보 교과의 리스트와 조건문 알고리즘으로 명쾌하게 구현한 융합적 소프트웨어 사고력 부각',
      draftRecordSnippet: `정보 수업에서 '자료구조와 제어문' 단원을 학습하며, 엔트리(Entry)를 활용해 'DNA 상보적 염기 결합 시뮬레이터'를 프로그래밍함. 리스트에 저장된 무작위 DNA 염기서열에 대해 상보적인 mRNA 서열을 조건문으로 자동 변환해 출력하는 알고리즘을 구현하여, 급우들이 유전 정보 전사 과정을 시각적으로 체험하도록 도움.`,
      concreteSteps: create4ConcreteSteps('엔트리 염기 상보결합 게임', 'tech', '리스트 자료구조와 조건문', '엔트리 블록 코딩 및 상보성 구현', ['엔트리', '교과서'], 'basic'),
    });

    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 융합과학탐구)',
      subjectCategory: 'tech',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 파이썬 기초)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 파이썬 문자열 함수를 활용한 유전자 염기 개수 및 GC 함량 계산',
      curriculumConcept: '정보: 프로그래밍 언어의 텍스트 처리 / 문자열 함수와 반복문',
      topic: '파이썬(Python) 기본 문자열 함수를 활용하여 공개된 바이러스 DNA 서열의 길이와 GC 함량(GC Content) 계산기 제작',
      inquiryQuestion: '수천 개의 염기로 이루어진 유전자 서열 텍스트에서 파이썬 count() 함수와 반복문을 활용해 GC 결합 비율을 어떻게 자동 계산하는가?',
      connectionRationale: '고교 정보 교과서 수준의 파이썬 문자열 다루기(count, len)를 실제 유전자 텍스트에 적용하여 생물정보학(Bioinformatics)의 첫걸음을 뗍니다.',
      methodology: 'NCBI에서 인플루엔자 바이러스 유전자 염기 텍스트(FASTA 형식)를 복사하여 파이썬 코드로 GC 함량을 계산하고 콘솔에 출력',
      recommendedTools: ['웹 브라우저 파이썬 실행기 (Colab/Replit)', 'NCBI GenBank'],
      readingRecommendation: '《파이썬으로 배우는 생물정보학》',
      recordTip: '고교 정보에서 배운 파이썬 문자열 처리 기술을 실제 바이러스 유전자 분석에 실용적으로 응용한 컴퓨팅 실무 역량 기술',
      draftRecordSnippet: `정보 시간에 '파이썬 문자열 처리' 단원을 이수하며, 생명과학 연구에서 중요한 지표인 'GC 함량 계산기'를 직접 코딩함. NCBI GenBank에서 공개된 바이러스 염기서열 텍스트를 불러와 len() 및 count() 함수로 G와 C의 비율을 자동 연산하고, GC 비율이 높을수록 DNA 결합 안정성이 높다는 생명 원리와 결부하여 분석 보고서를 작성함.`,
      concreteSteps: create4ConcreteSteps('파이썬 GC 함량 계산기', 'tech', '문자열 처리와 파이썬 프로그래밍', 'Google Colab 코드 작성 및 FASTA 분석', ['Google Colab', 'NCBI'], 'basic'),
    });

    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 융합과학탐구)',
      subjectCategory: 'tech',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · NCBI BLAST API 연동 및 레벤슈타인 편집거리 알고리즘 최적화',
      curriculumConcept: '정보: 동적 계획법(DP)과 알고리즘 시간복잡도 / 인공지능 기초: 문자열 유사도 척도',
      topic: 'NCBI BLAST API 연동 및 파이썬 레벤슈타인 편집 거리(Levenshtein Distance) 알고리즘을 활용한 가이드 RNA 오프타깃 서열 검색 최적화',
      inquiryQuestion: '인간 유전체 빅데이터에서 가이드 RNA(20bp)와 유사한 비표적 서열을 탐색할 때, Big-O 시간복잡도를 줄이기 위한 동적 계획법 최적화는 어떻게 구현되는가?',
      connectionRationale: '바이오 연구는 이제 데이터 사이언스입니다. 정보과의 "동적 계획법"과 "알고리즘 복잡도"를 유전체 서열 유사도 비교에 접목하여 최상위권 전공 적합성을 확보합니다.',
      methodology: 'Jupyter Notebook 환경에서 Python으로 2차원 DP 테이블 기반의 Levenshtein 거리 함수를 구현하고 시간 측정 모듈(timeit)로 벤치마킹',
      recommendedTools: ['Jupyter Notebook / Google Colab', 'Python (BioPython 라이브러리)', 'NCBI BLAST API'],
      readingRecommendation: '《알고리즘 문제 해결 전략》(구종만), 《생물정보학 입문》',
      recordTip: '단순 코딩을 넘어 알고리즘의 시간복잡도를 수리적으로 분석하고 빅데이터 탐색 효율성을 극대화한 뛰어난 컴퓨터공학 및 융합 역량 기술',
      draftRecordSnippet: `정보 교과의 '알고리즘 설계와 시간복잡도' 단원을 심화하여, 유전자 가위의 오프타깃 후보 서열을 탐색하는 동적 계획법(DP) 기반 레벤슈타인 편집 거리 알고리즘을 파이썬으로 구현함. 30억 염기쌍의 방대한 유전체 데이터에서 불일치 염기 3개 이하의 비표적 서열을 효율적으로 필터링하고 실행 시간을 최적화하여 컴퓨터공학과 의생명의 진정한 융합을 선보임.`,
      concreteSteps: create4ConcreteSteps('편집거리 오프타깃 알고리즘', 'tech', '동적 계획법과 시간복잡도', 'Python DP 코드 작성 및 벤치마킹', ['Google Colab', 'BioPython'], 'advanced'),
    });
  }

  // Domain 2: AI, CS & Robotics / Software
  else if (profile.isAi) {
    majorOverview = `'${cleanInterest}' 분야는 알고리즘과 수리적 모델링(정보·수학), 하드웨어 반도체의 물리적 발열 제어(과학), 인공지능 윤리와 저작권 거버넌스(사회), 언어철학과 기계 문체 비판(국어), 글로벌 최신 인공지능법 원문 독해(영어)가 집약된 첨단 융합 영역입니다. 교과서의 기초 개념(기본 2개)부터 전문 모델링(심화 1개)까지 3단계 수준으로 다채롭게 탐구할 수 있습니다.`;
    connectionSummary = `학생의 관심사인 '${cleanInterest}'을 6개 교과와 융합할 때, 수학에서는 일차함수 기초 신경망부터 트랜스포머 소프트맥스 편미분까지, 과학에서는 컴퓨터 발열 소재 관찰부터 액침 냉각 PUE 열역학 분석까지, 사회에서는 AI 표절 예방 수칙부터 AI 저작권 및 편향 감사 법제화까지 수준별 3가지 주제로 폭넓게 확장합니다.`;

    // Math 3 topics
    subjects.push({
      subject: '수학 (미적분 / 확률과 통계 / 인공지능 수학)',
      subjectCategory: 'math',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 교과서 일차함수와 가중치 합을 활용한 인공신경망 기초 이해',
      curriculumConcept: '수학: 일차함수 y=ax+b의 기울기와 절편 / 공통수학: 행렬의 기초 덧셈과 곱셈',
      topic: '고교 수학 "일차함수" 단원을 활용한 단일 퍼셉트론(Perceptron)의 입력값과 가중치(w), 편향(b)의 연산 원리 기초 탐구',
      inquiryQuestion: '인공지능의 기본 단위인 퍼셉트론이 입력을 받아 출력을 결정하는 과정은 중학교·고등학교 일차함수 그래프와 어떻게 일치하는가?',
      connectionRationale: '어려운 다변수 편미분 대신, 고1 수학의 일차함수 기울기(a)가 인공지능의 가중치(w)이고 y절편(b)이 편향(b)이라는 직관적 원리를 누구나 쉽게 이해할 수 있습니다.',
      methodology: '수학 교과서 일차함수 좌표평면에서 두 그룹을 선형으로 분류하는 직선의 방정식 y = wx + b를 손으로 직접 유도하고 시각화',
      recommendedTools: ['수학 교과서', '방안지 또는 지오지브라 그래프'],
      readingRecommendation: '《인공지능을 위한 수학》(프리렉), 《청소년을 위한 인공지능 수학 콘서트》',
      recordTip: '고교 수학의 일차함수와 직선의 방정식을 인공지능의 퍼셉트론 핵심 개념과 연결하여 수학적 직관력을 명쾌하게 증명한 학업 역량 기술',
      draftRecordSnippet: `수학 시간에 '일차함수의 그래프'를 학습한 후, 인공신경망의 기본 단위인 단일 퍼셉트론의 원리에 적용해 봄. 입력값 x와 가중치 w의 곱에 편향 b가 더해지는 구조가 일차함수 y=ax+b의 형태와 일치함을 도출하고, 2차원 평면상에서 데이터를 두 영역으로 구분하는 결정 경계(Decision Boundary)를 직선의 방정식으로 시각화하여 AI의 기본 수학 원리를 완벽히 체득함.`,
      concreteSteps: create4ConcreteSteps('퍼셉트론 일차함수 모델링', '수학', '일차함수와 직선의 방정식', '지오지브라 선형 분류 직선 유도', ['지오지브라', '교과서'], 'basic'),
    });

    subjects.push({
      subject: '수학 (미적분 / 확률과 통계 / 인공지능 수학)',
      subjectCategory: 'math',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 통계 탐색)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 엑셀 추세선을 활용한 인공지능 선형 회귀 예측 오차 계산',
      curriculumConcept: '확률과 통계: 산점도와 상관관계 / 추세선과 잔차(Residual) 분석',
      topic: '학급 설문 데이터 또는 공공 통계로 산점도를 그리고 엑셀 추세선을 활용한 예측값과 실제값의 잔차(오차) 분석',
      inquiryQuestion: '인공지능이 데이터를 학습하여 최적의 예측선을 찾을 때, 잔차의 제곱합(RSS)을 최소화하는 원리는 엑셀 추세선에서 어떻게 관찰되는가?',
      connectionRationale: '선형 회귀의 복잡한 수치최적화 공식을 엑셀의 추세선 기능과 산점도 잔차 계산을 통해 시각적으로 쉽게 이해합니다.',
      methodology: '교내 학생들의 스마트폰 사용 시간과 수면 시간 데이터를 수집하여 엑셀에 입력하고, 추세선 회귀식과 잔차(실제값 - 예측값) 계산',
      recommendedTools: ['Excel 스프레드시트', '구글 스프레드시트'],
      readingRecommendation: '《통계의 미학》(최제호), 《수학, 인문으로 수를 읽다》',
      recordTip: '실제 설문 데이터를 활용해 산점도를 작성하고 잔차 분석을 통해 AI 회귀 모델의 기본 예측 원리를 통계적으로 규명한 분석력 부각',
      draftRecordSnippet: `확률과 통계의 '상관관계와 회귀' 단원을 배우며, 교내 급우 20명의 일일 학습 시간과 시험 점수 데이터를 수집함. 엑셀을 활용해 산점도를 그리고 1차 선형 추세선을 도출한 후, 각 데이터의 관측치와 예측치 간의 잔차(Residual)를 계산함. 인공지능이 오차를 줄여나가는 머신러닝의 학습 기본 원리를 통계적으로 체득하여 급우들에게 발표함.`,
      concreteSteps: create4ConcreteSteps('엑셀 산점도 잔차 분석', '수학', '상관관계와 잔차 분석', '엑셀 추세선 유도 및 오차 계산', ['Excel', '설문 데이터'], 'basic'),
    });

    subjects.push({
      subject: '수학 (미적분 / 확률과 통계 / 인공지능 수학)',
      subjectCategory: 'math',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 트랜스포머 셀프 어텐션과 경사하강법 편미분 수식 모델링',
      curriculumConcept: '인공지능 수학: 벡터의 내적과 코사인 유사도 / 미적분: 다변수 함수의 편미분과 경사하강법(Gradient Descent)',
      topic: '트랜스포머 셀프 어텐션(Self-Attention)의 소프트맥스 정규화와 경사하강법 편미분 수식 모델링 및 LoRA 저순위 행렬 분해',
      inquiryQuestion: 'Query, Key, Value 벡터의 내적과 Softmax 정규화가 어떻게 토큰 간의 맥락적 의미를 수학적으로 계산하며, 손실함수의 편미분으로 가중치를 어떻게 업데이트하는가?',
      connectionRationale: '대규모 언어모델(LLM)의 핵심인 트랜스포머 아키텍처를 고교 "벡터의 내적"과 "미적분의 연쇄법칙(Chain Rule)"을 통해 수리적으로 엄밀하게 증명합니다.',
      methodology: '행렬의 내적, 코사인 유사도, 소프트맥스 함수의 편미분 수식을 유도하고 파이썬 넘파이(NumPy)로 직접 행렬 계산 과정 시각화',
      recommendedTools: ['파이썬 NumPy', '지오지브라 (GeoGebra)', 'Jupyter Notebook'],
      readingRecommendation: '《인공지능을 위한 수학》(프리렉), 《패턴 인식과 머신러닝》(크리스토퍼 비숍)',
      recordTip: '고교 기하와 벡터 및 미적분 개념을 트랜스포머 알고리즘 핵심 수식에 연결하여 증명한 최고 수준의 수학적 사고력 강조',
      draftRecordSnippet: `미적분 및 인공지능 수학 수업에서 '벡터의 내적과 편미분'을 학습한 후, 트랜스포머 모델의 셀프 어텐션 수식을 수학적으로 분해함. Q, K, V 행렬의 스케일드 닷 프로덕트 어텐션 연산 과정을 손으로 직접 전개하고, 소프트맥스 함수의 미분 유도식을 적용해 역전파 시의 그래디언트 소실 문제를 해결하는 수학적 메커니즘을 파이썬 코드로 시각화하여 증명함.`,
      concreteSteps: create4ConcreteSteps('트랜스포머 어텐션 수리 모델링', '수학', '벡터 내적과 다변수 편미분', '파이썬 NumPy 어텐션 연산 시뮬레이션', ['NumPy', 'Jupyter'], 'advanced'),
    });

    // Science 3 topics
    subjects.push({
      subject: '과학 (물리학Ⅰ / 물리학Ⅱ / 화학Ⅰ)',
      subjectCategory: 'science',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 물리학I 전기 회로와 트랜지스터 스위칭 기본 원리',
      curriculumConcept: '물리학Ⅰ: 물질의 전기적 특성과 반도체 / 다이오드와 트랜지스터',
      topic: '물리학I 반도체 단원을 활용한 트랜지스터의 ON/OFF 스위칭 작용과 2진수 0과 1 논리 게이트의 기초 물리 원리 탐구',
      inquiryQuestion: '반도체 p-n 접합과 트랜지스터에 전압을 걸었을 때 전류가 흐르고 차단되는 현상은 컴퓨터가 0과 1을 처리하는 물리적 기초와 어떻게 연결되는가?',
      connectionRationale: '어려운 열역학 대신, 고1/고2 물리학I 교과서에 나오는 반도체 스위치 개념을 통해 소프트웨어와 하드웨어의 연결고리를 누구나 쉽게 이해합니다.',
      methodology: '물리학 교과서 트랜지스터 회로도를 바탕으로 브레드보드(빵판) 가상 시뮬레이션(Tinkercad)에서 스위칭 회로를 직접 조작해보고 전구 점등 관찰',
      recommendedTools: ['틴커캐드 (Tinkercad Circuits)', '물리학 교과서'],
      readingRecommendation: '《모두를 위한 물리학》, 《하드웨어 해커의 세상》',
      recordTip: '물리학 교과서 속 반도체 물리 원리를 컴퓨터의 2진수 논리 연산과 연결하여 기초 공학 소양을 명쾌하게 증명한 탐구력 부각',
      draftRecordSnippet: `물리학Ⅰ '물질의 전기적 특성과 반도체' 단원을 이수하며, 트랜지스터가 컴퓨터의 0과 1을 표현하는 물리적 메커니즘을 탐구함. 틴커캐드(Tinkercad) 회로 시뮬레이터로 p-n-p 트랜지스터 회로를 구성하고 베이스 전압에 따른 전류 스위칭 동작을 가상으로 검증함으로써, 소프트웨어 연산의 물리적 기초를 깊이 있게 체득함.`,
      concreteSteps: create4ConcreteSteps('반도체 트랜지스터 스위칭 실험', 'science', '반도체와 트랜지스터 스위칭', '틴커캐드 회로 시뮬레이션', ['Tinkercad', '교과서'], 'basic'),
    });

    subjects.push({
      subject: '과학 (물리학Ⅰ / 물리학Ⅱ / 화학Ⅰ)',
      subjectCategory: 'science',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 발열 관찰)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 스마트폰/노트북 발열 소재(구리, 알루미늄) 열전도 비교 조사',
      curriculumConcept: '통합과학/물리학: 열의 전달과 금속의 물리적 성질 / 에너지 효율',
      topic: '일상에서 사용하는 스마트폰 및 노트북 부품의 발열 현상 관찰과 방열판 금속(구리 vs 알루미늄)의 열전도율 비교 조사',
      inquiryQuestion: '컴퓨터 부품이 연산을 많이 할 때 발열이 생기는 이유는 무엇이며, 구리와 알루미늄 중 어떤 방열판이 더 효과적으로 열을 방출하는가?',
      connectionRationale: '스마트폰을 오래 쓸 때 뜨거워지는 일상적 현상을 통해 하드웨어 냉각의 필요성과 금속의 비열·열전도율 차이를 쉽게 탐구합니다.',
      methodology: '노트북 및 스마트폰 분해 영상 자료를 조사하여 방열판 소재를 확인하고, 교과서 속 구리·알루미늄의 열전도도 수치를 비교한 보고서 작성',
      recommendedTools: ['스마트폰 하드웨어 모니터링 앱', '물리/화학 교과서'],
      readingRecommendation: '《반도체 공학 입문》, 《열역학 이야기》',
      recordTip: '전자기기의 일상적 발열 문제를 금속의 열전도율과 비열 개념으로 명확히 해석하고 냉각 설계의 원리를 탐구한 융합 공학적 시야 강조',
      draftRecordSnippet: `물리학 수업에서 '열과 에너지' 단원을 학습한 후, 스마트폰 고사양 게임 구동 시 발생하는 발열 현상에 주목함. 하드웨어 모니터링 앱으로 CPU 온도 변화를 측정하고, 방열 부품에 쓰이는 구리와 알루미늄의 열전도율(각각 400 W/mK, 237 W/mK) 및 비열 차이를 분석하여 경량화와 냉각 효율의 공학적 타협점을 논리적으로 제시함.`,
      concreteSteps: create4ConcreteSteps('전자기기 방열 소재 비교', 'science', '열전도율과 금속의 성질', 'CPU 온도 측정 및 금속 열전도도 분석', ['모니터링 앱', '교과서'], 'basic'),
    });

    subjects.push({
      subject: '과학 (물리학Ⅰ / 물리학Ⅱ / 화학Ⅰ)',
      subjectCategory: 'science',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · AI 데이터센터 GPU 발열 제어와 액침 냉각 열수지 분석',
      curriculumConcept: '물리학Ⅱ: 열역학 제1·2법칙 / 푸리에 열전도 법칙(Fourier\"s Law) 및 PUE(전력효율지수)',
      topic: '초거대 AI 데이터센터 GPU의 발열 제어를 위한 액침 냉각(Immersion Cooling) 열전도율 수식 유도 및 PUE 개선 시뮬레이션',
      inquiryQuestion: '초미세 반도체 공정에서 누설 전류로 인한 발열을 공랭식 대비 비전도성 유체 액침 냉각으로 제어할 때 열전도 효율과 에너지 절감률은 어떻게 산출되는가?',
      connectionRationale: '소프트웨어 알고리즘에 머무르지 않고, AI 시대 최대 병목인 데이터센터 전력 소비와 발열 난제를 물리학II 열역학과 유체역학 법칙으로 해결합니다.',
      methodology: '푸리에 열전도 법칙(q = -k * dT/dx) 및 비열 공식을 활용하여 공랭식 팬 대비 액침 냉각의 전력 사용 효율 지수(PUE) 개선치 수치 계산',
      recommendedTools: ['파이썬 SciPy 수치 해석', '데이터센터 에너지 리포트', '물리학II 수식 노트'],
      readingRecommendation: '《컴퓨터 아키텍처: 정량적 접근》(존 헤네시), 《열역학의 본질》',
      recordTip: '컴퓨터공학과 열역학 물리학을 융합하여 인공지능 인프라의 최대 난제인 데이터센터 에너지 효율 문제를 수식으로 증명한 탁월한 공학적 시야 기술',
      draftRecordSnippet: `물리학Ⅱ '열역학' 단원을 심화하여, 생성형 AI 데이터센터의 전력 소모 및 발열 문제를 정량적으로 분석함. 푸리에 열전도 법칙(Fourier's Law)을 적용해 공랭식 대비 비전도성 합성 탄화수소 액침 냉각의 열 전달 계수 차이를 계산함. 데이터센터 전력효율지수(PUE)를 1.5에서 1.08 수준으로 감축하는 모의 열수지 모델을 완성하여 하드웨어 인프라에 대한 깊이 있는 공학적 안목을 입증함.`,
      concreteSteps: create4ConcreteSteps('액침 냉각 열역학 시뮬레이션', 'science', '열역학 법칙과 푸리에 열전도', '푸리에 열전도 방정식 유도 및 PUE 계산', ['물리학II 수식', 'SciPy'], 'advanced'),
    });

    // Social 3 topics
    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 정치와 법)',
      subjectCategory: 'social',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 통합사회 정보 사회와 인권 단원 연계 AI 활용 윤리 수칙 제정',
      curriculumConcept: '통합사회: 정보 사회의 발전과 인권 / 디지털 윤리와 올바른 저작권 이용',
      topic: '통합사회 "정보 사회와 인권" 단원을 바탕으로 한 생성형 AI(ChatGPT 등) 학습 활용 시의 저작권 보호 및 학급 AI 윤리 행동 수칙 제정',
      inquiryQuestion: '생성형 인공지능이 만들어낸 글과 그림을 숙제나 발표에 활용할 때, 원작자의 권리를 지키고 표절을 방지하는 올바른 출처 표기법은 무엇인가?',
      connectionRationale: '어려운 국제 지식재산권 소송 대신, 학생들이 학교 과제에서 매일 마주하는 AI 표절과 저작권 문제를 실천적인 윤리 수칙으로 쉽게 다룹니다.',
      methodology: '한국저작권위원회 청소년 AI 가이드라인을 정독하고, 학급 급우들이 숙제할 때 지켜야 할 "학생 맞춤형 5대 AI 활용 윤리 규칙" 작성',
      recommendedTools: ['한국저작권위원회 가이드 (copyright.or.kr)', '통합사회 교과서'],
      readingRecommendation: '《인공지능 윤리 콘서트》, 《로봇 시대의 법과 윤리》',
      recordTip: '정보 기술의 편리함 뒤에 숨겨진 저작권 침해 위험을 교과서 인권 개념으로 성찰하고 자치 규범을 제정한 성숙한 시민 역량 기술',
      draftRecordSnippet: `통합사회 '정보화와 디지털 윤리' 단원을 학습하며, 교내에서 확산되는 생성형 AI 과제 제출의 표절 문제를 탐구함. 한국저작권위원회의 최신 가이드라인을 분석하여 'AI 생성물 프롬프트 및 출처 표기법'을 정립하고, 학급 급우들을 위한 '청소년 AI 올바른 이용 5대 수칙'을 포스터로 제작하여 학급 자치 규범으로 채택시키는 실천적 리더십을 발휘함.`,
      concreteSteps: create4ConcreteSteps('학급 AI 윤리 수칙 제정', 'social', '정보 사회와 디지털 윤리', '저작권위 가이드 분석 및 5대 수칙 제정', ['저작권위원회', '포스터'], 'basic'),
    });

    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 정치와 법)',
      subjectCategory: 'social',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 미디어 설문)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 알고리즘 추천으로 인한 필터 버블과 확증 편향 실태 설문',
      curriculumConcept: '사회·문화: 대중 매체와 사회적 영향 / 통합사회: 문화적 다양성과 편견 극복',
      topic: '유튜브 및 숏폼 알고리즘 추천으로 인한 청소년 필터 버블(Filter Bubble) 현상과 확증 편향 실태 설문 조사',
      inquiryQuestion: '인공지능의 맞춤형 영상 추천 알고리즘은 청소년들이 다양한 의견을 접하는 기회를 어떻게 차단하고 편견을 강화하는가?',
      connectionRationale: '누구나 매일 경험하는 유튜브 추천 알고리즘을 소재로, 사회문화 교과의 대중매체 영향력과 확증 편향 개념을 재미있게 설문으로 검증합니다.',
      methodology: '구글 설문 폼으로 학급 학생 30명에게 알고리즘 추천 영상 시청 습관과 반대 의견 접촉 빈도를 설문 조사하고 백분율 원그래프 제작',
      recommendedTools: ['Google Forms 설문 도구', 'Excel'],
      readingRecommendation: '《생각하지 않는 사람들》(니콜라스 카), 《필터 버블》(엘리 프레이저)',
      recordTip: '알고리즘 추천 시스템의 사회문화적 부작용을 학생 설문 조사를 통해 실증적으로 규명한 비판적 미디어 사회학 역량 기술',
      draftRecordSnippet: `사회·문화 수업에서 '대중 매체의 사회적 기능'을 배우며, AI 알고리즘의 맞춤형 추천이 낳는 '필터 버블(Filter Bubble)' 현상을 조사함. 교내 학생 30명을 대상으로 숏폼 알고리즘 영상 소비 실태를 설문하고, 78%의 응답자가 자신이 선호하는 견해의 영상만을 지속 추천받아 확증 편향을 경험했음을 통계적으로 분석하여 미디어 다이어트의 필요성을 제언함.`,
      concreteSteps: create4ConcreteSteps('알고리즘 필터버블 설문 분석', 'social', '대중매체와 확증편향', '구글 설문 폼 통계 및 원그래프', ['Google Forms', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 정치와 법)',
      subjectCategory: 'social',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · AI 저작권 공정이용(Fair Use) 법리 분석과 알고리즘 감사 제도',
      curriculumConcept: '정치와 법: 지식재산권과 민법상 손해배상 / 사회문화: 데이터 편향과 사회적 불평등 재생산',
      topic: 'AI 생성물의 저작권 귀속과 공정이용(Fair Use) 법적 쟁점 분석 및 채용 알고리즘 데이터 편향 방지를 위한 알고리즘 감사제도 제언',
      inquiryQuestion: '초거대 언어모델이 인터넷의 인간 창작물을 사전 동의 없이 학습 데이터로 크롤링하는 행위는 저작권 침해인가 정당한 공정이용인가, 그리고 알고리즘 차별을 방지할 법적 기준은 무엇인가?',
      connectionRationale: '글로벌 테크 소송(뉴욕타임스 vs OpenAI)의 최신 쟁점을 정치와 법의 "저작권법 제35조의5(공정이용)" 및 "민법상 침해" 법리로 심도 있게 다룹니다.',
      methodology: '미국 연방대법원 저작권 판례와 유럽 EU AI Act(위험등급제), 한국 저작권법 TDM(텍스트·데이터마이닝) 면책 입법안 비교 분석',
      recommendedTools: ['미국 연방법원 판례 데이터베이스', '국가법령정보센터', 'EU AI Act 원문'],
      readingRecommendation: '《AI는 어떻게 지성인이 되었는가》, 《대량살상 수학무기》(캐시 오닐)',
      recordTip: '최첨단 테크놀로지와 법학·사회학 이론을 융합하여 데이터 저작권과 알고리즘 공정성을 입체적으로 변론한 사회과학적 혜안 기술',
      draftRecordSnippet: `정치와 법 교과의 '지식재산권과 기본권' 단원을 심화하여, 뉴욕타임스 대 OpenAI 저작권 침해 소송의 법리를 심층 분석함. 미국 연방 저작권법 107조의 4대 공정이용 판단 기준(목적, 성격, 사용량, 시장영향)을 1:1로 검토하고, EU AI Act 조항을 벤치마킹하여 국내 TDM(데이터마이닝) 면책 규정 도입 시 창작자 보상 기금을 신설하는 입법 대안을 논리정연하게 제시함.`,
      concreteSteps: create4ConcreteSteps('AI 저작권 공정이용 법리 분석', 'social', '지식재산권과 공정이용', '미국 연방법원 판례 및 EU AI Act 분석', ['미국 판례 DB', 'EU AI Act'], 'advanced'),
    });

    // Korean 3 topics
    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 교양 도서 독해를 통한 AI 창작물의 예술적 가치 찬반 논평 작성',
      curriculumConcept: '독서: 주장과 근거의 적절성 평가하기 / 논평 쓰기',
      topic: '《인공지능 시대의 문학》 등 교양 도서 독해를 바탕으로 한 인공지능 창작물의 예술적 가치 인정에 관한 찬반 논평문 작성',
      inquiryQuestion: '인공지능이 인간의 감정을 흉내 내어 쓴 시와 소설을 과연 진정한 예술적 창작물로 볼 수 있는가?',
      connectionRationale: '복잡한 언어철학 대신, 고교 국어 교과서의 논평 쓰기 방법을 적용하여 AI 시대 예술의 가치에 대한 자기 생각을 알기 쉽게 정리합니다.',
      methodology: 'AI가 창작한 시 1편과 유명 시인의 시 1편을 비교 감상하고, 예술적 가치 인정 여부에 관한 800자 논평문 작성',
      recommendedTools: ['AI 시 창작 플랫폼', '교내 도서관 문학 도서'],
      readingRecommendation: '《로봇이 글을 쓰는 시대》(김태용), 《문학이란 무엇인가》(사르트르)',
      recordTip: '기술 발전이 예술과 문학에 미치는 영향을 문학 교과의 미적 감수성과 논리적 작문력으로 풀어낸 학업 역량 기술',
      draftRecordSnippet: `독서와 작문 수업에서 '예술·철학 텍스트 비판하기'를 수행하며, 인공지능이 창작한 시와 윤동주 시인의 시를 대비 감상함. AI의 시가 형식적 운율과 어휘 배치는 뛰어날지라도 인간의 실존적 고뇌와 역사적 비극성이 결여되어 있음을 지적하며, 문학의 본질은 기교가 아닌 진정성 있는 인간의 삶의 체험에 있다는 성찰을 담은 논평을 집필함.`,
      concreteSteps: create4ConcreteSteps('AI 창작물 예술 가치 논평', 'korean', '예술 텍스트 비판과 논평 쓰기', 'AI 시 vs 인간 시 비교 및 논평 집필', ['AI 텍스트', '문학 도서'], 'basic'),
    });

    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 문체 분석)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 챗봇 답변과 인간 작문의 문장 구조 및 접속사 빈도 비교',
      curriculumConcept: '언어와 매체: 문장의 짜임과 문체적 특성 / 접속 표현과 어휘 선택의 차이',
      topic: '동일한 작문 주제에 대한 생성형 챗봇(ChatGPT) 답변과 고등학생 작문의 접속사 사용 빈도 및 문장 종결 표현 비교 분석',
      inquiryQuestion: '인공지능이 생성한 한국어 문장에는 왜 "그러나, 따라서, 한편" 같은 접속 부사와 평서문 종결어미가 부자연스럽게 반복되는가?',
      connectionRationale: '실제 챗봇에게 글을 써보게 하고 자신의 글과 문장 성분을 비교함으로써, 국어 문법의 문장론과 문체적 특성을 재미있게 발견합니다.',
      methodology: '동일한 "환경 보호" 논설문 주제에 대해 AI 생성문과 학생 작성문 각 500자를 비교하여 접속사 빈도수 및 문장 평균 길이 계산',
      recommendedTools: ['ChatGPT 무료 웹 버전', 'Excel 문장 분석 시트'],
      readingRecommendation: '《문장 강화》(이태준), 《한국어 문법론》',
      recordTip: '인공지능 텍스트와 인간 언어의 미세한 문체적·문법적 편차를 정량 분석하여 국어과 문법 통찰력을 입증한 탐구력 부각',
      draftRecordSnippet: `언어와 매체의 '문장의 짜임과 담화' 단원을 학습하며, ChatGPT가 작성한 에세이와 교내 학생 에세이 각 1,000자의 문체적 특성을 비교 분석함. AI 텍스트에서 접속 부사('또한, 따라서')의 사용 빈도가 인간 텍스트보다 3배 이상 높고 수동 피동 표현이 빈번함을 도출하여, 기계적 언어 생성의 문법적 한계와 자연스러운 한국어 문체의 소중함을 강조함.`,
      concreteSteps: create4ConcreteSteps('AI 문체 문법적 비교 분석', 'korean', '문장의 짜임과 접속사 빈도', 'AI문 vs 학생문 접속사 빈도 집계', ['ChatGPT', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 존 설의 "중국어 방" 사고실험과 확률적 앵무새 비판 학술 에세이',
      curriculumConcept: '독서: 인문 철학 텍스트(심리철학, 기호학) 심층 독해 / 화법과 작문: 논증의 정교화',
      topic: '존 설(John Searle)의 "중국어 방(Chinese Room)" 사고실험과 대규모 언어모델(LLM)의 기호 조작 한계에 관한 비판적 학술 에세이 집필',
      inquiryQuestion: '통계적 확률로 다음 단어를 예측하는 확률적 앵무새(Stochastic Parrot)는 진정한 언어 이해와 지향성(Intentionality)에 도달할 수 있는가?',
      connectionRationale: '기호학과 심리철학의 고전 논쟁인 "중국어 방"을 현대 트랜스포머 언어모델과 결합하여, 인공지능의 지능이란 무엇인가에 대한 인문학적 깊이를 세특에 담아냅니다.',
      methodology: '존 설의 원전 번역본과 현대 인지과학 논문(벤지오, 르쿤의 견해)을 대조하여 기호론적 구문론(Syntax)과 의미론(Semantics)의 단절을 논증하는 4매 에세이 작성',
      recommendedTools: ['RISS 학술 논문 검색', '철학 사전 및 원전'],
      readingRecommendation: '《괴델, 에셔, 바흐》(더글러스 호프스태터), 《마음의 아이들》(한스 모라벡)',
      recordTip: '고급 인지언어학과 심리철학 이론을 통해 최신 LLM의 한계를 날카롭게 사유하고 학술적인 필치로 집필한 최고 수준의 인문학적 깊이 부각',
      draftRecordSnippet: `독서 수업에서 '기호학과 인지철학' 단원을 심화하여, 존 설의 '중국어 방' 사고실험을 대규모 언어모델(LLM)에 적용한 심층 학술 에세이를 집필함. AI가 방대한 매개변수로 구문론적(Syntactic) 일관성을 달성했을지라도 인간과 같은 의미론적(Semantic) 지향성에는 도달하지 못했음을 논리적으로 전개하며, 인공지능 시대에 인간 고유의 사유 능력을 재정립함.`,
      concreteSteps: create4ConcreteSteps('중국어 방 심리철학 에세이', 'korean', '기호학과 언어 심리철학', '존 설 원전 분석 및 학술 에세이 집필', ['RISS', '원전 번역서'], 'advanced'),
    });

    // English 3 topics
    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 청소년용 해외 테크 매체(MIT Tech Review Youth) 기초 어휘 학습',
      curriculumConcept: '영어: 정보 통신 기술 관련 영문 텍스트의 중심 내용 파악',
      topic: '청소년용 해외 테크 저널을 활용한 머신러닝 및 로봇 공학 기초 영단어 30선 단어장 제작',
      inquiryQuestion: '인공지능 뉴스에서 자주 쓰이는 "algorithm, autonomous, neural network" 등의 단어가 영문 기사에서 어떻게 사용되는가?',
      connectionRationale: '어려운 원서 논문 대신 고교생 수준의 시사 영문 테크 뉴스를 통해 어휘력과 독해력을 동시에 키웁니다.',
      methodology: '해외 테크 뉴스 사이트에서 청소년 대상 AI 해설 기사 1편을 발췌하여 모르는 어휘를 정리하고 예문을 기록하는 단어장 작성',
      recommendedTools: ['MIT Technology Review / Wired Youth', '영어사전'],
      readingRecommendation: '《Word Power in Technology》',
      recordTip: '글로벌 테크 뉴스를 주도적으로 찾아 읽고 전공 관련 기초 영단어를 예문과 함께 체계적으로 정리한 성실한 어학 역량 기술',
      draftRecordSnippet: `영어 시간에 '주제별 시사 영어'를 탐구하며 해외 IT 저널의 자율주행 알고리즘 해설 기사를 완독함. 'autonomous, perception, sensor fusion' 등 핵심 컴퓨터공학 영단어 30개를 추출하고, 문맥 속에서 단어의 품사와 쓰임새를 분석한 영문 단어장을 제작하여 학급 영어 학습 동아리에 기여함.`,
      concreteSteps: create4ConcreteSteps('해외 테크 뉴스 어휘 단어장', 'english', '정보통신 어휘와 중심 내용', '영문 테크 기사 독해 및 단어장 작성', ['Wired', '영어사전'], 'basic'),
    });

    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · UNESCO 권고안)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 유네스코(UNESCO) 인공지능 윤리 권고안 영문 팸플릿 번역',
      curriculumConcept: '영어: 공공 가이드라인 영문 텍스트의 핵심 주장 파악 및 한국어 번역',
      topic: '유네스코(UNESCO) 인공지능 윤리 권고안(Recommendation on the Ethics of AI) 요약본 번역 및 학급 전시물 제작',
      inquiryQuestion: '국제기구 유네스코가 전 세계에 권고하는 "공정성(Fairness)"과 "투명성(Transparency)"의 영문 정의는 무엇인가?',
      connectionRationale: '유네스코 공식 문서를 통해 신뢰성 있는 영어 표현을 배우고, 인공지능 윤리에 관한 글로벌 표준을 체득합니다.',
      methodology: 'UNESCO 웹사이트에서 공식 브로슈어를 발췌하여 4대 가치와 10대 원칙을 번역하고 학급 게시용 인포그래픽 포스터 제작',
      recommendedTools: ['UNESCO 공식 웹사이트 (unesco.org)', '디자인 도구'],
      readingRecommendation: '《유네스코 인공지능 윤리 권고 원문》',
      recordTip: '국제기구 공식 영문 문건을 정확히 독해하고 대중적인 우리말 번역물로 재구성한 실용 다국어 소통력 부각',
      draftRecordSnippet: `영어 교과의 '글로벌 공공 문서 독해' 활동의 일환으로 유네스코(UNESCO)의 '인공지능 윤리 권고안' 원문을 분석함. 'Human oversight, data privacy, accountability' 등 핵심 영문 조항의 뉘앙스를 살려 한국어로 번역하고, 학급 급우들이 한눈에 볼 수 있도록 요약 인포그래픽을 제작하여 국제 사회의 규범을 공유함.`,
      concreteSteps: create4ConcreteSteps('유네스코 AI 윤리 권고 번역', 'english', '국제기구 문서 번역', 'UNESCO 자료 번역 및 요약 포스터', ['UNESCO', 'Canva'], 'basic'),
    });

    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 유럽연합 EU AI Act 원문 법령 분석 및 영문 Executive Summary',
      curriculumConcept: '심화영어: 법률·기술 영어(Legal & Tech English) 독해 및 250단어 Executive Summary 작성',
      topic: '유럽연합 EU AI Act(인공지능법) 위험 등급 분류(Risk-based Classification) 원문 조항 분석 및 250단어 영문 Executive Summary 작성',
      inquiryQuestion: '세계 최초의 포괄적 AI 규제법인 EU AI Act는 고위험 AI(High-Risk AI)를 어떤 정밀한 법률 영어(Legal English) 요건으로 규정하고 있는가?',
      connectionRationale: '세계 최초의 포괄적 AI 규제 법률인 EU AI Act의 원문을 직접 강독하여 최상위권 학생다운 전문적인 법률·기술 영어 역량을 입증합니다.',
      methodology: '유럽의회 공식 웹사이트에서 EU AI Act 전문 중 "고위험 AI 시스템" 조항을 발췌하여 법률 어휘 분석 및 요약 보고서 작성',
      recommendedTools: ['EUR-Lex 유럽법령 포털', 'Grammarly', 'Google Scholar'],
      readingRecommendation: '《The EU Artificial Intelligence Act: A Commentary》',
      recordTip: '세계 최고의 테크 법령 원문을 고난도 법률 영어로 정밀 독해하고 영어 구조화 요약서를 작성해낸 탁월한 글로벌 지적 역량 강조',
      draftRecordSnippet: `심화영어 수업에서 유럽연합의 'EU AI Act' 전문을 강독하며, 고위험 AI에 부과되는 '적합성 평가(Conformity Assessment)'와 '인간 감독(Human Oversight)' 법률 조항을 분석함. 법률 영어의 엄밀한 문장 구조를 파악하고, 국내 AI 법안에 주는 시사점을 담아 250단어 영문 Executive Summary를 작성하여 영어 모의의회에서 발표함.`,
      concreteSteps: create4ConcreteSteps('EU AI Act 원문 법안 요약', 'english', '법률·기술 영어와 요약서', 'EUR-Lex 법령 분석 및 영문 보고서', ['EUR-Lex', 'Grammarly'], 'advanced'),
    });

    // Tech 3 topics
    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 프로그래밍)',
      subjectCategory: 'tech',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 엔트리 인공지능 블록을 활용한 재활용품 이미지 분류기 제작',
      curriculumConcept: '인공지능 기초: 머신러닝의 지도학습(Supervised Learning) / 이미지 데이터 라벨링',
      topic: '엔트리(Entry) 인공지능 이미지 학습 블록을 활용한 교내 재활용 쓰레기 자동 분류기 프로토타입 제작',
      inquiryQuestion: '페트병과 캔, 종이컵 사진 데이터를 인공지능 모델에 지도학습시킬 때, 모델의 분류 정확도를 높이기 위한 데이터셋의 조건은 무엇인가?',
      connectionRationale: '코딩 문법의 장벽 없이 엔트리의 AI 블록을 활용하여 지도학습의 핵심 과정(데이터 수집, 라벨링, 모델 학습, 테스트)을 온전히 체험합니다.',
      methodology: '교내 재활용 쓰레기 3종류 사진을 20장씩 촬영하여 엔트리 모델에 학습시키고, 새로운 쓰레기 사진을 인식시켜 분류 정확도 측정',
      recommendedTools: ['엔트리 인공지능 블록 (playentry.org)', '스마트폰 카메라'],
      readingRecommendation: '《모두를 위한 인공지능》(앤드류 응)',
      recordTip: '머신러닝 지도학습의 전 주기를 엔트리 블록으로 직접 구현하고 데이터 품질이 분류율에 미치는 영향을 규명한 인공지능 소양 기술',
      draftRecordSnippet: `인공지능 기초 수업에서 '지도학습과 모델 훈련'을 학습하며, 엔트리(Entry) 인공지능 블록으로 '교내 재활용 분리수거 분류기'를 제작함. 플라스틱과 캔 사진 60장을 직접 촬영 및 라벨링하여 모델을 훈련시키고, 빛 반사나 각도에 따른 인식 오차를 발견하여 다양한 조명 하의 데이터를 추가 보강함으로써 정확도를 92%까지 개선함.`,
      concreteSteps: create4ConcreteSteps('엔트리 이미지 분류기 제작', 'tech', '지도학습과 이미지 분류', '사진 60장 학습 및 정확도 측정', ['엔트리 AI', '카메라'], 'basic'),
    });

    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 프로그래밍)',
      subjectCategory: 'tech',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 파이썬 알고리즘)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 파이썬 기초 정렬 알고리즘(버블 정렬 vs 선택 정렬) 비교',
      curriculumConcept: '정보: 기초 알고리즘 / 정렬과 탐색 / 시간 측정',
      topic: '파이썬(Python) 기본 리스트 정렬 알고리즘(버블 정렬 vs 선택 정렬) 구현 및 데이터 개수에 따른 연산 횟수 비교',
      inquiryQuestion: '학생 100명의 시험 점수 데이터를 정렬할 때, 버블 정렬과 선택 정렬 중 어떤 알고리즘이 더 적은 비교 연산 횟수를 필요로 하는가?',
      connectionRationale: '고교 정보 교과서의 필수 단원인 정렬 알고리즘을 직접 코딩하여 컴퓨터가 데이터를 어떻게 효율적으로 정리하는지 수치로 체감합니다.',
      methodology: '파이썬 코드로 버블 정렬과 선택 정렬 함수를 작성하고, 무작위 숫자 리스트(50개, 100개)에 대해 비교 횟수 카운터를 비교 출력',
      recommendedTools: ['Google Colab / Replit', '정보 교과서'],
      readingRecommendation: '《Hello Coding 그림으로 개념을 이해하는 알고리즘》',
      recordTip: '정렬 알고리즘의 작동 방식을 파이썬 코드로 명확히 구현하고 연산 횟수를 수치적으로 비교한 뛰어난 논리적 알고리즘 설계력 기술',
      draftRecordSnippet: `정보 시간에 '정렬 알고리즘' 단원을 배우며, 파이썬으로 버블 정렬과 선택 정렬을 직접 코딩함. 난수 100개로 구성된 리스트를 정렬할 때 두 알고리즘의 원소 비교 횟수와 위치 교환(Swap) 횟수를 변수로 계측함. 데이터 상태에 따라 알고리즘의 효율성이 달라짐을 비교 그래프로 도출하여 소프트웨어 최적화의 중요성을 확인함.`,
      concreteSteps: create4ConcreteSteps('파이썬 정렬 알고리즘 비교', 'tech', '정렬 알고리즘과 연산 횟수', '파이썬 코드 작성 및 비교 횟수 측정', ['Google Colab', '교과서'], 'basic'),
    });

    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 프로그래밍)',
      subjectCategory: 'tech',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · Big-O 시간복잡도 분석과 희소 행렬 연산 메모리 최적화',
      curriculumConcept: '정보: 알고리즘 복잡도(Big-O 표기법) / 자료구조(연결 리스트, 희소 행렬) / 파이썬 SciPy',
      topic: 'Big-O 시간·공간 복잡도 벤치마킹 및 파이썬 희소 행렬(Sparse Matrix, CSR 형식) 연산 메모리 최적화 알고리즘 구현',
      inquiryQuestion: '대규모 언어모델의 방대한 파라미터 행렬(대부분이 0인 행렬)을 밀집 행렬(Dense) 대비 CSR(Compressed Sparse Row) 포맷으로 처리할 때 메모리 절감율과 실행 속도는 어떻게 최적화되는가?',
      connectionRationale: '단순 프로그래밍을 넘어, 대용량 AI 인프라의 핵심인 행렬 메모리 최적화 기법을 대학 수준의 자료구조와 Big-O 복잡도 분석으로 입증합니다.',
      methodology: '파이썬 SciPy의 csr_matrix 라이브러리와 NumPy를 사용하여 1000x1000 희소 행렬의 곱셈 실행 시간(timeit) 및 메모리 점유량(tracemalloc) 비교',
      recommendedTools: ['Google Colab', '파이썬 SciPy/NumPy', 'tracemalloc 모듈'],
      readingRecommendation: '《알고리즘 문제 해결 전략》(구종만), 《Introduction to Algorithms》',
      recordTip: '단순 코딩을 넘어 알고리즘의 시간 및 공간 복잡도를 정량적으로 벤치마킹하고 최적화 자료구조를 적용한 독보적인 컴퓨터공학 실무력 기술',
      draftRecordSnippet: `정보 교과의 '자료구조와 시간복잡도' 단원을 심화하여, 인공신경망의 거대 가중치 행렬을 다루는 파이썬 희소 행렬(CSR) 최적화 코드를 구현함. 90% 이상이 0으로 채워진 대형 행렬 연산 시, 기본 밀집 행렬 대비 메모리 사용량을 80% 이상 절감하고 Big-O 공간복잡도를 획기적으로 개선함을 tracemalloc 모듈로 정량 검증함.`,
      concreteSteps: create4ConcreteSteps('희소 행렬 메모리 최적화', 'tech', 'Big-O 복잡도와 희소 행렬', '파이썬 CSR 구현 및 메모리 벤치마킹', ['Google Colab', 'SciPy'], 'advanced'),
    });
  }

  // Domain 3: Environment, Climate & Energy
  else if (profile.isEnvOrClimate || profile.isBatteryOrSemiconductor) {
    majorOverview = `'${cleanInterest}' 분야는 신재생에너지 및 이차전지의 전기화학적 메커니즘 규명부터 탄소국경조정제도(CBAM) 등 경제 정책, 기후 정의에 이르는 핵심적인 현대 융합 과학 영역입니다. 기초 교과서 속 에너지와 화학 원리(기본 2개)부터, 배터리 방전 곡선의 미적분 모델링 및 IPCC 원문 강독(심화 1개)까지 3가지 수준의 다채로운 선택지를 제공합니다.`;
    connectionSummary = `학생의 관심 분야인 '${cleanInterest}'을 6개 교과와 융합하여, 수학에서는 전기 사용량 평균·분산부터 이차전지 에너지 밀도 정적분 모델링까지, 과학에서는 과일 전지 간이 실험부터 양극재 산화환원 MBL 분석까지, 사회는 친환경 소비 실천부터 탄소세 경제학 분석까지 수준별 3가지 주제로 폭넓게 설계합니다.`;

    // Math 3 topics
    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 지수와 로그 단원을 활용한 온실가스 반감기 기초 수치 계산',
      curriculumConcept: '수학: 지수함수와 로그함수의 활용 / 반감기 공식',
      topic: '고교 수학 "지수함수와 로그함수" 단원을 활용한 대기 중 온실가스(메탄, 이산화탄소) 잔존 반감기 수치 계산 모델링',
      inquiryQuestion: '메탄가스가 대기 중에서 자연 분해될 때, 지수함수적 감쇄 공식을 활용하여 10년, 20년 후 잔존 농도를 어떻게 계산할 수 있는가?',
      connectionRationale: '고1/고2 수학의 대표적인 활용 단원인 지수·로그 감쇄 공식을 기후 변화 온실가스 농도에 직접 적용하여 친근하게 이해합니다.',
      methodology: '교과서 속 방사성 동위원소 반감기 수식 N(t) = N0 * (1/2)^(t/h)를 메탄의 대기 체류 시간(약 12년)에 대입하여 연도별 감소율 계산',
      recommendedTools: ['수학 교과서', 'Excel 또는 공학용 계산기'],
      readingRecommendation: '《수학으로 생각하는 힘》(키트 예이츠), 《지구온난화의 부메랑》',
      recordTip: '고교 수학의 지수·로그 감쇄 모델을 대기 환경 온실가스 분해 주기에 접목하여 수리적 응용력을 보여준 탐구 태도 부각',
      draftRecordSnippet: `수학 시간에 '지수함수의 활용'을 배우며, 대기 중 메탄(CH4)의 농도 감소에 주목함. 메탄의 대기 잔존 반감기(약 12년)를 지수감쇄 수식에 대입하여 50년 후 잔류 비율을 수학적으로 계산함. 이산화탄소보다 온난화 지수가 높지만 단기 감축 효과가 큰 메탄의 수리적 특성을 증명하여 기후 정책의 우선순위를 명확히 제시함.`,
      concreteSteps: create4ConcreteSteps('온실가스 반감기 지수함수 계산', '수학', '지수함수와 감쇄 모델', '메탄 반감기 수식 계산', ['교과서', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 통계 탐색)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 한국전력 전력 통계를 활용한 우리 동네 전력 소비 패턴 분석',
      curriculumConcept: '확률과 통계: 시계열 데이터의 평균과 표준편차 / 꺾은선그래프 시각화',
      topic: '한국전력 빅데이터센터 공개 데이터를 활용한 계절별·시간대별 가정용 전력 소비량의 평균 및 피크 타임 변동폭 분석',
      inquiryQuestion: '여름철과 겨울철의 일일 시간대별 전력 소비 데이터에서 최대 전력(피크) 시간대와 평균 소비량의 편차는 어느 정도인가?',
      connectionRationale: '누구나 매달 고지서로 접하는 전기 사용량 데이터를 공공 빅데이터 포털에서 내려받아 기초 통계로 쉽게 분석합니다.',
      methodology: '한전 빅데이터센터에서 시·도별 시간대별 전력 사용량 CSV를 추출하여 엑셀 꺾은선그래프로 피크 시간대와 표준편차 산출',
      recommendedTools: ['한전 전력데이터 개방포털 (bigdata.kepco.co.kr)', 'Excel'],
      readingRecommendation: '《통계의 미학》(최제호), 《에너지 전환의 경제학》',
      recordTip: '실제 전력 소비 공공데이터를 주도적으로 가공하여 에너지 피크 관리의 필요성을 통계적으로 증명한 우수한 데이터 리터러시 기술',
      draftRecordSnippet: `확률과 통계의 '자료의 정리와 해석' 단원을 이수하며, 한전 전력데이터 개방포털에서 하계·동계 시간대별 전력 소비 통계를 분석함. 오후 2시~4시 사이의 피크 타임 전력량이 일일 평균치보다 42% 이상 높게 치솟는 변동성을 도출하고, 피크 시간대 분산을 위한 에너지 절약 가이드라인을 통계적으로 제안함.`,
      concreteSteps: create4ConcreteSteps('전력 소비 시계열 통계 분석', '수학', '대푯값과 시계열 그래프', '한전 데이터 정제 및 피크 분석', ['한전 포털', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 이차전지 충·방전 전압 곡선의 정적분 에너지 밀도 계산',
      curriculumConcept: '미적분: 정적분을 이용한 곡선 아래의 면적(일과 에너지) / 아레니우스 수식의 로그 모델링',
      topic: '이차전지 충·방전 전압-용량 곡선의 정적분 에너지 밀도(Wh) 계산 및 아레니우스 식을 활용한 배터리 열화 수명 감쇄 수리 모델링',
      inquiryQuestion: '배터리 방전 시 전압 강하 곡선을 시간에 대해 정적분할 때 실제 방출 에너지(Wh)는 어떻게 유도되며, 온도 상승에 따른 용량 퇴화율은 어떻게 수리적으로 예측되는가?',
      connectionRationale: '전기차 배터리의 핵심 지표인 "에너지 밀도"와 "수명 열화"를 미적분의 "정적분을 이용한 일의 양 계산" 및 화학반응속도의 아레니우스 수식으로 완벽히 정량화합니다.',
      methodology: '이차전지 논문 실험 데이터의 방전 전압 곡선(V-Q)을 다항함수로 피팅하여 정적분으로 총 에너지 산출 및 온도별 수명 감소율 계산',
      recommendedTools: ['지오지브라 (GeoGebra)', '파이썬 NumPy', 'KCI 배터리 연구 논문'],
      readingRecommendation: '《배터리 전쟁》(스티브 레빈), 《미적분의 힘》',
      recordTip: '이차전지의 공학적 난제를 교과서 속 정적분의 기하학적 넓이 계산과 화학반응식으로 모델링해낸 뛰어난 수리·공학 융합 역량 기술',
      draftRecordSnippet: `미적분 수업 중 '정적분의 활용' 단원을 심화하여, 리튬이온 배터리의 방전 전압 곡선(V-Q)을 정적분함으로써 실제 배터리가 방출하는 유효 에너지량(Wh)을 수리적으로 산출함. 또한 온도 상승에 따른 전해액 열화율을 아레니우스 식을 결합한 지수함수 모델로 구축하여, 고온 환경에서의 배터리 수명 감쇄율을 성공적으로 시뮬레이션함.`,
      concreteSteps: create4ConcreteSteps('배터리 방전 곡선 정적분 모델링', '수학', '정적분의 활용과 에너지 밀도', '지오지브라 V-Q 곡선 적분 유도', ['지오지브라', '선행 논문'], 'advanced'),
    });

    // Science 3 topics
    subjects.push({
      subject: '과학 (통합과학 / 화학Ⅰ / 물리학Ⅰ)',
      subjectCategory: 'science',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 통합과학 발전과 신재생에너지 단원 연계 태양광 기초 원리',
      curriculumConcept: '통합과학: 발전과 신재생에너지 / 광전효과와 태양광 발전의 기본 개념',
      topic: '통합과학 "발전과 신재생에너지" 단원을 기반으로 한 소형 태양광 패널의 일조 각도별 전압 측정 간이 실험',
      inquiryQuestion: '태양광 패널에 입사하는 빛의 각도가 수직에서 기울어질 때 발전 전압과 전류는 교과서 속 에너지 보존 법칙으로 어떻게 설명되는가?',
      connectionRationale: '교내 과학실의 미니 태양광 패널과 멀티미터로 누구나 쉽게 빛의 각도와 발전량의 상관관계를 실험할 수 있습니다.',
      methodology: '소형 태양전지판과 스탠드 조명을 설치하고 30도, 60도, 90도 각도 변화에 따른 전압을 멀티미터로 3회 반복 측정',
      recommendedTools: ['소형 태양광 셀', '디지털 멀티미터', '각도기, 조명'],
      readingRecommendation: '《태양광이 세상을 바꾼다》, 《청소년을 위한 에너지 교과서》',
      recordTip: '신재생에너지 발전 원리를 교내 간이 계측 실험으로 직접 설계하고 입사각과 에너지 효율의 상관관계를 증명한 탐구 태도 부각',
      draftRecordSnippet: `통합과학 '신재생에너지 발전' 단원을 배우며, 소형 태양전지판의 빛 입사각에 따른 발전 효율 변화를 실험함. 스탠드 조명의 조사 각도를 30도에서 90도까지 변경하며 디지털 멀티미터로 출력 전압을 측정한 결과, 입사각이 수직에 가까울수록 단위 면적당 수열 에너지가 극대화됨을 실증적으로 확인함.`,
      concreteSteps: create4ConcreteSteps('태양광 패널 입사각 실험', 'science', '신재생에너지 발전과 광전효과', '각도별 멀티미터 전압 측정', ['태양광 패널', '멀티미터'], 'basic'),
    });

    subjects.push({
      subject: '과학 (통합과학 / 화학Ⅰ / 물리학Ⅰ)',
      subjectCategory: 'science',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 모의 실험)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 과일 전지 실험을 통한 금속 이온화 경향성과 기전력 측정',
      curriculumConcept: '화학Ⅰ: 산화 환원 반응과 금속의 이온화 경향성 / 볼타 전지의 원리',
      topic: '레몬·사과 등 과일을 활용한 간이 볼타 전지 제작 및 아연-구리 전극의 이온화 경향성에 따른 기전력(전압) 비교',
      inquiryQuestion: '과일 속 전해질 용액에 아연판과 구리판을 꽂았을 때 전구에 불이 들어오는 산화·환원 메커니즘은 무엇인가?',
      connectionRationale: '친숙한 과일과 금속판을 이용한 볼타 전지 실험을 통해 배터리의 기본 원리인 산화·환원 반응을 오감으로 체험합니다.',
      methodology: '레몬 2개에 아연판과 구리판을 꽂고 직렬 연결하여 LED 전구를 켜고, 화학 교과서 금속 이온화 서열과 전압 크기 비교',
      recommendedTools: ['레몬/과일', '아연판, 구리판', 'LED, 전선, 멀티미터'],
      readingRecommendation: '《화학으로 이루어진 세상》, 《배터리의 역사》',
      recordTip: '산화·환원과 금속 이온화 경향성을 과일 전지 실험으로 명쾌하게 입증하고 전지 화학의 기초를 체득한 성실한 과학 탐구력 기술',
      draftRecordSnippet: `화학Ⅰ '산화와 환원 반응' 단원을 학습한 후, 레몬을 이용한 간이 볼타 전지를 제작함. 이온화 경향이 큰 아연판에서 산화 반응으로 전자가 방출되고 구리판에서 수소 이온이 환원되는 메커니즘을 멀티미터 전압 측정(약 0.9V)으로 입증하며, 화학 에너지가 전기 에너지로 변환되는 배터리의 원리를 명확히 이해함.`,
      concreteSteps: create4ConcreteSteps('과일 전지 산화환원 실험', 'science', '산화 환원과 금속 이온화', '레몬 전지 제작 및 LED 점등', ['과일', '아연·구리판'], 'basic'),
    });

    subjects.push({
      subject: '과학 (통합과학 / 화학Ⅰ / 물리학Ⅰ)',
      subjectCategory: 'science',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 이차전지 양극재 산화환원 반응과 전고체 배터리 이온 전도도 분석',
      curriculumConcept: '화학Ⅰ/Ⅱ: 산화환원과 표준환원전위 / 깁스 자유에너지 / 고체 전해질 결정 격자',
      topic: 'NCM 삼원계 양극재의 리튬 탈리/삽입 산화환원 메커니즘 규명 및 전고체 배터리 황화물계 전해질의 결정 격자 이온 전도도 비교',
      inquiryQuestion: '전이금속(Ni, Co, Mn)의 산화수 변화가 고용량 양극재의 구조적 안정성에 미치는 영향과 고체 전해질의 리튬 이온 전도 경로 메커니즘은 무엇인가?',
      connectionRationale: '현대 이차전지 첨단 난제인 "화재 위험 극복(전고체)"과 "하이니켈 양극재 열화"를 화학II의 표준환원전위 및 분자 결정 격자 이론과 결합하여 깊이 있게 파고듭니다.',
      methodology: 'KCI 선행 논문 2편을 분석하여 Ni 함량(60% vs 80%)에 따른 산화수 변화와 황화물계 고체 전해질의 결정 격자 경로 Matrix 작성',
      recommendedTools: ['KCI/RISS 학술 논문', 'Materials Project 분자 결정 뷰어'],
      readingRecommendation: '《이차전지 승자의 조건》(박철완), 《현대 전기화학》',
      recordTip: '전이금속의 산화수 변화와 결정 격자 내 이온 확산 경로를 화학적으로 깊이 있게 분석한 최우수 이공계 전공 탐구 역량 기술',
      draftRecordSnippet: `화학Ⅱ '화학 반응과 에너지' 단원을 심화하여, 차세대 전고체 배터리의 핵심 소재를 탐구함. 하이니켈(NCM811) 양극재에서 리튬 탈리 시 니켈 이온의 산화수 변화(Ni3+→Ni4+)에 따른 구조적 불안정성을 분석하고, 황화물계 고체 전해질의 결정 격자 내 리튬 이온 점핑 메커니즘을 화학 결합 에너지 관점에서 정밀 규명함.`,
      concreteSteps: create4ConcreteSteps('양극재 산화환원 및 전고체 분석', 'science', '표준환원전위와 결정 격자', '논문 Matrix 작성 및 결정구조 분석', ['Materials Project', 'KCI 논문'], 'advanced'),
    });

    // Social 3 topics
    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 경제)',
      subjectCategory: 'social',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 통합사회 환경 위기와 녹색소비 실천 방안',
      curriculumConcept: '통합사회: 환경 위기와 지속 가능한 발전 / 윤리적 소비(녹색소비)',
      topic: '통합사회 "환경 위기와 지속 가능한 발전" 단원을 바탕으로 한 일상 속 탄소 발자국 줄이기 녹색소비 실천 보고서 작성',
      inquiryQuestion: '소비자가 친환경 인증 마크 제품을 선택하거나 대중교통을 이용하는 윤리적 소비 행위는 온실가스 감축에 얼마나 기여하는가?',
      connectionRationale: '어려운 탄소배출권 시장 대신, 교과서의 윤리적 소비와 탄소 발자국 계산을 통해 누구나 실천적인 탐구를 시작할 수 있습니다.',
      methodology: '한국환경산업기술원 탄소발자국 계산기를 이용해 일주일간 자신의 탄소 배출량을 계산하고 친환경 생활 습관 실천 일지 작성',
      recommendedTools: ['환경부 탄소발자국 계산기', '통합사회 교과서'],
      readingRecommendation: '《착한 소비 윤리적 소비》(강수돌), 《지구온난화 이야기》',
      recordTip: '교과서 환경 단원의 개념을 자신의 일상생활 소비 패턴과 결부지어 성찰하고 실천적 대안을 도출한 모범적 시민 의식 기술',
      draftRecordSnippet: `통합사회 수업 중 '환경 위기와 지속 가능한 삶' 단원을 이수하며, 환경부 탄소발자국 계산기를 활용해 일주일간의 개인 온실가스 배출량을 직접 산출함. 텀블러 사용과 로컬푸드 소비가 탄소 배출을 줄이는 기여도를 수치로 확인하고, 학급 내 '녹색소비 실천 챌린지'를 기획하여 급우들의 동참을 이끌어냄.`,
      concreteSteps: create4ConcreteSteps('탄소발자국 녹색소비 실천', 'social', '지속가능발전과 윤리적 소비', '탄소계산기 측정 및 실천 일지', ['환경부 계산기', '교과서'], 'basic'),
    });

    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 경제)',
      subjectCategory: 'social',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 지자체 조례)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 일회용품 보증금제 및 전기차 보조금 정책 설문 조사',
      curriculumConcept: '경제: 정부의 시장 개입과 보조금 정책 / 환경 규제의 실효성',
      topic: '일회용 컵 보증금제 및 전기차 구매 보조금 지원 정책에 대한 교내 학생 및 학부모 수용성 설문 조사',
      inquiryQuestion: '가격 인센티브(보조금)와 환경 규제(보증금제) 중 어떤 정책 수단이 대중의 친환경 행동 전환에 더 효과적인가?',
      connectionRationale: '뉴스에 자주 보도되는 일회용 컵 보증금제와 전기차 보조금 사례를 통해 경제 교과의 인센티브와 정부 개입 원리를 쉽게 배웁니다.',
      methodology: '학급 및 주변인 30명을 대상으로 친환경 정책 인센티브 선호도 설문 조사를 실시하고 경제적 유인 효과 비교',
      recommendedTools: ['구글 설문 폼 (Google Forms)', '환경부 정책 보도자료'],
      readingRecommendation: '《넛지》(리처드 탈러), 《경제학 콘서트》',
      recordTip: '경제학의 유인(Incentive) 이론을 실제 환경 정책 수용성 설문으로 검증해낸 균형 잡힌 사회과학적 분석력 부각',
      draftRecordSnippet: `경제 교과의 '시장 실패와 정부의 역할' 단원을 학습하며, 일회용 컵 보증금제와 전기차 보조금 정책의 유인 구조를 비교함. 교내 30명을 대상으로 설문을 실시한 결과, 강제적 규제보다 보조금과 같은 긍정적 경제 유인책이 행동 변화에 더 높은 수용성을 보임을 통계적으로 확인하고 실효성 있는 정책을 제언함.`,
      concreteSteps: create4ConcreteSteps('환경 인센티브 설문 분석', 'social', '경제적 유인과 정부 정책', '구글 설문 폼 분석 및 보고서', ['Google Forms', '보도자료'], 'basic'),
    });

    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 경제)',
      subjectCategory: 'social',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 탄소국경조정제도(CBAM)와 배출권 거래제의 피구세(Pigovian Tax) 경제학 분석',
      curriculumConcept: '경제: 외부효과(외부불경제)와 피구세 / 국제 무역과 무역 장벽 / 생활과 윤리: 미래 세대에 대한 책임 윤리(요나스)',
      topic: 'EU 탄소국경조정제도(CBAM) 도입에 따른 국내 철강·배터리 수출 영향과 피구세(Pigovian Tax) 내부화 경제학 분석',
      inquiryQuestion: '온실가스 배출이라는 외부불경제를 조세(CBAM)로 내부화할 때, 탄소 집약 산업의 가격 경쟁력 변화와 탄소 누출(Carbon Leakage) 방지 효과는 어떻게 나타나는가?',
      connectionRationale: '글로벌 통상 최대 이슈인 CBAM을 경제과의 "외부효과 내부화" 및 "국제 무역" 이론과 결합하여 대학 상경/사회과학 계열에 최적화된 심화 역량을 입증합니다.',
      methodology: '대외경제정책연구원(KIEP) CBAM 보고서를 발췌하여 톤당 탄소세 부과 시 철강 및 배터리 원가 상승률을 계산하고 대안 무역 모델링 도출',
      recommendedTools: ['대외경제정책연구원 (kiep.go.kr)', '관세청 수출입 무역 통계'],
      readingRecommendation: '《기후의 경제학》(윌리엄 노드하우스), 《책임 원칙》(한스 요나스)',
      recordTip: '글로벌 무역 장벽으로 부상한 환경 조세를 미시경제학의 외부성 이론으로 명료하게 분석한 탁월한 경제·정책 탐구 역량 기술',
      draftRecordSnippet: `경제 및 통합사회 수업에서 '외부효과의 내부화'를 심화하여, 유럽연합의 탄소국경조정제도(CBAM)가 국내 핵심 수출 산업에 미칠 파급효과를 계량적으로 고찰함. 피구세(Pigovian Tax) 원리에 기반한 탄소 가격 책정 메커니즘을 분석하고, 국내 기업들이 탄소 배출권을 선제적으로 확보하고 신재생에너지를 확대하기 위한 정부 차원의 지원 기금을 논리적으로 제안함.`,
      concreteSteps: create4ConcreteSteps('CBAM 피구세 경제 모델링', 'social', '외부불경제와 탄소국경세', 'KIEP 보고서 분석 및 원가 모델링', ['KIEP', '통상 통계'], 'advanced'),
    });

    // Korean 3 topics
    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 환경 고전 교양서(《침묵의 봄》 등) 발췌 독해 및 독서 일지 작성',
      curriculumConcept: '독서: 글의 중심 내용과 맥락 파악 / 독서 일지 작성',
      topic: '환경 고전 《침묵의 봄》 강독을 통한 화학 물질 남용의 위험성과 자연과의 공존에 관한 독서 일지 작성',
      inquiryQuestion: '레이첼 카슨이 고발한 살충제 남용의 비극은 오늘날 기후 위기와 플라스틱 오염 문제에 어떤 교훈을 주는가?',
      connectionRationale: '고교생 필독서인 《침묵의 봄》을 통해 국어 교과서의 비판적 읽기 전략을 환경 문제에 쉽게 적용합니다.',
      methodology: '도서 중 대표 챕터(내일을 위한 우화)를 정독하고, 핵심 논거 3가지를 정리한 800자 독서 성찰 일지 작성',
      recommendedTools: ['《침묵의 봄》 도서', '독서 노트'],
      readingRecommendation: '《침묵의 봄》(레이첼 카슨), 《녹색 시민 구직기》',
      recordTip: '환경 고전의 핵심 논지를 시대적 맥락과 결부지어 파악하고 자신의 삶과 연결하여 글로 정리한 성실한 독서 역량 기술',
      draftRecordSnippet: `독서 수업에서 환경 고전인 레이첼 카슨의 《침묵의 봄》을 완독함. 무분별한 화학물질 살포가 생태계 먹이사슬을 타고 인간에게 되돌아오는 생물 농축의 위험성을 파악하고, 이것이 현대의 기후 변화 및 미세플라스틱 문제와 일맥상통함을 논리적으로 성찰한 독서 일지를 작성하여 교내 독서 활동 우수 사례로 선정됨.`,
      concreteSteps: create4ConcreteSteps('침묵의 봄 환경 독서 일지', 'korean', '비판적 독서와 성찰 일지', '도서 발췌 및 800자 독서 일지', ['침묵의 봄', '독서장'], 'basic'),
    });

    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 광고 분석)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 기업들의 친환경 위장술(그린워싱) 광고 문구 수사법 비판',
      curriculumConcept: '화법과 작문: 설득 텍스트의 타당성 및 공정성 평가 / 과장·허위 광고의 언어적 특징',
      topic: '기업 상품 광고 속 친환경 위장술(그린워싱, Greenwashing) 사례 수집 및 모호한 친환경 수사 표현 분석',
      inquiryQuestion: '기업 광고에서 "에코, 친환경, 자연주의" 같은 단어들이 객관적 인증 없이 소비자를 현혹하는 언어적 수법은 무엇인가?',
      connectionRationale: '실제 마트나 편의점 상품에 적힌 친환경 문구를 분석하여 화법과 작문 교과의 "설득 텍스트의 공정성"을 실감 나게 배웁니다.',
      methodology: '실제 제품 포장지 및 온라인 광고 5건을 사진 촬영하여 객관적 수치 없이 사용된 모호한 친환경 수사 표현을 비교표로 작성',
      recommendedTools: ['광고 이미지/제품 포장지', '공정거래위원회 그린워싱 가이드'],
      readingRecommendation: '《그린워싱》(김병수), 《광고 언어의 해부》',
      recordTip: '상업적 텍스트 뒤에 숨겨진 과장과 모호성을 날카롭게 지적하고 소비자의 합리적 판단을 돕는 비판적 문해력 부각',
      draftRecordSnippet: `화법과 작문의 '설득 전략의 비판적 평가' 단원을 이수하며, 일상 생활용품 5종의 광고 문구를 수집해 '그린워싱(친환경 위장)' 표현을 분석함. 객관적 근거 없이 '에코, 자연 친화' 등의 모호한 단어를 남발하는 기만적 수사 기법을 지적하고, 소비자를 오도하지 않는 명확한 성분 표기 가이드라인을 제안함.`,
      concreteSteps: create4ConcreteSteps('그린워싱 광고 문구 분석', 'korean', '설득 텍스트의 비판적 평가', '광고 사례 5건 수집 및 수사법 분석', ['광고 캡처', '공정위 자료'], 'basic'),
    });

    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 기후변화 회의론 논증 구조 분해 및 정의로운 기후 전환 학술 논설문',
      curriculumConcept: '화법과 작문: 논증의 타당성 평가와 오류 검출 / 독서: 비판적 담화 분석',
      topic: '기후변화 회의론자들의 논리적 오류를 툴민(Toulmin) 논증 모형으로 분해하고 정의로운 기후 전환을 제언하는 학술 논설문 집필',
      inquiryQuestion: '기후 변화가 자연적 주기설에 불과하다는 회의론적 주장에 내재된 인과관계 왜곡과 확증 편향 오류를 어떻게 논리적으로 논파할 것인가?',
      connectionRationale: '기후 위기에 대한 과학적 사실을 왜곡하는 담론을 툴민 논증 모델로 해체하고, 설득력 있는 학술적 문체로 대안을 제시합니다.',
      methodology: '회의론자들의 주요 칼럼 2편을 Toulmin 모형(Data-Warrant-Claim)으로 도식화하고 오류를 반박하는 4매 분량의 논증적 에세이 집필',
      recommendedTools: ['기후변화 학술 논문', 'Toulmin 논증 분석 시트'],
      readingRecommendation: '《지구를 살리는 기후위기 과학》(조천호), 《기후변화의 심리학》',
      recordTip: '복잡한 과학적 논쟁을 탄탄한 논증 구조와 명료한 작문력으로 풀어내어 사회적 합의를 이끌어내는 탁월한 국어과 고차 사고력 기술',
      draftRecordSnippet: `화법과 작문 수업에서 툴민(Toulmin) 논증 모델을 활용해 기후변화 회의론 칼럼의 논리적 오류를 해체함. 자연적 주기설을 주장하는 논변에서 인위적 온실가스 배출 데이터를 의도적으로 누락한 '성급한 일반화'의 오류를 규명하고, 미래 세대와 기후 취약 계층을 아우르는 '정의로운 전환'을 촉구하는 학술 논설문을 완성함.`,
      concreteSteps: create4ConcreteSteps('기후 회의론 반박 논설문', 'korean', '논증 타당성과 오류 검출', '칼럼 분해 및 4매 학술 에세이 작성', ['논증 시트', '기후 논문'], 'advanced'),
    });

    // English 3 topics
    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 청소년용 환경 영문 기사(National Geographic Kids) 어휘 30선',
      curriculumConcept: '영어: 환경 관련 시사 텍스트 독해와 핵심 어휘 학습',
      topic: '청소년용 해외 환경 저널(National Geographic Kids)의 기후 변화 기사를 활용한 환경·신재생에너지 필수 영단어 30선 정리',
      inquiryQuestion: '해외 환경 기사에서 자주 쓰이는 "renewable, biodiversity, footprint, ecosystem" 등의 영단어는 어떤 문맥에서 활용되는가?',
      connectionRationale: '친근한 내셔널지오그래픽 키즈 기사를 통해 환경 분야의 기초 영어 어휘를 쉽고 재미있게 익힐 수 있습니다.',
      methodology: 'National Geographic Kids 웹사이트에서 기후 변화 관련 기사 1편을 정독하고 핵심 단어 30개와 예문을 기록한 단어장 제작',
      recommendedTools: ['National Geographic Kids', '영어사전'],
      readingRecommendation: '《English for Environmental Science》',
      recordTip: '해외 청소년 환경 기사를 자기주도적으로 탐독하고 어휘를 체계적으로 정리한 성실한 어학 역량 기술',
      draftRecordSnippet: `영어 시간에 '환경 시사 어휘 학습' 활동을 수행하며 내셔널 지오그래픽 키즈의 기후 변화 특집 기사를 탐색함. 'ecosystem, extinction, carbon footprint' 등 핵심 환경 어휘 30개를 추출하고, 문맥 속에서 단어의 품사와 쓰임새를 분석한 영문 단어장을 제작하여 학급 영어 학습 동아리에 기여함.`,
      concreteSteps: create4ConcreteSteps('청소년 환경 영어 단어장', 'english', '환경 시사 어휘 학습', '기사 독해 및 단어장 작성', ['NatGeo Kids', '사전'], 'basic'),
    });

    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 파리협정 번역)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 파리 기후변화협정 핵심 목표 조항 영문 인포그래픽 번역',
      curriculumConcept: '영어: 국제 협약 조항의 핵심 의미 파악 및 한국어 번역',
      topic: '파리 기후변화협정(Paris Agreement) 핵심 목표 조항(지구 온도 1.5도 제한) 영문 인포그래픽 번역 및 학급 전시',
      inquiryQuestion: '파리협정 2조에 명시된 "Well below 2 degrees Celsius"와 "1.5 degrees"의 영문 법적 뉘앙스는 무엇인가?',
      connectionRationale: '역사적인 국제 협약 문안을 직접 번역해보며 국제기구 영어의 공식적 표현 방식을 자연스럽게 배웁니다.',
      methodology: 'UNFCCC 공식 웹사이트에서 파리협정 요약문을 발췌하여 번역하고 학급 게시용 번역 포스터 제작',
      recommendedTools: ['UNFCCC 공식 웹사이트 (unfccc.int)', 'Canva'],
      readingRecommendation: '《파리협정 원문 해설》',
      recordTip: '역사적인 글로벌 기후 협약 원문을 정확하게 독해하고 대중적인 우리말 번역물로 재구성한 실용 다국어 소통력 부각',
      draftRecordSnippet: `영어 교과의 '국제 협약 텍스트 독해' 활동을 통해 2015 파리 기후변화협정(Paris Agreement) 요약본을 번역함. 산업화 이전 대비 지구 온도 상승을 1.5도로 제한하자는 핵심 조항의 영문 표현을 학습하고, 주요 감축 메커니즘을 한국어로 번역한 포스터를 제작하여 학급에 기후 행동 동참을 호소함.`,
      concreteSteps: create4ConcreteSteps('파리협정 핵심 조항 번역', 'english', '국제 협약 조항 독해', 'UNFCCC 자료 번역 및 포스터 제작', ['UNFCCC', 'Canva'], 'basic'),
    });

    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · IPCC 6차 보고서(AR6) SPM 원문 분석 및 영문 Executive Summary',
      curriculumConcept: '심화영어: 국제 과학 기구 보고서 독해 / 통계적 확률 진술 표현(Likely, Very likely) 분석',
      topic: 'IPCC 6차 평가보고서(AR6) 정책결정자를 위한 요약본(SPM) 원문 강독 및 250단어 영문 Executive Summary 작성',
      inquiryQuestion: '기후변화에 관한 정부간 협의체(IPCC)는 인간 활동에 의한 온난화 인과성을 어떤 통계적 학술 표현(Unequivocal, Virtually certain)으로 엄밀하게 서술하는가?',
      connectionRationale: '전 세계 기후 정책의 기준점인 IPCC 공식 보고서를 원문으로 완독하여 글로벌 학술 영어 역량을 최고 수준으로 입증합니다.',
      methodology: 'IPCC AR6 SPM 중 자연과학적 근거 챕터를 발췌하여 통계적 확률 서술 표현을 분류하고 250단어 영문 요약서 집필',
      recommendedTools: ['IPCC 공식 웹사이트 (ipcc.ch)', 'Grammarly', 'Google Scholar'],
      readingRecommendation: '《IPCC Sixth Assessment Report: Climate Change 2021》',
      recordTip: '국제기구의 최고 권위 보고서를 완독하고 통계적 학술 영어의 뉘앙스를 정확히 살려 영문 요약서를 작성해낸 탁월한 글로벌 소통력 기술',
      draftRecordSnippet: `심화영어 수업에서 IPCC 6차 평가보고서(AR6)의 SPM 원문을 강독함. 과학자들이 기후 변화의 위험성을 서술할 때 사용하는 통계적 확률 표현('Virtually certain, High confidence')의 엄밀한 정의를 분석하고, 핵심 발견과 온실가스 감축 경로를 250단어 영문 Executive Summary로 완벽히 요약하여 발표를 이끎.`,
      concreteSteps: create4ConcreteSteps('IPCC AR6 SPM 요약서 집필', 'english', '과학 기구 보고서와 통계 영어', 'IPCC SPM 분석 및 영문 보고서', ['IPCC', 'Grammarly'], 'advanced'),
    });

    // Tech 3 topics
    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 환경)',
      subjectCategory: 'tech',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 엔트리 블록 코딩으로 구현하는 교실 절전 시뮬레이터 제작',
      curriculumConcept: '정보: 센서와 액추에이터의 원리 / 조건 제어문 알고리즘',
      topic: '엔트리(Entry) 블록 코딩을 활용한 교실 적정 온도 유지 및 빈 교실 전등 자동 소등 모의 시뮬레이터 제작',
      inquiryQuestion: '사람의 재실 여부와 실내 온도 센서 값을 변수로 받아들여 전등과 에어컨을 자동 제어하는 알고리즘은 어떻게 설계되는가?',
      connectionRationale: '스마트홈 절전 시스템을 교과서의 조건문(if-else) 블록 코딩으로 누구나 쉽게 구현해볼 수 있습니다.',
      methodology: '엔트리에서 가상 온도 센서와 재실 센서 오브젝트를 만들고, 조건문에 따라 전력 소모량이 감소하는 시뮬레이션 구현',
      recommendedTools: ['엔트리 (playentry.org)', '정보 교과서'],
      readingRecommendation: '《소프트웨어와 미래 사회》',
      recordTip: '환경 절전 문제를 정보 교과의 핵심인 조건 제어 알고리즘으로 모델링하여 실생활 해결 능력을 보여준 컴퓨팅 사고력 부각',
      draftRecordSnippet: `정보 수업에서 '알고리즘과 제어 구조'를 배우며, 엔트리(Entry)를 활용해 '스마트 교실 절전 시스템'을 프로그래밍함. 조도 센서와 인체 감지 센서 값을 조건문으로 연산하여 빈 교실의 전등을 자동 차단하고 실내 적정 온도를 유지하는 시뮬레이션을 완성하여 에너지 절약 알고리즘을 실증함.`,
      concreteSteps: create4ConcreteSteps('엔트리 절전 시스템 코딩', 'tech', '조건 제어문과 센서 알고리즘', '엔트리 블록 코딩 구현', ['엔트리', '교과서'], 'basic'),
    });

    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 환경)',
      subjectCategory: 'tech',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 공공데이터 분석)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 기상청 일사량 데이터를 엑셀로 분석한 태양광 발전 잠재량 계산',
      curriculumConcept: '정보: 공공데이터 활용 / 스프레드시트 수식 계산 및 추세선 도출',
      topic: '기상청 공공데이터포털 전국 일사량 CSV 데이터를 엑셀로 가공하여 우리 지역의 월별 태양광 발전 잠재량 추세선 분석',
      inquiryQuestion: '공공 기상데이터의 일일 누적 일사량 수치를 활용하여 계절별 태양광 발전소의 예상 발전량을 어떻게 계산할 수 있는가?',
      connectionRationale: '실제 기상 데이터를 엑셀 함수(SUM, AVERAGE)로 가공하여 태양광 발전의 효율성을 실증적으로 분석합니다.',
      methodology: '공공데이터포털에서 기상청 관측소별 일사량 CSV를 다운로드하고, 엑셀 수식을 통해 월평균 발전 잠재량 그래프 작성',
      recommendedTools: ['기상청 기상자료개방포털 (data.kma.go.kr)', 'Excel'],
      readingRecommendation: '《빅데이터 인문학》, 《에너지 데이터 분석》',
      recordTip: '공공 기상 데이터를 수집·가공하여 신재생에너지 발전 효율을 통계 수치로 도출해낸 우수한 데이터 분석 실무 역량 기술',
      draftRecordSnippet: `정보 시간에 '스프레드시트를 활용한 데이터 분석' 단원을 이수하며, 기상청 기상자료개방포털에서 최근 1년간의 일별 일사량 데이터를 수집함. 엑셀 수식과 조건부 서식을 적용해 월별 일사량 평균을 구하고 태양광 발전 잠재량 추세선을 도출하여, 5월과 6월이 최적의 발전 효율을 보임을 데이터로 증명함.`,
      concreteSteps: create4ConcreteSteps('일사량 데이터 발전량 계산', 'tech', '스프레드시트 공공데이터 가공', 'CSV 데이터 정제 및 발전량 추세선', ['기상청 포털', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 환경)',
      subjectCategory: 'tech',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 아두이노 센서 및 파이썬 이동평균 필터링 실시간 계측 파이프라인',
      curriculumConcept: '정보: 실시간 데이터 통신 / 이동평균 필터(Moving Average Filter) 신호 처리 알고리즘',
      topic: '아두이노 미세먼지(PM2.5)·온습도 센서 계측 데이터와 파이썬 시리얼 통신을 연계한 노이즈 제거 이동평균 필터링 알고리즘 구현',
      inquiryQuestion: '저가형 환경 센서에서 발생하는 튀는 노이즈(Outlier)를 제거하고 실시간 대기질 추세를 정확히 포착하기 위한 최적의 이동평균 윈도우 크기는 얼마인가?',
      connectionRationale: '하드웨어 센서 계측과 파이썬 신호 처리 알고리즘을 융합하여 실시간 환경 모니터링 시스템의 정밀도를 향상시킵니다.',
      methodology: '아두이노 환경 센서 데이터를 파이썬 pyserial 라이브러리로 수집하고, 5포인트 이동평균 필터 함수를 직접 코딩하여 노이즈 제거 전후 시각화',
      recommendedTools: ['아두이노 우노 및 PM2.5 센서', '파이썬 (PySerial, Matplotlib)'],
      readingRecommendation: '《센서 데이터 분석과 신호 처리》, 《사물인터넷을 품은 아두이노》',
      recordTip: '하드웨어 센서 데이터를 파이썬으로 수신하고 수학적 필터링 알고리즘을 적용해 신호 신뢰도를 획기적으로 개선한 뛰어난 임베디드 융합 역량 기술',
      draftRecordSnippet: `정보 및 융합과학 수업에서 '사물인터넷과 데이터 신호 처리'를 심화하여, 아두이노 PM2.5 센서와 파이썬을 연동한 실시간 공기질 모니터링 파이프라인을 구축함. 센서 계측 시 발생하는 노이즈를 제거하기 위해 파이썬으로 가중 이동평균(Moving Average) 필터를 직접 코딩하고, 원시 데이터와 필터링 데이터의 분산을 비교해 데이터 신뢰도를 대폭 향상시킴.`,
      concreteSteps: create4ConcreteSteps('센서 데이터 이동평균 필터링', 'tech', '실시간 데이터 통신과 신호 처리', '아두이노-파이썬 시리얼 필터 구현', ['아두이노', 'Python'], 'advanced'),
    });
  }

  // Domain 4: General / Hybrid / Cross-Disciplinary Fallback
  else {
    majorOverview = `'${cleanInterest}' 분야는 교과서의 기본 개념과 최신 전공 학술 연구가 만나는 흥미로운 융합 연구 영역입니다. 기존 주제가 어렵게 느껴졌던 학생들도 부담 없이 시작할 수 있는 교과서 중심의 직관적 탐구(기본 2개)부터, 데이터 시뮬레이션과 학술 논문 비교에 이르는 심층 탐구(심화 1개)까지 각 교과별 3가지 주제(총 18개)의 풍부한 선택지를 제공합니다.`;
    connectionSummary = `학생의 관심 연구 분야인 '${cleanInterest}'을 6개 교과와 융합하여, 수학에서는 친숙한 함수와 평균부터 회귀 모델링까지, 과학에서는 기본 원리 개념도부터 가설연역 실험까지, 사회는 일상 설문부터 정책 조례 설계까지 수준별 3가지 주제로 폭넓게 제시합니다.`;

    // Math 3 topics
    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 교과서 속 함수의 증가·감소 관찰 및 기초 함수 모델링',
      curriculumConcept: '수학: 함수의 그래프와 증가·감소 / 평균변화율의 기하학적 의미',
      topic: `함수의 그래프와 증가·감소 관찰을 통한 '${interestClean}' 현상의 변화 추이 및 교과서 기본 문제 적용`,
      inquiryQuestion: `이 현상에서 시간에 따라 관측값이 증가하거나 감소하는 패턴은 교과서에서 배운 함수의 그래프 개형으로 어떻게 설명할 수 있는가?`,
      connectionRationale: `어려운 미분방정식 없이도 고교 수학의 기본 함수 그래프와 평균변화율을 통해 현상의 전반적인 변화 추이를 명쾌하게 파악할 수 있습니다.`,
      methodology: `관측 자료를 시간 순서대로 나열하여 좌표평면에 꺾은선그래프로 그리고, 구간별 평균변화율을 교과서 공식으로 계산`,
      recommendedTools: ['수학 교과서', 'Excel 스프레드시트', '지오지브라'],
      readingRecommendation: '《수학, 인문으로 수를 읽다》(이광연), 《미적분의 힘》',
      recordTip: '교과서 속 함수의 기본 성질을 실세계 현상의 변화 추세와 결부지어 직관적으로 풀어낸 수학적 관찰력 기술',
      draftRecordSnippet: `수학 수업에서 '함수의 증가와 감소' 단원을 학습하며, 평소 관심 분야인 '${cleanInterest}' 현상의 시계열 변화에 적용해 봄. 관측 수치를 좌표평면에 타점하여 구간별 평균변화율을 계산하고, 현상이 급격히 변화하는 임계 구간을 함수의 기울기 개념으로 명쾌하게 설명해내는 수학적 분석력을 발휘함.`,
      concreteSteps: create4ConcreteSteps('기초 함수 변화율 관찰', '수학', '함수의 증가와 감소', '좌표평면 타점 및 평균변화율 계산', ['교과서', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 통계 탐색)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 공공데이터 지표와 평균·분산 개념을 활용한 실태 비교',
      curriculumConcept: '확률과 통계: 대푯값과 산포도 / 산점도와 상관계수',
      topic: `공공데이터 통계 지표와 평균·분산 개념을 활용한 '${interestClean}' 실태 비교 및 산점도 시각화`,
      inquiryQuestion: `공개된 통계 데이터에서 서로 다른 두 변수(예: 투자액과 성과) 사이에 양의 상관관계가 나타나는가?`,
      connectionRationale: `실제 통계청이나 공공데이터포털의 공개 자료를 활용하여 교과서 속 평균, 표준편차, 산점도의 개념을 친근하게 적용합니다.`,
      methodology: `공공데이터포털에서 관련 통계 CSV를 다운로드하여 엑셀 산점도와 추세선을 그리고 상관관계 요약표 작성`,
      recommendedTools: ['공공데이터포털 (data.go.kr)', 'Excel 통계 팩'],
      readingRecommendation: '《통계의 미학》(최제호), 《팩트풀니스》(한스 로슬링)',
      recordTip: '공공 통계 데이터를 주도적으로 수집하여 교과서 대푯값과 산점도로 명확하게 분석해낸 데이터 리터러시 강조',
      draftRecordSnippet: `확률과 통계의 '대푯값과 산점도' 단원을 이수하며, 공공데이터포털에서 '${cleanInterest}' 관련 통계 지표를 직접 수집함. 두 핵심 변수 간의 산점도를 그리고 분산과 표준편차를 산출하여 데이터의 흩어짐 정도를 객관적으로 비교 분석함으로써, 통계적 근거를 바탕으로 현상을 해석하는 역량을 입증함.`,
      concreteSteps: create4ConcreteSteps('공공데이터 산점도 분석', '수학', '대푯값과 산포도', 'CSV 다운로드 및 산점도 시각화', ['공공데이터포털', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '수학 (미적분 / 확률과 통계)',
      subjectCategory: 'math',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 미적분 순간변화율과 최소제곱법 2차 회귀분석 수리 모델링',
      curriculumConcept: '미적분: 변화율과 접선의 기울기 / 확률과 통계: 최소제곱법 선형 회귀분석 및 결정계수(R²)',
      topic: `'${interestClean}'의 핵심 변수 간 상관관계 도출을 위한 2차 다항 회귀분석 및 미적분 변화율 모델링`,
      inquiryQuestion: `이 시스템의 상태를 결정짓는 핵심 독립변수와 종속변수 사이의 상관관계를 다항함수로 피팅할 때, 최적의 수렴성과 최소 잔차(RSS)를 보이는 수학적 모델은 무엇인가?`,
      connectionRationale: `'${cleanInterest}' 분야의 직관적 가설을 검증 가능한 수식으로 변환하기 위해 미적분의 순간변화율과 통계적 회귀식을 결합하여 정량적 설명력을 부여합니다.`,
      methodology: `공공 데이터 또는 선행 연구 관측치를 수집하여 산점도를 작성하고, 지오지브라/파이썬을 활용해 1차 및 2차 회귀곡선 수식 유도 및 오차(R-squared) 검증`,
      recommendedTools: ['지오지브라 (GeoGebra)', 'Excel 통계 팩', '파이썬 NumPy'],
      readingRecommendation: '《미적분의 힘》(스티븐 스트로가츠), 《수학으로 생각하는 힘》(키트 예이츠)',
      recordTip: '현상 속에서 수학적 함수 관계를 포착하고 회귀방정식을 유도하여 통계적 설명력을 검증한 우수한 수리적 직관과 탐구력 강조',
      draftRecordSnippet: `교과 수업 중 '미분계수의 기하학적 의미'와 '회귀분석' 단원을 이수하며, 평소 관심을 두었던 '${cleanInterest}' 현상에 내재된 수학적 규칙성을 탐구함. 관측 데이터를 수집하여 산점도를 작성하고 최소제곱법을 적용해 2차 다항 회귀곡선을 직접 유도함. 결정계수(R²)를 산출하여 모델의 적합도를 객관적으로 검증하는 등 현상을 수학적 언어로 환원해내는 뛰어난 수리 모델링 역량을 보임.`,
      concreteSteps: create4ConcreteSteps('2차 다항 회귀 모델링', '수학', '미적분 변화율과 최소제곱법', '지오지브라 회귀식 유도 및 R² 검증', ['지오지브라', '파이썬'], 'advanced'),
    });

    // Science 3 topics
    subjects.push({
      subject: '과학/공학 (통합과학 / 물리학 / 화학 / 생명과학)',
      subjectCategory: 'science',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 교과서 속 기본 법칙과 현상의 원리 비교 개념도 정리',
      curriculumConcept: '통합과학: 자연의 구성 물질과 에너지 흐름 / 과학적 원리의 이해',
      topic: `교과서 속 핵심 법칙(에너지 보존 / 작용·반작용 / 화학 반응 등)과 '${interestClean}'의 기초 원리 비교 및 개념도 정리`,
      inquiryQuestion: `이 분야의 핵심 현상은 교과서에 소개된 기초 과학 법칙으로 어떻게 쉽게 설명될 수 있는가?`,
      connectionRationale: `전문적인 실험 장비 없이도 교과서 속 과학 원리와 실세계 현상을 1:1로 매핑하여 개념 관계도를 작성할 수 있습니다.`,
      methodology: `교과서 단원 개념을 토대로 현상의 인과관계를 단계별 순서도로 도식화하고 요약 보고서 작성`,
      recommendedTools: ['과학 교과서', '개념 맵 작성 도구'],
      readingRecommendation: '《모두를 위한 물리학》, 《화학으로 이루어진 세상》',
      recordTip: '교과서 기초 과학 이론을 전공 관심 분야와 유기적으로 접목하여 시각적으로 구조화해낸 우수한 개념 이해도 부각',
      draftRecordSnippet: `통합과학 수업에서 '자연의 규칙성과 에너지' 단원을 배우며, '${cleanInterest}' 현상의 기본 원리를 교과서 법칙과 연결함. 현상의 인과 단계를 3단계 순서도로 도식화하고 핵심 과학 개념의 상호작용을 명확히 정리하여 과학적 기초 지식에 기반한 탄탄한 탐구력을 입증함.`,
      concreteSteps: create4ConcreteSteps('기초 과학 원리 개념도 작성', 'science', '에너지 보존과 과학적 원리', '인과 순서도 및 개념 맵 작성', ['교과서', '스케치 도구'], 'basic'),
    });

    subjects.push({
      subject: '과학/공학 (통합과학 / 물리학 / 화학 / 생명과학)',
      subjectCategory: 'science',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 간이 모의 관찰)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 실생활 속 적용 사례 조사 및 장단점 비교 분석',
      curriculumConcept: '과학 탐구: 일상생활 속 과학 원리 탐색 및 기술의 영향 평가',
      topic: `실생활 속 '${interestClean}' 적용 사례 조사 및 기술적 장단점 비교 분석 (간이 모의 관찰 보고서)`,
      inquiryQuestion: `우리 주변에서 이 기술 또는 현상이 적용된 대표적 사례는 무엇이며, 사용 시의 장점과 한계점은 무엇인가?`,
      connectionRationale: `일상에서 흔히 접할 수 있는 사례와 사진, 영상 자료를 통해 기술의 실용적 가치와 개선 과제를 친근하게 탐구합니다.`,
      methodology: `인터넷 및 뉴스 영상에서 실제 적용 사례 2건을 수집하고, 기존 기술 대비 개선점과 한계점을 2단 비교표로 작성`,
      recommendedTools: ['뉴스 및 영상 자료', 'Excel 비교 분석표'],
      readingRecommendation: '《기술의 충격》(케빈 켈리), 《과학 콘서트》',
      recordTip: '실제 제품 및 기술 사례를 다각도로 조사하고 객관적인 비교 기준을 수립하여 장단점을 분석한 성실한 과학적 안목 기술',
      draftRecordSnippet: `과학 탐구 활동에서 '${cleanInterest}'의 실제 상용화 사례를 조사하여 기술 분석 보고서를 작성함. 기존 방식 대비 에너지 효율성과 비용 측면의 개선점을 정량 비교하고, 현재 기술이 직면한 안전성 및 내구성의 한계를 객관적으로 짚어내어 기술 발전 방향을 제시함.`,
      concreteSteps: create4ConcreteSteps('실생활 적용 사례 분석', 'science', '과학 기술의 응용과 평가', '사례 수집 및 장단점 비교표 작성', ['뉴스 자료', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '과학/공학 (통합과학 / 물리학 / 화학 / 생명과학)',
      subjectCategory: 'science',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 가설-연역적 실험 설계 및 MBL 센서 정량 계측',
      curriculumConcept: '과학 탐구 방법론: 가설-연역적 탐구 / 화학·물리: 에너지 보존 및 반응 속도 조절 메커니즘',
      topic: `'${interestClean}' 메커니즘 규명을 위한 가설-연역적 실험 설계 및 에너지 전달 효율 분석`,
      inquiryQuestion: `이 시스템에서 에너지와 물질이 상호작용할 때 발생하는 손실 요인은 무엇이며, 외부 환경 조건 변화에 따른 반응 효율은 어떻게 달라지는가?`,
      connectionRationale: `'${cleanInterest}' 현상의 기저에 작동하는 자연과학적 인과관계를 밝히기 위해 독립변수를 엄격히 통제하고 에너지 보존 및 반응 속도론을 적용합니다.`,
      methodology: `선행 연구 논문 2편의 실험 프로토콜 비교 분석, 교내 센서 또는 시뮬레이션 소프트웨어를 활용한 변인 통제 모의실험 보고서 작성`,
      recommendedTools: ['교내 MBL 디지털 계측 센서', 'KCI 선행 연구 논문', 'PhET 대화형 과학 시뮬레이션'],
      readingRecommendation: '《부분과 전체》(베르너 하이젠베르크), 《생각의 탄생》(로버트 루트번스타인)',
      recordTip: '가설 설정의 타당성과 변인 통제의 엄밀성을 철저히 지키며 오차 원인을 스스로 분석한 성실한 과학적 탐구 태도 부각',
      draftRecordSnippet: `과학 교과의 '가설-연역적 탐구 방법론'을 바탕으로, '${cleanInterest}'의 핵심 물리화학적 메커니즘을 규명하는 실험을 기획함. 독립변수를 엄격히 통제한 대조군과 실험군을 설계하고, 센서 계측을 통해 시간에 따른 반응 수치 변화를 정량 측정함. 장비의 분해능 한계로 발생한 오차를 통계적으로 보정하고 대안적 가설을 제시하는 등 연구자로서의 깊이 있는 탐구 자세를 입증함.`,
      concreteSteps: create4ConcreteSteps('가설연역적 정량 실험 설계', 'science', '가설-연역적 탐구와 변인 통제', 'MBL 센서 계측 및 오차 분석', ['MBL 센서', 'KCI 논문'], 'advanced'),
    });

    // Social 3 topics
    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 정치와 법 / 경제)',
      subjectCategory: 'social',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 통합사회 기본권 및 공동체 윤리 단원 연계 쟁점 고찰',
      curriculumConcept: '통합사회: 인권과 헌법 / 공동체 역량과 사회적 갈등 해결',
      topic: `통합사회 교과서 기본권 및 공동체 윤리 단원으로 바라본 '${interestClean}'의 긍정적 효과와 윤리적 과제`,
      inquiryQuestion: `이 주제와 관련된 기술이나 제도가 확대될 때, 시민들의 기본권 신장과 공동체 안전은 어떻게 상호 조화를 이룰 수 있는가?`,
      connectionRationale: `고1 통합사회 교과서의 인권 및 공동체 윤리 개념을 바탕으로, 현상이 사회 구성원들에게 미치는 영향을 알기 쉽게 살펴봅니다.`,
      methodology: `교과서 속 인권 조항을 정리하고, 현상이 가져오는 편익 2가지와 부작용 2가지를 균형 있게 비교하는 워크시트 작성`,
      recommendedTools: ['통합사회 교과서', '사회적 영향 평가 워크시트'],
      readingRecommendation: '《인권이란 무엇인가》, 《정의란 무엇인가》',
      recordTip: '사회의 다양한 이해관계를 교과서 인권 개념에 입각하여 균형 있게 조망한 성숙한 시민적 소양 기술',
      draftRecordSnippet: `통합사회 수업에서 '공동체와 인권' 단원을 학습하며, '${cleanInterest}'의 확산이 가져올 사회적 파급효과를 검토함. 시민 생활의 편익 증진이라는 긍정적 측면과 정보 격차 및 권리 침해라는 잠재적 위험을 균형 있게 분석하고, 공동체적 상생을 위한 자율적 규범을 제안함.`,
      concreteSteps: create4ConcreteSteps('공동체 인권 영향 분석', 'social', '인권과 공동체 윤리', '교과서 인권 조항 매핑 및 비교표', ['교과서', '워크시트'], 'basic'),
    });

    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 정치와 법 / 경제)',
      subjectCategory: 'social',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 설문 조사)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 언론 보도 및 설문 조사를 통한 대중 인식과 제도 지원 조사',
      curriculumConcept: '사회·문화: 설문지법을 활용한 양적 연구 / 사회적 인식 조사',
      topic: `언론 보도 및 청소년 설문 조사를 통한 '${interestClean}' 관련 대중 인식과 제도적 지원 현황 조사`,
      inquiryQuestion: `학생들과 일반 시민들은 이 주제에 대해 얼마나 알고 있으며, 가장 시급히 도입되어야 할 제도적 지원은 무엇이라고 생각하는가?`,
      connectionRationale: `사회문화 교과의 설문지법을 적용하여 직접 문항을 만들고 응답을 집계해보며 현실 감각 있는 사회 조사를 수행합니다.`,
      methodology: `구글 설문 폼으로 5개 문항을 제작하여 학급 친구 20명에게 응답을 받고 엑셀 원그래프로 통계 결과 시각화`,
      recommendedTools: ['Google Forms 설문 도구', 'Excel'],
      readingRecommendation: '《사회조사방법론 입문》, 《여론의 탄생》',
      recordTip: '사회문화 교과의 설문지법을 체계적으로 설계하고 통계적 수치로 대중의 인식을 분석해낸 사회과학 실무 역량 기술',
      draftRecordSnippet: `사회·문화 시간에 '사회조사방법론(설문지법)'을 학습한 후, '${cleanInterest}'에 대한 청소년 인식 설문 조사를 직접 기획함. 5가지 문항의 설문지를 구글 폼으로 제작해 25명의 응답을 수집하고, 연령별 인지도 차이와 정책 지원 우선순위를 통계 차트로 시각화하여 설득력 있는 조사 보고서를 완성함.`,
      concreteSteps: create4ConcreteSteps('대중 인식 설문 조사', 'social', '설문지법과 사회문화 조사', '구글 설문지 제작 및 원그래프 분석', ['Google Forms', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '사회 (통합사회 / 생활과 윤리 / 정치와 법 / 경제)',
      subjectCategory: 'social',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 롤스 정의론 및 외부효과 내부화 조세 모델을 적용한 정책 제언',
      curriculumConcept: '생활과 윤리: 롤스의 정의론(차등의 원칙) / 경제: 외부효과 내부화 및 정책 분석',
      topic: `롤스(Rawls) 정의론 및 시장 외부효과 모델을 적용한 '${interestClean}' 공공 정책 제언 및 규제 샌드박스 조례안 설계`,
      inquiryQuestion: `이 분야의 혁신을 촉진하면서도 취약계층의 권익을 보호하기 위해 롤스의 차등 원칙을 적용한 최적의 공공 가이드라인은 무엇인가?`,
      connectionRationale: `기술 혁신과 공공 규제의 조화를 위해 경제학의 외부성 이론과 윤리학의 분배 정의론을 융합하여 실질적 제도 개선안을 도출합니다.`,
      methodology: `국내외 관련 법률안 2건을 비교 분석하고, 이해관계자 3자 모의 공청회 대본 작성 및 정책 제안서 완성`,
      recommendedTools: ['국가법령정보센터', '국회 의안정보시스템'],
      readingRecommendation: '《정의론》(존 롤스), 《공공선택론》',
      recordTip: '철학적 규범 윤리와 실정법 조항을 융합하여 입체적으로 법리를 분석하고 정책적 대안을 도출한 뛰어난 학업 역량 기술',
      draftRecordSnippet: `생활과 윤리 및 정치와 법을 융합하여, '${cleanInterest}'의 확산에 따른 사회적 갈등 해결 방안을 모색함. 존 롤스의 '차등의 원칙'을 원용하여 혁신의 혜택이 사회적 약자에게 우선 분배되도록 규정하는 '규제 샌드박스 조례안' 초안을 작성하고, 법리적 타당성을 검토하여 완성도 높은 정책 제안서를 완성함.`,
      concreteSteps: create4ConcreteSteps('롤스 정의론 정책 조례 설계', 'social', '차등의 원칙과 외부효과', '국회 의안 분석 및 조례안 작성', ['의안정보시스템', '정의론'], 'advanced'),
    });

    // Korean 3 topics
    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 교과서 독서 지문 및 관련 교양 서적 강독 서평 작성',
      curriculumConcept: '독서: 사실적 읽기와 중심 생각 파악 / 서평 작성',
      topic: `교과서 독서 단원 연계 관련 교양 도서 강독을 통한 '${interestClean}' 핵심 쟁점 요약 및 서평 작성`,
      inquiryQuestion: `관련 도서에서 저자가 강조하는 핵심 메시지는 무엇이며, 학생의 시각에서 가장 인상 깊은 부분은 무엇인가?`,
      connectionRationale: `교과서에 소개된 독서 전략을 통해 책 한 권을 깊이 있게 읽고 알기 쉬운 서평으로 생각을 표현합니다.`,
      methodology: `도서 1권을 선정하여 목차와 서론, 결론을 바탕으로 핵심 논지를 요약하고 800자 서평 작성`,
      recommendedTools: ['교내 도서관 도서', '독서 활동지'],
      readingRecommendation: '《생각의 탄생》, 《책 읽는 뇌》',
      recordTip: '도서의 핵심 논지를 논리적으로 구조화하여 요약하고 자신의 생각을 진솔하게 담아낸 우수한 독서력 부각',
      draftRecordSnippet: `독서 수업에서 '주제 통합적 읽기'를 실천하며, '${cleanInterest}'을 다룬 교양 도서를 완독함. 저자가 제시한 학문적 논점과 사회적 시사점을 3가지 핵심 키워드로 요약하고, 전공 희망자의 관점에서 향후 탐구 과제를 도출한 서평을 작성하여 학급 독서 활동을 주도함.`,
      concreteSteps: create4ConcreteSteps('교양 도서 독서 서평 작성', 'korean', '사실적 독서와 서평', '도서 발췌 및 800자 서평 작성', ['도서관 도서', '독서 노트'], 'basic'),
    });

    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 신문 기사)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 주요 일간지 기사 비교를 통한 보도 태도 및 설득 전략 분석',
      curriculumConcept: '화법과 작문: 설득 전략의 타당성 평가 / 언론 기사의 보도 태도 비교',
      topic: `주요 일간지 기사 비교를 통한 '${interestClean}' 관련 보도 태도 및 언어적 설득 전략 분석`,
      inquiryQuestion: `서로 다른 언론사들이 동일한 사안을 보도할 때 제목과 본문에서 어떤 어휘적 차이를 보이는가?`,
      connectionRationale: `신문 기사 2편을 나란히 놓고 비교해보며 매체 언어의 어조와 관점의 차이를 쉽게 파악합니다.`,
      methodology: `포털 뉴스에서 보수/진보 성향 일간지 기사 각 1편을 발췌하여 사용된 핵심 명사와 형용사 비교표 작성`,
      recommendedTools: ['포털 뉴스 검색 (Naver/Daum)', 'Excel 비교표'],
      readingRecommendation: '《미디어 리터러시》, 《뉴스 읽기의 혁명》',
      recordTip: '언론 텍스트의 어휘 선택과 관점 차이를 날카롭게 포착하여 비판적 수용 태도를 입증한 국어과 역량 기술',
      draftRecordSnippet: `화법과 작문 시간 '매체 텍스트의 설득 전략'을 배우며, '${cleanInterest}'에 관한 일간지 기사 2편을 비교 분석함. 한 언론사는 경제적 기대 효과를 부각한 반면 다른 언론사는 부작용에 초점을 맞추었음을 헤드라인 어휘 분석으로 도출하고, 균형 잡힌 정보 수용의 중요성을 제언함.`,
      concreteSteps: create4ConcreteSteps('일간지 기사 어휘 비교 분석', 'korean', '매체 언어의 관점 비교', '기사 2편 비교표 작성', ['포털 뉴스', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '국어 (독서 / 화법과 작문 / 언어와 매체)',
      subjectCategory: 'korean',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 툴민 논증 모델과 비판적 담화 분석을 적용한 학술 소논설문 집필',
      curriculumConcept: '화법과 작문: 논증의 정교화와 오류 검출 / 비판적 담화 분석(CDA)',
      topic: `툴민(Toulmin) 논증 모델과 비판적 담화 분석을 적용한 '${interestClean}' 학술 소논설문 집필`,
      inquiryQuestion: `이 주제를 다룬 기존 학술적 사설들의 논리 전개에서 데이터와 주장 사이의 논리적 비약은 어디서 발생하는가?`,
      connectionRationale: `전문 지식을 명료하고 호소력 있는 학술적 문체로 풀어내고 툴민 논증 모델로 논리적 엄밀성을 확보합니다.`,
      methodology: `신문 사설 3편을 주장-데이터-담보 3요소로 분해하고, 4매 분량의 논증적 에세이 집필 및 학급 발표`,
      recommendedTools: ['BigKinds 빅카인즈', '툴민 논증 다이어그램'],
      readingRecommendation: '《생각의 탄생》(루트번스타인), 《비판적 담화 분석》',
      recordTip: '전문 지식을 탄탄한 논증 구조와 품격 있는 문체로 완성해낸 탁월한 작문 및 의사소통 역량 기술',
      draftRecordSnippet: `화법과 작문 수업에서 툴민(Toulmin) 논증 모델을 활용해 '${cleanInterest}' 관련 담론을 비판적으로 분석함. 데이터와 주장 사이의 논리적 비약과 암묵적 전제를 날카롭게 짚어내고, 과학적 팩트와 윤리적 책임을 아우르는 완성도 높은 4매 분량의 논증적 소논설문을 완성함.`,
      concreteSteps: create4ConcreteSteps('툴민 논증 학술 소논설문 집필', 'korean', '논증 구조와 비판적 담화', '사설 분해 및 4매 에세이 작성', ['빅카인즈', '작문 노트'], 'advanced'),
    });

    // English 3 topics
    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 청소년용 해외 뉴스(BBC News for Youth)를 활용한 핵심 어휘 학습',
      curriculumConcept: '영어: 맥락 속 어휘 의미 추론 및 기본 문장 구조 파악',
      topic: `청소년용 해외 뉴스(BBC News for Youth)를 활용한 '${interestClean}' 관련 핵심 어휘 및 문장 구조 학습`,
      inquiryQuestion: `해외 영문 뉴스에서 이 주제를 다룰 때 가장 빈번하게 등장하는 핵심 어휘 20선은 무엇인가?`,
      connectionRationale: `고교생 수준에 맞춘 해외 청소년 뉴스를 통해 주제 관련 핵심 영어 어휘와 문장 구조를 친근하게 체득합니다.`,
      methodology: `BBC Newsround 기사 1편을 정독하고 핵심 단어 20개와 문장 3개를 발췌하여 학습 카드 제작`,
      recommendedTools: ['BBC Newsround / CNN 10', '영어사전'],
      readingRecommendation: '《Word Power in Use》',
      recordTip: '해외 영문 시사 자료를 스스로 찾아 읽고 핵심 어휘를 정확하게 정리한 성실한 자기주도 어학 역량 기술',
      draftRecordSnippet: `영어 시간에 '시사 텍스트를 통한 어휘 확장' 활동을 수행하며, BBC Newsround의 '${cleanInterest}' 관련 해설 기사를 완독함. 핵심 어휘 20개를 추출해 단어장을 제작하고, 기사의 주요 논지를 3문장의 간결한 영어로 요약 발표하여 어학 역량을 입증함.`,
      concreteSteps: create4ConcreteSteps('청소년 뉴스 어휘 학습 카드', 'english', '맥락 속 어휘 추론', 'BBC 기사 독해 및 단어장 작성', ['BBC News', '사전'], 'basic'),
    });

    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 인포그래픽 번역)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 해외 비정부기구(NGO) 및 공공기관의 영문 인포그래픽 번역',
      curriculumConcept: '영어: 시각 자료 연계 텍스트 정보의 한국어 전달 및 번역',
      topic: `해외 비정부기구(NGO) 및 공공기관의 '${interestClean}' 관련 영문 인포그래픽 자료 해독 및 학급 공유`,
      inquiryQuestion: `해외 인포그래픽에 수록된 핵심 수치와 설명을 한국어로 가장 명확하게 전달하는 번역 방식은 무엇인가?`,
      connectionRationale: `시각 자료와 결합된 영문 텍스트를 직접 번역해봄으로써 실용적인 영어 전달력을 기릅니다.`,
      methodology: `해외 공식 웹사이트에서 인포그래픽을 발췌하여 핵심 문장을 우리말로 번역한 카드뉴스 제작`,
      recommendedTools: ['해외 공공 포털', '디자인 도구'],
      readingRecommendation: '《번역의 탄생》',
      recordTip: '시각 자료와 결합된 영문 텍스트를 정확하게 이해하고 알기 쉽게 재구성한 실용 번역 역량 부각',
      draftRecordSnippet: `영어 교과의 '시각 정보 전달' 활동의 일환으로 해외 기관의 '${cleanInterest}' 인포그래픽 자료를 번역함. 영문 통계 그래프와 슬로건을 한국어로 자연스럽게 번역하여 4컷 카드뉴스를 제작하고 학급에 공유하여 실용적인 다국어 소통력을 발휘함.`,
      concreteSteps: create4ConcreteSteps('영문 인포그래픽 카드뉴스 번역', 'english', '시각 자료 연계 텍스트 번역', '자료 번역 및 카드뉴스 제작', ['해외 포털', 'Canva'], 'basic'),
    });

    subjects.push({
      subject: '영어 (영어 / 영어회화 / 심화영어)',
      subjectCategory: 'english',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · SCI급 오픈액세스 저널 IMRaD 원문 분석 및 영문 Executive Summary',
      curriculumConcept: '심화영어: Academic Word List(AWL)와 IMRaD 구조 독해 / 250단어 영문 요약서',
      topic: `'${interestClean}' 관련 SCI급 오픈액세스 저널 논문 2편 IMRaD 원문 분석 및 250단어 영문 Executive Summary 작성`,
      inquiryQuestion: `국제 학술계가 이 분야에서 가장 긴급하게 해결하고자 하는 연구 난제는 어떤 학술 영어 수사로 서술되는가?`,
      connectionRationale: `Nature/Science/IEEE 등 국제 학술 저널의 원문 구조(IMRaD)를 해독하고 영문 Executive Summary를 작성하여 전공 어학 역량을 입증합니다.`,
      methodology: `Google Scholar 검색을 통해 오픈액세스 논문 2편의 초록과 결론을 발췌하여 학술 어휘 30선 및 250단어 영문 요약서 작성`,
      recommendedTools: ['Google Scholar 원문 검색', 'Grammarly 문법 검사기'],
      readingRecommendation: '《The Elements of Style》',
      recordTip: '해외 학술 저널 원문을 능동적으로 탐색하고 학술적 영어로 완벽히 재구성해낸 우수한 글로벌 학업 역량 기술',
      draftRecordSnippet: `심화영어 수업에서 '${cleanInterest}' 관련 최신 국제 저널 원문 논문을 IMRaD 구조로 강독함. 학술 어휘(AWL)를 정리하고 연구 결론의 핵심을 250단어 영문 Executive Summary로 완벽하게 요약해 영어 프레젠테이션을 성공적으로 수행함.`,
      concreteSteps: create4ConcreteSteps('SCI 원문 IMRaD 강독 요약', 'english', '학술 영어와 IMRaD 구조', 'Google Scholar 논문 분석 및 요약서', ['Google Scholar', 'Grammarly'], 'advanced'),
    });

    // Tech 3 topics
    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 프로그래밍)',
      subjectCategory: 'tech',
      level: 'basic',
      levelLabel: '기본 탐구 (교과서 중심 · 개념 이해)',
      difficultyRating: 2,
      suitability: '고1~2 추천 · 엔트리 블록 코딩 또는 스프레드시트를 활용한 기초 시뮬레이터 제작',
      curriculumConcept: '정보: 변수와 제어 구조 / 프로그래밍의 기초 원리',
      topic: `엔트리(Entry) 블록 코딩 또는 스프레드시트를 활용한 '${interestClean}' 기초 모의 시뮬레이터 제작`,
      inquiryQuestion: `이 현상의 핵심 규칙을 교과서 속 조건문과 반복문 블록으로 어떻게 컴퓨터 화면에 구현할 수 있는가?`,
      connectionRationale: `코딩 문법의 어려움 없이 엔트리 블록으로 현상의 규칙을 직접 조작해보고 컴퓨팅 사고력을 키웁니다.`,
      methodology: `엔트리에서 슬라이더 변수를 생성하고 조건에 따라 결과가 변하는 인터랙티브 시뮬레이션 제작`,
      recommendedTools: ['엔트리 (playentry.org)', '정보 교과서'],
      readingRecommendation: '《헬로 루비: 코딩 동화》, 《소프트웨어 세상》',
      recordTip: '현상의 규칙을 교과서 제어문 알고리즘으로 명쾌하게 구현해낸 기초 컴퓨팅 사고력 기술',
      draftRecordSnippet: `정보 수업에서 '프로그래밍의 기초' 단원을 학습하며, 엔트리(Entry)를 활용해 '${cleanInterest}' 시뮬레이터를 제작함. 변수와 조건문을 통해 입력값에 따른 결과 변화를 동적으로 시각화하여 소프트웨어를 통한 문제 해결 역량을 입증함.`,
      concreteSteps: create4ConcreteSteps('엔트리 블록 시뮬레이터 제작', 'tech', '변수와 조건문 알고리즘', '엔트리 블록 코딩 구현', ['엔트리', '교과서'], 'basic'),
    });

    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 프로그래밍)',
      subjectCategory: 'tech',
      level: 'basic',
      levelLabel: '기본 탐구 (실생활 사례 · 데이터 시각화)',
      difficultyRating: 3,
      suitability: '고1~2 추천 · 공공데이터포털 CSV 데이터를 엑셀 피벗테이블과 차트로 시각화',
      curriculumConcept: '정보: 데이터의 수집과 관리 / 스프레드시트 피벗테이블 분석',
      topic: `공공데이터포털 CSV 데이터를 엑셀 피벗테이블과 조건부 서식으로 가공한 '${interestClean}' 차트 시각화`,
      inquiryQuestion: `정부 공공데이터 원시 파일에서 결측치를 정제하고 차트로 시각화했을 때 어떤 통계적 패턴이 드러나는가?`,
      connectionRationale: `실제 공공데이터포털의 방대한 CSV 파일을 엑셀로 내려받아 필터링과 피벗테이블을 활용해 데이터를 정리합니다.`,
      methodology: `공공데이터포털에서 관련 CSV를 다운로드하여 엑셀 피벗테이블로 집계하고 꺾은선 및 막대차트 제작`,
      recommendedTools: ['공공데이터포털 (data.go.kr)', 'Excel'],
      readingRecommendation: '《빅데이터 인문학》, 《데이터 시각화의 원리》',
      recordTip: '정부 공개 대규모 원시 데이터를 체계적으로 수집·정제하여 통계적 패턴을 시각화해낸 실무 데이터 분석력 부각',
      draftRecordSnippet: `정보 시간에 '스프레드시트를 이용한 데이터 관리'를 학습하며, 공공데이터포털에서 '${cleanInterest}' 관련 원시 CSV 데이터를 수집함. 피벗테이블로 데이터를 범주별 집계하고 조건부 서식 차트로 시각화하여 숨겨진 통계적 규칙성을 명확히 도출함.`,
      concreteSteps: create4ConcreteSteps('엑셀 피벗테이블 데이터 시각화', 'tech', '데이터 관리와 피벗테이블', 'CSV 정제 및 차트 작성', ['공공데이터포털', 'Excel'], 'basic'),
    });

    subjects.push({
      subject: '정보/융합 (정보 / 인공지능 기초 / 프로그래밍)',
      subjectCategory: 'tech',
      level: 'advanced',
      levelLabel: '심화 탐구 (정량 모델링 · 학술 심층)',
      difficultyRating: 5,
      suitability: '고2~3 추천 · 파이썬 공공 API 파이프라인 구축 및 Big-O 알고리즘 시간복잡도 최적화',
      curriculumConcept: '정보: API 연동 및 데이터 파이프라인 / 알고리즘 복잡도(Big-O) 분석',
      topic: `파이썬 공공데이터 JSON Open API 연동 및 결측치 정제·Big-O 알고리즘 시간복잡도 최적화`,
      inquiryQuestion: `실시간 공공 API 응답 데이터를 어떻게 효율적으로 메모리에 적재하고 검색 시간복잡도를 O(N)에서 O(log N)으로 단축할 것인가?`,
      connectionRationale: `단순 코딩을 넘어 공공 API 파이프라인 구축과 알고리즘 시간·공간 복잡도 분석을 통해 전공 적합성을 확보합니다.`,
      methodology: `파이썬 requests로 실시간 API 데이터를 수집하고 Pandas로 정제 후 이진 탐색 및 해시 테이블 시간복잡도 비교 벤치마킹`,
      recommendedTools: ['공공데이터포털 API', 'Python (Pandas, Timeit)', 'Google Colab'],
      readingRecommendation: '《알고리즘 문제 해결 전략》(구종만), 《파이썬 데이터 사이언스 핸드북》',
      recordTip: '공공 API 파이프라인을 독자 구축하고 알고리즘 복잡도를 수리적으로 분석하여 성능을 개선한 뛰어난 컴퓨팅 실무력 기술',
      draftRecordSnippet: `정보 교과의 '알고리즘 최적화' 단원을 심화하여, '${cleanInterest}' 관련 공공데이터 JSON API를 호출하는 파이썬 데이터 파이프라인을 구축함. Pandas로 결측치를 정제하고 자료구조(리스트 vs 해시맵)에 따른 탐색 시간복잡도를 timeit 모듈로 벤치마킹하여 성능을 획기적으로 개선함.`,
      concreteSteps: create4ConcreteSteps('파이썬 API 파이프라인 최적화', 'tech', 'API 통신과 알고리즘 복잡도', 'Python API 수집 및 timeit 벤치마킹', ['Google Colab', '공공데이터포털'], 'advanced'),
    });
  }

  // Always include all 18 topics across all 6 high school subject clusters (2 basic + 1 advanced per subject: 6 x 3 = 18 topics)
  // This guarantees that the Mind Map and Wizard always contain the complete 3 recommended topics for every subject!
  const finalSubjects: SubjectInquiryTopic[] = subjects.map((s, idx) => ({
    ...s,
    id: s.id || `topic-synth-${s.subjectCategory}-${idx}`,
  }));

  // Build MindMap displaying all 3 distinct topic nodes under each subject branch
  const subjectCategoryOrder: SubjectCategory[] = ['math', 'science', 'social', 'korean', 'english', 'tech'];
  const subjectCategoryNames: Record<SubjectCategory, string> = {
    math: '수학 (미적분/확통/기하)',
    science: '과학/공학 (물리/화학/생명/지구)',
    social: '사회/윤리/경제 (통합사회/정법/한지)',
    korean: '국어/인문 (독서/화작/언매)',
    english: '영어/글로벌 (영어/심화영어)',
    tech: '정보/융합 (정보/인공지능기초)',
  };

  const subjectBranches = subjectCategoryOrder
    .map((cat, idx) => {
      const catTopics = finalSubjects.filter((s) => s.subjectCategory === cat);
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
        text: `[${cat.toUpperCase()}] ${subjectCategoryNames[cat]} 교과 연계 (기본 2개 · 심화 1개)`,
        category: cat,
        color: branchColor,
        subject: subjectCategoryNames[cat],
        nodeType: 'subject' as const,
        detail: `${cleanInterest} 관련 ${subjectCategoryNames[cat]} 교과 수준별 탐구 주제 모음 (기본 2개, 심화 1개)`,
        children: catTopics.map((topic, tIdx) => {
          const isBasic = topic.level === 'basic';
          const topicColor = isBasic ? (tIdx === 0 ? '#10b981' : '#06b6d4') : '#6366f1';

          return {
            id: `topic-${cat}-${tIdx}`,
            text: `[${isBasic ? '기본' : '심화'}] ${topic.topic}`,
            category: cat,
            color: topicColor,
            subject: topic.subject,
            level: topic.level,
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
            children: (topic.concreteSteps || []).map((step, sIdx) => ({
              id: `step-${cat}-${tIdx}-${step.stepNum ?? sIdx + 1}`,
              text: step.stepName,
              category: cat,
              color: topicColor,
              subject: topic.subject,
              nodeType: 'process_step' as const,
              level: topic.level,
              detail: `${step.focus || step.detail || ''} (${step.protocol})`,
              inquiryQuestion: topic.inquiryQuestion,
              methodology: step.protocol,
              readingRecommendation: topic.readingRecommendation,
              recordTip: topic.recordTip,
              recommendedTools: step.tools,
              children: createTailoredActionChildren(
                step.stepNum ?? sIdx + 1,
                cat,
                topic.topic,
                topic.subject,
                topic.curriculumConcept || '',
                step.protocol,
                step.tools || [],
                cleanInterest,
                topic.level || 'basic'
              ),
            })),
          };
        }),
      };
    })
    .filter(Boolean) as MindMapNode[];

  const mindmap: MindMapNode = {
    id: `root-${Date.now()}`,
    text: cleanInterest,
    category: 'root',
    nodeType: 'root',
    color: '#4f46e5',
    detail: `학생 핵심 관심 연구 분야: ${cleanInterest} (희망 진로: ${cleanMajor}, 대상: ${grade}) - 교과별 기본/심화 3대 탐구 과제`,
    children: subjectBranches,
  };

  return {
    majorOverview,
    connectionSummary,
    subjects: finalSubjects,
    mindmap,
  };
}
