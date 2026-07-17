import { EntityManager } from 'typeorm';
import { User } from '../entities/users.entity';
import bcrypt from 'bcryptjs';

export async function seedAdmins(manager: EntityManager) {
  const userRepository = manager.getRepository(User);

  const hashedPassword = await bcrypt.hash('Admin123', 10);

  const adminsData = [
    {
      email: 'admin1@tuks.co.za',
      first_name: 'System',
      last_name: 'Administrator',
    },
    {
      email: 'admin2@tuks.co.za',
      first_name: 'Campus',
      last_name: 'Manager',
    },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of adminsData) {
    // Check if admin already exists by email
    const existing = await userRepository.findOne({
      where: { email: data.email },
    });

    if (existing) {
      console.log(`Skipped (already exists): ${data.email}`);
      skippedCount++;
      continue;
    }

    const admin = userRepository.create({
      email: data.email,
      password_hash: hashedPassword,
      first_name: data.first_name,
      last_name: data.last_name,
      is_verified: true,
      role: 'admin',
    });

    await userRepository.save(admin);
    console.log(`Created: ${data.email}`);
    createdCount++;
  }

  console.log(
    `Admins seeded: ${createdCount} created, ${skippedCount} skipped`,
  );
}
