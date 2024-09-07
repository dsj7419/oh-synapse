import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from "@/server/db";
import { getAuthSession } from "@/server/auth";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  
  if (!session?.user?.roles?.includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email } = await req.json() as { email: string };
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const adminUser = await db.user.create({
      data: {
        email: email,
        roles: {
          create: [
            {
              role: {
                connect: {
                  name: 'admin'
                }
              }
            }
          ]
        },        
      },
    });

    return NextResponse.json({ message: 'Admin user created', user: adminUser });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
}