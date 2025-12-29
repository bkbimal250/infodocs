import { HiPlay } from 'react-icons/hi';
import { tutorialApi } from '../../../../api/Tutorials/tutorialApi';

/**
 * Video Card Component for Managers
 * Modern card design with enhanced styling
 */
const VideoCard = ({ tutorial, onView }) => {
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
      <div 
        className="relative w-full h-56 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden cursor-pointer" 
        onClick={() => videoUrl && onView && onView(tutorial)}
      >
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
            <div className="hidden absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 items-center justify-center">
              <HiPlay className="w-20 h-20 text-emerald-400" />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            <HiPlay className="w-20 h-20 text-emerald-400" />
          </div>
        )}
        
        {/* Play Overlay on Hover */}
        {videoUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-emerald-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white rounded-full p-5 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
              <HiPlay className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-emerald-600 transition-colors">
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
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
              {tutorial.video_format.toUpperCase()}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          {videoUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView && onView(tutorial);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              title="Watch Tutorial"
            >
              <HiPlay className="w-5 h-5" />
              Watch Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
