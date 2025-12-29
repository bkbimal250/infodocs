import { HiPlay, HiEye, HiPencil, HiTrash, HiDownload } from 'react-icons/hi';
import { tutorialApi } from '../../../api/Tutorials/tutorialApi';

/**
 * Video Card Component for Admin
 * Modern card design with enhanced styling and admin actions
 */
const VideoCard = ({ tutorial, onView, onEdit, onDelete, onDownload }) => {
  if (!tutorial) return null;

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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 group">
      {/* Thumbnail Section */}
      <div className="relative w-full h-56 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
        {tutorial.thumbnail_url ? (
          <>
            <img
              src={tutorial.thumbnail_url}
              alt={tutorial.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="hidden absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 items-center justify-center">
              <HiPlay className="w-20 h-20 text-amber-400" />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <HiPlay className="w-20 h-20 text-amber-400" />
          </div>
        )}
        
        {/* Play Overlay on Hover */}
        {videoUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-amber-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white rounded-full p-5 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
              <HiPlay className="w-10 h-10 text-amber-600" />
            </div>
          </div>
        )}

        {/* Status Badges on Thumbnail */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {!tutorial.is_active && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              Inactive
            </span>
          )}
          {!tutorial.is_public && (
            <span className="px-3 py-1 bg-gray-700 text-white text-xs font-bold rounded-full shadow-lg">
              Private
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-amber-600 transition-colors">
          {tutorial.title}
        </h3>

        {/* Description */}
        {tutorial.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
            {tutorial.description}
          </p>
        )}

        {/* Video Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
          <span className="flex items-center gap-1">
            <span className="font-semibold">Size:</span>
            {formatFileSize(tutorial.video_file_size)}
          </span>
          {tutorial.video_format && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
              {tutorial.video_format.toUpperCase()}
            </span>
          )}
        </div>

        {/* Video Source Indicator */}
        <div className="mb-4">
          {tutorial.video_file_path ? (
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
              ✓ Uploaded Video
            </span>
          ) : tutorial.video_url ? (
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
              External URL
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
              No Video
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {videoUrl && (
            <button
              onClick={() => onView && onView(tutorial)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm rounded-xl hover:from-amber-700 hover:to-orange-700 font-semibold shadow-md hover:shadow-lg transition-all"
              title="View Tutorial"
            >
              <HiEye className="w-4 h-4" />
              <span className="hidden sm:inline">View</span>
            </button>
          )}
          
          <button
            onClick={() => onEdit && onEdit(tutorial)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-yellow-600 text-white text-sm rounded-xl hover:bg-yellow-700 font-semibold shadow-md hover:shadow-lg transition-all"
            title="Edit Tutorial"
          >
            <HiPencil className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {tutorial.video_file_path && (
            <button
              onClick={() => onDownload && onDownload(tutorial)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 font-semibold shadow-md hover:shadow-lg transition-all"
              title="Download Video"
            >
              <HiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}

          <button
            onClick={() => onDelete && onDelete(tutorial.id)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 font-semibold shadow-md hover:shadow-lg transition-all"
            title="Delete Tutorial"
          >
            <HiTrash className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Created Date */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Created: {new Date(tutorial.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
