import React from "react";
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_FIELDS,
} from "../../utils/certificateConstants";
import ImageUpload from "./ImageUpload";

const IdCardForm = ({ formData, handleInputChange }) => {
  const config = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.ID_CARD] || {};
  const fields = config.fields || [];

  const getConfig = (name) => fields.find((f) => f.name === name) || {};

  const candidateField = getConfig("candidate_name");
  const designationField = getConfig("designation");
  const dojField = getConfig("date_of_joining");
  const contactField = getConfig("contact_number");
  const issueDateField = getConfig("issue_date");
  const photoField = getConfig("candidate_photo");

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
      {/* Candidate Info */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Candidate Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="candidate_name"
            label={candidateField.label || "Candidate Name"}
            placeholder={candidateField.placeholder || "Full Name"}
            required
          />
          <Input
            name="designation"
            label={designationField.label || "Designation"}
            placeholder={designationField.placeholder || "Spa Therapist"}
            required
          />
        </div>
      </div>

      {/* Employment Details */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Employment Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            name="date_of_joining"
            type="date"
            label={dojField.label || "Date of Joining"}
            required
          />
          <Input
            name="contact_number"
            label={contactField.label || "Contact Number"}
            placeholder={contactField.placeholder || "Mobile Number"}
            required
          />
          <Input
            name="issue_date"
            type="date"
            label={issueDateField.label || "Issue Date"}
          />
        </div>
      </div>

      {/* Candidate Photo */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Candidate Photo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload
            name="candidate_photo"
            value={formData.candidate_photo || ""}
            onChange={handleInputChange}
            label={photoField.label || "Candidate Photo"}
            // Use passport-like aspect ratio so ID card photo looks proper
            aspectRatio={3 / 4}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default IdCardForm;


