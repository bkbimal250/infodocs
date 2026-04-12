import { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '../../api/Admin/adminApi';
import { hrApi } from '../../api/hr/hrApi';
import { managerApi } from '../../api/Manager/managerApi';
import { usersApi } from '../../api/Users/usersApi';
import { authApi } from '../../api/Auth/authApi';
import { HiSearch, HiX, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaMapMarkerAlt, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

/**
 * Premium SPA Select Component
 * High-performance, searchable dropdown with branch details
 * 
 * @param {Object} props
 * @param {string} props.value - Selected SPA ID
 * @param {Function} props.onChange - Callback when SPA is selected
 * @param {string} props.role - User role
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Label text
 * @param {string} props.excludeId - SPA ID to exclude from list
 * @param {string} props.placeholder - Search placeholder
 */
const SelectSpa = ({
  value,
  onChange,
  role = null,
  required = false,
  className = '',
  label = 'Branch Selection',
  excludeId = null,
  placeholder = 'Search by name, code, area, or city...'
}) => {
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spaSearch, setSpaSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(role);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userRole && !role) {
      const detectRole = async () => {
        try {
          const response = await authApi.getCurrentUser();
          const detectedRole = response.data?.role;
          if (detectedRole === 'super_admin') setUserRole('admin');
          else if (detectedRole === 'spa_manager') setUserRole('spa_manager');
          else setUserRole(detectedRole || 'user');
        } catch (err) {
          setUserRole('user');
        }
      };
      detectRole();
    } else if (role) {
      setUserRole(role);
    }
  }, [role]);

  const loadSpas = useCallback(async () => {
    if (!userRole) return;
    try {
      setLoading(true);
      setError(null);
      let response;
      switch (userRole) {
        case 'admin':
        case 'super_admin': response = await adminApi.forms.getSpas(); break;
        case 'hr': response = await hrApi.getSpas(); break;
        case 'spa_manager': response = await managerApi.getSpas(); break;
        default: response = await usersApi.getSpas(); break;
      }
      setSpas(response?.data || []);
    } catch (err) {
      console.error('Error loading SPAs:', err);
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole) loadSpas();
  }, [userRole, loadSpas]);

  const filteredSpas = spas
    .filter(s => String(s.id) !== String(excludeId))
    .filter(spa => {
      const search = spaSearch.toLowerCase();
      return (
        !spaSearch ||
        (spa.name && String(spa.name).toLowerCase().includes(search)) ||
        (spa.code && String(spa.code).toLowerCase().includes(search)) ||
        (spa.area && String(spa.area).toLowerCase().includes(search)) ||
        (spa.city && String(spa.city).toLowerCase().includes(search))
      );
    });

  const selectedSpa = spas.find(s => String(s.id) === String(value));

  const handleSelect = (spa) => {
    onChange({
      target: {
        name: 'spa_id',
        value: spa.id,
        spa: spa // Extra context if needed
      }
    });
    setSpaSearch(spa.name);
    setShowDropdown(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name: 'spa_id', value: '' } });
    setSpaSearch('');
  };

  return (
    <div className={`relative space-y-2 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400  tracking-widest ml-1">
          <HiOutlineLocationMarker className="text-blue-500 text-xs" />
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative group">
        <div
          className={`flex items-center gap-3 w-full px-5 py-3.5 bg-gray-50 border rounded-2xl transition-all ${showDropdown ? 'bg-white border-blue-500 shadow-xl shadow-blue-500/5' : 'border-gray-100 group-hover:bg-gray-100/50'}`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <HiSearch className={`text-xl ${showDropdown ? 'text-blue-500' : 'text-gray-400'}`} />
          <input
            type="text"
            className="flex-grow bg-transparent outline-none text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
            placeholder={placeholder}
            value={showDropdown ? spaSearch : (selectedSpa?.name || spaSearch)}
            onChange={(e) => {
              setSpaSearch(e.target.value);
              if (!showDropdown) setShowDropdown(true);
            }}
          />
          {value && (
            <button onClick={handleClear} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
              <HiX className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Total Count Badge */}
        {!showDropdown && !loading && spas.length > 0 && (
          <div className="absolute -top-6 right-2 flex items-center gap-1.5">
            <span className="text-[9px] font-black text-gray-300  tracking-tighter">Inventory: {spas.length} units</span>
          </div>
        )}

        {showDropdown && (
          <div className="absolute z-[60] w-full mt-2 bg-white border border-gray-100 rounded-[1.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <span className="text-[9px] font-black text-gray-400  tracking-widest pl-2">
                {spaSearch ? `Filtered: ${filteredSpas.length}` : `Total Branches: ${spas.length}`}
              </span>
              {loading && <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />}
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
              {filteredSpas.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs font-black text-gray-300  tracking-widest">No Intelligence Found</p>
                </div>
              ) : (
                filteredSpas.map((spa) => (
                  <button
                    key={spa.id}
                    type="button"
                    onClick={() => handleSelect(spa)}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between group ${String(value) === String(spa.id) ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-blue-50 text-gray-700'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${String(value) === String(spa.id) ? 'bg-white/20' : 'bg-white shadow-sm text-gray-400 group-hover:text-blue-600'}`}>
                        <FaMapMarkerAlt size={16} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-sm font-black leading-none flex items-center gap-2">
                          {spa.name}
                          {spa.code && <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${String(value) === String(spa.id) ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{spa.code}</span>}
                        </div>
                        <div className={`text-[10px] font-bold  tracking-tight flex items-center gap-2 ${String(value) === String(spa.id) ? 'text-white/70' : 'text-gray-400'}`}>
                          {spa.city || 'Regional'}
                          <span className="w-1 h-1 bg-current opacity-30 rounded-full" />
                          {spa.area || 'Core'}
                        </div>
                      </div>
                    </div>
                    {String(value) === String(spa.id) ? (
                      <FaCheckCircle className="text-white" />
                    ) : (
                      <FaArrowRight size={12} className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all text-blue-500" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && !loading && (
        <p className="text-[10px] font-black text-red-500  tracking-widest mt-1 ml-1">{error}</p>
      )}
    </div>
  );
};

export default SelectSpa;
