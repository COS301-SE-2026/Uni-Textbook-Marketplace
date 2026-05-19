import { EntityManager } from 'typeorm/entity-manager/EntityManager.js';

import { University } from '../entities/university.entity';

export async function seedUniversities(manager: EntityManager) {
  const universityRepository = manager.getRepository(University);

  const universities = [
    universityRepository.create({
      name: 'University of Pretoria',
      email_domain: 'tuks.co.za',
    }),

    universityRepository.create({
      name: 'University of Cape Town',
      email_domain: 'uct.ac.za',
    }),

    universityRepository.create({
      name: 'University of the Witwatersrand',
      email_domain: 'wits.ac.za',
    }),
  ];

  await universityRepository.save(universities);

  console.log('Universities seeded');
}
