// src/database/seeds/faculty.seed.ts
import { EntityManager } from 'typeorm';
import { Faculty } from '../entities/faculty.entity';
import { University } from '../entities/university.entity';

export async function seedFaculties(manager: EntityManager) {
  const facultyRepository = manager.getRepository(Faculty);
  const universityRepository = manager.getRepository(University);

  const university = await universityRepository.findOne({
    where: { name: 'University of Pretoria' },
  });

  if (!university) {
    throw new Error('University of Pretoria not found');
  }

  const facultyData = [
    { name: 'Economic and Management Sciences' },
    { name: 'Education' },
    { name: 'Engineering, Built Environment and IT' },
    { name: 'Health Sciences' },
    { name: 'Humanities' },
    { name: 'Law' },
    { name: 'Natural and Agricultural Sciences' },
    { name: 'Theology and Religion' },
    { name: 'Veterinary Sciences' },
    { name: 'Gordon Institute of Business Science' },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of facultyData) {
    // Check if faculty already exists for this university
    const existing = await facultyRepository.findOne({
      where: {
        name: data.name,
        university: { id: university.id },
      },
    });

    if (existing) {
      console.log(`Skipped (already exists): ${data.name}`);
      skippedCount++;
      continue;
    }

    const faculty = facultyRepository.create({
      name: data.name,
      university: university,
    });

    await facultyRepository.save(faculty);
    console.log(`Created: ${data.name}`);
    createdCount++;
  }

  console.log(
    `Faculties seeded: ${createdCount} created, ${skippedCount} skipped for University of Pretoria`,
  );
}
