// tests/unit/services/admin/AdminService.test.ts
import { AdminService } from '@/services/admin/AdminService';
import { db } from "@/server/db";

jest.mock("@/server/db", () => ({
  db: {
    user: {
      create: jest.fn(),
    },
  },
}));

describe('AdminService', () => {
  let createSpy: jest.SpyInstance;

  beforeEach(() => {
    createSpy = jest.spyOn(db.user, 'create');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an admin user successfully', async () => {
    const mockUser = { id: '1', email: 'admin@example.com' };
    createSpy.mockResolvedValue(mockUser);

    const result = await AdminService.createAdminUser('admin@example.com');

    expect(result).toEqual(mockUser);
    expect(createSpy).toHaveBeenCalledWith({
      data: {
        email: 'admin@example.com',
        roles: {
          create: [
            { role: { connect: { name: 'admin' } } }
          ]
        },
      },
    });
  });

  it('should throw an error if email is not provided', async () => {
    await expect(AdminService.createAdminUser('')).rejects.toThrow('Email is required');
  });
});