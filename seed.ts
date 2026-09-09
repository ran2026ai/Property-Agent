import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.mapClickEvent.deleteMany();
  await prisma.accessRequest.deleteMany();
  await prisma.property.deleteMany();
  await prisma.dealerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create sample users: dealers, regular users, and an admin
  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Admin User',
      whatsappNumber: '+1234567890',
      role: 'ADMIN',
    },
  });

  const dealer1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'John Doe',
      whatsappNumber: '+19876543210',
      role: 'DEALER',
    },
  });

  const dealer2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Jane Smith',
      whatsappNumber: '+19123456789',
      role: 'DEALER',
    },
  });

  const regularUser1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Regular User One',
      whatsappNumber: '+11223344550',
      role: 'REGULAR',
    },
  });

  const regularUser2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Regular User Two',
      whatsappNumber: '+11223344551',
      role: 'REGULAR',
    },
  });

  console.log('Created sample users');

  // Create dealer profiles
  await prisma.dealerProfile.create({
    data: {
      userId: dealer1.id,
      businessName: 'John Doe Realty',
      city: 'New York',
      area: 'Manhattan',
      profilePhotoUrl: null,
    },
  });

  await prisma.dealerProfile.create({
    data: {
      userId: dealer2.id,
      businessName: 'Jane Smith Properties',
      city: 'Los Angeles',
      area: 'Hollywood',
      profilePhotoUrl: null,
    },
  });

  console.log('Created dealer profiles');

  // Create sample properties for dealer1
  const property1 = await prisma.property.create({
    data: {
      id: uuidv4(),
      dealerId: dealer1.id,
      type: 'SELL',
      category: 'RESIDENTIAL',
      sizeSqft: 1200,
      address: '123 Main St, New York, NY 10001',
      areaLocality: 'Midtown',
      city: 'New York',
      state: 'NY',
      googleMapsLink: 'https://maps.google.com/?q=123+Main+St,+New+York,+NY+10001',
      approximateValue: 500000,
      landClassification: 'GENERAL',
      photos: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
      ],
      description: 'A beautiful apartment in the heart of Manhattan.',
      status: 'ACTIVE',
    },
  });

  const property2 = await prisma.property.create({
    data: {
      id: uuidv4(),
      dealerId: dealer1.id,
      type: 'RENT',
      category: 'RESIDENTIAL',
      sizeSqft: 800,
      address: '456 Oak Ave, New York, NY 10002',
      areaLocality: 'Downtown',
      city: 'New York',
      state: 'NY',
      googleMapsLink: 'https://maps.google.com/?q=456+Oak+Ave,+New+York,+NY+10002',
      approximateValue: 2500, // Monthly rent
      landClassification: 'GENERAL',
      photos: [
        'https://example.com/photo3.jpg',
      ],
      description: 'A cozy studio apartment near the subway.',
      status: 'ACTIVE',
    },
  });

  // Create sample properties for dealer2
  const property3 = await prisma.property.create({
    data: {
      id: uuidv4(),
      dealerId: dealer2.id,
      type: 'SELL',
      category: 'COMMERCIAL',
      sizeSqft: 2500,
      address: '789 Sunset Blvd, Los Angeles, CA 90028',
      areaLocality: 'Hollywood',
      city: 'Los Angeles',
      state: 'CA',
      googleMapsLink: 'https://maps.google.com/?q=789+Sunset+Blvd,+Los+Angeles,+CA+90028',
      approximateValue: 1200000,
      landClassification: 'GENERAL',
      photos: [
        'https://example.com/photo4.jpg',
        'https://example.com/photo5.jpg',
        'https://example.com/photo6.jpg',
      ],
      description: 'A commercial space ideal for retail or office.',
      status: 'ACTIVE',
    },
  });

  const property4 = await prisma.property.create({
    data: {
      id: uuidv4(),
      dealerId: dealer2.id,
      type: 'SELL',
      category: 'PLOT',
      sizeSqft: 5000,
      address: '321 Pine Rd, Los Angeles, CA 90029',
      areaLocality: 'Santa Monica',
      city: 'Los Angeles',
      state: 'CA',
      googleMapsLink: 'https://maps.google.com/?q=321+Pine+Rd,+Los+Angeles,+CA+90029',
      approximateValue: 800000,
      landClassification: 'GENERAL',
      photos: [],
      description: 'A vacant lot ready for development.',
      status: 'ACTIVE',
    },
  });

  console.log('Created sample properties');

  // Create sample access requests
  await prisma.accessRequest.create({
    data: {
      id: uuidv4(),
      userId: regularUser1.id,
      dealerId: dealer1.id,
      propertyId: property1.id,
      status: 'PENDING',
    },
  });

  await prisma.accessRequest.create({
    data: {
      id: uuidv4(),
      userId: regularUser2.id,
      dealerId: dealer1.id,
      propertyId: property2.id,
      status: 'PENDING',
    },
  });

  await prisma.accessRequest.create({
    data: {
      id: uuidv4(),
      userId: regularUser1.id,
      dealerId: dealer2.id,
      propertyId: property3.id,
      status: 'AUTHORIZED',
    },
  });

  await prisma.accessRequest.create({
    data: {
      id: uuidv4(),
      userId: regularUser2.id,
      dealerId: dealer2.id,
      propertyId: property4.id,
      status: 'DECLINED',
    },
  });

  console.log('Created sample access requests');

  // Create sample map click events
  await prisma.mapClickEvent.create({
    data: {
      id: uuidv4(),
      userId: regularUser1.id,
      propertyId: property3.id,
    },
  });

  await prisma.mapClickEvent.create({
    data: {
      id: uuidv4(),
      userId: regularUser2.id,
      propertyId: property3.id,
    },
  });

  console.log('Created sample map click events');

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });