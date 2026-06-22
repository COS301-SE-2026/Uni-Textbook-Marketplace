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
    // Economic and Management Sciences
    {
      code: 'EMS001',
      name: 'Temporary Module - EMS',
      semester: 1,
      faculty: 'Economic and Management Sciences',
    },

    // Education
    {
      code: 'EDU001',
      name: 'Temporary Module - Education',
      semester: 1,
      faculty: 'Education',
    },

    // Engineering, Built Environment and IT
    {
      code: 'EBIT001',
      name: 'Temporary Module - EBIT',
      semester: 1,
      faculty: 'Engineering, Built Environment and IT',
    },

    // Health Sciences
    {
      code: 'HLS001',
      name: 'Temporary Module - Health Sciences',
      semester: 1,
      faculty: 'Health Sciences',
    },

    // Humanities
    {
      code: 'HUM001',
      name: 'Temporary Module - Humanities',
      semester: 1,
      faculty: 'Humanities',
    },

    // Law
    {
      code: 'LAW001',
      name: 'Temporary Module - Law',
      semester: 1,
      faculty: 'Law',
    },

    // Natural and Agricultural Sciences
    {
      code: 'NAS001',
      name: 'Temporary Module - Natural and Agricultural Sciences',
      semester: 1,
      faculty: 'Natural and Agricultural Sciences',
    },

    // Theology and Religion
    {
      code: 'THE001',
      name: 'Temporary Module - Theology and Religion',
      semester: 1,
      faculty: 'Theology and Religion',
    },

    // Veterinary Science
    {
      code: 'VET001',
      name: 'Temporary Module - Veterinary Science',
      semester: 1,
      faculty: 'Veterinary Science',
    },
  ];

  const modules = modulesData.map((data) =>
    moduleRepository.create({
      ...data,
      university,
    }),
  );

  await moduleRepository.save(modules);
  console.log(`${modules.length} modules seeded with all 9 faculties`);
}
