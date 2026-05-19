import { AppDataSource } from '../../data-source';

import { Module } from '../entities/module.entity';
import { University } from '../entities/university.entity';

export async function seedModules() {
  const moduleRepository = AppDataSource.getRepository(Module);

  const universityRepository = AppDataSource.getRepository(University);

  const university = await universityRepository.findOne({
    where: {
      name: 'University of Pretoria',
    },
  });

  if (!university) {
    throw new Error('University of Pretoria not found');
  }

  const modules = [
    moduleRepository.create({
      code: 'COS132',
      name: 'Imperative Programming',
      faculty: 'Engineering, Built Environment and IT',
      semester: 1,
      university,
    }),

    moduleRepository.create({
      code: 'COS151',
      name: 'Introduction to Computer Science',
      faculty: 'Engineering, Built Environment and IT',
      semester: 1,
      university,
    }),

    moduleRepository.create({
      code: 'COS212',
      name: 'Data Structures and Algorithms',
      faculty: 'Engineering, Built Environment and IT',
      semester: 1,
      university,
    }),

    moduleRepository.create({
      code: 'COS214',
      name: 'Software Modelling',
      faculty: 'Engineering, Built Environment and IT',
      semester: 1,
      university,
    }),

    moduleRepository.create({
      code: 'COS216',
      name: 'Netcentric Computer Systems',
      faculty: 'Engineering, Built Environment and IT',
      semester: 1,
      university,
    }),

    moduleRepository.create({
      code: 'COS284',
      name: 'Computer Organisation and Architecture',
      faculty: 'Engineering, Built Environment and IT',
      semester: 2,
      university,
    }),

    moduleRepository.create({
      code: 'WTW114',
      name: 'Calculus',
      faculty: 'Natural and Agricultural Sciences',
      semester: 1,
      university,
    }),

    moduleRepository.create({
      code: 'WTW124',
      name: 'Mathematics',
      faculty: 'Natural and Agricultural Sciences',
      semester: 2,
      university,
    }),

    moduleRepository.create({
      code: 'STK110',
      name: 'Statistics',
      faculty: 'Natural and Agricultural Sciences',
      semester: 1,
      university,
    }),

    moduleRepository.create({
      code: 'INF214',
      name: 'Informatics',
      faculty: 'Engineering, Built Environment and IT',
      semester: 2,
      university,
    }),
  ];

  await moduleRepository.save(modules);

  console.log('10 modules seeded');
}
