import React from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS } from '../../utils/certificateConstants';
import SignatureUpload from './SignatureUpload';
import { Input, Select, DatePicker, Textarea } from '../../ui';

const OfferLetterForm = ({ formData, handleInputChange }) => {
  const config = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.OFFER_LETTER] || {};

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          Candidate Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="employee_name"
            label="Candidate Name"
            placeholder="Full Name"
            value={formData.employee_name}
            onChange={handleInputChange}
            required
          />
          <Input
            name="candidate_email"
            type="email"
            label="Candidate Email"
            placeholder="candidate@example.com"
            value={formData.candidate_email}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            name="candidate_address"
            label="Address"
            placeholder="Residential address"
            value={formData.candidate_address}
            onChange={handleInputChange}
          />
          <Input
            name="candidate_phone"
            type="tel"
            label="Phone Number"
            placeholder="+91 9876543210"
            value={formData.candidate_phone}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          Position Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="position"
            label={config.fields?.find((f) => f.name === 'position')?.label || 'Position'}
            placeholder={config.fields?.find((f) => f.name === 'position')?.placeholder}
            value={formData.position}
            onChange={handleInputChange}
            required
          />
          <Input
            name="department"
            label="Department"
            placeholder="Operations / Wellness / Front Desk"
            value={formData.department}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <DatePicker
            name="start_date"
            label={config.fields?.find((f) => f.name === 'start_date')?.label || 'Start Date'}
            value={formData.start_date}
            onChange={handleInputChange}
            required
          />
          <Select
            name="employment_type"
            label="Employment Type"
            options={['Full-Time', 'Part-Time', 'Contract', 'Permanent']}
            value={formData.employment_type || 'Full-Time'}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          Compensation Package
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="salary"
            type="number"
            label={config.fields?.find((f) => f.name === 'salary')?.label || 'Monthly Salary'}
            placeholder={config.fields?.find((f) => f.name === 'salary')?.placeholder}
            value={formData.salary}
            onChange={handleInputChange}
            required
          />
          <Input
            name="salary_currency"
            label="Salary Currency"
            placeholder="INR / USD / AED"
            value={formData.salary_currency}
            onChange={handleInputChange}
          />
        </div>

        <div className="mt-4">
          <Textarea
            name="benefits"
            label="Benefits & Allowances"
            placeholder="e.g., accommodation, meals, medical insurance, performance bonus"
            value={formData.benefits}
            onChange={handleInputChange}
            rows={4}
          />
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          Offer Terms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            name="offer_expiry_date"
            label="Offer Expiry Date"
            value={formData.offer_expiry_date}
            onChange={handleInputChange}
          />
          <Input
            name="probation_period"
            label="Probation Period"
            placeholder="e.g., 3 Months"
            value={formData.probation_period}
            onChange={handleInputChange}
          />
        </div>
        <div className="mt-4">
          <Textarea
            name="terms"
            label="Additional Terms & Conditions"
            placeholder="Any additional terms, reporting structure, or conditions..."
            value={formData.terms}
            onChange={handleInputChange}
            rows={4}
          />
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          SPA/Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="spa_name"
            label="SPA Name"
            placeholder="SPA/Company Name"
            value={formData.spa_name}
            onChange={handleInputChange}
          />
          <Input
            name="manager_name"
            label="Manager Name"
            placeholder="Hiring Manager"
            value={formData.manager_name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            name="manager_title"
            label="Manager Title"
            placeholder="HR Manager"
            value={formData.manager_title}
            onChange={handleInputChange}
          />
          <DatePicker
            name="manager_signature_date"
            label="Signature Date"
            value={formData.manager_signature_date}
            onChange={handleInputChange}
          />
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
