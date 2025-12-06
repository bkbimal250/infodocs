import React from "react";
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_FIELDS,
} from "../../utils/certificateConstants";
import ImageUpload from "./ImageUpload";
import SignatureUpload from "./SignatureUpload";
import { Input, Select } from "../../ui";

const courseNameOptions = [
  "Diploma in Spa Therapy",
  "Diploma in Beautician",
];

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

  return (
    <div className="space-y-6">


      {/* Course Information */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
    

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
            name="course_name"
            options={courseNameOptions}
            value={formData.course_name}
            onChange={handleInputChange}
            label={courseNameField.label || "Course Name"}
            required
          />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            name="start_date"
            type="date"
            label={startDateField.label || "Start Date"}
            value={formData.start_date}
            onChange={handleInputChange}
            required
          />

          <Input
            name="end_date"
            type="date"
            label={endDateField.label || "End Date"}
            value={formData.end_date}
            onChange={handleInputChange}
            required
          />
        </div>
        
      </div>

      {/* Attachments */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">

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
