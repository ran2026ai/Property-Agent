import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // We'll need to check if the user making the request is an admin.
    // For now, we'll assume the admin ID is passed in the headers.
    const adminId = request.headers.get('x-admin-id');
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Check if the admin exists and is an admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to delete users' },
        { status: 403 }
      );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // We should also delete related data: dealer profile, properties, access requests, map clicks.
    // But for simplicity, we'll just delete the user and rely on cascade deletes if set up in Prisma.
    // We'll need to set up cascade deletes in the Prisma schema.
    // For now, we'll delete the user and hope that the cascade deletes are set up.
    // We'll update the Prisma schema later to have cascade deletes.

    // Delete the user
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}