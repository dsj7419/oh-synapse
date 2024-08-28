import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const adminUser = await db.user.create({
      data: {
        email: email,
        role: 'admin',
        // Note: You might want to generate a temporary password or use email verification
      },
    });

    return NextResponse.json({ message: 'Admin user created', user: adminUser });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
}