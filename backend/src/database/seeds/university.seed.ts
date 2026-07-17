import { EntityManager } from 'typeorm/entity-manager/EntityManager.js';
import { University } from '../entities/university.entity';

export async function seedUniversities(manager: EntityManager) {
  const universityRepository = manager.getRepository(University);

  const universitiesData = [
    {
      name: 'University of Pretoria',
      email_domain: 'tuks.co.za',
    },
    {
      name: 'University of Cape Town',
      email_domain: 'uct.ac.za',
    },
    {
      name: 'University of the Witwatersrand',
      email_domain: 'wits.ac.za',
    },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of universitiesData) {
    // Check if university already exists by email_domain (unique constraint)
    const existing = await universityRepository.findOne({
      where: { email_domain: data.email_domain },
    });

    if (!existing) {
      const university = universityRepository.create(data);
      await universityRepository.save(university);
      console.log(`Created university: ${data.name} (${data.email_domain})`);
      createdCount++;
    } else {
      console.log(
        `Skipped (already exists): ${data.name} (${data.email_domain})`,
      );
      skippedCount++;
    }
  }

  console.log(
    `Universities seeded: ${createdCount} created, ${skippedCount} skipped`,
  );
}
