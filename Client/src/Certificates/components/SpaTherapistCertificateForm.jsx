import React from "react";
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_FIELDS,
} from "../../utils/certificateConstants";
import ImageUpload from "./ImageUpload";
import SignatureUpload from "./SignatureUpload";

const SpaTherapistCertificateForm = ({ formData, handleInputChange }) => {
  const fields =
    CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.SPA_THERAPIST]?.fields || [];

  const getConfig = (name) => fields.find((f) => f.name === name) || {};

  const candidateField = getConfig("candidate_name");
  const courseNameField = getConfig("course_name");
  const startDateField = getConfig("start_date");
  const endDateField = getConfig("end_date");
  const passportPhotoField = getConfig("passport_size_photo");
  const signatureField = getConfig("candidate_signature");

  // -----------------------------
  // INPUT COMPONENT (TEXT)
  // -----------------------------
  const Input = ({
    label,
    required,
    name,
    type = "text",
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
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required={required}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Candidate Information */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Recipient Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="candidate_name"
            label={candidateField.label || "Candidate Name"}
            placeholder={candidateField.placeholder || "Full Name"}
            required
          />
        </div>
      </div>

      {/* Course Information */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Course Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="course_name"
            label={courseNameField.label || "Course Name"}
            placeholder={
              courseNameField.placeholder ||
              "Professional Spa Therapy & Beautician Course"
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            name="start_date"
            type="date"
            label={startDateField.label || "Start Date"}
            required
          />

          <Input
            name="end_date"
            type="date"
            label={endDateField.label || "End Date"}
            required
          />
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Attachments
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload
            name="passport_size_photo"
            value={formData.passport_size_photo || ""}
            onChange={handleInputChange}
            label={passportPhotoField.label || "Passport Size Photo"}
            aspectRatio={3 / 4} // Standard passport photo aspect ratio
          />

          <SignatureUpload
            name="candidate_signature"
            value={formData.candidate_signature || ""}
            onChange={handleInputChange}
            label={signatureField.label || "Candidate Signature"}
          />
        </div>
      </div>
    </div>
  );
};

export default SpaTherapistCertificateForm;
