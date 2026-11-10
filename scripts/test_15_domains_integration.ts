import { fifteenCurriculumDatabase } from '../src/data/fifteenCurriculumDatabase.ts';
import { synthesizeComprehensiveCurriculum } from '../src/data/curriculumSynthesizer.ts';
import { generateTailoredRoadmap, generateTailoredInquiryRecords } from '../src/data/tailoredRoadmapAndLogs.ts';
import { Student } from '../src/types/index.ts';

console.log(`[Test] fifteenCurriculumDatabase loaded. Total domains: ${fifteenCurriculumDatabase.length}`);

let passCount = 0;
for (const domain of fifteenCurriculumDatabase) {
  // Test synthesis
  const res = synthesizeComprehensiveCurriculum({
    interest: domain.name,
    targetMajor: domain.aliases[0],
    grade: '고등학교 2학년',
    customKeywords: domain.aliases.slice(0, 3).join(', '),
  });

  if (res.subjects.length !== 18) {
    console.error(`FAIL: ${domain.name} generated ${res.subjects.length} subjects (expected 18)`);
    process.exit(1);
  }

  // Test roadmap & activity records
  const mockStudent: Student = {
    id: `test-${domain.id}`,
    name: '테스트학생',
    school: '고등학교',
    grade: '고등학교 2학년',
    classNum: '1반 1번',
    targetCareer: domain.aliases[domain.aliases.length - 1],
    targetMajor: domain.aliases[0],
    mainInterestTopic: domain.name,
    interestKeywords: domain.aliases,
    preferredSubjects: ['수학', '과학', '정보'],
    avatar: '',
    status: 'active',
  };

  const roadmap = generateTailoredRoadmap(mockStudent);
  if (roadmap.length !== 10) {
    console.error(`FAIL: ${domain.name} generated ${roadmap.length} milestones (expected 10)`);
    process.exit(1);
  }

  const records = generateTailoredInquiryRecords(mockStudent);
  if (records.length !== 3) {
    console.error(`FAIL: ${domain.name} generated ${records.length} records (expected 3)`);
    process.exit(1);
  }

  passCount++;
  console.log(`✔ [PASS] ${domain.name} -> 18 subjects, 10 milestones, 3 activity records verified!`);
}

console.log(`\n🎉 ALL ${passCount} DOMAINS VERIFIED SUCCESSFULLY!`);
