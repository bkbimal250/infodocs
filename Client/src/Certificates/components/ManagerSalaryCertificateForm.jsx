import React from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS } from '../../utils/certificateConstants';

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
      years[index] = value;
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
            <input
              type="text"
              name="position"
              value={formData.position || ''}
              onChange={handleInputChange}
              placeholder={placeholder('position', 'Manager')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label('joining_date', 'Joining Date')}
            </label>
            <input
              type="text"
              name="joining_date"
              value={formData.joining_date || ''}
              onChange={handleInputChange}
              placeholder={placeholder('joining_date', '15th Oct, 2025')}
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
              onChange={handleInputChange}
              placeholder={placeholder('monthly_salary_in_words', 'Sixty Thousand Only')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      type="text"
                      value={monthYearList[index] || ''}
                      onChange={(e) => updateSalaryRow(index, 'month', e.target.value)}
                      placeholder="Oct 2025"
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
