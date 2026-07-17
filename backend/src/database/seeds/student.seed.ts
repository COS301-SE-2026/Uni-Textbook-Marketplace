import { EntityManager } from 'typeorm';
import { User } from '../entities/users.entity';
import { Faculty } from '../entities/faculty.entity';
import bcrypt from 'bcryptjs';

export async function seedStudents(manager: EntityManager) {
  const userRepository = manager.getRepository(User);
  const facultyRepository = manager.getRepository(Faculty);
  const hashedPassword = await bcrypt.hash('Password123', 10);

  const faculties = await facultyRepository.find();

  const getFaculty = (name: string) => {
    const faculty = faculties.find((f) => f.name === name);
    if (!faculty) {
      throw new Error(
        `Faculty "${name}" not found. Make sure faculty.seed.ts runs first.`,
      );
    }
    return faculty;
  };

  const studentsData = [
    {
      email: 'student1@tuks.co.za',
      firstName: 'John',
      lastName: 'Doe',
      facultyName: 'Engineering, Built Environment and IT',
    },
    {
      email: 'student2@tuks.co.za',
      firstName: 'Sarah',
      lastName: 'Smith',
      facultyName: 'Health Sciences',
    },
    {
      email: 'student3@tuks.co.za',
      firstName: 'Mike',
      lastName: 'Johnson',
      facultyName: 'Law',
    },
    {
      email: 'student4@tuks.co.za',
      firstName: 'Emma',
      lastName: 'Brown',
      facultyName: 'Economic and Management Sciences',
    },
    {
      email: 'student5@tuks.co.za',
      firstName: 'David',
      lastName: 'Wilson',
      facultyName: 'Natural and Agricultural Sciences',
    },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of studentsData) {
    // Check if student already exists by email
    const existing = await userRepository.findOne({
      where: { email: data.email },
    });

    if (existing) {
      console.log(`Skipped (already exists): ${data.email}`);
      skippedCount++;
      continue;
    }

    const student = userRepository.create({
      email: data.email,
      password_hash: hashedPassword,
      first_name: data.firstName,
      last_name: data.lastName,
      faculty: getFaculty(data.facultyName),
      is_verified: true,
      role: 'student',
    });

    await userRepository.save(student);
    console.log(`Created: ${data.email}`);
    createdCount++;
  }

  console.log(
    `Students seeded: ${createdCount} created, ${skippedCount} skipped`,
  );
}
