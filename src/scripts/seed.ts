import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as bcrypt from 'bcrypt';
import { getConnection } from 'typeorm';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const connection = getConnection();

  // Clear tables
  await connection.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

  const userRepository = connection.getRepository('User');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = userRepository.create({
    name: 'Admin UniMarket',
    email: 'admin@unimarket.edu',
    password: adminPassword,
    role: 'admin',
    notificationsEnabled: true,
    totalRating: 5.0,
    ratingCount: 0,
  });
  await userRepository.save(admin);

  // Create student users
  const studentPasswords = {};
  const students = [];

  const studentData = [
    { name: 'Maria Garcia', email: 'maria.garcia@universidad.edu' },
    { name: 'Juan Perez', email: 'juan.perez@universidad.edu' },
    { name: 'Carlos Lopez', email: 'carlos.lopez@universidad.edu' },
    { name: 'Sofia Martinez', email: 'sofia.martinez@universidad.edu' },
    { name: 'Roberto Gomez', email: 'roberto.gomez@universidad.edu' },
    { name: 'Ana Maria', email: 'ana.maria@universidad.edu' },
    { name: 'Felipe L.', email: 'felipe.l@universidad.edu' },
    { name: 'Alex Estudiante', email: 'alex@universidad.edu' },
  ];

  for (const data of studentData) {
    const password = await bcrypt.hash('student123', 10);
    studentPasswords[data.email] = password;

    const student = userRepository.create({
      ...data,
      password,
      role: 'student',
      notificationsEnabled: true,
      interests: ['Libros', 'Tecnología', 'Muebles'],
      totalRating: Math.random() * 5,
      ratingCount: Math.floor(Math.random() * 20),
    });
    students.push(student);
  }

  await userRepository.save(students);

  console.log('Database seeded successfully!');
  console.log('\nTest Credentials:');
  console.log('Admin: admin@unimarket.edu / admin123');
  console.log('Student: maria.garcia@universidad.edu / student123');

  await app.close();
}

seed().catch(console.error);
