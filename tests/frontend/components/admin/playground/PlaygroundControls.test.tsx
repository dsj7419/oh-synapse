import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PlaygroundControls } from '@/components/admin/playground/PlaygroundControls';
import { useThemeContext } from '@/context/ThemeContext';
import { api } from '@/trpc/react';

jest.mock('@/context/ThemeContext', () => ({
  useThemeContext: jest.fn(),
}));

jest.mock('@/trpc/react', () => ({
  api: {
    playground: {
      saveTheme: {
        useMutation: jest.fn(),
      },
    },
  },
}));

const mockComponents = ['ColorPicker', 'FontPicker', 'LayoutPicker', 'RadiusPicker', 'ScalingPicker', 'AppearancePicker', 'PanelBackgroundPicker', 'ThemeSelector'];

describe('PlaygroundControls', () => {
  const mockTheme = {
    name: 'Test Theme',
    appearance: 'light',
    accentColor: 'blue',
    grayColor: 'slate',
    radius: 'medium',
    scaling: '100%',
  };

  const mockUpdateTheme = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeContext as jest.Mock).mockReturnValue({
      theme: mockTheme,
      updateTheme: mockUpdateTheme,
    });
  });

  it('renders correctly', () => {
    (api.playground.saveTheme.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    render(<PlaygroundControls />);
    expect(screen.getByText('Customize Theme')).toBeInTheDocument();
    mockComponents.forEach(component => {
      expect(screen.getByText(component)).toBeInTheDocument();
    });
    expect(screen.getByText('Save Theme')).toBeInTheDocument();
  });

  it('calls saveTheme mutation when save button is clicked', () => {
    (api.playground.saveTheme.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    render(<PlaygroundControls />);
    const saveButton = screen.getByText('Save Theme');
    fireEvent.click(saveButton);
    expect(mockMutate).toHaveBeenCalledWith({ theme: mockTheme });
  });

  it('displays success message when theme is saved', async () => {
    const mockUseMutation = jest.fn();
    let onSuccessCallback: () => void = () => {};
    mockUseMutation.mockReturnValue({
      mutate: jest.fn().mockImplementation(() => {
        setTimeout(() => {
          act(() => {
            onSuccessCallback();
          });
        }, 0);
      }),
      isPending: false,
      onSuccess: (callback: () => void) => {
        onSuccessCallback = callback;
      },
    });
    (api.playground.saveTheme.useMutation as jest.Mock).mockImplementation(mockUseMutation);

    render(<PlaygroundControls />);
    const saveButton = screen.getByText('Save Theme');
    fireEvent.click(saveButton);

    await waitFor(() => {
        expect(screen.findByText('Theme saved successfully!', {}, { timeout: 5000 })).resolves.toBeInTheDocument();
      });
    }, 10000);

  it('displays error message when theme save fails', async () => {
    const errorMessage = 'Failed to save theme';
    const mockUseMutation = jest.fn();
    let onErrorCallback: (error: Error) => void = () => {};
    mockUseMutation.mockReturnValue({
      mutate: jest.fn().mockImplementation(() => {
        setTimeout(() => {
          act(() => {
            onErrorCallback(new Error(errorMessage));
          });
        }, 0);
      }),
      isPending: false,
      onError: (callback: (error: Error) => void) => {
        onErrorCallback = callback;
      },
    });
    (api.playground.saveTheme.useMutation as jest.Mock).mockImplementation(mockUseMutation);

    render(<PlaygroundControls />);
    const saveButton = screen.getByText('Save Theme');
    fireEvent.click(saveButton);

    await waitFor(() => {
        expect(screen.findByText(`Error saving theme: ${errorMessage}`, {}, { timeout: 5000 })).resolves.toBeInTheDocument();
      });
    }, 10000);
});