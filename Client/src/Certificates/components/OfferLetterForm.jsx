import React from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS } from '../../utils/certificateConstants';
import SignatureUpload from './SignatureUpload';

const OfferLetterForm = ({ formData, handleInputChange }) => {
  const config = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.OFFER_LETTER] || {};

  const renderInput = (name, props = {}) => (
    <input
      type={props.type || 'text'}
      name={name}
      value={formData[name] || ''}
      onChange={handleInputChange}
      placeholder={props.placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
      required={props.required}
    />
  );

  const renderTextarea = (name, props = {}) => (
    <textarea
      name={name}
      value={formData[name] || ''}
      onChange={handleInputChange}
      placeholder={props.placeholder}
      rows={props.rows || 3}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
    />
  );

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          Candidate Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Candidate Name <span className="text-red-500">*</span>
            </label>
            {renderInput('employee_name', {
              placeholder: 'Full Name',
              required: true,
            })}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Email</label>
            {renderInput('candidate_email', { type: 'email', placeholder: 'candidate@example.com' })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {renderInput('candidate_address', { placeholder: 'Residential address' })}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            {renderInput('candidate_phone', { type: 'tel', placeholder: '+91 9876543210' })}
          </div>
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          Position Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.fields?.find((f) => f.name === 'position')?.label || 'Position'}{' '}
              <span className="text-red-500">*</span>
            </label>
            {renderInput('position', {
              placeholder: config.fields?.find((f) => f.name === 'position')?.placeholder,
              required: true,
            })}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            {renderInput('department', { placeholder: 'Operations / Wellness / Front Desk' })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.fields?.find((f) => f.name === 'start_date')?.label || 'Start Date'}{' '}
              <span className="text-red-500">*</span>
            </label>
            {renderInput('start_date', { type: 'date', required: true })}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
            <select
              name="employment_type"
              value={formData.employment_type || 'Full-Time'}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Permanent">Permanent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          Compensation Package
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.fields?.find((f) => f.name === 'salary')?.label || 'Monthly Salary'}{' '}
              <span className="text-red-500">*</span>
            </label>
            {renderInput('salary', {
              type: 'number',
              placeholder: config.fields?.find((f) => f.name === 'salary')?.placeholder,
              required: true,
            })}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Currency</label>
            {renderInput('salary_currency', { placeholder: 'INR / USD / AED' })}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Benefits & Allowances
          </label>
          {renderTextarea('benefits', {
            placeholder: 'e.g., accommodation, meals, medical insurance, performance bonus',
            rows: 4,
          })}
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          Offer Terms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Expiry Date</label>
            {renderInput('offer_expiry_date', { type: 'date' })}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Probation Period</label>
            {renderInput('probation_period', { placeholder: 'e.g., 3 Months' })}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Terms & Conditions
          </label>
          {renderTextarea('terms', {
            placeholder: 'Any additional terms, reporting structure, or conditions...',
          })}
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          SPA/Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SPA Name</label>
            {renderInput('spa_name', { placeholder: 'SPA/Company Name' })}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager Name <span className="text-red-500">*</span>
            </label>
            {renderInput('manager_name', { placeholder: 'Hiring Manager', required: true })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Title</label>
            {renderInput('manager_title', { placeholder: 'HR Manager' })}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Signature Date</label>
            {renderInput('manager_signature_date', { type: 'date' })}
          </div>
        </div>

        <div className="mt-4">
          <SignatureUpload
            name="manager_signature"
            value={formData.manager_signature || ''}
            onChange={handleInputChange}
            label={config.fields?.find((f) => f.name === 'manager_signature')?.label || 'Manager Signature'}
            required={true}
          />
          <p className="text-xs text-gray-500 mt-2">
            You can also enter the manager's name as text if you prefer
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfferLetterForm;
