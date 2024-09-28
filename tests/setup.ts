import { TRPCError } from '@trpc/server';

jest.mock('superjson', () => ({
  default: {
    parse: jest.fn(x => x),
    stringify: jest.fn(x => x),
  },
}));

jest.mock('@trpc/server', () => ({
  ...jest.requireActual('@trpc/server'),
  initTRPC: {
    context: jest.fn().mockReturnValue({
      create: jest.fn().mockReturnValue({
        middleware: jest.fn(),
        router: jest.fn(),
        procedure: {
          input: jest.fn().mockReturnThis(),
          query: jest.fn(),
          mutation: jest.fn(),
        },
      }),
    }),
  },
}));

jest.mock('@/server/api/trpc', () => ({
  createTRPCContext: jest.fn().mockImplementation(async () => ({
    session: null,
    db: {},
  })),
}));

jest.mock('@/server/api/root', () => ({
  createCaller: jest.fn().mockReturnValue({
    recipe: {
      createOrUpdate: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      toggleFound: jest.fn(),
      delete: jest.fn(),
      markAsFound: jest.fn(),
    },
  }),
}));

declare global {
  var TRPCError: typeof import('@trpc/server').TRPCError;
}
global.TRPCError = TRPCError;