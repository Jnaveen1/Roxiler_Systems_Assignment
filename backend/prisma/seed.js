const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script...');

  // Clean existing data
  await prisma.rating.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing database data.');

  // Create hashed passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const ownerPassword = await bcrypt.hash('Owner@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  // 1. Create ADMIN
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Account',
      email: 'admin@storerating.com',
      password: adminPassword,
      address: '100 Corporate Headquarters Plaza, New York, NY 10001',
      role: 'ADMIN',
    },
  });
  console.log('Created Admin:', admin.email);

  // 2. Create STORE_OWNERs
  const owner1 = await prisma.user.create({
    data: {
      name: 'Store Owner Manager One',
      email: 'owner1@storerating.com',
      password: ownerPassword,
      address: '12 Executive Park Suite 400, San Jose, CA 95110',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Store Owner Manager Two',
      email: 'owner2@storerating.com',
      password: ownerPassword,
      address: '500 Commerce Street, Austin, TX 78701',
      role: 'STORE_OWNER',
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Store Owner Manager Three',
      email: 'owner3@storerating.com',
      password: ownerPassword,
      address: '77 Ocean Drive, Miami, FL 33139',
      role: 'STORE_OWNER',
    },
  });
  console.log('Created Store Owners.');

  // 3. Create NORMAL_USERs
  const user1 = await prisma.user.create({
    data: {
      name: 'Normal Customer User One',
      email: 'user1@storerating.com',
      password: userPassword,
      address: '42 Residential Elm Street, Chicago, IL 60601',
      role: 'NORMAL_USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Normal Customer User Two',
      email: 'user2@storerating.com',
      password: userPassword,
      address: '88 Maple Avenue Apartment 3B, Seattle, WA 98101',
      role: 'NORMAL_USER',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Normal Customer User Three',
      email: 'user3@storerating.com',
      password: userPassword,
      address: '150 Sunset Boulevard, Los Angeles, CA 90028',
      role: 'NORMAL_USER',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Normal Customer User Four',
      email: 'user4@storerating.com',
      password: userPassword,
      address: '303 Pine Ridge Road, Denver, CO 80202',
      role: 'NORMAL_USER',
    },
  });
  console.log('Created Normal Users.');

  // 4. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'TechWorld Electronics Hub',
      email: 'contact@techworld.com',
      address: '100 Innovation Way, Silicon Valley, CA 94025',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Gourmet Artisan Coffee & Bakery',
      email: 'hello@gourmetcoffee.com',
      address: '45 Market Street, Suite 12, San Francisco, CA 94105',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Urban Fitness & Wellness Gym',
      email: 'support@urbanfitness.com',
      address: '888 Health Boulevard, Austin, TX 78701',
      ownerId: owner3.id,
    },
  });
  console.log('Created Stores.');

  // 5. Create Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, value: 5 },
      { userId: user2.id, storeId: store1.id, value: 4 },
      { userId: user3.id, storeId: store1.id, value: 5 },
      { userId: user1.id, storeId: store2.id, value: 4 },
      { userId: user2.id, storeId: store2.id, value: 3 },
      { userId: user4.id, storeId: store2.id, value: 5 },
      { userId: user3.id, storeId: store3.id, value: 5 },
    ],
  });
  console.log('Created Ratings.');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
