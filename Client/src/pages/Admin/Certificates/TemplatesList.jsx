import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import { CERTIFICATE_CATEGORY_METADATA } from '../../../utils/certificateConstants';
import TemplateTable from './TemplateComponent/TemplateTable';
import Pagination from '../../common/Pagination';
import { 
  HiOutlinePlus, 
  HiOutlineRefresh, 
  HiOutlineSearch,
  HiOutlineCollection
} from 'react-icons/hi';

/**
 * Admin Templates List Page
 * View and manage certificate templates with a premium interface.
 */
const TemplatesList = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    loadTemplates();
  }, []);

  const getCategoryLabel = (categoryValue) =>
    CERTIFICATE_CATEGORY_METADATA[categoryValue]?.title || categoryValue;

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await adminApi.certificates.getTemplates();
      setTemplates(response.data?.results || response.data || []);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load templates';
      setError(errorMessage);
      console.error('Load templates error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    navigate(`/admin/certificates/templates/${template.id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template? This cannot be undone.')) return;

    try {
      await adminApi.certificates.deleteTemplate(id);
      await loadTemplates();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to delete template';
      setError(errorMessage);
      console.error('Delete template error:', err);
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const search = searchTerm.toLowerCase();
      const name = template.name?.toLowerCase() || '';
      const category = getCategoryLabel(template.category)?.toLowerCase() || '';
      return name.includes(search) || category.includes(search);
    });
  }, [templates, searchTerm]);

  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTemplates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTemplates, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading && templates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500 font-medium tracking-wide">Syncing certificate templates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
              <HiOutlineCollection size={18} />
              <span>Templates Engine</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Certificate Templates</h1>
            <p className="text-gray-500 mt-2 font-medium">Design and manage the blueprints for your digital credentials.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={loadTemplates}
              className="p-3 bg-white text-gray-600 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              title="Refresh List"
            >
              <HiOutlineRefresh size={22} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => navigate('/admin/certificates/templates/add')}
              className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 font-bold shadow-xl shadow-indigo-100 active:scale-95"
            >
              <HiOutlinePlus size={20} />
              Create New Template
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl font-medium flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            {error}
          </div>
        )}

        {/* Filters & Content */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden transition-all duration-500">
          <div className="p-6 border-b border-gray-50">
            <div className="relative group max-w-md">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by name or category..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-sm font-semibold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TemplateTable
            templates={paginatedTemplates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getCategoryLabel={getCategoryLabel}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredTemplates.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={filteredTemplates.length}
            itemsPerPage={itemsPerPage}
            showInfo={true}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplatesList;

