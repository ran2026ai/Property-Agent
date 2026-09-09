import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from '@/lib/rateLimit';

const accessRequestLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

// For GET requests (fetching access requests)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId'); // For admin to see requests made by a specific user
    const propertyId = searchParams.get('propertyId'); // To see requests for a specific property

    // Build where clause
    const where: any = {};

    if (dealerId) {
      where.dealerId = dealerId;
    }

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const accessRequests = await prisma.accessRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
          },
        },
        dealer: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
          },
        },
        property: {
          select: {
            id: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(accessRequests);
  } catch (error) {
    console.error('Error fetching access requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// For POST requests (creating a new access request)
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  const limitRes = await accessRequestLimiter.check(ip, 5);
  if (!limitRes.success) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { name, whatsappNumber, dealerId, propertyId } = await request.json();

    if (!name || !whatsappNumber || !dealerId) {
      return NextResponse.json(
        { error: 'Name, WhatsApp number, and dealerId are required' },
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

    // Find or create a user for the requester (role: REGULAR)
    let user = await prisma.user.findUnique({
      where: { whatsappNumber: cleaned },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uuidv4(),
          name,
          whatsappNumber: cleaned,
          role: 'REGULAR',
        },
      });
    } else {
      // Update the name if it has changed? Optional.
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Ensure the dealer exists
    const dealer = await prisma.user.findUnique({
      where: { id: dealerId },
    });

    if (!dealer) {
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      );
    }

    // Optionally, check if the property exists and belongs to the dealer
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property || property.dealerId !== dealerId) {
        return NextResponse.json(
          { error: 'Property not found or does not belong to the dealer' },
          { status: 400 }
        );
      }
    }

    // Check if there's already a pending request from this user to this dealer (for the same property or any)
    // We'll allow multiple requests (e.g., for different properties) but we can prevent duplicate pending requests for the same dealer and property.
    const existingRequest = await prisma.accessRequest.findFirst({
      where: {
        userId: user.id,
        dealerId,
        propertyId: propertyId ?? undefined,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json(existingRequest, { status: 200 });
    }

    const accessRequest = await prisma.accessRequest.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        dealerId,
        propertyId: propertyId ?? null,
        status: 'PENDING',
      },
    });

    return NextResponse.json(accessRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating access request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}