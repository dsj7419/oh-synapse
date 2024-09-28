import { db } from "@/server/db";
import type { User } from "@prisma/client";

export class AdminService {
  static async createAdminUser(email: string): Promise<User> {
    if (!email) {
      throw new Error('Email is required');
    }
    return await db.user.create({
      data: {
        email: email,
        roles: {
          create: [
            { role: { connect: { name: 'admin' } } }
          ]
        },
      },
    });
  }
}