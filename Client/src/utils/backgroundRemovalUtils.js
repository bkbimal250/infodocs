/**
 * Utility helpers for background removal handling, error parsing, and file validation.
 */

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit matching backend REMBG_MAX_IMAGE_BYTES
export const BACKGROUND_REMOVAL_TIMEOUT_MS = 135000; // 135s (120s backend inference deadline + 15s transport/decoding buffer)

/**
 * Validates file type and size for user feedback before upload.
 * Backend validation remains authoritative.
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select an image file.' };
  }

  if (!file.type || !file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, WEBP).' };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      valid: false,
      error: `Image size exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please choose a smaller image.`,
    };
  }

  return { valid: true };
}

/**
 * Parses background removal API errors into user-friendly feedback categories.
 * Correctly distinguishes 400 (validation), 503 (busy vs unavailable), 504 (timeout),
 * and network failures. Avoids automatic retry loops.
 */
export function parseBackgroundRemovalError(error) {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail || error?.response?.data?.error;
  
  // Extract Retry-After header if present
  let retryAfter = 5;
  const rawRetryAfter =
    error?.response?.headers?.['retry-after'] ||
    (error?.response?.headers?.get && error.response.headers.get('retry-after'));
  if (rawRetryAfter) {
    const parsed = parseInt(rawRetryAfter, 10);
    if (!isNaN(parsed) && parsed > 0) {
      retryAfter = parsed;
    }
  }

  // Timeout handling (Axios timeout or HTTP 504 Gateway Timeout)
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout') || status === 504) {
    return {
      type: 'timeout',
      status: 504,
      message: 'Background removal processing timed out. Original image preserved. You can try again.',
      canRetry: true,
      retryAfter: 0,
    };
  }

  // 503 Service Unavailable (Busy vs Unavailable)
  if (status === 503) {
    const detailLower = (detail || '').toLowerCase();
    const isBusy = detailLower.includes('busy') || (error?.message || '').toLowerCase().includes('busy');

    if (isBusy) {
      return {
        type: 'busy',
        status: 503,
        message: `Background removal service is currently busy. Please retry in ${retryAfter} seconds.`,
        canRetry: true,
        retryAfter,
      };
    }

    return {
      type: 'unavailable',
      status: 503,
      message: detail || 'Background removal service is currently unavailable. Using original image.',
      canRetry: false,
      retryAfter: 0,
    };
  }

  // 400 Validation Error
  if (status === 400) {
    return {
      type: 'validation',
      status: 400,
      message: detail || 'Invalid image format or dimensions. Using original image.',
      canRetry: false,
      retryAfter: 0,
    };
  }

  // Network Error / CORS Error
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error' || error?.message?.includes('Unable to connect')) {
    return {
      type: 'network',
      status: 0,
      message: 'Cannot connect to server. Please check your internet connection and retry.',
      canRetry: true,
      retryAfter: 5,
    };
  }

  // Fallback generic error
  return {
    type: 'general',
    status: status || 500,
    message: detail || error?.message || 'Failed to remove background. Using original image.',
    canRetry: true,
    retryAfter: 5,
  };
}
