import { Repository } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { User } from '../entities/users.entity';
import bcrypt from 'bcrypt';

export async function seedStudents() {
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash('Password123', 10);

  const students = [
    userRepository.create({
      email: 'student1@tuks.co.za',
      password_hash: hashedPassword,
      first_name: 'John',
      last_name: 'Doe',
      faculty: 'Engineering',
      is_verified: true,
      role: 'student',
    }),

    userRepository.create({
      email: 'student2@tuks.co.za',
      password_hash: hashedPassword,
      first_name: 'Sarah',
      last_name: 'Smith',
      faculty: 'Health Sciences',
      is_verified: true,
      role: 'student',
    }),

    userRepository.create({
      email: 'student3@tuks.co.za',
      password_hash: hashedPassword,
      first_name: 'Mike',
      last_name: 'Johnson',
      faculty: 'Law',
      is_verified: true,
      role: 'student',
    }),

    userRepository.create({
      email: 'student4@tuks.co.za',
      password_hash: hashedPassword,
      first_name: 'Emma',
      last_name: 'Brown',
      faculty: 'Commerce',
      is_verified: true,
      role: 'student',
    }),

    userRepository.create({
      email: 'student5@tuks.co.za',
      password_hash: hashedPassword,
      first_name: 'David',
      last_name: 'Wilson',
      faculty: 'Natural Sciences',
      is_verified: true,
      role: 'student',
    }),
  ];

  await userRepository.save(students);

  console.log('5 students seeded');
}
