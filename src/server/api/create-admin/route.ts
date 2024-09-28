import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthSession } from "@/server/auth";
import { AdminService } from "@/services/admin/AdminService";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();

  if (!session?.user?.roles?.includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email } = await req.json() as { email: string };
    const adminUser = await AdminService.createAdminUser(email);
    return NextResponse.json({ message: 'Admin user created', user: adminUser });
  } catch (error) {
    console.error('Error creating admin user:', error);
    if (error instanceof Error && error.message === 'Email is required') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
}