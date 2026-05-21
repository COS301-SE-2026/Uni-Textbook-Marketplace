import { EntityManager } from 'typeorm';
import { Module } from '../entities/module.entity';
import { University } from '../entities/university.entity';

export async function seedModules(manager: EntityManager) {
  const moduleRepository = manager.getRepository(Module);
  const universityRepository = manager.getRepository(University);

  const university = await universityRepository.findOne({
    where: { name: 'University of Pretoria' },
  });

  if (!university) {
    throw new Error('University of Pretoria not found');
  }

  const modulesData = [
    { code: 'COS132', name: 'Imperative Programming', semester: 1 },
    { code: 'COS151', name: 'Introduction to Computer Science', semester: 1 },
    { code: 'COS212', name: 'Data Structures and Algorithms', semester: 1 },
    { code: 'COS214', name: 'Software Modelling', semester: 1 },
    { code: 'COS216', name: 'Netcentric Computer Systems', semester: 1 },
    { code: 'COS284', name: 'Computer Organisation and Architecture', semester: 2 },
    { code: 'WTW114', name: 'Calculus', semester: 1 },
    { code: 'WTW124', name: 'Mathematics', semester: 2 },
    { code: 'STK110', name: 'Statistics', semester: 1 },
    { code: 'INF214', name: 'Informatics', semester: 2 },
  ];

  const faculty = 'Engineering, Built Environment and IT';
  const scienceFaculty = 'Natural and Agricultural Sciences';

  const modules = modulesData.map(data => 
    moduleRepository.create({
      ...data,
      faculty: data.code.startsWith('WTW') || data.code === 'STK110' 
        ? scienceFaculty 
        : faculty,
      university,
    })
  );

  await moduleRepository.save(modules);
  console.log(`${modules.length} modules seeded`);
}