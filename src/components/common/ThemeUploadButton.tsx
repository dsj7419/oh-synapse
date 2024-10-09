import React, { useState } from 'react';
import { generateUploadButton } from "@uploadthing/react";
import { useThemeContext } from '@/context/ThemeContext';
import type { OurFileRouter } from "@/server/uploadthing";

const GeneratedUploadButton = generateUploadButton<OurFileRouter>();

interface ThemedUploadButtonProps {
  endpoint: keyof OurFileRouter;
  onClientUploadComplete?: (res: any) => void;
  onUploadError?: (error: Error) => void;
  onUploadBegin?: (fileName: string) => void;
}

const ThemedUploadButton: React.FC<ThemedUploadButtonProps> = ({
  endpoint,
  onClientUploadComplete,
  onUploadError,
  onUploadBegin,
}) => {
  const { theme } = useThemeContext();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClientUploadComplete = (res: any) => {
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
    onClientUploadComplete?.(res);
  };

  return (
    <GeneratedUploadButton
      endpoint={endpoint}
      onClientUploadComplete={handleClientUploadComplete}
      onUploadError={onUploadError}
      onUploadBegin={onUploadBegin}
      appearance={{
        button: ({ ready, isUploading }) => ({
          backgroundColor: isSuccess ? `var(--${theme.accentColor}-5)` : `var(--${theme.accentColor}-9)`,
          color: isSuccess ? `var(--${theme.accentColor}-11)` : 'var(--color-background)',
          borderRadius: `var(--radius-${theme.radius})`,
          padding: '0.5rem 1rem',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          opacity: ready ? 1 : 0.5,
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transform: isSuccess ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isSuccess ? '0 0 0 2px var(--color-background), 0 0 0 4px var(--${theme.accentColor}-7)' : 'none',
        }),
        allowedContent: {
          color: `var(--gray-11)`,
          fontSize: '0.875rem',
        },
      }}
      content={{
        button: ({ ready }) => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isSuccess ? (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ marginRight: '0.5rem' }}
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Uploaded!
              </>
            ) : (
              ready ? 'Upload file' : 'Preparing...'
            )}
          </div>
        ),
      }}
    />
  );
};

export default ThemedUploadButton;