import { Student, Teacher, InquiryActivityRecord, RoadmapMilestone, ChatMessage, MindMapNode } from '../types';
import { synthesizeComprehensiveCurriculum } from './curriculumSynthesizer';
import { generateTailoredRoadmap, generateTailoredInquiryRecords } from './tailoredRoadmapAndLogs';

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    name: '강수진',
    subject: '통합과학 · 생명과학',
    role: '진로진학상담부장',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    school: '한국과학예술고등학교',
  },
];

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: '김민서',
    grade: '고등학교 2학년',
    classNum: '2반 14번',
    targetMajor: '경영학과',
    targetCareer: '마케팅 전문가',
    mainInterestTopic: 'AI를 활용한 마케팅',
    interestKeywords: ['AI 활용 윤리', '코딩능력', '온라인 홍보', '기획능력'],
    preferredSubjects: ['사회 (경제/경영)', '수학 (수학I/확률과 통계)', '정보/AI'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    school: '한국과학예술고등학교',
    status: 'review_needed',
    onboardingCompleted: true,
  },
  {
    id: 'student-2',
    name: '이준호',
    grade: '고등학교 2학년',
    classNum: '4반 21번',
    targetMajor: '컴퓨터공학과 / 인공지능융합',
    targetCareer: 'AI 시스템 아키텍트, 분산 컴퓨팅 연구원',
    mainInterestTopic: '대규모 언어 모델(LLM)의 환각 저감과 알고리즘 시간복잡도 최적화',
    interestKeywords: ['대규모 언어 모델', '트랜스포머 알고리즘', '인공지능 윤리/저작권', '그래프 뉴럴 네트워크'],
    preferredSubjects: ['정보/AI', '수학 (미적분/확률과 통계)', '영어 (심화영어)'],
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    school: '한국과학예술고등학교',
    status: 'active',
    onboardingCompleted: true,
  },
  {
    id: 'student-3',
    name: '박서연',
    grade: '고등학교 3학년',
    classNum: '1반 09번',
    targetMajor: '환경경제학과 / 공공정책학',
    targetCareer: 'ESG 정책 연구원, 탄소중립 배출권 거래 분석가',
    mainInterestTopic: '탄소배출권 거래제 시장 실패 방지와 피구세 최적 세율 모델링',
    interestKeywords: ['배출권 거래제', '미시경제학 시장 실패', '기후 데이터 시각화', '기후 정의'],
    preferredSubjects: ['사회 (경제/정치와 법)', '수학 (확률과 통계)', '국어 (독서/작문)'],
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    school: '한국과학예술고등학교',
    status: 'active',
    onboardingCompleted: true,
  },
];

export const initialMindMaps: Record<string, MindMapNode> = {
  "student-1": synthesizeComprehensiveCurriculum({
    interest: mockStudents[0].mainInterestTopic || 'AI를 활용한 마케팅',
    targetMajor: mockStudents[0].targetMajor,
    grade: mockStudents[0].grade,
    customKeywords: mockStudents[0].interestKeywords?.join(", ")
  }).mindmap!,
  "student-2": synthesizeComprehensiveCurriculum({
    interest: mockStudents[1].mainInterestTopic || '초거대 언어 모델',
    targetMajor: mockStudents[1].targetMajor,
    grade: mockStudents[1].grade,
    customKeywords: mockStudents[1].interestKeywords?.join(", ")
  }).mindmap!,
  "student-3": synthesizeComprehensiveCurriculum({
    interest: mockStudents[2].mainInterestTopic || '탄소배출권 거래제',
    targetMajor: mockStudents[2].targetMajor,
    grade: mockStudents[2].grade,
    customKeywords: mockStudents[2].interestKeywords?.join(", ")
  }).mindmap!,
};

export const mockInquiryRecords: InquiryActivityRecord[] = [
  ...generateTailoredInquiryRecords(mockStudents[0]),
  ...generateTailoredInquiryRecords(mockStudents[1]),
  ...generateTailoredInquiryRecords(mockStudents[2]),
];

export const mockRoadmap: Record<string, RoadmapMilestone[]> = {
  'student-1': generateTailoredRoadmap(mockStudents[0]),
  'student-2': generateTailoredRoadmap(mockStudents[1]),
  'student-3': generateTailoredRoadmap(mockStudents[2]),
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'student-1',
    senderName: '김민서',
    senderRole: 'student',
    recipientId: 'teacher-1',
    content: '선생님 안녕하세요! 지난번 조언해주신 대로 확률과 통계 시간에 베이즈 정리를 활용해서 CRISPR 유전자가위 오프타깃 확률을 모델링해보고 보고서를 작성해 제출했습니다. 혹시 세특 기재 방향이나 보완할 점이 있을까요?',
    timestamp: '2026-05-21 16:40',
    relatedActivityId: 'act-1',
    tag: '세특검토',
  },
  {
    id: 'msg-2',
    senderId: 'teacher-1',
    senderName: '강수진 교사',
    senderRole: 'teacher',
    recipientId: 'student-1',
    content: '민서 학생, 제출한 보고서 꼼꼼히 확인했어요! 고등학교 확률과 통계 교과 내용인 조건부 확률과 베이즈 정리를 실제 유전공학의 난제인 오프타깃 문제에 직접 접목한 점이 입학사정관에게 매우 인상적인 학업역량으로 보일 거예요.',
    timestamp: '2026-05-22 09:15',
    relatedActivityId: 'act-1',
    tag: '피드백',
  },
  {
    id: 'msg-3',
    senderId: 'teacher-1',
    senderName: '강수진 교사',
    senderRole: 'teacher',
    recipientId: 'student-1',
    content: '피드백 패널에 학생부 세특 표준 기재 문안 초안을 작성해 두었으니 확인해 보세요. 그리고 2학기에는 생명과학II에서 Cas9 단백질의 3차원 변이체 구조 분석으로 연결하면 1학년-2학년-3학년으로 이어지는 강력한 연구 스토리라인이 완성될 겁니다!',
    timestamp: '2026-05-22 09:18',
    relatedActivityId: 'act-1',
    tag: '피드백',
  },
  {
    id: 'msg-4',
    senderId: 'student-1',
    senderName: '김민서',
    senderRole: 'student',
    recipientId: 'teacher-1',
    content: '우와, 세특 초안과 연계 방향 조언 정말 감사드립니다! 말씀해주신 대로 마인드맵에 2학기 생명과학II 세부 브랜치를 추가해 두었습니다. 다음 주에 생명윤리 관련 토론 보고서도 마감되는 대로 공유해 드리겠습니다!',
    timestamp: '2026-05-22 10:05',
    relatedActivityId: 'act-1',
    tag: '질문',
  },
];

export const presetFields = [
  {
    category: '의학 / 생명과학',
    fields: ['유전자 가위와 난치병 치료', '면역 항암제 및 CAR-T 세포 치료', '뇌신경과학과 뇌-컴퓨터 인터페이스(BCI)', '합성생물학과 맞춤 미생물'],
  },
  {
    category: '인공지능 / 소프트웨어',
    fields: ['초거대 언어 모델(LLM)과 분산 컴퓨팅', '컴퓨터 비전과 자율주행 객체인식', '블록체인 분산 원장과 스마트 계약', '양자 컴퓨팅과 암호학 알고리즘'],
  },
  {
    category: '기계 / 로봇 / 항공우주',
    fields: ['소프트 로보틱스와 생체 모방 기술', '우주 발사체 재사용 열역학 설계', '자율주행 드론 군집 비행 제어', '수소 연료전지 자동차 에너지 효율'],
  },
  {
    category: '환경 / 신소재 / 화학',
    fields: ['탄소 포집·활용·저장(CCUS) 기술', '차세대 전고체 배터리 소재', '해양 미세플라스틱 분해 효소', '페로브스카이트 태양전지 광전효율'],
  },
  {
    category: '경영 / 경제 / 사회정책',
    fields: ['배출권 거래제(ETS)와 시장 실패 극복', '빅데이터 기반 소비자 행동경제학', '플랫폼 독점과 공정거래법 규제', '국민연금 재정 지속가능성 수리 모델'],
  },
  {
    category: '인문 / 미디어 / 교육',
    fields: ['생성형 AI 시대의 디지털 리터러시', '미디어 알고리즘과 확증 편향 해소', '과학기술 윤리와 인류학적 공존', '디지털 격차와 교육 기회 균등'],
  },
];
