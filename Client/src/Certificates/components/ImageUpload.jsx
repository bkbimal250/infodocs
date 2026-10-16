import { useState, useRef, useEffect, useCallback } from 'react';
import ImageCrop from './ImageCrop';
import { HiUpload, HiX, HiSparkles, HiRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { certificateApi } from '../../api/Certificates/certificateApi';
import {
  validateImageFile,
  parseBackgroundRemovalError,
} from '../../utils/backgroundRemovalUtils';

/**
 * Image Upload Component with Crop and Optional Background Removal
 * Allows users to upload and crop images.
 * Background removal is optional and disabled by default.
 * 
 * Features:
 * - Clear loading state and duplicate submission prevention
 * - Preserves original image and form values on failure
 * - Precise error handling (400 validation, 503 busy with countdown, 503 unavailable, 504 timeout)
 * - Manual retry support without automated retry loops
 * - Stale response protection via request ID tracking
 * - Object URL tracking and cleanup
 * - Transparent preview rendering
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
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [canManualRetry, setCanManualRetry] = useState(false);

  const fileInputRef = useRef(null);
  const activeRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const originalImageRef = useRef(null);
  const objectUrlsRef = useRef(new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      objectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      objectUrlsRef.current.clear();
    };
  }, []);

  const revokeObjectUrl = useCallback((url) => {
    if (url && typeof url === 'string' && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
        objectUrlsRef.current.delete(url);
      } catch {
        // ignore
      }
    }
  }, []);

  const startCountdown = useCallback((seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRetryCountdown(seconds);
    timerRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleFileSelect = (e) => {
    if (processing) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (!isMountedRef.current) return;
      setTempImageSrc(reader.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const executeBackgroundRemoval = async (croppedImageUrl) => {
    if (processing) return;

    const requestId = ++activeRequestIdRef.current;
    setProcessing(true);
    setCanManualRetry(false);
    toast.loading('Removing background...', { id: 'bg-removal' });

    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${name || 'image'}.png`, { type: 'image/png' });

      const result = await certificateApi.removeBackground(file, 'PNG');

      if (!isMountedRef.current || activeRequestIdRef.current !== requestId) {
        return;
      }

      if (result.data?.success && result.data?.image) {
        onChange({ target: { name, value: result.data.image } });
        setShowCrop(false);
        if (tempImageSrc) {
          revokeObjectUrl(tempImageSrc);
          setTempImageSrc(null);
        }
        setProcessing(false);
        toast.success('Background removed successfully!', { id: 'bg-removal' });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      if (!isMountedRef.current || activeRequestIdRef.current !== requestId) {
        return;
      }

      console.error('Background removal error:', error);
      const parsed = parseBackgroundRemovalError(error);

      // Fallback to original cropped image without background removal
      const fallback = originalImageRef.current || croppedImageUrl || value;
      if (fallback) {
        onChange({ target: { name, value: fallback } });
      }

      setShowCrop(false);
      if (tempImageSrc) {
        revokeObjectUrl(tempImageSrc);
        setTempImageSrc(null);
      }
      setProcessing(false);

      if (parsed.canRetry) {
        setCanManualRetry(true);
        if (parsed.retryAfter > 0) {
          startCountdown(parsed.retryAfter);
        }
      }

      toast.error(parsed.message, { id: 'bg-removal', duration: 7000 });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
      if (tempImageSrc) {
        revokeObjectUrl(tempImageSrc);
        setTempImageSrc(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    originalImageRef.current = croppedImageUrl;
    await executeBackgroundRemoval(croppedImageUrl);
  };

  const handleManualRetry = async () => {
    if (processing || retryCountdown > 0) return;
    const targetImage = originalImageRef.current || value;
    if (!targetImage) {
      toast.error('No image available to retry.');
      return;
    }
    await executeBackgroundRemoval(targetImage);
  };

  const handleCancelCrop = () => {
    if (processing) return;
    setShowCrop(false);
    if (tempImageSrc) {
      revokeObjectUrl(tempImageSrc);
      setTempImageSrc(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (processing) return;
    activeRequestIdRef.current++;
    originalImageRef.current = null;
    setCanManualRetry(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setRetryCountdown(0);

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
          {/* Transparency preview container */}
          <div className="border-2 border-gray-300 rounded-lg p-2 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:12px_12px] bg-white min-w-[120px] min-h-[60px] flex items-center justify-center">
            <img
              src={value}
              alt={label}
              className="max-w-full max-h-48 object-contain rounded"
            />
          </div>
          <div className="absolute -top-2 -right-2 flex gap-1">
            {removeBackground && (
              <button
                type="button"
                onClick={handleManualRetry}
                disabled={processing || retryCountdown > 0}
                className="bg-blue-500 text-white rounded-full p-1.5 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow transition-colors"
                title="Re-run background removal"
              >
                <HiSparkles className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              disabled={processing}
              className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow transition-colors"
              title="Remove image"
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>

          {canManualRetry && removeBackground && !processing && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualRetry}
                disabled={retryCountdown > 0}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded px-2 py-1 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <HiRefresh className={`w-3.5 h-3.5 ${retryCountdown > 0 ? 'animate-spin' : ''}`} />
                {retryCountdown > 0 ? `Retry in ${retryCountdown}s` : 'Retry Background Removal'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors ${
          processing ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-400'
        }`}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={processing}
            className="hidden"
            id={`image-upload-${name || label}`}
          />
          <label
            htmlFor={`image-upload-${name || label}`}
            className={`flex flex-col items-center gap-2 ${
              processing ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'
            }`}
          >
            <HiUpload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Click to upload {label.toLowerCase()} (max 10 MB)
            </span>
            {removeBackground && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <HiSparkles className="w-4 h-4 text-blue-500" />
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
        <div className="mt-2.5 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2.5 animate-pulse">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent flex-shrink-0"></div>
          <span>Processing background removal... Please wait.</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
