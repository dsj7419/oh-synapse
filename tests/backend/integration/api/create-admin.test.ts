/**
 * @jest-environment node
 */

// Remove the mocking of 'next/server' altogether

// Mock other modules
jest.mock("@/server/auth", () => ({
    getAuthSession: jest.fn(),
  }));
  
  jest.mock("@/services/admin/AdminService", () => ({
    AdminService: {
      createAdminUser: jest.fn(),
    },
  }));
  
  // Now import the modules that use the mocks
  import type { NextRequest } from 'next/server';
  import { POST } from '@/server/api/create-admin/route';
  import { getAuthSession } from "@/server/auth";
  import { AdminService } from "@/services/admin/AdminService";
  import type { User } from "@prisma/client";
  
  const mockNextRequest = (
    url: string,
    options?: { method?: string; body?: string }
  ): Partial<NextRequest> & { json: () => Promise<{ email?: string }> } => ({
    url,
    method: options?.method ?? 'GET',
    json: async () => (options?.body ? JSON.parse(options.body) as { email?: string } : {}),
  });
  
  describe('POST /api/create-admin', () => {
    let consoleErrorSpy: jest.SpyInstance;
  
    const mockAdminSession = {
      user: {
        id: 'admin-user-id',
        roles: ['admin'],
      },
    };
  
    const mockNonAdminSession = {
      user: {
        id: 'non-admin-user-id',
        roles: ['user'],
      },
    };
  
    beforeEach(() => {
      jest.resetAllMocks();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { /* empty */ });
    });
  
    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });
  
    it('should create an admin user successfully', async () => {
      const mockUser: User = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        banned: false,
      };
  
      (getAuthSession as jest.Mock).mockResolvedValue(mockAdminSession);
      const createAdminUserSpy = jest.spyOn(AdminService, 'createAdminUser').mockResolvedValue(mockUser);
  
      const req = mockNextRequest('http://localhost/api/create-admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com' }),
      });
      const response = await POST(req as NextRequest);
      const responseBody = await response.json() as { message: string; user: User };
  
      expect(response.status).toBe(200);
      expect(responseBody.message).toBe('Admin user created');
      // Adjust the mockUser to match the response format
      const expectedUser = {
        ...mockUser,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
      };
  
      expect(responseBody.user).toEqual(expectedUser);
      expect(createAdminUserSpy).toHaveBeenCalledWith('admin@example.com');
    });
  
    it('should return 401 if user is not an admin', async () => {
      (getAuthSession as jest.Mock).mockResolvedValue(mockNonAdminSession);
  
      const req = mockNextRequest('http://localhost/api/create-admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com' }),
      });
      const response = await POST(req as NextRequest);
      const responseBody = await response.json() as { error: string };
  
      expect(response.status).toBe(401);
      expect(responseBody).toEqual({ error: 'Unauthorized' });
    });
  
    it('should return 400 if email is not provided', async () => {
      (getAuthSession as jest.Mock).mockResolvedValue(mockAdminSession);
  
      // Mock the method to throw 'Email is required' when email is missing
      (AdminService.createAdminUser as jest.Mock).mockImplementation((email: string) => {
        if (!email) {
          throw new Error('Email is required');
        }
        // Return a mock user if needed
        return Promise.resolve({} as User);
      });
  
      const req = mockNextRequest('http://localhost/api/create-admin', {
        method: 'POST',
        body: JSON.stringify({}), // No email provided
      });
      const response = await POST(req as NextRequest);
      const responseBody = await response.json() as { error: string };
  
      expect(response.status).toBe(400);
      expect(responseBody).toEqual({ error: 'Email is required' });
    });
  
    it('should return 500 if an unexpected error occurs', async () => {
      (getAuthSession as jest.Mock).mockResolvedValue(mockAdminSession);
      (AdminService.createAdminUser as jest.Mock).mockRejectedValue(new Error('Unexpected error'));
  
      const req = mockNextRequest('http://localhost/api/create-admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com' }),
      });
      const response = await POST(req as NextRequest);
      const responseBody = await response.json() as { error: string };
  
      expect(response.status).toBe(500);
      expect(responseBody).toEqual({ error: 'Failed to create admin user' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating admin user:', expect.any(Error));
    });
  });
  