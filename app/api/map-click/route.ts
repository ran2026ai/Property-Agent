import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { propertyId, userId } = await request.json();

    if (!propertyId || !userId) {
      return NextResponse.json(
        { error: 'Property ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if the property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the user has an authorized access request for this property's dealer
    const accessRequest = await prisma.accessRequest.findFirst({
      where: {
        userId,
        dealerId: property.dealerId,
        propertyId: propertyId, // We can check for the specific property or any property of the dealer? We'll check for the specific property.
        status: 'AUTHORIZED',
      },
    });

    if (!accessRequest) {
      return NextResponse.json(
        { error: 'User does not have authorized access to this property' },
        { status: 403 }
      );
    }

    // Create the map click event
    const mapClick = await prisma.mapClickEvent.create({
      data: {
        id: uuidv4(),
        propertyId,
        userId,
      },
    });

    return NextResponse.json(mapClick, { status: 201 });
  } catch (error) {
    console.error('Error logging map click:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}