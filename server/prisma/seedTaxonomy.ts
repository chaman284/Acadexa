import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SEMESTER = 5;

interface TaxonomyRow {
  course_code: string;
  course_name: string;
  module_no: string;
  topic: string;
  subtopic_id: string;
  subtopic: string;
}

async function main() {
  console.log('🌱 Starting Taxonomy Seeding...');

  const csvPath = path.resolve(__dirname, 'data/syllabus_taxonomy.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Taxonomy CSV file not found at ${csvPath}`);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records: TaxonomyRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`📄 Read ${records.length} records from CSV.`);

  // 1. Resolve Department (reuse AIML from existing seed, fallback to first, or create CS)
  let dept = await prisma.department.findUnique({ where: { code: 'AIML' } });
  if (!dept) {
    dept = await prisma.department.findFirst();
  }
  if (!dept) {
    dept = await prisma.department.create({
      data: { code: 'CS', name: 'Computer Science' },
    });
  }
  console.log(`🏢 Using department: ${dept.name} (${dept.code})`);

  // Collect unique subjects, topics, and subtopics
  const subjectsMap = new Map<string, { id: string; name: string; code: string }>();
  const topicsMap = new Map<string, { id: string; name: string; moduleNo: number; subjectId: string }>();
  const subtopicsMap = new Map<string, { id: string; name: string; topicId: string }>();

  for (const row of records) {
    const courseCode = row.course_code.trim();
    const courseName = row.course_name.trim();
    const moduleNo = parseInt(row.module_no.trim(), 10);
    const topicName = row.topic.trim();
    const subtopicId = row.subtopic_id.trim();
    const subtopicName = row.subtopic.trim();

    const subjectId = `subj-${courseCode}`;
    if (!subjectsMap.has(subjectId)) {
      subjectsMap.set(subjectId, {
        id: subjectId,
        name: courseName,
        code: courseCode,
      });
    }

    const topicId = `topic-${courseCode}-M${moduleNo}`;
    if (!topicsMap.has(topicId)) {
      topicsMap.set(topicId, {
        id: topicId,
        name: topicName,
        moduleNo,
        subjectId,
      });
    }

    if (!subtopicsMap.has(subtopicId)) {
      subtopicsMap.set(subtopicId, {
        id: subtopicId,
        name: subtopicName,
        topicId,
      });
    }
  }

  // 2. Upsert Subjects
  let subjectsCount = 0;
  for (const subj of subjectsMap.values()) {
    await prisma.subject.upsert({
      where: { id: subj.id },
      update: {
        name: subj.name,
        code: subj.code,
      },
      create: {
        id: subj.id,
        name: subj.name,
        code: subj.code,
        semester: DEFAULT_SEMESTER,
        departmentId: dept.id,
      },
    });
    subjectsCount++;
  }

  // 3. Upsert Topics
  let topicsCount = 0;
  for (const top of topicsMap.values()) {
    await prisma.topic.upsert({
      where: { id: top.id },
      update: {
        name: top.name,
        moduleNo: top.moduleNo,
        subjectId: top.subjectId,
      },
      create: {
        id: top.id,
        name: top.name,
        moduleNo: top.moduleNo,
        subjectId: top.subjectId,
      },
    });
    topicsCount++;
  }

  // 4. Upsert Subtopics
  let subtopicsCount = 0;
  for (const sub of subtopicsMap.values()) {
    await prisma.subtopic.upsert({
      where: { id: sub.id },
      update: {
        name: sub.name,
        topicId: sub.topicId,
      },
      create: {
        id: sub.id,
        name: sub.name,
        topicId: sub.topicId,
      },
    });
    subtopicsCount++;
  }

  console.log(`\n🎉 Taxonomy Seed Summary:`);
  console.log(`   Subjects created/updated: ${subjectsCount}`);
  console.log(`   Topics created/updated:   ${topicsCount}`);
  console.log(`   Subtopics created/updated: ${subtopicsCount}`);
}

main()
  .catch(e => {
    console.error('❌ Error during taxonomy seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
