import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
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
    } = await request.json();

    // Validate required fields
    if (!dealerId || !type || !category || sizeSqft === undefined || !address || !city || !state || !googleMapsLink || approximateValue === undefined || !landClassification) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dealer exists
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

    // Create the property
    const property = await prisma.property.create({
      data: {
        id: uuidv4(),
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
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minSize = searchParams.get('minSize');
    const maxSize = searchParams.get('maxSize');
    const landClassification = searchParams.get('landClassification');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};

    if (dealerId) {
      where.dealerId = dealerId;
    }

    if (city) {
      where.city = city;
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.approximateValue = {
        gte: parseFloat(minPrice),
        lte: parseFloat(maxPrice),
      };
    } else if (minPrice !== undefined) {
      where.approximateValue = {
        gte: parseFloat(minPrice),
      };
    } else if (maxPrice !== undefined) {
      where.approximateValue = {
        lte: parseFloat(maxPrice),
      };
    }

    if (minSize !== undefined && maxSize !== undefined) {
      where.sizeSqft = {
        gte: parseInt(minSize),
        lte: parseInt(maxSize),
      };
    } else if (minSize !== undefined) {
      where.sizeSqft = {
        gte: parseInt(minSize),
      };
    } else if (maxSize !== undefined) {
      where.sizeSqft = {
        lte: parseInt(maxSize),
      };
    }

    if (landClassification) {
      where.landClassification = landClassification;
    }

    if (status) {
      where.status = status;
    }

    const properties = await prisma.property.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}