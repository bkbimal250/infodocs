import React from "react";
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_FIELDS,
} from "../../utils/certificateConstants";
import ImageUpload from "./ImageUpload";
import SignatureUpload from "./SignatureUpload";
import { Input } from "../../ui";

const UnderTakingSheet = ({ formData, handleInputChange }) => {
  const fields =
    CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.UNDER_TAKING_SHEET]?.fields || [];

  const getConfig = (name) => fields.find((f) => f.name === name) || {};

  const nameField = getConfig("employee_name");
  const positionField = getConfig("employee_position");
  const dateField = getConfig("date");
  const photoField = getConfig("employee_photo");
  const signatureField = getConfig("employee_signature");

  return (
    <div className="space-y-6">
      {/* Employee & Position Information */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Mandatory Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="employee_name"
            label={nameField.label || "Employee Name"}
            placeholder={nameField.placeholder || "Full Name"}
            value={formData.employee_name || ""}
            onChange={handleInputChange}
            required
          />
          <Input
            name="employee_position"
            label={positionField.label || "Position"}
            placeholder={positionField.placeholder || "Job Position"}
            value={formData.employee_position || ""}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            name="date"
            type="date"
            label={dateField.label || "Date of Undertaking"}
            value={formData.date || ""}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Identification & Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload
            name="employee_photo"
            value={formData.employee_photo || ""}
            onChange={handleInputChange}
            label={photoField.label || "Employee Photo"}
            aspectRatio={3 / 4}
          />

          <SignatureUpload
            name="employee_signature"
            value={formData.employee_signature || ""}
            onChange={handleInputChange}
            label={signatureField.label || "Employee Signature"}
          />
        </div>
      </div>
    </div>
  );
};

export default UnderTakingSheet;
