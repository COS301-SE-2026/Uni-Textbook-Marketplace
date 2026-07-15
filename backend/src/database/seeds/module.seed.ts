import { EntityManager } from 'typeorm';
import { Module } from '../entities/module.entity';
import { University } from '../entities/university.entity';
import { Faculty } from '../entities/faculty.entity';

async function getOrCreateFaculty(
  manager: EntityManager,
  name: string,
): Promise<Faculty> {
  const facultyRepository = manager.getRepository(Faculty);
  let faculty = await facultyRepository.findOne({ where: { name } });

  if (!faculty) {
    faculty = facultyRepository.create({ name });
    await facultyRepository.save(faculty);
  }

  return faculty;
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

  // Get or create faculties
  const engineeringFaculty = await getOrCreateFaculty(
    manager,
    'Engineering, Built Environment and IT',
  );
  const scienceFaculty = await getOrCreateFaculty(
    manager,
    'Natural and Agricultural Sciences',
  );

  const modulesData = [
    { code: 'COS132', name: 'Imperative Programming', semester: 1 },
    { code: 'COS151', name: 'Introduction to Computer Science', semester: 1 },
    { code: 'COS212', name: 'Data Structures and Algorithms', semester: 1 },
    { code: 'COS214', name: 'Software Modelling', semester: 1 },
    { code: 'COS216', name: 'Netcentric Computer Systems', semester: 1 },
    {
      code: 'COS284',
      name: 'Computer Organisation and Architecture',
      semester: 2,
    },
    { code: 'WTW114', name: 'Calculus', semester: 1 },
    { code: 'WTW124', name: 'Mathematics', semester: 2 },
    { code: 'STK110', name: 'Statistics', semester: 1 },
    { code: 'INF214', name: 'Informatics', semester: 2 },
  ];

  const modules = modulesData.map((data) => {
    const isScienceModule =
      data.code.startsWith('WTW') || data.code === 'STK110';
    const faculty = isScienceModule ? scienceFaculty : engineeringFaculty;

    return moduleRepository.create({
      code: data.code,
      name: data.name,
      semester: data.semester,
      faculty: faculty,
      university: university,
    });
  });

  await moduleRepository.save(modules);
  console.log(`${modules.length} modules seeded`);
}
