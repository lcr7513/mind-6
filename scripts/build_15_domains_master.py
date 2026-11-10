# -*- coding: utf-8 -*-
"""
Master Builder for fifteenCurriculumDatabase.ts
Loads all 15 domains, validates them, and writes the TypeScript database.
"""
import sys
import os
import json

# Add scripts directory to path
sys.path.append(os.path.dirname(__file__))

from domain_group_1_to_5 import DOMAINS_1_TO_5
from domain_group_6_to_10 import DOMAINS_6_TO_10
from domain_group_11_to_15 import DOMAINS_11_TO_15

ALL_DOMAINS = DOMAINS_1_TO_5 + DOMAINS_6_TO_10 + DOMAINS_11_TO_15
print(f"Total domains loaded: {len(ALL_DOMAINS)}")

CATEGORY_MAP = {
    "math": "수학",
    "science": "과학",
    "social": "사회",
    "korean": "국어",
    "english": "영어",
    "tech": "정보"
}

ORDER_KEYS = [
    ("math", "basic", "math_basic1", "기본 탐구 (교과서 중심 · 개념 이해)", 2, "고1~2 추천"),
    ("math", "basic", "math_basic2", "기본 탐구 (실생활 사례 · 통계 탐색)", 3, "고1~2 추천"),
    ("math", "advanced", "math_adv", "심화 탐구 (고난도 미적분 · 전공 수리 모델)", 5, "고2~3 추천"),
    
    ("science", "basic", "sci_basic1", "기본 탐구 (교과서 중심 · 개념 이해)", 2, "고1~2 추천"),
    ("science", "basic", "sci_basic2", "기본 탐구 (실생활 사례 · 실험 탐구)", 3, "고1~2 추천"),
    ("science", "advanced", "sci_adv", "심화 탐구 (전공 심화 · 분자생리학/물리학 메커니즘)", 5, "고2~3 추천"),
    
    ("social", "basic", "soc_basic1", "기본 탐구 (교과서 중심 · 개념 이해)", 2, "고1~2 추천"),
    ("social", "basic", "soc_basic2", "기본 탐구 (실생활 사례 · 제도 분석)", 3, "고1~2 추천"),
    ("social", "advanced", "soc_adv", "심화 탐구 (제도 분석 · 법제화 쟁점)", 5, "고2~3 추천"),
    
    ("korean", "basic", "kor_basic1", "기본 탐구 (교과서 중심 · 논증 글쓰기)", 2, "고1~2 추천"),
    ("korean", "basic", "kor_basic2", "기본 탐구 (실생활 사례 · 매체 분석)", 3, "고1~2 추천"),
    ("korean", "advanced", "kor_adv", "심화 탐구 (학술 비평 · 인문학적 성찰)", 5, "고2~3 추천"),
    
    ("english", "basic", "eng_basic1", "기본 탐구 (교과서 중심 · 개념 이해)", 2, "고1~2 추천"),
    ("english", "basic", "eng_basic2", "기본 탐구 (실생활 사례 · 고전 원전 강독)", 3, "고1~2 추천"),
    ("english", "advanced", "eng_adv", "심화 탐구 (학술 보고서 · 영문 정책 제안서)", 5, "고2~3 추천"),
    
    ("tech", "basic", "tech_basic1", "기본 탐구 (교과서 중심 · 프로그래밍)", 2, "고1~2 추천"),
    ("tech", "basic", "tech_basic2", "기본 탐구 (실생활 사례 · 데이터 시각화)", 3, "고1~2 추천"),
    ("tech", "advanced", "tech_adv", "심화 탐구 (인공지능 머신러닝/딥러닝 파이프라인)", 5, "고2~3 추천")
]

def make_inquiry_question(topic, concept):
    return f"{concept.split(':')[0]}의 핵심 원리를 바탕으로 볼 때, '{topic}'에서 제기되는 학문적·실천적 핵심 메커니즘과 그 해결 방안은 무엇인가?"

def make_rationale(domain_name, topic, concept):
    return f"{domain_name} 진로 희망 학생이 고교 교육과정의 {concept.split('/')[0]} 핵심 개념을 전공 분야의 실제 쟁점과 융합하여 주도적으로 탐구할 수 있는 최적의 주제입니다."

def make_methodology(category, topic):
    if category == "math":
        return "가상의 실제 데이터셋을 수집하여 지오지브라 및 파이썬 NumPy로 수리 모델을 수립하고 극값과 변화율을 분석"
    elif category == "science":
        return "고교 과학 실험실 시약 및 가상 시뮬레이터를 활용하여 변인 통제 실험을 수행하고 메커니즘 도식화"
    elif category == "social":
        return "국가 통계 포털(KOSIS) 및 학술 데이터베이스(RISS)의 공공 정책 자료를 수집하여 비교 분석 및 제도적 대안 도출"
    elif category == "korean":
        return "관련 학술 논문 및 고전 텍스트를 심층 독해하고 논증의 타당성을 평가하는 학술 에세이 및 설득적 비평문 집필"
    elif category == "english":
        return "글로벌 국제기구 원문 보고서 및 영문 학술 저널 초록을 정밀 강독하고 핵심 어휘 주해 및 영문 브리프 작성"
    else:
        return "파이썬(Python) 라이브러리를 활용하여 알고리즘을 직접 코딩하고 데이터 전처리 및 성능 평가지표 산출"

def make_tools(category):
    if category == "math":
        return ["GeoGebra", "Excel", "파이썬 NumPy"]
    elif category == "science":
        return ["MBL 센서", "광학현미경", "NCBI PubMed"]
    elif category == "social":
        return ["통계청 KOSIS", "국회도서관 학술포털", "R/Python"]
    elif category == "korean":
        return ["국립국어원 표준국어대사전", "RISS 학술검색", "독서 포트폴리오"]
    elif category == "english":
        return ["Oxford Academic", "Grammarly Academic", "영한 전문사전"]
    else:
        return ["Python IDLE", "Google Colab", "Scikit-learn"]

def make_record_tip(domain_name, topic, concept):
    return f"{concept.split(':')[0]}의 교과 개념을 {domain_name}의 전공 탐구와 유기적으로 결합하여 문제해결력과 비판적 사고력을 구체적으로 강조할 것"

def make_snippet(domain_name, topic, concept):
    return f"{concept.split(':')[0]} 단원을 학습하며 '{topic}'을(를) 주제로 심층 탐구를 수행함. 교과서 개념에 머무르지 않고 전공 관련 실제 사례에 적용하여 논리적 가설을 검증하고 창의적 대안을 도출해내는 탁월한 융합적 학업 역량을 보임."

def generate_milestones(domain):
    dname = domain["name"]
    topics = domain["topics"]
    t_m1 = topics["math_basic1"][1]
    t_m2 = topics["math_basic2"][1]
    t_ma = topics["math_adv"][1]
    t_s1 = topics["sci_basic1"][1]
    t_s2 = topics["sci_basic2"][1]
    t_sa = topics["sci_adv"][1]
    t_soc = topics["soc_basic1"][1]
    t_eng = topics["eng_basic1"][1]
    t_t1 = topics["tech_basic1"][1]
    t_ta = topics["tech_adv"][1]
    book = domain.get("book", "전공 필독서")

    return [
        {"gradeSemester": "1학년 1학기", "stage": "기초 탐색기", "category": "교과세특", "title": f"수학 기초 탐구: {t_m1[:40]}...", "description": f"{t_m1}을(를) 바탕으로 수리적 모델링을 수행하여 기초 전공 기초 확립", "keyCompetency": "학업역량 (수리적 문제해결력)", "linkedSubject": "수학Ⅰ"},
        {"gradeSemester": "1학년 1학기", "stage": "기초 탐색기", "category": "진로탐색", "title": f"{dname} 전공 탐색 및 진로 멘토링 인터뷰", "description": f"{dname} 분야의 최신 연구 트렌드와 산업 동향을 파악하고 학업 로드맵 수립", "keyCompetency": "진로역량 (전공 관심도)", "linkedSubject": "진로활동"},
        {"gradeSemester": "1학년 2학기", "stage": "기초 탐색기", "category": "교과세특", "title": f"과학 기초 실험: {t_s1[:40]}...", "description": f"{t_s1} 가설을 설정하고 교내 과학 실험을 통해 과학적 탐구 역량 체득", "keyCompetency": "탐구역량 (가설연역적 사고력)", "linkedSubject": "통합과학"},
        {"gradeSemester": "1학년 2학기", "stage": "기초 탐색기", "category": "동아리", "title": f"전공 탐구 동아리: {t_soc[:40]}...", "description": f"교내 자율동아리에서 {t_soc} 쟁점을 분석하고 학술 토론 진행", "keyCompetency": "공동체역량 (협업 및 소통)", "linkedSubject": "동아리활동"},
        {"gradeSemester": "2학년 1학기", "stage": "전공 심화기", "category": "교과세특", "title": f"통계적 데이터 분석: {t_m2[:40]}...", "description": f"{t_m2} 실제 통계 데이터를 활용하여 확률분포 및 신뢰구간 분석", "keyCompetency": "학업역량 (데이터 분석력)", "linkedSubject": "확률과 통계"},
        {"gradeSemester": "2학년 1학기", "stage": "전공 심화기", "category": "심화독서", "title": f"전공 융합 독서: {book} 심층 독해 및 비평문", "description": f"{book}을(를) 읽고 인문·사회·과학적 맥락을 융합한 학술 서평 집필", "keyCompetency": "진로역량 (인문·전공 융합력)", "linkedSubject": "독서"},
        {"gradeSemester": "2학년 2학기", "stage": "전공 심화기", "category": "교과세특", "title": f"과학 전공 심화: {t_s2[:40]}...", "description": f"{t_s2} 분자/물리 메커니즘을 규명하고 심화 실험 보고서 완성", "keyCompetency": "학업역량 (전공 심화 탐구력)", "linkedSubject": "물리/화학/생명과학"},
        {"gradeSemester": "2학년 2학기", "stage": "전공 심화기", "category": "교과세특", "title": f"정보·알고리즘 구현: {t_t1[:40]}...", "description": f"파이썬 프로그래밍을 통해 {t_t1} 전공 문제를 소프트웨어로 자동화", "keyCompetency": "융합역량 (소프트웨어 개발력)", "linkedSubject": "정보"},
        {"gradeSemester": "3학년 1학기", "stage": "융합 발전기", "category": "교과세특", "title": f"미적분 전공 심화 모델링: {t_ma[:40]}...", "description": f"{t_ma} 미분방정식 또는 극한 개념을 적용하여 전공 심화 수리 모델 완성", "keyCompetency": "학업역량 (고급 수리 융합력)", "linkedSubject": "미적분"},
        {"gradeSemester": "3학년 1학기", "stage": "융합 발전기", "category": "교과세특", "title": f"인공지능 융합 파이프라인: {t_ta[:40]}...", "description": f"{t_ta} 머신러닝/딥러닝 알고리즘을 적용한 종단간 AI 예측 시스템 구축", "keyCompetency": "융합역량 (AI 융합 문제해결력)", "linkedSubject": "인공지능 기초"}
    ]

def generate_activity_records(domain):
    dname = domain["name"]
    topics = domain["topics"]
    t_m1 = topics["math_basic1"][1]
    c_m1 = topics["math_basic1"][2]
    t_s2 = topics["sci_basic2"][1]
    c_s2 = topics["sci_basic2"][2]
    t_ta = topics["tech_adv"][1]
    c_ta = topics["tech_adv"][2]

    return [
        {
            "title": t_m1,
            "subject": "수학Ⅰ / 확률과 통계",
            "category": "math",
            "activityType": "데이터분석",
            "duration": "2026.04.10 ~ 2026.05.04 (18시간)",
            "motivation": f"{dname} 분야에서 핵심적으로 다루어지는 문제인 '{t_m1}'에 대해 호기심을 갖고, 학교 수학 시간에 배운 {c_m1.split(':')[0]} 개념을 실제 데이터와 접목하여 수학적으로 정량화해보고자 탐구를 시작함.",
            "content": f"관련 공공 통계 및 연구 자료를 수집하여 {c_m1} 공식을 유도함. 수치 데이터를 표준화하고 지오지브라 및 엑셀을 활용해 함수 그래프를 피팅함. 변수의 변화에 따른 결과값의 추이를 분석하여 최적의 임계 조건을 수학적으로 도출함.",
            "reflection": f"이론으로만 접했던 수학 공식이 {dname}의 실제 난제를 해결하는 강력한 분석 도구임을 체감함. 복잡한 현실 문제를 수리적 모델로 단순화하고 검증하는 논리적 사고력을 크게 함양함.",
            "keyCompetency": ["학업역량 (수리 모델링)", "진로역량 (전공 데이터 분석)", "문제해결력"],
            "teacherPoints": f"수학 교과의 개념을 {dname}의 실제 응용 사례와 탁월하게 융합함. 수집한 데이터를 통계적으로 분석하고 오차를 보정한 수리적 분석력이 매우 돋보임."
        },
        {
            "title": t_s2,
            "subject": "통합과학 / 화학 / 생명 / 물리",
            "category": "science",
            "activityType": "실험실습",
            "duration": "2026.05.15 ~ 2026.06.10 (16시간)",
            "motivation": f"교과서에서 배운 {c_s2.split(':')[0]}의 과학적 원리가 {dname}의 현장에서 어떻게 작용하는지 직접 가설을 세우고 실험으로 실증해보고자 탐구를 기획함.",
            "content": f"가설을 설정하고 독립변인과 종속변인을 엄격히 통제한 실험 프로토콜을 수립함. 여러 농도/조건별 시편을 제작하여 반복 측정을 실시하고 오차를 분석함. 과학적 원리를 바탕으로 실험 결과의 인과관계를 체계적인 보고서로 정리함.",
            "reflection": f"직관적 상식에 의존하지 않고 객관적 실험 데이터에 근거하여 결론을 도출하는 과학자적 탐구 태도를 체득함. {dname} 분야의 연구자로서 갖추어야 할 엄밀성을 다짐함.",
            "keyCompetency": ["탐구역량 (가설연역적 실험 설계)", "진로역량 (전공 과학 메커니즘 규명)", "비판적사고력"],
            "teacherPoints": f"과학적 원리를 실제 실험으로 명확하게 검증해낸 탐구력이 뛰어남. 실험 결과에서 나타난 예외 상황의 원인을 논리적으로 규명하고 발전적 대안을 제시한 태도가 우수함."
        },
        {
            "title": t_ta,
            "subject": "정보 / 인공지능 기초",
            "category": "tech",
            "activityType": "데이터분석",
            "duration": "2026.09.05 ~ 2026.10.20 (24시간)",
            "motivation": f"정보 및 AI 교과에서 학습한 머신러닝/딥러닝 알고리즘을 {dname}의 자동화 및 예측 시스템에 적용하여 실질적인 문제 해결 도구를 구현해보고자 개발을 시작함.",
            "content": f"공개 데이터셋을 수집하여 결측치 정제 및 정규화 전처리를 수행함. 파이썬 머신러닝 라이브러리를 활용해 모델을 학습시키고 교차 검증(Cross-validation)을 통해 과적합을 방지함. 분류/회귀 평가지표를 도출하고 결과를 시각화하는 완전한 파이프라인을 구축함.",
            "reflection": f"인공지능 기술이 {dname} 분야의 업무 효율을 혁신하고 인간의 의사결정을 보조하는 강력한 시너지를 낼 수 있음을 확인하여, 향후 AI 융합형 인재로 성장하겠다는 포부를 확립함.",
            "keyCompetency": ["융합역량 (AI 알고리즘 설계 및 구현)", "문제해결력 (소프트웨어 자동화)", "데이터분석력"],
            "teacherPoints": f"정보 교과의 인공지능 알고리즘을 {dname}의 도메인 문제와 결합하여 직접 작동하는 소프트웨어 파이프라인으로 구현함. 모델의 평가지표를 엄밀히 분석한 융합적 개발 역량이 매우 탁월함."
        }
    ]

# Now let's assemble all 15 domains
output_domains = []

for domain in ALL_DOMAINS:
    d_id = domain["id"]
    d_name = domain["name"]
    aliases = domain["aliases"]
    detect_regex = domain["detect_regex"]
    overview = domain["overview"]
    summary = domain["summary"]
    topics = domain["topics"]
    book = domain.get("book", "")
    
    # Build 18 subjects
    subjects = []
    for cat, lvl, key, lvl_label, diff, suit_prefix in ORDER_KEYS:
        if key in topics:
            item = topics[key]
            subj_name = item[0]
            top_title = item[1]
            concept = item[2]
            
            inq_q = make_inquiry_question(top_title, concept)
            rationale = make_rationale(d_name, top_title, concept)
            meth = make_methodology(cat, top_title)
            tools = make_tools(cat)
            read_rec = f"{book}, 고교 {subj_name.split(' ')[0]} 교과서" if book else f"고교 {subj_name.split(' ')[0]} 교과서 및 관련 학술논문"
            tip = make_record_tip(d_name, top_title, concept)
            snip = make_snippet(d_name, top_title, concept)
            
            subjects.append({
                "subject": subj_name,
                "subjectCategory": cat,
                "level": lvl,
                "levelLabel": lvl_label,
                "difficultyRating": diff,
                "suitability": f"{suit_prefix} · {top_title[:35]}...",
                "curriculumConcept": concept,
                "topic": top_title,
                "inquiryQuestion": inq_q,
                "connectionRationale": rationale,
                "methodology": meth,
                "recommendedTools": tools,
                "readingRecommendation": read_rec,
                "recordTip": tip,
                "draftRecordSnippet": snip
            })
            
    # Milestones & Activity Records
    milestones = generate_milestones(domain)
    activity_records = generate_activity_records(domain)
    
    output_domains.append({
        "id": d_id,
        "name": d_name,
        "aliases": aliases,
        "detect_regex": detect_regex,
        "majorOverview": overview,
        "connectionSummary": summary,
        "subjects": subjects,
        "milestones": milestones,
        "activityRecords": activity_records
    })

print(f"Generated {len(output_domains)} full domains.")
total_subjects = sum(len(d["subjects"]) for d in output_domains)
total_milestones = sum(len(d["milestones"]) for d in output_domains)
total_records = sum(len(d["activityRecords"]) for d in output_domains)
print(f"Total Subjects: {total_subjects} (Expected 270)")
print(f"Total Milestones: {total_milestones} (Expected 150)")
print(f"Total Records: {total_records} (Expected 45)")

# Emit TypeScript code
ts_code = []
ts_code.append("import type { SubjectCategory, InquiryLevel, SubjectInquiryTopic, RoadmapMilestone, InquiryActivityRecord } from '../types/index.ts';\n")
ts_code.append("export interface DomainCurriculumDefinition {")
ts_code.append("  id: string;")
ts_code.append("  name: string;")
ts_code.append("  aliases: string[];")
ts_code.append("  detect: (text: string) => boolean;")
ts_code.append("  majorOverview: string;")
ts_code.append("  connectionSummary: string;")
ts_code.append("  subjects: {")
ts_code.append("    subject: string;")
ts_code.append("    subjectCategory: SubjectCategory;")
ts_code.append("    level: InquiryLevel;")
ts_code.append("    levelLabel: string;")
ts_code.append("    difficultyRating: number;")
ts_code.append("    suitability: string;")
ts_code.append("    curriculumConcept: string;")
ts_code.append("    topic: string;")
ts_code.append("    inquiryQuestion: string;")
ts_code.append("    connectionRationale: string;")
ts_code.append("    methodology: string;")
ts_code.append("    recommendedTools: string[];")
ts_code.append("    readingRecommendation: string;")
ts_code.append("    recordTip: string;")
ts_code.append("    draftRecordSnippet: string;")
ts_code.append("  }[];")
ts_code.append("  milestones: {")
ts_code.append("    gradeSemester: string;")
ts_code.append("    stage: '기초 탐색기' | '전공 심화기' | '융합 발전기';")
ts_code.append("    category: '교과세특' | '동아리' | '진로탐색' | '심화독서';")
ts_code.append("    title: string;")
ts_code.append("    description: string;")
ts_code.append("    keyCompetency: string;")
ts_code.append("    linkedSubject?: string;")
ts_code.append("  }[];")
ts_code.append("  activityRecords: {")
ts_code.append("    title: string;")
ts_code.append("    subject: string;")
ts_code.append("    category: SubjectCategory;")
ts_code.append("    activityType: '실험실습' | '문헌연구' | '데이터분석' | '사회조사';")
ts_code.append("    duration: string;")
ts_code.append("    motivation: string;")
ts_code.append("    content: string;")
ts_code.append("    reflection: string;")
ts_code.append("    keyCompetency: string[];")
ts_code.append("    teacherPoints: string;")
ts_code.append("  }[];")
ts_code.append("}\n")
ts_code.append("// 15 Comprehensive Academic Domains Database")
ts_code.append("export const fifteenCurriculumDatabase: DomainCurriculumDefinition[] = [")

for d in output_domains:
    ts_code.append("  {")
    ts_code.append(f"    id: {json.dumps(d['id'])},")
    ts_code.append(f"    name: {json.dumps(d['name'])},")
    ts_code.append(f"    aliases: {json.dumps(d['aliases'], ensure_ascii=False)},")
    ts_code.append(f"    detect: (text: string) => /{d['detect_regex']}/i.test(text),")
    ts_code.append(f"    majorOverview: {json.dumps(d['majorOverview'], ensure_ascii=False)},")
    ts_code.append(f"    connectionSummary: {json.dumps(d['connectionSummary'], ensure_ascii=False)},")
    
    # subjects
    ts_code.append("    subjects: [")
    for s in d['subjects']:
        ts_code.append("      {")
        for k, v in s.items():
            ts_code.append(f"        {k}: {json.dumps(v, ensure_ascii=False)},")
        ts_code.append("      },")
    ts_code.append("    ],")
    
    # milestones
    ts_code.append("    milestones: [")
    for m in d['milestones']:
        ts_code.append("      {")
        for k, v in m.items():
            ts_code.append(f"        {k}: {json.dumps(v, ensure_ascii=False)},")
        ts_code.append("      },")
    ts_code.append("    ],")
    
    # activityRecords
    ts_code.append("    activityRecords: [")
    for a in d['activityRecords']:
        ts_code.append("      {")
        for k, v in a.items():
            ts_code.append(f"        {k}: {json.dumps(v, ensure_ascii=False)},")
        ts_code.append("      },")
    ts_code.append("    ],")
    ts_code.append("  },")

ts_code.append("];\n")

dest_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/data/fifteenCurriculumDatabase.ts"))
with open(dest_path, "w", encoding="utf-8") as f:
    f.write("\n".join(ts_code))

print(f"Successfully wrote {dest_path} with {len(output_domains)} domains!")
