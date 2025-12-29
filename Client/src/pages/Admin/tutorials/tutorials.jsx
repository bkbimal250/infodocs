import { useState, useEffect } from 'react';
import { tutorialApi } from '../../../api/Tutorials/tutorialApi';
import { HiPlus, HiX, HiSearch, HiVideoCamera } from 'react-icons/hi';
import TutorialForm from './TutorialForm';
import ViewTutorialModal from './ViewTutorialModal';
import VideoCard from './VideoCard';

/**
 * Admin Tutorials Management Page
 * Modern design for managing video tutorials
 */
const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);
  const [viewingTutorial, setViewingTutorial] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    is_active: '',
    is_public: '',
  });

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filter.is_active !== '') params.is_active = filter.is_active === 'true';
      if (filter.is_public !== '') params.is_public = filter.is_public === 'true';
      
      const response = await tutorialApi.getTutorials(params);
      const data = response.data;
      setTutorials(data.tutorials || []);
    } catch (err) {
      setError('Failed to load tutorials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutorials();
  }, [filter.is_active, filter.is_public]);

  const handleAdd = () => {
    setEditingTutorial(null);
    setShowForm(true);
  };

  const handleEdit = (tutorial) => {
    setEditingTutorial(tutorial);
    setShowForm(true);
  };

  const handleView = (tutorial) => {
    setViewingTutorial(tutorial);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tutorial?')) {
      return;
    }

    try {
      await tutorialApi.deleteTutorial(id, false);
      setSuccess('Tutorial deleted successfully');
      loadTutorials();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete tutorial');
      console.error(err);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTutorial(null);
    loadTutorials();
  };

  const handleDownload = async (tutorial) => {
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
      setError('Failed to download video');
      console.error(err);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl shadow-lg">
                <HiVideoCamera className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Video Tutorials</h1>
                <p className="text-gray-600 text-lg">Manage video tutorials for users</p>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <HiPlus className="w-5 h-5" />
              Add Tutorial
            </button>
          </div>
          {filteredTutorials.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filteredTutorials.length}</span> tutorial{filteredTutorials.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded-lg shadow-sm flex items-start gap-3">
            <div className="flex-1">
              <p className="font-medium">{success}</p>
            </div>
            <button 
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        )}

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

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  placeholder="Search tutorials..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filter.is_active}
                onChange={(e) => setFilter({ ...filter, is_active: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
              <select
                value={filter.is_public}
                onChange={(e) => setFilter({ ...filter, is_public: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
              >
                <option value="">All</option>
                <option value="true">Public</option>
                <option value="false">Private</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({ search: '', is_active: '', is_public: '' })}
                className="w-full px-4 py-2.5 text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tutorials Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading tutorials...</p>
          </div>
        ) : filteredTutorials.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiVideoCamera className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutorials found</h3>
            <p className="text-gray-600 mb-4">
              {filter.search || filter.is_active || filter.is_public 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first tutorial'}
            </p>
            {!filter.search && !filter.is_active && !filter.is_public && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <HiPlus className="w-5 h-5" />
                Add Your First Tutorial
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTutorials.map((tutorial) => (
              <VideoCard
                key={tutorial.id}
                tutorial={tutorial}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <TutorialForm
            tutorial={editingTutorial}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        )}

        {/* View Modal */}
        {viewingTutorial && (
          <ViewTutorialModal
            tutorial={viewingTutorial}
            onClose={() => setViewingTutorial(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Tutorials;
