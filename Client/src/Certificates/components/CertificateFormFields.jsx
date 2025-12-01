/**
 * Certificate Form Components
 * Fixed unified handleInputChange format 
 */

import React from "react";

const Input = ({
  label,
  name,
  formData,
  handleInputChange,
  type = "text",
  required,
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    <input
      type={type}
      name={name}
      value={formData[name] || ""}
      placeholder={placeholder}
      required={required}
      onChange={(e) =>
        handleInputChange({
          target: { name, value: e.target.value },
        })
      }
      className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const TextArea = ({
  label,
  name,
  formData,
  handleInputChange,
  rows = 3,
  placeholder,
}) => (
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>

    <textarea
      name={name}
      value={formData[name] || ""}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) =>
        handleInputChange({
          target: { name, value: e.target.value },
        })
      }
      className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-blue-500 focus-border-transparent"
    />
  </div>
);

/* ManagerSalaryCertificate */
export const SalaryCertificateForm = ({ formData, handleInputChange }) => (
  <div className="border-b border-gray-200 pb-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Manager Salary Certificate
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Manager Name" name="manager_name" formData={formData} handleInputChange={handleInputChange} required />
      <Input label="Position" name="position" formData={formData} handleInputChange={handleInputChange} />
      <Input label="Joining Date" name="joining_date" formData={formData} handleInputChange={handleInputChange} />
      <Input label="Monthly Salary" name="monthly_salary" formData={formData} handleInputChange={handleInputChange} />
      <Input label="Salary (in words)" name="monthly_salary_in_words" formData={formData} handleInputChange={handleInputChange} />
      <TextArea
        label="Salary Breakdown (JSON)"
        name="month_salary_data"
        formData={formData}
        handleInputChange={handleInputChange}
      />
    </div>
  </div>
);

/* ExperienceCertificateForm */
export const ExperienceCertificateForm = ({ formData, handleInputChange }) => (
  <div className="border-b border-gray-200 pb-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Experience Letter
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Employee Name" name="candidate_name" formData={formData} handleInputChange={handleInputChange} required />
      <Input label="Position" name="position" formData={formData} handleInputChange={handleInputChange} required />
      <Input label="Joining Date" name="joining_date" formData={formData} handleInputChange={handleInputChange} required />
      <Input label="End Date" name="end_date" formData={formData} handleInputChange={handleInputChange} required />
      <Input label="Duration" name="duration" formData={formData} handleInputChange={handleInputChange} />
      <Input label="Salary" name="salary" formData={formData} handleInputChange={handleInputChange} />
      <TextArea label="Performance Description" name="performance_description" formData={formData} handleInputChange={handleInputChange} />
    </div>
  </div>
);

/* AppointmentCertificateForm */
export const AppointmentCertificateForm = ({ formData, handleInputChange }) => (
  <div className="border-b border-gray-200 pb-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Appointment Letter
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Employee Name" name="employee_name" formData={formData} handleInputChange={handleInputChange} required />
      <Input label="Position" name="position" formData={formData} handleInputChange={handleInputChange} />
      <Input label="Start Date" name="start_date" formData={formData} handleInputChange={handleInputChange} />
      <Input label="Salary" name="salary" formData={formData} handleInputChange={handleInputChange} />
      <Input label="Manager Signature (name/URL)" name="manager_signature" formData={formData} handleInputChange={handleInputChange} />
    </div>
  </div>
);

/* OfferLetterForm */
export const OfferLetterForm = AppointmentCertificateForm;

/* SpaTherapistCertificateForm */
export const SpatherapistCertificateForm = ({
  formData,
  handleInputChange,
}) => (
  <div className="border-b border-gray-200 pb-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Spa Therapist Certificate
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Candidate Name" name="candidate_name" formData={formData} handleInputChange={handleInputChange} required />
      <Input label="Course Name" name="course_name" formData={formData} handleInputChange={handleInputChange} />
      <Input label="Start Date" type="date" name="start_date" formData={formData} handleInputChange={handleInputChange} />
      <Input label="End Date" type="date" name="end_date" formData={formData} handleInputChange={handleInputChange} />
      <Input label="Passport Photo URL" name="passport_size_photo" formData={formData} handleInputChange={handleInputChange} />
      <Input label="Candidate Signature URL" name="candidate_signature" formData={formData} handleInputChange={handleInputChange} />
    </div>
  </div>
);



export default {
  SalaryCertificateForm,
  ExperienceCertificateForm,
  AppointmentCertificateForm,
  OfferLetterForm,
  SpatherapistCertificateForm,
};
