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
 * Signature Upload Component with Background Removal
 * Allows users to upload signature, crop it, and remove background.
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
const SignatureUpload = ({
  value,
  onChange,
  label = 'Signature',
  required = false,
  name = 'signature',
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

    // Validate file size and type
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

  const executeBackgroundRemoval = async (imageInput, isBase64 = false) => {
    if (processing) return;

    const requestId = ++activeRequestIdRef.current;
    setProcessing(true);
    setCanManualRetry(false);
    toast.loading('Removing background...', { id: 'bg-removal' });

    try {
      let result;
      if (isBase64) {
        result = await certificateApi.removeBackgroundFromBase64(imageInput, 'PNG');
      } else {
        let fileToUpload = imageInput;
        if (typeof imageInput === 'string') {
          const resp = await fetch(imageInput);
          const blob = await resp.blob();
          fileToUpload = new File([blob], 'signature.png', { type: 'image/png' });
        }
        result = await certificateApi.removeBackground(fileToUpload, 'PNG');
      }

      if (!isMountedRef.current || activeRequestIdRef.current !== requestId) {
        return;
      }

      if (result.data && result.data.success && result.data.image) {
        onChange({ target: { name, value: result.data.image } });
        setShowCrop(false);
        if (tempImageSrc) {
          revokeObjectUrl(tempImageSrc);
          setTempImageSrc(null);
        }
        setProcessing(false);
        toast.success('Background removed successfully!', { id: 'bg-removal' });
      } else {
        throw new Error('Invalid response received from server.');
      }
    } catch (error) {
      if (!isMountedRef.current || activeRequestIdRef.current !== requestId) {
        return;
      }

      console.error('Background removal error:', error);
      const parsed = parseBackgroundRemovalError(error);

      // Preserve original cropped image on failure
      const fallback = originalImageRef.current || (typeof imageInput === 'string' ? imageInput : value);
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

    originalImageRef.current = croppedImageUrl;
    await executeBackgroundRemoval(croppedImageUrl, false);
  };

  const handleManualRetry = async () => {
    if (processing || retryCountdown > 0) return;
    const targetImage = originalImageRef.current || value;
    if (!targetImage) {
      toast.error('No image available to retry.');
      return;
    }
    await executeBackgroundRemoval(targetImage, true);
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

  const isImage = value && (value.startsWith('data:image') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:'));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {value && isImage ? (
        <div className="relative inline-block">
          {/* Transparency preview container */}
          <div className="border-2 border-gray-300 rounded-lg p-2 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:12px_12px] bg-white min-w-[120px] min-h-[60px] flex items-center justify-center">
            <img
              src={value}
              alt="Signature preview"
              className="max-w-full max-h-32 object-contain"
            />
          </div>

          <div className="absolute -top-2 -right-2 flex gap-1">
            <button
              type="button"
              onClick={() => executeBackgroundRemoval(value, true)}
              disabled={processing || retryCountdown > 0}
              className="bg-blue-500 text-white rounded-full p-1.5 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow transition-colors"
              title="Re-run background removal"
            >
              <HiSparkles className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={processing}
              className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow transition-colors"
              title="Remove signature"
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>

          {canManualRetry && !processing && (
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
      ) : value && !isImage ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            disabled={processing}
            placeholder="Enter signature name or URL"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={processing}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            title="Clear"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
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
              id={`signature-upload-${label}`}
            />
            <label
              htmlFor={`signature-upload-${label}`}
              className={`flex flex-col items-center gap-2 ${
                processing ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'
              }`}
            >
              <HiUpload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload signature image (PNG, JPEG, max 10 MB)
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <HiSparkles className="w-4 h-4 text-blue-500" />
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
            disabled={processing}
            placeholder="Enter signature name or URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
      )}

      {showCrop && tempImageSrc && (
        <ImageCrop
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
          aspectRatio={null}
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

export default SignatureUpload;
