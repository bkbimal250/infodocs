import React from 'react';
import { Input, Select, Textarea, Label, Checkbox } from '../../ui';

/**
 * Personal Information Component
 * Handles all personal, address, contact, and experience information
 */

const positions = [
  'Therapist',
  'Receptionist',
  'Manager',
  'House Keeping',
  'Beautician'
 
];


const countries = [
  'India',
  'Nepal',
  'Pakistan',
  
];

const work_experience_options = [
  '0-1 year',
  '1-2 years',
  '2-3 years',
  '3-4 years',
  '4+ years',
];

const therapist_experience_options = [
  '0-1 year',
  '1-2 years',
  '2-3 years',
  '3-4 years',
  '4+ years',
];

const state_options = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Lakshadweep',
  'Puducherry'
];



const PersonalInformation = ({ formData, handleInputChange }) => {
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = React.useState(false);
  const [stateSearch, setStateSearch] = React.useState('');

  // Handle checkbox change
  const handleSameAddressChange = (e) => {
    const checked = e.target.checked;
    setSameAsCurrentAddress(checked);
    
    if (checked) {
      // Copy current address to aadhar address
      handleInputChange({
        target: {
          name: 'aadhar_address',
          value: formData.current_address
        }
      });
    }
  };

  // Sync aadhar address when current address changes and checkbox is checked
  React.useEffect(() => {
    if (sameAsCurrentAddress && formData.current_address) {
      handleInputChange({
        target: {
          name: 'aadhar_address',
          value: formData.current_address
        }
      });
    } else if (!sameAsCurrentAddress && formData.aadhar_address === formData.current_address) {
      // If unchecked and addresses are the same, clear aadhar address to allow manual entry
      // Only clear if they match (were synced)
    }
  }, [formData.current_address, sameAsCurrentAddress, formData.aadhar_address]);

  // Filter states based on search
  const filteredStates = state_options.filter((state) => {
    if (!stateSearch) return true;
    return state.toLowerCase().includes(stateSearch.toLowerCase());
  });

  return (
    <>
      {/* Personal Information */}
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <Label required className="mb-1">
              First Name
            </Label>
            <Input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label className="mb-1">Middle Name</Label>
            <Input
              type="text"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label required className="mb-1">Last Name</Label>
            <Input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Address Information
        </h2>
        <div className="space-y-2">
          <div>
            <Label required className="mb-1">
              Current Address
            </Label>
            <Textarea
              name="current_address"
              value={formData.current_address}
              onChange={handleInputChange}
              required
              rows={2}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>
                Aadhar Address
              </Label>
              <Checkbox
                name="same_as_current_address"
                checked={sameAsCurrentAddress}
                onChange={handleSameAddressChange}
                label="✓ Same as Current Address"
              />
            </div>
            <Textarea
              name="aadhar_address"
              value={formData.aadhar_address}
              onChange={handleInputChange}
              disabled={sameAsCurrentAddress}
              rows={2}
              placeholder={sameAsCurrentAddress ? "Same as current address" : "Enter Aadhar address"}
            />
            {sameAsCurrentAddress && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Aadhar address is automatically synced with current address
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label required className="mb-1">City</Label>
              <Input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label required className="mb-1">Zip Code</Label>
              <Input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label required className="mb-1">
                State
                {filteredStates.length !== state_options.length && (
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    ({filteredStates.length} results)
                  </span>
                )}
              </Label>
              <Input
                type="text"
                value={stateSearch}
                onChange={(e) => {
                  const searchValue = e.target.value;
                  setStateSearch(searchValue);
                  // Clear selected state if it no longer matches the filter
                  if (formData.state && searchValue) {
                    const searchLower = searchValue.toLowerCase();
                    if (!formData.state.toLowerCase().includes(searchLower)) {
                      handleInputChange({ target: { name: 'state', value: '' } });
                    }
                  }
                }}
                placeholder="Search state..."
                className="mb-2"
              />
              <select 
                className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                  !formData.state ? 'border-red-300' : 'border-gray-300'
                }`}
                onChange={(e) => {
                  handleInputChange({ target: { name: 'state', value: e.target.value } });
                  setStateSearch(''); // Clear search after selection
                }}
                name="state"
                value={formData.state}
                required
                size={Math.min(filteredStates.length + 1, 8)} // Auto-expand dropdown
              >
                <option value="">-- Select State ({filteredStates.length} available) --</option>
                {filteredStates.length > 0 ? (
                  filteredStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))
                ) : (
                  <option value="" disabled>No states found matching "{stateSearch}"</option>
                )}
              </select>
              {!formData.state && (
                <p className="mt-1 text-xs text-red-600">Please select a state from the list</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Experience Information */}
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact & Experience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <Label required className="mb-1">
              Phone Number
            </Label>
            <Input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label className="mb-1">
              Alternate Number
            </Label>
            <Input
              type="tel"
              name="alternate_number"
              value={formData.alternate_number}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label required className="mb-1">Age</Label>
            <Input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label required className="mb-1">
              Position Applied For
            </Label>
            <Select
              onChange={(e) => handleInputChange({ target: { name: 'position_applied_for', value: e.target.value } })}
              name="position_applied_for"
              value={formData.position_applied_for}
              required
              options={positions.map((position) => ({
                value: position,
                label: position
              }))}
              placeholder="Select Position"
            />
            <p className="text-xs text-gray-500 mt-1">
              Please select the position you are applying for.
            </p>
          </div>
          <div>
            <Label required className="mb-1">
              Work Experience
            </Label>
            <Select
              onChange={(e) => handleInputChange({ target: { name: 'work_experience', value: e.target.value } })}
              name="work_experience"
              value={formData.work_experience}
              required
              options={work_experience_options.map((work_experience) => ({
                value: work_experience,
                label: work_experience
              }))}
              placeholder="Select Work Experience"
            />
            <p className="text-xs text-gray-500 mt-1">
              Please select the work experience you have.
            </p>
          </div>
          <div>
            <Label required className="mb-1">
              Therapist Experience
            </Label>
            <Select
              onChange={(e) => handleInputChange({ target: { name: 'Therapist_experience', value: e.target.value } })}
              name="Therapist_experience"
              value={formData.Therapist_experience}
              required
              options={therapist_experience_options.map((therapist_experience) => ({
                value: therapist_experience,
                label: therapist_experience
              }))}
              placeholder="Select Therapist Experience"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1">
              Education & Certificate Courses
            </Label>
            <Textarea
              name="education_certificate_courses"
              value={formData.education_certificate_courses}
              onChange={handleInputChange}
              rows={2}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalInformation;

