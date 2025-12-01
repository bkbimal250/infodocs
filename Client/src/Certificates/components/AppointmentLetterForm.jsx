import React from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS } from '../../utils/certificateConstants';
import SignatureUpload from './SignatureUpload';

/**
 * Appointment Letter Form Component
 * 
 * Handles form inputs for Appointment/Joining Letter certificates.
 * Fields: Position, start date, salary, manager signature, and company details
 */
const AppointmentLetterForm = ({ formData, handleInputChange }) => {
  const fields = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.APPOINTMENT_LETTER] || {};

  return (
    <div className="space-y-6">
      {/* Candidate Information Section */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
          Candidate Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {(fields.employee_name?.label || 'Employee Name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employee_name"
              value={formData.employee_name || ''}
              onChange={handleInputChange}
              placeholder={fields.employee_name?.placeholder || 'Full Name'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {(fields.position?.label || 'Position')}
            </label>
            <input
              type="text"
              name="position"
              value={formData.position || ''}
              onChange={handleInputChange}
              placeholder={fields.position?.placeholder || 'Job Position'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          
        </div>

        
      </div>

      {/* Position & Appointment Details */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
          Start & Salary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {(fields.start_date?.label || 'Start Date')}
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {(fields.salary?.label || 'Monthly Salary')}
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary || ''}
              onChange={handleInputChange}
              placeholder={fields.salary?.placeholder || '₹30,000.00 per Month'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>

        
      </div>

      {/* Manager Signature */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
          Authorization
        </h3>
        <div>
          <SignatureUpload
            name="manager_signature"
            value={formData.manager_signature || ''}
            onChange={handleInputChange}
            label={fields.manager_signature?.label || 'Manager Signature'}
          />
          <p className="text-xs text-gray-500 mt-2">
            You can also enter the manager's name as text if you prefer
          </p>
        </div>
      </div>

      
    </div>
  );
};

export default AppointmentLetterForm;
