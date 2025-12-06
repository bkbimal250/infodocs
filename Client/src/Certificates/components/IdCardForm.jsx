import React from "react";
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_FIELDS,
} from "../../utils/certificateConstants";
import ImageUpload from "./ImageUpload";
import { Input, Select, DatePicker } from "../../ui";

const designationOptions = [
  "Therapist",
  "Manager",
  "Receptionist",
  "House keeper",
  "Beautician",
];

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
            value={formData.candidate_name}
            onChange={handleInputChange}
            required
          />
          <Select
            name="designation"
            label={designationField.label || "Designation"}
            options={designationOptions}
            value={formData.designation}
            onChange={handleInputChange}
            placeholder="Select Designation"
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
          <DatePicker
            name="date_of_joining"
            label={dojField.label || "Date of Joining"}
            value={formData.date_of_joining}
            onChange={handleInputChange}
            required
          />
          <Input
            name="contact_number"
            label={contactField.label || "Contact Number"}
            placeholder={contactField.placeholder || "Mobile Number"}
            value={formData.contact_number}
            onChange={handleInputChange}
            required
          />
          <DatePicker
            name="issue_date"
            label={issueDateField.label || "Issue Date"}
            value={formData.issue_date}
            onChange={handleInputChange}
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


