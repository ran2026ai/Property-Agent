import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const whatsappNumber = searchParams.get('whatsappNumber');

    if (!propertyId || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Property ID and WhatsApp number are required' },
        { status: 400 }
      );
    }

    // Clean the WhatsApp number
    const cleanedWhatsApp = whatsappNumber.replace(/\s/g, '');

    // Find the property to get the dealerId
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        dealer: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Find the user by WhatsApp number
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: cleanedWhatsApp },
    });

    if (!user) {
      // If the user doesn't exist, there can't be an access request
      return NextResponse.json({ status: null }, { status: 200 });
    }

    // Find the access request for this user, dealer, and property
    const accessRequest = await prisma.accessRequest.findFirst({
      where: {
        userId: user.id,
        dealerId: property.dealerId,
        propertyId: propertyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!accessRequest) {
      return NextResponse.json({ status: null }, { status: 200 });
    }

    return NextResponse.json({ status: accessRequest.status }, { status: 200 });
  } catch (error) {
    console.error('Error checking access request status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}