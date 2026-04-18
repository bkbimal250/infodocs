import React from "react";
import {
    CERTIFICATE_CATEGORIES,
    CERTIFICATE_FIELDS,
} from "../../utils/certificateConstants";
import ImageUpload from "./ImageUpload";
import SignatureUpload from "./SignatureUpload";
import { Input, Textarea } from "../../ui";

const JobFormsheet = ({ formData, handleInputChange }) => {
    const fields =
        CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.JOB_FORM_SHEET]?.fields || [];

    const getConfig = (name) => fields.find((f) => f.name === name) || {};

    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        name="first_name"
                        label={getConfig("first_name").label || "First Name"}
                        value={formData.first_name || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="middle_name"
                        label={getConfig("middle_name").label || "Middle Name"}
                        value={formData.middle_name || ""}
                        onChange={handleInputChange}
                    />
                    <Input
                        name="last_name"
                        label={getConfig("last_name").label || "Last Name"}
                        value={formData.last_name || ""}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input
                        name="phone"
                        label={getConfig("phone").label || "Phone Number"}
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="alt_phone"
                        label={getConfig("alt_phone").label || "Alternate Phone"}
                        value={formData.alt_phone || ""}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input
                        name="age"
                        label={getConfig("age").label || "Age"}
                        value={formData.age || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="age_proof"
                        label={getConfig("age_proof").label || "Age Proof"}
                        placeholder="e.g. Aadhar Card"
                        value={formData.age_proof || ""}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            {/* Address Information */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Address Details</h3>
                <div className="grid grid-cols-1 gap-4">
                    <Textarea
                        name="address"
                        label={getConfig("address").label || "Full Address"}
                        value={formData.address || ""}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Input
                        name="city"
                        label={getConfig("city").label || "City"}
                        value={formData.city || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="state"
                        label={getConfig("state").label || "State"}
                        value={formData.state || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="zip_code"
                        label={getConfig("zip_code").label || "Zip Code"}
                        value={formData.zip_code || ""}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>

            {/* Professional Information */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        name="position_applied"
                        label={getConfig("position_applied").label || "Position Applied For"}
                        value={formData.position_applied || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="date"
                        type="date"
                        label={getConfig("date").label || "Application Date"}
                        value={formData.date || ""}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mt-4">
                    <Textarea
                        name="skills"
                        label={getConfig("skills").label || "Skills & Experience"}
                        value={formData.skills || ""}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            {/* Attachments */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Attachments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUpload
                        name="employee_photo"
                        value={formData.employee_photo || ""}
                        onChange={handleInputChange}
                        label={getConfig("employee_photo").label || "Passport Photo"}
                        aspectRatio={3 / 4}
                    />

                    <SignatureUpload
                        name="employee_signature"
                        value={formData.employee_signature || ""}
                        onChange={handleInputChange}
                        label={getConfig("employee_signature").label || "Signature"}
                    />
                </div>
            </div>
        </div>
    );
};

export default JobFormsheet;
