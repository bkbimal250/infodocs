import { useState, useRef } from 'react';
import ImageCrop from './ImageCrop';
import { HiUpload, HiX, HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { certificateApi } from '../../api/Certificates/certificateApi';

/**
 * Image Upload Component with Crop and Optional Background Removal
 * Allows users to upload and crop images
 * Background removal is optional and disabled by default
 */
const ImageUpload = ({ 
  value, 
  onChange, 
  label = 'Image', 
  required = false,
  aspectRatio = null,
  name,
  removeBackground = false // Optional: enable background removal
}) => {
  const [showCrop, setShowCrop] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageSrc(reader.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageUrl) => {
    if (!croppedImageUrl) {
      setShowCrop(false);
      setTempImageSrc(null);
      return;
    }

    // If background removal is not enabled, just use the cropped image
    if (!removeBackground) {
      onChange({ target: { name, value: croppedImageUrl } });
      setShowCrop(false);
      setTempImageSrc(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Background removal is enabled
    try {
      setProcessing(true);
      toast.loading('Removing background...', { id: 'bg-removal' });

      // Convert data URL to blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${name || 'image'}.png`, { type: 'image/png' });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 60000)
      );
      const result = await Promise.race([
        certificateApi.removeBackground(file, 'PNG'),
        timeoutPromise,
      ]);

      if (!result.data?.success || !result.data?.image) {
        throw new Error('Invalid response from server');
      }

      onChange({ target: { name, value: result.data.image } });
      setShowCrop(false);
      setTempImageSrc(null);
      setProcessing(false);
      toast.success('Background removed successfully!', { id: 'bg-removal' });
    } catch (error) {
      console.error('Background removal error:', error);
      const backendMessage = error.response?.data?.detail || error.message || 'Failed to remove background.';
      toast.error(`${backendMessage} Using original image.`, { id: 'bg-removal', duration: 6000 });
      // Fallback to cropped image without background removal
      onChange({ target: { name, value: croppedImageUrl } });
      setShowCrop(false);
      setTempImageSrc(null);
      setProcessing(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelCrop = () => {
    setShowCrop(false);
    setTempImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange({ target: { name, value: '' } });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {value ? (
        <div className="relative inline-block">
          <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
            <img
              src={value}
              alt={label}
              className="max-w-full max-h-48 object-contain rounded"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            title="Remove image"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`image-upload-${name || label}`}
          />
          <label
            htmlFor={`image-upload-${name || label}`}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <HiUpload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Click to upload {label.toLowerCase()}
            </span>
            {removeBackground && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <HiSparkles className="w-4 h-4" />
                Background will be removed automatically
              </span>
            )}
          </label>
        </div>
      )}

      {showCrop && tempImageSrc && (
        <ImageCrop
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
          aspectRatio={aspectRatio}
        />
      )}

      {processing && (
        <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Processing...
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

