import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        dealer: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
            dealerProfile: {
              select: {
                businessName: true,
                city: true,
                area: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {
      dealerId,
      type,
      category,
      sizeSqft,
      address,
      areaLocality,
      city,
      state,
      googleMapsLink,
      approximateValue,
      landClassification,
      photos,
      description,
      status,
    } = await request.json();

    // Validate required fields
    if (!dealerId || !type || !category || sizeSqft === undefined || !address || !city || !state || !googleMapsLink || approximateValue === undefined || !landClassification) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dealer exists and is a dealer
    const dealer = await prisma.user.findUnique({
      where: { id: dealerId },
    });

    if (!dealer || dealer.role !== 'DEALER') {
      return NextResponse.json(
        { error: 'Invalid dealer' },
        { status: 400 }
      );
    }

    // Validate photos array length (max 5)
    if (photos && photos.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 photos allowed' },
        { status: 400 }
      );
    }

    // Check if the property exists and belongs to the dealer
    const existingProperty = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (existingProperty.dealerId !== dealerId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this property' },
        { status: 403 }
      );
    }

    // Update the property
    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        dealerId,
        type,
        category,
        sizeSqft,
        address,
        areaLocality: areaLocality || null,
        city,
        state,
        googleMapsLink,
        approximateValue,
        landClassification,
        photos: photos || [],
        description: description || null,
        status: status || undefined,
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // We'll need to authenticate the user to ensure they are the dealer who owns the property.
    // For now, we'll assume the dealerId is passed in the request headers or body.
    // We'll get the dealerId from the request headers (for simplicity, we'll use a custom header).
    // In a real app, we would use session or JWT.
    const dealerId = request.headers.get('x-dealer-id');

    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }

    // Check if the property exists and belongs to the dealer
    const existingProperty = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (existingProperty.dealerId !== dealerId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this property' },
        { status: 403 }
      );
    }

    // Delete the property
    await prisma.property.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}