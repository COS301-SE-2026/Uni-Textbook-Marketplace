import { EntityManager } from 'typeorm';
import { User } from '../entities/users.entity';
import bcrypt from 'bcryptjs';

export async function seedStudents(manager: EntityManager) {
  const userRepository = manager.getRepository(User);
  const hashedPassword = await bcrypt.hash('Password123', 10);

  const studentsData = [
    { email: 'student1@tuks.co.za', firstName: 'John', lastName: 'Doe', faculty: 'Engineering' },
    { email: 'student2@tuks.co.za', firstName: 'Sarah', lastName: 'Smith', faculty: 'Health Sciences' },
    { email: 'student3@tuks.co.za', firstName: 'Mike', lastName: 'Johnson', faculty: 'Law' },
    { email: 'student4@tuks.co.za', firstName: 'Emma', lastName: 'Brown', faculty: 'Commerce' },
    { email: 'student5@tuks.co.za', firstName: 'David', lastName: 'Wilson', faculty: 'Natural Sciences' },
  ];

  const students = studentsData.map(data =>
    userRepository.create({
      email: data.email,
      password_hash: hashedPassword,
      first_name: data.firstName,
      last_name: data.lastName,
      faculty: data.faculty,
      is_verified: true,
      role: 'student',
    })
  );

  await userRepository.save(students);
  console.log(`${students.length} students seeded`);
}