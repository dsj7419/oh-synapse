const mockPrismaClient = {
  auditLog: {
    create: jest.fn().mockResolvedValue({}),
  },
  // Add other models and methods as needed
};

export const PrismaClient = jest.fn(() => mockPrismaClient);