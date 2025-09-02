import React, { useState } from 'react';
import { removeBackground, loadImage } from '../utils/backgroundRemoval';

export const BackgroundRemover: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processUploadedImage = async () => {
    setIsProcessing(true);
    try {
      // Fetch the uploaded image
      const response = await fetch('/lovable-uploads/a286b57d-7f31-46c4-8d16-860e56d8e61e.png');
      const blob = await response.blob();
      
      // Load as image element
      const imageElement = await loadImage(blob);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Create download link
      const url = URL.createObjectURL(processedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'coin-no-background.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Background removed successfully!');
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    // Automatically process the image when component mounts
    processUploadedImage();
  }, []);

  return (
    <div className="p-4">
      {isProcessing && (
        <div className="text-center">
          <p>Removendo fundo da moeda...</p>
        </div>
      )}
    </div>
  );
};