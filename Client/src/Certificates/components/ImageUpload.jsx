import { useState, useRef } from 'react';
import ImageCrop from './ImageCrop';
import { HiUpload, HiX } from 'react-icons/hi';

/**
 * Image Upload Component with Crop
 * Allows users to upload and crop images
 */
const ImageUpload = ({ 
  value, 
  onChange, 
  label = 'Image', 
  required = false,
  aspectRatio = null,
  name 
}) => {
  const [showCrop, setShowCrop] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageSrc(reader.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl) => {
    if (croppedImageUrl) {
      onChange({ target: { name, value: croppedImageUrl } });
    }
    setShowCrop(false);
    setTempImageSrc(null);
    
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
    </div>
  );
};

export default ImageUpload;

