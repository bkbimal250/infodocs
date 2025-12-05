import React, { useEffect } from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS } from '../../utils/certificateConstants';
import { numberToWords } from '../../utils/certificateUtils';

/**
 * Manager Salary Certificate Form
 *
 * This form is aligned with the backend model:
 * ManagerSalaryCertificate (models.py 122-139)
 *
 * Fields used:
 * - manager_name
 * - position
 * - joining_date
 * - monthly_salary
 * - monthly_salary_in_words
 * - month_year_list (JSON list of months/years)
 * - month_salary_list (JSON list of salaries)
 */

const positionOptions = [
 "Manager",
 "Therapist",
 "Beautician",
 "Housekeeper",
 "Receptionist",
];


const ManagerSalaryCertificateForm = ({ formData, handleInputChange }) => {
  const config = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.MANAGER_SALARY] || {};

  const getFieldConfig = (name) =>
    (Array.isArray(config.fields) ? config.fields : []).find((field) => field.name === name) || {};

  const label = (name, fallback) => getFieldConfig(name).label || fallback;
  const placeholder = (name, fallback) => getFieldConfig(name).placeholder || fallback;

  // Ensure arrays for month/year + salary
  const monthYearList = Array.isArray(formData.month_year_list)
    ? formData.month_year_list
    : [];
  const monthSalaryList = Array.isArray(formData.month_salary_list)
    ? formData.month_salary_list
    : [];

  const rowCount = Math.max(monthYearList.length, monthSalaryList.length, 1);
  const rows = Array.from({ length: rowCount });

  // Convert "MON YYYY" format (e.g., "OCT 2024") to "YYYY-MM" format for date input
  const formatMonthYearToDate = (monthYear) => {
    if (!monthYear || !monthYear.trim()) return '';
    
    // Try to parse formats like "OCT 2024", "Oct 2024", "10 2024", etc.
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Try to match "MON YYYY" or "MON-YYYY" format
    const match = monthYear.match(/([A-Za-z]{3})[\s-]?(\d{4})/);
    if (match) {
      const monthStr = match[1].toUpperCase();
      const year = match[2];
      const monthIndex = monthNames.indexOf(monthStr) !== -1 
        ? monthNames.indexOf(monthStr) 
        : monthNamesShort.indexOf(match[1]);
      
      if (monthIndex !== -1) {
        const month = String(monthIndex + 1).padStart(2, '0');
        return `${year}-${month}`;
      }
    }
    
    // Try to parse "MM/YYYY" or "MM-YYYY" format
    const dateMatch = monthYear.match(/(\d{1,2})[\s/-](\d{4})/);
    if (dateMatch) {
      const month = String(parseInt(dateMatch[1], 10)).padStart(2, '0');
      const year = dateMatch[2];
      return `${year}-${month}`;
    }
    
    return '';
  };

  // Convert "YYYY-MM" format from date input to "MON YYYY" format
  const formatDateToMonthYear = (dateValue) => {
    if (!dateValue || !dateValue.trim()) return '';
    
    // If already in "MON YYYY" format, return as is
    if (/^[A-Z]{3}\s\d{4}$/.test(dateValue.trim().toUpperCase())) {
      return dateValue.trim().toUpperCase();
    }
    
    // Parse "YYYY-MM" format
    const match = dateValue.match(/(\d{4})-(\d{2})/);
    if (match) {
      const year = match[1];
      const monthIndex = parseInt(match[2], 10) - 1;
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${year}`;
      }
    }
    
    return dateValue;
  };

  const updateSalaryRow = (index, field, value) => {
    const years = Array.isArray(formData.month_year_list)
      ? [...formData.month_year_list]
      : Array.from({ length: rowCount }, () => '');
    const salaries = Array.isArray(formData.month_salary_list)
      ? [...formData.month_salary_list]
      : Array.from({ length: rowCount }, () => '');

    while (years.length < rowCount) years.push('');
    while (salaries.length < rowCount) salaries.push('');

    if (field === 'month') {
      // Convert date value (YYYY-MM) to MON YYYY format
      years[index] = formatDateToMonthYear(value);
    } else {
      salaries[index] = value;
    }

    handleInputChange({
      target: { name: 'month_year_list', value: years, type: 'text' },
    });
    handleInputChange({
      target: { name: 'month_salary_list', value: salaries, type: 'text' },
    });
  };

  const addRow = () => {
    const years = Array.isArray(formData.month_year_list)
      ? [...formData.month_year_list, '']
      : ['', ''];
    const salaries = Array.isArray(formData.month_salary_list)
      ? [...formData.month_salary_list, '']
      : ['', ''];

    handleInputChange({
      target: { name: 'month_year_list', value: years, type: 'text' },
    });
    handleInputChange({
      target: { name: 'month_salary_list', value: salaries, type: 'text' },
    });
  };

  const removeRow = (index) => {
    const years = Array.isArray(formData.month_year_list)
      ? [...formData.month_year_list]
      : [];
    const salaries = Array.isArray(formData.month_salary_list)
      ? [...formData.month_salary_list]
      : [];

    if (years.length <= 1 && salaries.length <= 1) {
      // Keep at least one empty row
      handleInputChange({
        target: { name: 'month_year_list', value: [''], type: 'text' },
      });
      handleInputChange({
        target: { name: 'month_salary_list', value: [''], type: 'text' },
      });
      return;
    }

    years.splice(index, 1);
    salaries.splice(index, 1);

    handleInputChange({
      target: { name: 'month_year_list', value: years, type: 'text' },
    });
    handleInputChange({
      target: { name: 'month_salary_list', value: salaries, type: 'text' },
    });
  };

  // Auto-calculate salary in words when monthly_salary changes
  useEffect(() => {
    if (formData.monthly_salary) {
      // Extract numeric value from salary string (remove Rs., commas, etc.)
      const salaryStr = formData.monthly_salary.toString().replace(/[^\d]/g, '');
      const salaryNum = parseInt(salaryStr, 10);
      
      if (!isNaN(salaryNum) && salaryNum > 0) {
        const words = numberToWords(salaryNum);
        // Only update if the field is empty or if it was auto-generated
        if (!formData.monthly_salary_in_words || formData.monthly_salary_in_words === '') {
          handleInputChange({
            target: { 
              name: 'monthly_salary_in_words', 
              value: `Rupees ${words}`,
              type: 'text' 
            },
          });
        }
      }
    }
  }, [formData.monthly_salary]);

  return (
    <div className="space-y-6">
      {/* Manager & Employment Details */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
          {config.title || 'Manager & Employment Details'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label('manager_name', 'Manager Name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="manager_name"
              value={formData.manager_name || ''}
              onChange={handleInputChange}
              placeholder={placeholder('manager_name', 'Full name of the manager')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label('position', 'Position / Designation')}
            </label>
            <select
              name="position"
              value={formData.position || ''}
              onChange={(e) => handleInputChange({ target: { name: 'position', value: e.target.value } })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Position</option>
              {positionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label('joining_date', 'Joining Date')}
            </label>
            <input
              type="date"
              name="joining_date"
              value={(() => {
                // Convert formatted date back to YYYY-MM-DD for date input
                if (!formData.joining_date) return '';
                // Check if already in YYYY-MM-DD format
                if (/^\d{4}-\d{2}-\d{2}$/.test(formData.joining_date)) {
                  return formData.joining_date;
                }
                // Try to parse formatted date (e.g., "15th Oct, 2025")
                const dateMatch = formData.joining_date.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+),\s+(\d+)/);
                if (dateMatch) {
                  const day = parseInt(dateMatch[1]);
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const monthIndex = monthNames.indexOf(dateMatch[2]);
                  const year = parseInt(dateMatch[3]);
                  if (monthIndex !== -1) {
                    const date = new Date(year, monthIndex, day);
                    if (!isNaN(date.getTime())) {
                      const yearStr = date.getFullYear();
                      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
                      const dayStr = String(date.getDate()).padStart(2, '0');
                      return `${yearStr}-${monthStr}-${dayStr}`;
                    }
                  }
                }
                return '';
              })()}
              onChange={(e) => {
                // Convert date to readable format (e.g., "15th Oct, 2025")
                if (e.target.value) {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    const day = date.getDate();
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const month = monthNames[date.getMonth()];
                    const year = date.getFullYear();
                    
                    // Add suffix to day
                    let daySuffix = 'th';
                    if (day === 1 || day === 21 || day === 31) daySuffix = 'st';
                    else if (day === 2 || day === 22) daySuffix = 'nd';
                    else if (day === 3 || day === 23) daySuffix = 'rd';
                    
                    const formattedDate = `${day}${daySuffix} ${month}, ${year}`;
                    handleInputChange({
                      target: { name: 'joining_date', value: formattedDate, type: 'text' },
                    });
                  }
                } else {
                  // Clear the date if input is cleared
                  handleInputChange({
                    target: { name: 'joining_date', value: '', type: 'text' },
                  });
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Salary Information */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
          Salary Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label('monthly_salary', 'Monthly Salary')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="monthly_salary"
              value={formData.monthly_salary || ''}
              onChange={handleInputChange}
              placeholder={placeholder('monthly_salary', '60000')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label('monthly_salary_in_words', 'Salary in Words')}
            </label>
            <input
              type="text"
              name="monthly_salary_in_words"
              value={formData.monthly_salary_in_words || ''}
              disabled
              placeholder={placeholder('monthly_salary_in_words', 'Rupees Sixty Thousand Only')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Salary Breakdown (Month / Salary) */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
          Salary Breakdown (Month-wise)
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
            <thead className="bg-green-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Month / Year
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Salary
                </th>
                <th className="px-3 py-2 text-sm font-semibold text-gray-700 border-b w-16 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((_, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="px-4 py-2">
                    <input
                      type="month"
                      value={formatMonthYearToDate(monthYearList[index] || '')}
                      onChange={(e) => updateSalaryRow(index, 'month', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={monthSalaryList[index] || ''}
                      onChange={(e) => updateSalaryRow(index, 'salary', e.target.value)}
                      placeholder="60000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-red-600 bg-red-50 rounded hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-4 inline-flex items-center px-3 py-2 border border-green-600 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
        >
          + Add Month
        </button>
      </div>
    </div>
  );
};

export default ManagerSalaryCertificateForm;
