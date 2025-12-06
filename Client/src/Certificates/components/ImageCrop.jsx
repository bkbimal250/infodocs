import { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { HiX, HiCheck } from 'react-icons/hi';

/**
 * Image Crop Component
 * Allows users to crop images before using them
 */
const ImageCrop = ({ imageSrc, onCropComplete, onCancel, aspectRatio = null }) => {
  const [crop, setCrop] = useState(() => {
    // Initialize with proper x and y values to avoid undefined errors
    if (aspectRatio) {
      const cropSize = Math.min(90, 100);
      const cropHeight = cropSize / aspectRatio;
      return {
        unit: '%',
        x: (100 - cropSize) / 2,
        y: (100 - cropHeight) / 2,
        width: cropSize,
        height: cropHeight,
        aspect: aspectRatio,
      };
    } else {
      return {
        unit: '%',
        x: 5,
        y: 5,
        width: 90,
        height: 90,
      };
    }
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const imageLoadedRef = useRef(false);

  // Reset when image source changes
  useEffect(() => {
    imageLoadedRef.current = false;
    setCompletedCrop(null);
  }, [imageSrc]);

  const onImageLoaded = useCallback((image) => {
    // Prevent multiple calls that cause infinite loops
    if (imageLoadedRef.current || !image) return;
    
    imageLoadedRef.current = true;
    imgRef.current = image;
    
    // Initialize crop to center of image only if not already set
    if (aspectRatio) {
      const cropSize = Math.min(90, 100);
      const cropHeight = cropSize / aspectRatio;
      setCrop({
        unit: '%',
        x: (100 - cropSize) / 2,
        y: (100 - cropHeight) / 2,
        width: cropSize,
        height: cropHeight,
        aspect: aspectRatio,
      });
    } else {
      setCrop({
        unit: '%',
        x: 5,
        y: 5,
        width: 90,
        height: 90,
      });
    }
  }, [aspectRatio]);

  const getCroppedImg = useCallback((image, crop) => {
    if (!image || !crop) {
      return Promise.resolve(null);
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Handle percentage units
    const cropX = crop.unit === '%' ? (crop.x / 100) * image.width : crop.x;
    const cropY = crop.unit === '%' ? (crop.y / 100) * image.height : crop.y;
    const cropWidth = crop.unit === '%' ? (crop.width / 100) * image.width : crop.width;
    const cropHeight = crop.unit === '%' ? (crop.height / 100) * image.height : crop.height;
    
    canvas.width = cropWidth * scaleX;
    canvas.height = cropHeight * scaleY;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return Promise.resolve(null);
    }

    ctx.drawImage(
      image,
      cropX * scaleX,
      cropY * scaleY,
      cropWidth * scaleX,
      cropHeight * scaleY,
      0,
      0,
      cropWidth * scaleX,
      cropHeight * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, 'image/jpeg', 0.95);
    });
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!imgRef.current) {
      onCropComplete(imageSrc); // Return original if no image
      return;
    }

    // Use completedCrop if available, otherwise use current crop
    const cropToUse = completedCrop || crop;
    
    // Validate crop has all required properties
    if (!cropToUse || 
        typeof cropToUse.x === 'undefined' || 
        typeof cropToUse.y === 'undefined' ||
        !cropToUse.width || 
        !cropToUse.height) {
      onCropComplete(imageSrc); // Return original if no valid crop
      return;
    }

    try {
      const croppedImageUrl = await getCroppedImg(imgRef.current, cropToUse);
      if (croppedImageUrl) {
        onCropComplete(croppedImageUrl);
      } else {
        onCropComplete(imageSrc);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      onCropComplete(imageSrc);
    }
  }, [imgRef, completedCrop, crop, imageSrc, getCroppedImg, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCropComplete}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <HiCheck className="w-5 h-5" />
              Apply
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <HiX className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => {
                // Ensure x and y are always defined
                if (c && typeof c.x !== 'undefined' && typeof c.y !== 'undefined') {
                  setCrop(c);
                  // Also update completedCrop when user drags/resizes
                  if (c.width && c.height) {
                    setCompletedCrop(c);
                  }
                }
              }}
              onComplete={(c) => {
                // Only update if crop has valid coordinates
                if (c && typeof c.x !== 'undefined' && typeof c.y !== 'undefined') {
                  setCompletedCrop(c);
                }
              }}
              aspect={aspectRatio}
              locked={false}
              keepSelection={true}
            >
              <img
                alt="Crop me"
                src={imageSrc}
                onLoad={(e) => {
                  onImageLoaded(e.currentTarget);
                }}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '70vh',
                  display: 'block'
                }}
              />
            </ReactCrop>
          </div>
          {aspectRatio && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Aspect ratio: {aspectRatio.toFixed(2)} (locked)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCrop;

