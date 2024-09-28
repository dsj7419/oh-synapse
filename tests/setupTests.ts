import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const PrismaClient = jest.fn(() => ({
    auditLog: {
      create: jest.fn(),
    },
  }));
  return { PrismaClient };
});

// Mock auditLogger
jest.mock('@/utils/auditLogger', () => ({
  logAction: jest.fn(),
}));

// Existing mocks...
jest.mock('@uploadthing/react', () => ({
  generateUploadButton: () => () => null,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@headlessui/react', () => ({
  Switch: ({ checked, onChange, children }: any) => (
    React.createElement('button', {
      role: "switch",
      'aria-checked': checked,
      onClick: () => onChange(!checked)
    }, children)
  ),
}));

// Suppress specific console errors
const originalError = console.error;
console.error = (...args: any[]) => {
  if (args.join(' ').includes('Not implemented: HTMLFormElement.prototype.requestSubmit')) {
    return;
  }
  originalError(...args);
};

if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function() {
    this.submit();
  };
}
