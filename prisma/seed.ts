import { PrismaClient } from '@prisma/client';
import { hash } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.leadPrivate.deleteMany();
  await prisma.leadPublic.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.leadType.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const marketerPassword = await hash('Marketer123!');
  const managerPassword = await hash('Manager123!');
  const adminPassword = await hash('Admin123!');

  const marketer = await prisma.user.create({
    data: {
      email: 'marketer@example.com',
      passwordHash: marketerPassword,
      role: 'MARKETER',
      balance: 0,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      passwordHash: managerPassword,
      role: 'MANAGER',
      balance: 5000,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      balance: 0,
    },
  });

  console.log('✓ Created users:', { marketer: marketer.id, manager: manager.id, admin: admin.id });

  // Create lead types
  const leadType1 = await prisma.leadType.create({
    data: {
      companyId: marketer.id,
      title: 'Premium Lead Type',
      description: 'High-quality leads for enterprise',
      basePrice: 100.0,
    },
  });

  const leadType2 = await prisma.leadType.create({
    data: {
      companyId: marketer.id,
      title: 'Standard Lead Type',
      description: 'Standard quality leads',
      basePrice: 50.0,
    },
  });

  console.log('✓ Created lead types:', {
    premium: leadType1.id,
    standard: leadType2.id,
  });

  console.log('✓ Database seeding completed!');
  console.log('\nTest credentials:');
  console.log('Marketer: marketer@example.com / Marketer123!');
  console.log('Manager: manager@example.com / Manager123!');
  console.log('Admin: admin@example.com / Admin123!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
