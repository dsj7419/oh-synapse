import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

jest.mock('@/context/ThemeContext', () => ({
  useThemeContext: jest.fn(),
}));

// Define mockComponents
const mockComponents = ['ColorPicker', 'FontPicker', 'LayoutPicker', 'RadiusPicker', 'ScalingPicker', 'AppearancePicker', 'PanelBackgroundPicker', 'ThemeSelector'];

// Mock ThemePluginArchitecture
jest.mock('@/components/admin/playground/ThemePluginArchitecture', () => ({
  themePlugins: mockComponents.map(name => ({ name, component: () => React.createElement('div', null, name) })),
  registerThemePlugin: jest.fn(),
}));

// Mock all theme plugin components
mockComponents.forEach(component => {
  jest.mock(`@/components/admin/playground/${component}`, () => ({
    __esModule: true,
    default: () => React.createElement('div', null, component),
  }));
});

jest.mock('@prisma/client', () => {
  const PrismaClient = jest.fn(() => ({
    auditLog: {
      create: jest.fn(),
    },
  }));
  return { PrismaClient };
});

jest.mock('@/utils/auditLogger', () => ({
  logAction: jest.fn(),
}));

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