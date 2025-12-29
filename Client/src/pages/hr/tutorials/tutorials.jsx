import { useState, useEffect } from 'react';
import { tutorialApi } from '../../../api/Tutorials/tutorialApi';
import { HiX, HiSearch, HiVideoCamera } from 'react-icons/hi';
import VideoCard from './Component/VideoCard';

/**
 * HR Tutorials Page
 * Modern design for viewing video tutorials
 */
const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
  });

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tutorialApi.getTutorials({ is_active: true, is_public: true });
      const data = response.data;
      setTutorials(data.tutorials || []);
    } catch (err) {
      setError('Failed to load tutorials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (tutorial) => {
    setSelectedTutorial(tutorial);
  };

  const filteredTutorials = tutorials.filter((tutorial) => {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        tutorial.title?.toLowerCase().includes(searchLower) ||
        tutorial.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getVideoUrl = (tutorial) => {
    if (tutorial.video_file_path) {
      return tutorialApi.getVideoStreamUrl(tutorial.id);
    }
    if (tutorial.video_url) {
      return tutorial.video_url;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <HiVideoCamera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Video Tutorials</h1>
              <p className="text-gray-600 text-lg">Learn from our comprehensive video library</p>
            </div>
          </div>
          {filteredTutorials.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filteredTutorials.length}</span> tutorial{filteredTutorials.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-lg shadow-sm flex items-start gap-3">
            <HiX className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Search tutorials by title or description..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* Tutorials Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading tutorials...</p>
          </div>
        ) : filteredTutorials.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiVideoCamera className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutorials found</h3>
            <p className="text-gray-600">
              {filter.search ? 'Try adjusting your search terms' : 'No tutorials available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTutorials.map((tutorial) => (
              <VideoCard
                key={tutorial.id}
                tutorial={tutorial}
                onView={handleView}
              />
            ))}
          </div>
        )}

        {/* Video Modal */}
        {selectedTutorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedTutorial.title}</h2>
                  {selectedTutorial.description && (
                    <p className="text-purple-100 text-sm line-clamp-2">{selectedTutorial.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedTutorial(null)}
                  className="ml-4 text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {selectedTutorial.description && (
                  <div className="mb-6 bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedTutorial.description}</p>
                  </div>
                )}

                {getVideoUrl(selectedTutorial) ? (
                  <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
                    <video
                      src={getVideoUrl(selectedTutorial)}
                      controls
                      controlsList="nodownload"
                      className="w-full"
                      style={{ maxHeight: '600px' }}
                      autoPlay
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                    <p className="text-yellow-800 font-medium">No video available for this tutorial.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tutorials;
