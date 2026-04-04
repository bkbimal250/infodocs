/**
 * Utility function to construct a full URL for a file served by the backend.
 * @param {string} filePath - The relative path to the file (e.g., 'candidate_forms/image.jpg')
 * @returns {string|null} - The full URL or null if filePath is empty
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  // Get API base URL from environment or use default
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in/api';
  
  // Handle different file path formats
  let cleanPath = filePath;
  
  // Remove "uploads/" prefix if present to match the backend /forms/files/:path endpoint
  if (filePath.startsWith('uploads/')) {
    cleanPath = filePath.replace('uploads/', '');
  } else if (filePath.startsWith('/uploads/')) {
    cleanPath = filePath.replace('/uploads/', '');
  }
  
  // Construct the file serving URL using the forms router endpoint
  const url = `${apiBaseUrl}/forms/files/${cleanPath}`;
  
  return url;
};
