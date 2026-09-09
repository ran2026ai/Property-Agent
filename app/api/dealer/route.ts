import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from '@/lib/rateLimit';

const dealerSignupLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 100, // Max 100 signups per hour
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  const limitRes = await dealerSignupLimiter.check(ip, 3); // 3 signups per hour per IP
  if (!limitRes.success) {
    return NextResponse.json(
      { error: 'Too many signup attempts, please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { name, whatsappNumber, businessName, city, area } = await request.json();

    if (!name || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Name and WhatsApp number are required' },
        { status: 400 }
      );
    }

    const cleaned = whatsappNumber.replace(/\s/g, '');
    if (!/^\+?\d{10,15}$/.test(cleaned)) {
      return NextResponse.json(
        { error: 'Please enter a valid WhatsApp number' },
        { status: 400 }
      );
    }

    // Check if a user with this WhatsApp number already exists
    const existingUser = await prisma.user.findUnique({
      where: { whatsappNumber: cleaned },
    });

    if (existingUser) {
      // If the user exists and is already a dealer, return an error.
      // If the user exists but is not a dealer, we can upgrade them to dealer?
      // For simplicity, we'll not allow duplicate WhatsApp numbers.
      return NextResponse.json(
        { error: 'A user with this WhatsApp number already exists' },
        { status: 400 }
      );
    }

    // Create the user with role DEALER
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name,
        whatsappNumber: cleaned,
        role: 'DEALER',
      },
    });

    // Create the dealer profile
    await prisma.dealerProfile.create({
      data: {
        userId: user.id,
        businessName: businessName || null,
        city: city || null,
        area: area || null,
        profilePhotoUrl: null,
      },
    });

    // Return the created user (without sensitive data)
    const { whatsappNumber: _, ...userWithoutWhatsapp } = user;
    return NextResponse.json(userWithoutWhatsapp, { status: 201 });
  } catch (error) {
    console.error('Error creating dealer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}