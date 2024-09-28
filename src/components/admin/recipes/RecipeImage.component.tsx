import React from 'react';
import { generateUploadButton } from "@uploadthing/react";
import Image from 'next/image';
import type { RecipeDetails } from '@/types/recipe';
import type { OurFileRouter } from "@/server/uploadthing";

const UploadButton = generateUploadButton<OurFileRouter>();

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
  return (
    <div className="mt-4 flex items-center">
      <UploadButton
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
      />
      {uploadStatus === 'uploading' && <span className="ml-2 text-blue-500">Uploading...</span>}
      {uploadStatus === 'success' && (
        <span className="ml-2 text-green-500">Upload successful!</span>
      )}
      {uploadStatus === 'error' && <span className="ml-2 text-red-500">Upload failed</span>}
      {recipe.image && (
        <div className="mt-4">
          <Image src={recipe.image} alt="Recipe" width={128} height={128} className="w-32 h-32 object-cover rounded" />
        </div>
      )}
    </div>
  );
};