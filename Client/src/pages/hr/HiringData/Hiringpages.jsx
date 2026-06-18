import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { hrApi } from '../../../api/hr/hrApi';
import HiringDataTable from './HiringDatatable';
import EditData from './Editdata';
import HiringFilter from './HiringFilter';
import Pagination from '../../common/Pagination';

const text = (value) => (value || '').toString().toLowerCase();

const filterForms = (forms, filter) => {
  return forms.filter((form) => {
    const spaFields = [
      form.spa?.name,
      form.spa?.code,
      form.spa?.area,
      form.spa?.city,
      form.spa?.state,
      form.spa?.address,
      form.spa_name_text,
    ].map(text).join(' ');

    const matchesSearch =
      !filter.search ||
      text(form.for_role).includes(text(filter.search)) ||
      text(form.description).includes(text(filter.search)) ||
      text(form.required_skills).includes(text(filter.search)) ||
      spaFields.includes(text(filter.search));

    const matchesRole = !filter.role || text(form.for_role).includes(text(filter.role));
    const matchesSpa = !filter.spa || spaFields.includes(text(filter.spa));
    const matchesCity = !filter.city || text(form.spa?.city).includes(text(filter.city));

    return matchesSearch && matchesRole && matchesSpa && matchesCity;
  });
};

const Hiringpages = () => {
  const navigate = useNavigate();
  const [allHiringForms, setAllHiringForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filter, setFilter] = useState({
    search: '',
    role: '',
    spa: '',
    city: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    loadData();
  }, []);

  const filteredForms = useMemo(() => filterForms(allHiringForms, filter), [allHiringForms, filter]);
  const hiringForms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredForms.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredForms, currentPage]);

  const spaCount = useMemo(() => {
    return new Set(allHiringForms.map((form) => form.spa?.id || form.spa?.name).filter(Boolean)).size;
  }, [allHiringForms]);

  const cityCount = useMemo(() => {
    return new Set(allHiringForms.map((form) => form.spa?.city).filter(Boolean)).size;
  }, [allHiringForms]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await hrApi.getHiringForms({ skip: 0, limit: 1000 });
      setAllHiringForms(response.data || []);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load hiring forms';
      setAllHiringForms([]);
      setError(errorMsg);
      console.error('Failed to load hiring forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilter(newFilters);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hiring form? This action cannot be undone.')) {
      return;
    }

    try {
      await hrApi.deleteHiringForm(id);
      await loadData();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete hiring form';
      setError(errorMessage);
      console.error('Delete hiring form error:', err);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingForm(null);
    loadData();
  };

  if (loading && allHiringForms.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-sm text-slate-600">Loading hiring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-indigo-700">HR Hiring Data</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Hiring Requirements</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Review requirements with complete SPA identity, city, location, and address details.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <HiOutlineRefresh className="h-5 w-5" />
            Refresh
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Stat icon={HiOutlineBriefcase} label="Requirements" value={allHiringForms.length} />
          <Stat icon={HiOutlineOfficeBuilding} label="SPAs" value={spaCount} />
          <Stat icon={HiOutlineOfficeBuilding} label="Cities" value={cityCount} />
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <HiOutlineExclamationCircle className="h-5 w-5 flex-none" />
            {error}
          </div>
        )}

        <HiringFilter
          hiringForms={allHiringForms}
          filters={filter}
          onFilterChange={handleFilterChange}
        />

        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <HiringDataTable
            hiringForms={hiringForms}
            onEdit={(form) => {
              setEditingForm(form);
              setShowEditModal(true);
            }}
            onDelete={handleDelete}
            onView={(id) => navigate(`/hr/hiring-data/${id}`)}
          />
          {filteredForms.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredForms.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={filteredForms.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>

        <EditData
          hiringForm={editingForm}
          isOpen={showEditModal}
          onSuccess={handleEditSuccess}
          onCancel={() => {
            setShowEditModal(false);
            setEditingForm(null);
          }}
        />
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-950">{value}</p>
    </div>
  </div>
);

export default Hiringpages;
