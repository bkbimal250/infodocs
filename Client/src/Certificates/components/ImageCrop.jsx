import { useState, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { HiX, HiCheck } from 'react-icons/hi';

/**
 * Image Crop Component
 * Allows users to crop images before using them
 */
const ImageCrop = ({ imageSrc, onCropComplete, onCancel, aspectRatio = null }) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    aspect: aspectRatio,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgRef, setImgRef] = useState(null);

  const onImageLoaded = useCallback((image) => {
    setImgRef(image);
  }, []);

  const getCroppedImg = (image, crop) => {
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
      }, 'image/png');
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef || !completedCrop) {
      onCropComplete(imageSrc); // Return original if no crop
      return;
    }

    const croppedImageUrl = await getCroppedImg(imgRef, completedCrop);
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
    } else {
      onCropComplete(imageSrc);
    }
  };

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
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
            >
              <img
                ref={setImgRef}
                alt="Crop me"
                src={imageSrc}
                onLoad={onImageLoaded}
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
              />
            </ReactCrop>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCrop;

