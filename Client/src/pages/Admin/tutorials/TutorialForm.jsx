import { useState, useEffect } from 'react';
import { tutorialApi } from '../../../api/Tutorials/tutorialApi';
import { HiX, HiUpload } from 'react-icons/hi';

/**
 * Tutorial Form Component
 * Create or edit tutorial with video upload
 */
const TutorialForm = ({ tutorial, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    video_url: '',
    is_active: true,
    is_public: true,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    if (tutorial) {
      setFormData({
        title: tutorial.title || '',
        description: tutorial.description || '',
        thumbnail_url: tutorial.thumbnail_url || '',
        video_url: tutorial.video_url || '',
        is_active: tutorial.is_active !== undefined ? tutorial.is_active : true,
        is_public: tutorial.is_public !== undefined ? tutorial.is_public : true,
      });
    }
  }, [tutorial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid video format. Please upload MP4, WebM, OGG, MOV, AVI, or MKV files.');
        return;
      }
      
      // Validate file size (1 GB max)
      if (file.size > 1024 * 1024 * 1024) {
        setError('Video file is too large. Maximum size is 1 GB.');
        return;
      }
      
      setVideoFile(file);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewVideo(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('thumbnail_url', formData.thumbnail_url || '');
      formDataToSend.append('video_url', formData.video_url || '');
      formDataToSend.append('is_active', formData.is_active);
      formDataToSend.append('is_public', formData.is_public);
      
      if (videoFile) {
        formDataToSend.append('video_file', videoFile);
      }

      if (tutorial) {
        await tutorialApi.updateTutorial(tutorial.id, formDataToSend);
      } else {
        await tutorialApi.createTutorial(formDataToSend);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to save tutorial');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {tutorial ? 'Edit Tutorial' : 'Add Tutorial'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <HiUpload className="w-5 h-5" />
                {videoFile ? 'Change Video' : 'Upload Video'}
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {videoFile && (
                <span className="text-sm text-gray-600">
                  {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              )}
            </div>
            {previewVideo && (
              <div className="mt-4">
                <video
                  src={previewVideo}
                  controls
                  className="w-full max-w-md rounded-lg"
                />
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: MP4, WebM, OGG, MOV, AVI, MKV (Max: 1 GB)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OR External Video URL
            </label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">
              If you provide an external URL, the uploaded file will be ignored
            </p>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Public</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : tutorial ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutorialForm;
