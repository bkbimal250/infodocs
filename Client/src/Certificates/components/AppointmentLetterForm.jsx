import React from "react";
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_FIELDS,
} from "../../utils/certificateConstants";
import SignatureUpload from "./SignatureUpload";
import { Input, Select, DatePicker } from "../../ui";

const positionOptions = [
  "Manager",
  "Therapist",
  "Beautician",
  "Housekeeper",
  "Receptionist",
];

const AppointmentLetterForm = ({ formData, handleInputChange }) => {
  const config = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.APPOINTMENT_LETTER] || {};
  const fields = config.fields || [];

  const getConfig = (name) => fields.find((f) => f.name === name) || {};

  const employeeNameField = getConfig("employee_name");
  const positionField = getConfig("position");
  const startDateField = getConfig("start_date");
  const salaryField = getConfig("salary");
  const signatureField = getConfig("manager_signature");

  return (
    <div className="space-y-6">
      {/* Employee Information */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
          Employee Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="employee_name"
            label={employeeNameField.label || "Employee Name"}
            placeholder={employeeNameField.placeholder || "Full Name"}
            value={formData.employee_name}
            onChange={handleInputChange}
            required
          />
          <Select
            name="position"
            label={positionField.label || "Position"}
            options={positionOptions}
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Select Position"
          />
          <DatePicker
            name="start_date"
            label={startDateField.label || "Start Date"}
            value={formData.start_date}
            onChange={handleInputChange}
            required
          />
          <Input
            name="salary"
            label={salaryField.label || "Monthly Salary"}
            placeholder={salaryField.placeholder || "₹30,000.00 per Month"}
            value={formData.salary}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      {/* Manager Signature */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
          Manager Signature
        </h3>
        <SignatureUpload
          name="manager_signature"
          value={formData.manager_signature }
          onChange={handleInputChange}
          label={signatureField.label}
        />
      </div>
    </div>
  );
};

export default AppointmentLetterForm;
