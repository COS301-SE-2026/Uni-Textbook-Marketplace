import { EntityManager } from 'typeorm';
import { Module } from '../entities/module.entity';
import { University } from '../entities/university.entity';
import * as fs from 'fs';
import * as path from 'path';

interface ModuleData {
  code: string;
  name: string;
  faculty: string;
  facultyCode: string;
  url: string;
}

export async function seedModules(manager: EntityManager) {
  const moduleRepository = manager.getRepository(Module);
  const universityRepository = manager.getRepository(University);

  const university = await universityRepository.findOne({
    where: { name: 'University of Pretoria' },
  });

  if (!university) {
    throw new Error('University of Pretoria not found');
  }

  const jsonPath = path.join(__dirname, '..', '..', '..', 'modules-data.json');

  let modulesData: ModuleData[] = [];

  try {
    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    modulesData = JSON.parse(fileContent);
    console.log(`Loaded ${modulesData.length} modules from modules-data.json`);
    console.log(`File path: ${jsonPath}`);
  } catch (error) {
    console.error('Failed to read modules-data.json:', error);
    console.log('Falling back to hardcoded module data...');
    modulesData = getFallbackModules();
  }

  const facultyMapping: Record<string, string> = {
    SCI: 'Natural and Agricultural Sciences',
    EBIT: 'Engineering, Built Environment and IT',
    EMS: 'Economic and Management Sciences',
    EDU: 'Education',
    MED: 'Health Sciences',
    HLT: 'Health Sciences',
    HUM: 'Humanities',
    LAW: 'Law',
    THEO: 'Theology and Religion',
    VET: 'Veterinary Sciences',
    GIBS: 'Gordon Institute of Business Science',
  };

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of modulesData) {
    // Check if module already exists by code
    const existing = await moduleRepository.findOne({
      where: { code: data.code, university: { id: university.id } },
    });

    if (existing) {
      console.log(`Skipped (already exists): ${data.code} - ${data.name}`);
      skippedCount++;
      continue;
    }

    const semester = determineSemester(data.code);
    const facultyName =
      data.faculty || facultyMapping[data.facultyCode] || 'Unknown Faculty';

    const module = moduleRepository.create({
      code: data.code,
      name: data.name,
      faculty: facultyName,
      semester: semester,
      university: university,
    });

    await moduleRepository.save(module);
    console.log(`Created: ${data.code} - ${data.name}`);
    createdCount++;
  }

  console.log(
    `Modules seeded: ${createdCount} created, ${skippedCount} skipped`,
  );
}

function determineSemester(code: string): number {
  const lastTwoDigits = parseInt(code.slice(-2));

  if (lastTwoDigits >= 10 && lastTwoDigits <= 19) {
    return 1;
  } else if (lastTwoDigits >= 20 && lastTwoDigits <= 29) {
    return 2;
  } else if (lastTwoDigits >= 110 && lastTwoDigits <= 119) {
    return 1;
  } else if (lastTwoDigits >= 120 && lastTwoDigits <= 129) {
    return 2;
  }

  return 1;
}

function getFallbackModules(): ModuleData[] {
  return [
    {
      code: 'COS132',
      name: 'Imperative Programming',
      faculty: 'Engineering, Built Environment and IT',
      facultyCode: 'EBIT',
      url: '',
    },
    {
      code: 'COS151',
      name: 'Introduction to Computer Science',
      faculty: 'Engineering, Built Environment and IT',
      facultyCode: 'EBIT',
      url: '',
    },
    {
      code: 'COS212',
      name: 'Data Structures and Algorithms',
      faculty: 'Engineering, Built Environment and IT',
      facultyCode: 'EBIT',
      url: '',
    },
    {
      code: 'COS214',
      name: 'Software Modelling',
      faculty: 'Engineering, Built Environment and IT',
      facultyCode: 'EBIT',
      url: '',
    },
    {
      code: 'COS216',
      name: 'Netcentric Computer Systems',
      faculty: 'Engineering, Built Environment and IT',
      facultyCode: 'EBIT',
      url: '',
    },
    {
      code: 'COS284',
      name: 'Computer Organisation and Architecture',
      faculty: 'Engineering, Built Environment and IT',
      facultyCode: 'EBIT',
      url: '',
    },
    {
      code: 'WTW114',
      name: 'Calculus',
      faculty: 'Natural and Agricultural Sciences',
      facultyCode: 'SCI',
      url: '',
    },
    {
      code: 'WTW124',
      name: 'Mathematics',
      faculty: 'Natural and Agricultural Sciences',
      facultyCode: 'SCI',
      url: '',
    },
    {
      code: 'STK110',
      name: 'Statistics',
      faculty: 'Natural and Agricultural Sciences',
      facultyCode: 'SCI',
      url: '',
    },
    {
      code: 'INF214',
      name: 'Informatics',
      faculty: 'Engineering, Built Environment and IT',
      facultyCode: 'EBIT',
      url: '',
    },
  ];
}
