import { useState, useRef } from 'react';
import ImageCrop from './ImageCrop';
import { HiUpload, HiX, HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { certificateApi } from '../../api/Certificates/certificateApi';

/**
 * Signature Upload Component with Background Removal
 * Allows users to upload signature, crop it, and remove background
 * 
 * NOTE: Background removal is handled by the backend FastAPI service only.
 * No frontend background removal libraries are used in this component.
 */
const SignatureUpload = ({ value, onChange, label = 'Signature', required = false, name = 'signature' }) => {
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

    try {
      setProcessing(true);
      toast.loading('Removing background...', { id: 'bg-removal' });

      // Convert data URL to blob for upload
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const file = new File([blob], 'signature.png', { type: 'image/png' });

      // Call backend API to remove background
      const result = await certificateApi.removeBackground(file, 'PNG');
      
      if (result.data && result.data.success && result.data.image) {
        // Use the processed image from backend
        onChange({ target: { name, value: result.data.image } });
        setShowCrop(false);
        setTempImageSrc(null);
        setProcessing(false);
        toast.success('Background removed successfully!', { id: 'bg-removal' });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Background removal error:', error);
      
      // Determine error message
      let errorMessage = 'Failed to remove background. Using original image.';
      if (error.response?.status === 503) {
        // Show the detailed error from backend
        const backendMessage = error.response?.data?.detail || 'Background removal service is not available.';
        errorMessage = `${backendMessage} Using original image.`;
      } else if (error.response?.data?.detail) {
        errorMessage = `${error.response.data.detail} Using original image.`;
      } else if (error.message) {
        errorMessage = `${error.message} Using original image.`;
      }
      
      toast.error(errorMessage, { id: 'bg-removal', duration: 6000 });
      
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

  const handleRemoveBackground = async () => {
    if (!value || !isImage) {
      toast.error('No image to process');
      return;
    }

    try {
      setProcessing(true);
      toast.loading('Removing background...', { id: 'bg-removal' });

      // Use base64 endpoint since we already have the image as data URL
      const result = await certificateApi.removeBackgroundFromBase64(value, 'PNG');
      
      if (result.data && result.data.success && result.data.image) {
        onChange({ target: { name, value: result.data.image } });
        setProcessing(false);
        toast.success('Background removed successfully!', { id: 'bg-removal' });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Background removal error:', error);
      
      let errorMessage = 'Failed to remove background.';
      if (error.response?.status === 503) {
        // Show the detailed error from backend
        errorMessage = error.response?.data?.detail || 'Background removal service is not available.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: 'bg-removal', duration: 6000 });
      setProcessing(false);
    }
  };

  const isImage = value && (value.startsWith('data:image') || value.startsWith('http://') || value.startsWith('https://'));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {value && isImage ? (
        <div className="relative inline-block">
          <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
            <img
              src={value}
              alt="Signature preview"
              className="max-w-full max-h-32 object-contain"
            />
          </div>
          <div className="absolute -top-2 -right-2 flex gap-1">
            <button
              type="button"
              onClick={handleRemoveBackground}
              disabled={processing}
              className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove background"
            >
              <HiSparkles className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              title="Remove signature"
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : value && !isImage ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder="Enter signature name or URL"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            title="Clear"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id={`signature-upload-${label}`}
            />
            <label
              htmlFor={`signature-upload-${label}`}
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <HiUpload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload signature image
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <HiSparkles className="w-4 h-4" />
                Background will be removed automatically
              </span>
            </label>
          </div>
          <div className="text-center text-sm text-gray-500">OR</div>
          <input
            type="text"
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder="Enter signature name or URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {showCrop && tempImageSrc && (
        <ImageCrop
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
          aspectRatio={null} // Free aspect for signature
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

export default SignatureUpload;

