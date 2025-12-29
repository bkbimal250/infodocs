import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/Admin/adminApi';
import { hrApi } from '../../api/hr/hrApi';
import { managerApi } from '../../api/Manager/managerApi';
import { usersApi } from '../../api/Users/usersApi';
import { authApi } from '../../api/Auth/authApi';

/**
 * Reusable SPA Select Component
 * Can be used across all query forms and other components
 * 
 * @param {Object} props
 * @param {string} props.value - Selected SPA ID
 * @param {Function} props.onChange - Callback when SPA is selected
 * @param {string} props.role - User role ('admin', 'hr', 'spa_manager', 'user') - auto-detected if not provided
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Label text
 * @param {boolean} props.showSearch - Whether to show search input
 */
const SelectSpa = ({ 
  value, 
  onChange, 
  role = null, 
  required = false,
  className = '',
  label = 'SPA',
  showSearch = true
}) => {
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spaSearch, setSpaSearch] = useState('');
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(role);

  useEffect(() => {
    // Auto-detect role if not provided
    if (!userRole && !role) {
      const detectRole = async () => {
        try {
          const response = await authApi.getCurrentUser();
          const detectedRole = response.data?.role;
          // Map role names
          if (detectedRole === 'super_admin') {
            setUserRole('admin');
          } else if (detectedRole === 'spa_manager') {
            setUserRole('spa_manager');
          } else {
            setUserRole(detectedRole || 'user');
          }
        } catch (err) {
          // If not authenticated, default to user
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
        case 'super_admin':
          response = await adminApi.forms.getSpas();
          break;
        case 'hr':
          response = await hrApi.getSpas();
          break;
        case 'spa_manager':
          response = await managerApi.getSpas();
          break;
        case 'user':
        default:
          // Use the same endpoint as other roles for users
          response = await usersApi.getSpas();
          break;
      }
      
      if (response && response.data) {
        setSpas(response.data || []);
      } else {
        setSpas([]);
      }
    } catch (err) {
      console.error('Error loading SPAs:', err);
      setError('Failed to load SPAs. Please try again.');
      setSpas([]);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole) {
      loadSpas();
    }
  }, [userRole, loadSpas]);

  // Filter SPAs based on search
  const filteredSpas = spas.filter((spa) => {
    if (!spaSearch) return true;
    const searchLower = spaSearch.toLowerCase();
    return (
      (spa.name && String(spa.name).toLowerCase().includes(searchLower)) ||
      (spa.code && String(spa.code).toLowerCase().includes(searchLower)) ||
      (spa.area && String(spa.area).toLowerCase().includes(searchLower)) ||
      (spa.city && String(spa.city).toLowerCase().includes(searchLower))
    );
  });

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    onChange({
      target: {
        name: 'spa_id',
        value: selectedId,
      },
    });
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {showSearch && (
        <div className="relative mb-2">
          <input
            type="text"
            value={spaSearch}
            onChange={(e) => setSpaSearch(e.target.value)}
            placeholder="Search by name, code, area, or city"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {spaSearch && (
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {filteredSpas.length} {filteredSpas.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <span className="text-sm text-gray-500">Loading SPAs...</span>
        </div>
      ) : error ? (
        <div className="w-full px-4 py-2 border border-red-300 rounded-lg bg-red-50">
          <span className="text-sm text-red-600">{error}</span>
        </div>
      ) : (
        <select
          name="spa_id"
          value={value || ''}
          onChange={handleSelectChange}
          required={required}
          size={spaSearch && filteredSpas.length > 0 ? Math.min(filteredSpas.length + 1, 8) : 1}
          className={`w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            !value && required ? 'border-red-300' : 'border-gray-300'
          } ${spaSearch && filteredSpas.length > 0 ? 'overflow-y-auto' : ''} ${className}`}
        >
          <option value="">
            -- Select SPA {spaSearch && filteredSpas.length > 0 ? `(${filteredSpas.length} found)` : ''} --
          </option>
          {filteredSpas.length > 0 ? (
            filteredSpas.map((spa) => (
              <option key={spa.id} value={spa.id}>
                {spa.code ? `[${spa.code}] ` : ''}{spa.name}
                {spa.area ? ` - ${spa.area}` : ''}
                {spa.city ? `, ${spa.city}` : ''}
              </option>
            ))
          ) : spaSearch ? (
            <option value="" disabled>
              No SPAs found matching "{spaSearch}"
            </option>
          ) : (
            spas.map((spa) => (
              <option key={spa.id} value={spa.id}>
                {spa.code ? `[${spa.code}] ` : ''}{spa.name}
                {spa.area ? ` - ${spa.area}` : ''}
                {spa.city ? `, ${spa.city}` : ''}
              </option>
            ))
          )}
        </select>
      )}
      
      {!value && required && !spaSearch && (
        <p className="mt-1 text-xs text-red-600">Please select a SPA location</p>
      )}
    </div>
  );
};

export default SelectSpa;
