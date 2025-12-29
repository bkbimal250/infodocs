import { HiX, HiDownload } from 'react-icons/hi';
import { tutorialApi } from '../../../api/Tutorials/tutorialApi';

/**
 * View Tutorial Modal Component
 * Display tutorial details and video player
 */
const ViewTutorialModal = ({ tutorial, onClose }) => {
  if (!tutorial) return null;

  const handleDownload = async () => {
    try {
      const response = await tutorialApi.downloadVideo(tutorial.id);
      const blob = new Blob([response.data], { type: 'video/mp4' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tutorial.title}${tutorial.video_format ? '.' + tutorial.video_format : '.mp4'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download video:', err);
      alert('Failed to download video');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getVideoUrl = () => {
    if (tutorial.video_file_path) {
      return tutorialApi.getVideoStreamUrl(tutorial.id);
    }
    if (tutorial.video_url) {
      return tutorial.video_url;
    }
    return null;
  };

  const videoUrl = getVideoUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{tutorial.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {tutorial.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{tutorial.description}</p>
            </div>
          )}

          {videoUrl && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Video</label>
                {tutorial.video_file_path && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <HiDownload className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  src={videoUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full"
                  style={{ maxHeight: '500px' }}
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
              <p className="text-sm text-gray-900">{formatFileSize(tutorial.video_file_size)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <p className="text-sm text-gray-900">{tutorial.video_format || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                tutorial.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {tutorial.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                tutorial.is_public
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {tutorial.is_public ? 'Public' : 'Private'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-sm text-gray-900">
                {new Date(tutorial.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTutorialModal;
