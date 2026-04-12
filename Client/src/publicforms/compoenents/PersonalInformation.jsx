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
    <div className="space-y-6">

      {/* Personal Info */}
      <div className="bg-gray-50 border rounded-xl p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 Personal Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label required>First Name</Label>
            <Input name="first_name" value={formData.first_name} onChange={handleInputChange} />
          </div>

          <div>
            <Label>Middle Name</Label>
            <Input name="middle_name" value={formData.middle_name} onChange={handleInputChange} />
          </div>

          <div>
            <Label required>Last Name</Label>
            <Input name="last_name" value={formData.last_name} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-gray-50 border rounded-xl p-4 sm:p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">🏠 Address Information</h2>

        <div>
          <Label required>Current Address</Label>
          <Textarea
            name="current_address"
            value={formData.current_address}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label>Aadhar Address</Label>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={sameAsCurrentAddress}
                onChange={handleSameAddressChange}
              />
              <span className="text-xs text-gray-600">Same as current</span>
            </div>
          </div>

          <Textarea
            name="aadhar_address"
            value={formData.aadhar_address}
            onChange={handleInputChange}
            disabled={sameAsCurrentAddress}
            rows={3}
            className="mt-2"
          />

          {sameAsCurrentAddress && (
            <p className="text-xs text-blue-600 mt-1">
              Auto-filled from current address
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label required>City</Label>
            <Input name="city" value={formData.city} onChange={handleInputChange} />
          </div>

          <div>
            <Label required>Zip Code</Label>
            <Input name="zip_code" value={formData.zip_code} onChange={handleInputChange} />
          </div>

          <div>
            <Label required>State</Label>

            <Input
              placeholder="Search state..."
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              className="mb-2"
            />

            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              value={formData.state}
              onChange={(e) =>
                handleInputChange({ target: { name: 'state', value: e.target.value } })
              }
            >
              <option value="">Select State</option>
              {filteredStates.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact + Experience */}
      <div className="bg-gray-50 border rounded-xl p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📞 Contact & Experience</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <Label required>Phone Number</Label>
            <Input name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
          </div>

          <div>
            <Label>Alternate Number</Label>
            <Input name="alternate_number" value={formData.alternate_number} onChange={handleInputChange} />
          </div>

          <div>
            <Label required>Age</Label>
            <Input type="number" name="age" value={formData.age} onChange={handleInputChange} />
          </div>

          <div>
            <Label required>Position</Label>
            <Select
              name="position_applied_for"
              value={formData.position_applied_for}
              onChange={(e) =>
                handleInputChange({ target: { name: 'position_applied_for', value: e.target.value } })
              }
              options={positions.map((p) => ({ value: p, label: p }))}
              placeholder="Select position"
            />
          </div>

          <div>
            <Label required>Work Experience</Label>
            <Select
              name="work_experience"
              value={formData.work_experience}
              onChange={(e) =>
                handleInputChange({ target: { name: 'work_experience', value: e.target.value } })
              }
              options={work_experience_options.map((p) => ({ value: p, label: p }))}
              placeholder="Select experience"
            />
          </div>

          <div>
            <Label required>Therapist Experience</Label>
            <Select
              name="Therapist_experience"
              value={formData.Therapist_experience}
              onChange={(e) =>
                handleInputChange({ target: { name: 'Therapist_experience', value: e.target.value } })
              }
              options={therapist_experience_options.map((p) => ({ value: p, label: p }))}
              placeholder="Select therapist experience"
            />
          </div>

          <div className="sm:col-span-2">
            <Label>Education & Courses</Label>
            <Textarea
              name="education_certificate_courses"
              value={formData.education_certificate_courses}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default PersonalInformation;

