import React from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS } from '../../utils/certificateConstants';
import SignatureUpload from './SignatureUpload';
import { Input, DatePicker, Textarea } from '../../ui';

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
          <Input
            name="employee_name"
            label={fields.employee_name?.label || 'Employee Name'}
            placeholder={fields.employee_name?.placeholder || 'Full Name'}
            value={formData.employee_name}
            onChange={handleInputChange}
            required
          />
          <Input
            name="position"
            label={fields.position?.label || 'Position'}
            placeholder={fields.position?.placeholder || 'Job Position'}
            value={formData.position}
            onChange={handleInputChange}
          />
        </div>

        
      </div>

      {/* Position & Appointment Details */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
          Start & Salary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            name="start_date"
            label={fields.start_date?.label || 'Start Date'}
            value={formData.start_date}
            onChange={handleInputChange}
          />
          <Input
            name="salary"
            label={fields.salary?.label || 'Monthly Salary'}
            placeholder={fields.salary?.placeholder || '₹30,000.00 per Month'}
            value={formData.salary}
            onChange={handleInputChange}
          />
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
