import React from 'react';
import ThemedUploadButton from '@/components/common/ThemeUploadButton';
import Image from 'next/image';
import type { RecipeDetails } from '@/types/recipe';
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Flex, Text } from '@radix-ui/themes';

interface RecipeImageProps {
  recipe: RecipeDetails;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  setUploadStatus: (status: 'idle' | 'uploading' | 'success' | 'error') => void;
  setRecipe: React.Dispatch<React.SetStateAction<RecipeDetails>>;
  setError: (error: string | null) => void;
}

export const RecipeImage: React.FC<RecipeImageProps> = ({
  recipe,
  uploadStatus,
  setUploadStatus,
  setRecipe,
  setError,
}) => {
  const { theme } = useThemeContext();

  return (
    <Box>
      <Flex align="center" gap="2">
        <ThemedUploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            const uploadedFile = res?.[0];
            if (uploadedFile) {
              setRecipe((prev) => ({ ...prev, image: uploadedFile.url }));
              setUploadStatus('success');
              // Log upload success
            }
            setTimeout(() => setUploadStatus('idle'), 3000);
          }}
          onUploadError={(error: Error) => {
            console.error('Error uploading file:', error);
            setError(`Upload failed: ${error.message}`);
            setUploadStatus('error');
            // Log upload failure
            setTimeout(() => setUploadStatus('idle'), 3000);
          }}
          onUploadBegin={() => setUploadStatus('uploading')}
        />
        {uploadStatus === 'uploading' && <Text color="blue">Uploading...</Text>}
        {uploadStatus === 'success' && <Text color="green">Upload successful!</Text>}
        {uploadStatus === 'error' && <Text color="red">Upload failed</Text>}
      </Flex>
      {recipe.image && (
        <Box mt="4">
          <Image 
            src={recipe.image} 
            alt="Recipe" 
            width={128} 
            height={128} 
            style={{ 
              objectFit: 'cover', 
              borderRadius: `var(--radius-${theme.radius})` 
            }} 
          />
        </Box>
      )}
    </Box>
  );
};