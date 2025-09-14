import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚨 Seeding database with vulnerable data...');

  // Create vulnerable users with plain text passwords
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@vulnerable-app.com',
      password: 'admin123', // Plain text password - VULNERABLE!
      role: 'admin',
      isAdmin: true,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: 'password123', // Plain text password - VULNERABLE!
      role: 'user',
      isAdmin: false,
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'test@test.com',
      password: 'test', // Very weak password - VULNERABLE!
      role: 'user',
      isAdmin: false,
    },
  });

  // Create vulnerable notes with XSS payloads
  await prisma.note.create({
    data: {
      title: 'Welcome Note',
      content: 'Welcome to the vulnerable notes app! This is a test note.',
      ownerId: adminUser.id,
      isPublic: true,
    },
  });

  await prisma.note.create({
    data: {
      title: '<script>alert("XSS in title!")</script>',
      content: 'This note demonstrates XSS vulnerability in the title.',
      ownerId: adminUser.id,
      isPublic: false,
    },
  });

  await prisma.note.create({
    data: {
      title: 'XSS Test Note',
      content: '<img src="x" onerror="alert(\'XSS in content!\')" />This note has XSS in content.',
      ownerId: regularUser.id,
      isPublic: false,
    },
  });

  await prisma.note.create({
    data: {
      title: 'Private Admin Note',
      content: 'This is a private admin note with sensitive information: API_KEY=secret123, DB_PASSWORD=admin_pass',
      ownerId: adminUser.id,
      isPublic: false,
    },
  });

  await prisma.note.create({
    data: {
      title: 'User Note',
      content: 'This is a regular user note. Nothing special here.',
      ownerId: regularUser.id,
      isPublic: true,
    },
  });

  // Create fake sessions for demonstration
  await prisma.userSession.create({
    data: {
      userId: adminUser.id,
      token: 'fake-admin-token-123',
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  await prisma.userSession.create({
    data: {
      userId: regularUser.id,
      token: 'fake-user-token-456',
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Database seeded with vulnerable data!');
  console.log('🚨 Created users:');
  console.log('   Admin: admin@vulnerable-app.com / admin123');
  console.log('   User: user@example.com / password123');
  console.log('   Test: test@test.com / test');
  console.log('🚨 Created notes with XSS payloads and sensitive data');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
