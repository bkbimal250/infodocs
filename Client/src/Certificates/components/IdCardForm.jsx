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
    <div className="space-y-5 text-sm">
      {/* Candidate Info */}
      <div className="rounded-xl border border-slate-200 bg-white/90 shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
              1
            </span>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-slate-900">
                Candidate Information
              </h3>
              <p className="text-xs text-slate-500">
                Basic details to be printed on the ID card.
              </p>
            </div>
          </div>
        </div>

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
            placeholder="Select designation"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
      <div className="rounded-xl border border-slate-200 bg-white/90 shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
              2
            </span>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-slate-900">
                Candidate Photo
              </h3>
              <p className="text-xs text-slate-500">
                Upload a clear, passport-style photo for the ID card.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <ImageUpload
            name="candidate_photo"
            value={formData.candidate_photo || ""}
            onChange={handleInputChange}
            label={photoField.label || "Candidate Photo"}
            aspectRatio={3 / 4} // passport-like ratio
            required
          />
          <div className="hidden md:block text-xs  leading-relaxed">
            <ul className="list-disc list-inside text-red-500  space-y-1 mt-4">
              <li>Use a recent, professional-looking photo.</li>
              <li>Keep the face clearly visible with plain background.</li>
              <li>Recommended size: similar to passport photo dimensions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdCardForm;
