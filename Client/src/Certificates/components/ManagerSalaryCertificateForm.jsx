import React from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS } from '../../utils/certificateConstants';

/**
 * Manager Salary Certificate Form Component
 * 
 * Handles form inputs for Salary Verification/Manager Salary certificates.
 * Fields: Position, salary, designation, SPA details, and salary breakdown
 */
const ManagerSalaryCertificateForm = ({ formData, handleInputChange }) => {
  const config = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.MANAGER_SALARY] || {};
  const configFields = Array.isArray(config.fields) ? config.fields : [];

  const getFieldConfig = (name) => configFields.find((field) => field.name === name) || {};
  const getLabel = (name, fallback) => getFieldConfig(name).label || fallback;
  const getPlaceholder = (name, fallback) => getFieldConfig(name).placeholder || fallback;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
          {config.title || "Manager Information"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || field.defaultValue || ''}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Salary Information Section */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
          Salary Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getLabel('monthly_salary', 'Monthly Salary')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="monthly_salary"
              value={formData.monthly_salary || ''}
              onChange={handleInputChange}
              placeholder={getPlaceholder('monthly_salary', 'Rs. 40,000/-')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getLabel('monthly_salary_in_words', 'Salary in Words')}
            </label>
            <input
              type="text"
              name="monthly_salary_in_words"
              value={formData.monthly_salary_in_words || ''}
              onChange={handleInputChange}
              placeholder={getPlaceholder('monthly_salary_in_words', 'Rupees Forty Thousand Only')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getLabel('position', 'Position')}
            </label>
            <input
              type="text"
              name="position"
              value={formData.position || ''}
              onChange={handleInputChange}
              placeholder={getPlaceholder('position', 'Manager')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getLabel('joining_date', 'Joining Date')}
            </label>
            <input
              type="text"
              name="joining_date"
              value={formData.joining_date || ''}
              onChange={handleInputChange}
              placeholder={getPlaceholder('joining_date', '15th Oct, 2025')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* SPA Details Section */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
          SPA/Company Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getLabel('spa_name', 'SPA Name')}
            </label>
            <input
              type="text"
              name="spa_name"
              value={formData.spa_name || ''}
              onChange={handleInputChange}
              placeholder={getPlaceholder('spa_name', 'SPA/Company Name')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signatory Name
            </label>
            <input
              type="text"
              name="signatory_name"
              value={formData.signatory_name || ''}
              onChange={handleInputChange}
              placeholder="Authorized signatory name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SPA Address</label>
            <textarea
              name="spa_address"
              value={formData.spa_address || ''}
              onChange={handleInputChange}
              rows="3"
              placeholder="Full Address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SPA Phone(s)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                name="spa_phone"
                value={formData.spa_phone || ''}
                onChange={handleInputChange}
                placeholder="Primary Phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                name="spa_phone1"
                value={formData.spa_phone1 || ''}
                onChange={handleInputChange}
                placeholder="Alternate Phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signatory Title
            </label>
            <input
              type="text"
              name="signatory_title"
              value={formData.signatory_title || ''}
              onChange={handleInputChange}
              placeholder="Manager / Owner"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signature Date
            </label>
            <input
              type="date"
              name="signature_date"
              value={formData.signature_date || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
          Additional Information
        </h3>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks/Notes
        </label>
        <textarea
          name="remarks"
          value={formData.remarks || ''}
          onChange={handleInputChange}
          placeholder="Any additional remarks or notes"
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default ManagerSalaryCertificateForm;
