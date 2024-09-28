const mockPrismaClient = {
  auditLog: {
    create: jest.fn().mockResolvedValue({}),
  },
};

export const PrismaClient = jest.fn(() => mockPrismaClient);