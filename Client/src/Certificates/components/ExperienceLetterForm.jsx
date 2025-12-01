import React from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS } from '../../utils/certificateConstants';

const ExperienceLetterForm = ({ formData, handleInputChange }) => {
  const config = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.EXPERIENCE_LETTER] || {};
  const fields = Array.isArray(config.fields) ? config.fields : [];
  const findField = (name) => fields.find((field) => field.name === name) || {};

  const renderInput = (name, type) => {
    const field = findField(name);
    const commonProps = {
      name,
      value: formData[name] || '',
      onChange: handleInputChange,
      placeholder: field.placeholder,
      className:
        'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
    };

    if (field.type === 'textarea' || type === 'textarea') {
      return <textarea {...commonProps} rows="3" />;
    }

    return <input {...commonProps} type={type || field.type || 'text'} />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Employee Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {findField('candidate_name').label || 'Employee Name'}{' '}
              <span className="text-red-500">*</span>
            </label>
            {renderInput('candidate_name')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {findField('position').label || 'Position'} <span className="text-red-500">*</span>
            </label>
            {renderInput('position')}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Employment Period
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {findField('joining_date').label || 'Joining Date'}{' '}
              <span className="text-red-500">*</span>
            </label>
            {renderInput('joining_date')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {findField('end_date').label || 'End Date'} <span className="text-red-500">*</span>
            </label>
            {renderInput('end_date')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {findField('duration').label || 'Duration'}
            </label>
            {renderInput('duration')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {findField('salary').label || 'Salary'}
            </label>
            {renderInput('salary')}
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default ExperienceLetterForm;
