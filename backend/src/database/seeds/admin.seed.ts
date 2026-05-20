import { EntityManager } from 'typeorm';
import { User } from '../entities/users.entity';
import bcrypt from 'bcryptjs';

export async function seedAdmins(manager: EntityManager) {
  const userRepository = manager.getRepository(User);

  const hashedPassword = await bcrypt.hash('Admin123', 10);

  const admins = [
    userRepository.create({
      email: 'admin1@tuks.co.za',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      is_verified: true,
      role: 'admin',
    }),

    userRepository.create({
      email: 'admin2@tuks.co.za',
      password_hash: hashedPassword,
      first_name: 'Campus',
      last_name: 'Manager',
      is_verified: true,
      role: 'admin',
    }),
  ];

  await userRepository.save(admins);

  console.log('2 admins seeded');
}
