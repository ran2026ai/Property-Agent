import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessRequest = await prisma.accessRequest.findUnique({
      where: { id: params.id },
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
    });

    if (!accessRequest) {
      return NextResponse.json(
        { error: 'Access request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(accessRequest);
  } catch (error) {
    console.error('Error fetching access request:', error);
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
    const { status } = await request.json();

    if (!status || !['PENDING', 'AUTHORIZED', 'DECLINED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }

    // We'll need to check if the user making the request is the dealer associated with the access request.
    // For now, we'll assume the dealer ID is passed in the headers.
    const dealerId = request.headers.get('x-dealer-id');
    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }

    // Check if the access request exists and if the dealer ID matches
    const accessRequest = await prisma.accessRequest.findUnique({
      where: { id: params.id },
      include: {
        dealer: true,
      },
    });

    if (!accessRequest) {
      return NextResponse.json(
        { error: 'Access request not found' },
        { status: 404 }
      );
    }

    if (accessRequest.dealerId !== dealerId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this access request' },
        { status: 403 }
      );
    }

    // Update the access request
    const updatedRequest = await prisma.accessRequest.update({
      where: { id: params.id },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating access request:', error);
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
    // We'll need to check if the user making the request is the dealer associated with the access request.
    const dealerId = request.headers.get('x-dealer-id');
    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }

    // Check if the access request exists and if the dealer ID matches
    const accessRequest = await prisma.accessRequest.findUnique({
      where: { id: params.id },
      include: {
        dealer: true,
      },
    });

    if (!accessRequest) {
      return NextResponse.json(
        { error: 'Access request not found' },
        { status: 404 }
      );
    }

    if (accessRequest.dealerId !== dealerId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this access request' },
        { status: 403 }
      );
    }

    // Delete the access request
    await prisma.accessRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting access request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}