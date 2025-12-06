import React, { useEffect } from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS } from '../../utils/certificateConstants';
import { Input, Select, DatePicker } from '../../ui';

const positionOptions = [
  "Manager",
  "Therapist",
  "Beautician",
  "Housekeeper",
  "Receptionist",
];

const ExperienceLetterForm = ({ formData, handleInputChange }) => {
  const config = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.EXPERIENCE_LETTER] || {};
  const fields = Array.isArray(config.fields) ? config.fields : [];
  const findField = (name) => fields.find((field) => field.name === name) || {};

  // Parse date from various formats (YYYY-MM-DD, "15th Oct, 2025", etc.)
  const parseDate = (dateString) => {
    if (!dateString || !dateString.trim()) return null;
    
    // Check if already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Try to parse formatted date (e.g., "15th Oct, 2025")
    const dateMatch = dateString.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+),\s+(\d+)/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthNames.indexOf(dateMatch[2]);
      const year = parseInt(dateMatch[3]);
      if (monthIndex !== -1) {
        const date = new Date(year, monthIndex, day);
        return isNaN(date.getTime()) ? null : date;
      }
    }
    
    // Try to parse as regular date
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Calculate duration between two dates
  const calculateDuration = (startDate, endDate) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!start || !end) return '';
    if (end < start) return ''; // Invalid if end is before start
    
    // Calculate difference in months
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    const days = end.getDate() - start.getDate();
    
    let totalMonths = years * 12 + months;
    if (days < 0) {
      totalMonths -= 1;
    }
    
    // Format duration
    if (totalMonths < 0) return '';
    
    const yearsPart = Math.floor(totalMonths / 12);
    const monthsPart = totalMonths % 12;
    
    if (yearsPart > 0 && monthsPart > 0) {
      return `${yearsPart} ${yearsPart === 1 ? 'year' : 'years'} ${monthsPart} ${monthsPart === 1 ? 'month' : 'months'}`;
    } else if (yearsPart > 0) {
      return `${yearsPart} ${yearsPart === 1 ? 'year' : 'years'}`;
    } else if (monthsPart > 0) {
      return `${monthsPart} ${monthsPart === 1 ? 'month' : 'months'}`;
    } else {
      return 'Less than 1 month';
    }
  };

  // Auto-calculate duration when dates change
  useEffect(() => {
    if (formData.joining_date && formData.end_date) {
      const duration = calculateDuration(formData.joining_date, formData.end_date);
      if (duration && duration !== formData.duration) {
        handleInputChange({
          target: { name: 'duration', value: duration, type: 'text' },
        });
      }
    } else if (!formData.joining_date || !formData.end_date) {
      // Clear duration if either date is missing
      if (formData.duration) {
        handleInputChange({
          target: { name: 'duration', value: '', type: 'text' },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.joining_date, formData.end_date]);

  const renderInput = (name, type) => {
    const field = findField(name);
    const commonProps = {
      name,
      value: formData[name] || '',
      onChange: handleInputChange,
      placeholder: field.placeholder,
      className:
        'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
    };

    if (field.type === 'textarea' || type === 'textarea') {
      return <textarea {...commonProps} rows="3" />;
    }

    return <input {...commonProps} type={type || field.type || 'text'} />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Employee Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="candidate_name"
            label={findField('candidate_name').label || 'Employee Name'}
            placeholder={findField('candidate_name').placeholder}
            value={formData.candidate_name}
            onChange={handleInputChange}
            required
          />
          <Select
            name="position"
            label={findField('position').label || 'Position'}
            options={positionOptions}
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Select Position"
            required
          />
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Employment Period
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            name="joining_date"
            label={findField('joining_date').label || 'Joining Date'}
            value={(() => {
              // Convert formatted date back to YYYY-MM-DD for date input
              if (!formData.joining_date) return '';
              // Check if already in YYYY-MM-DD format
              if (/^\d{4}-\d{2}-\d{2}$/.test(formData.joining_date)) {
                return formData.joining_date;
              }
              // Try to parse formatted date (e.g., "15th Oct, 2025")
              const dateMatch = formData.joining_date.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+),\s+(\d+)/);
              if (dateMatch) {
                const day = parseInt(dateMatch[1]);
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthIndex = monthNames.indexOf(dateMatch[2]);
                const year = parseInt(dateMatch[3]);
                if (monthIndex !== -1) {
                  const date = new Date(year, monthIndex, day);
                  if (!isNaN(date.getTime())) {
                    const yearStr = date.getFullYear();
                    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
                    const dayStr = String(date.getDate()).padStart(2, '0');
                    return `${yearStr}-${monthStr}-${dayStr}`;
                  }
                }
              }
              return '';
            })()}
            onChange={(e) => {
              // Convert date to readable format (e.g., "15th Oct, 2025")
              if (e.target.value) {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  const day = date.getDate();
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const month = monthNames[date.getMonth()];
                  const year = date.getFullYear();
                  
                  // Add suffix to day
                  let daySuffix = 'th';
                  if (day === 1 || day === 21 || day === 31) daySuffix = 'st';
                  else if (day === 2 || day === 22) daySuffix = 'nd';
                  else if (day === 3 || day === 23) daySuffix = 'rd';
                  
                  const formattedDate = `${day}${daySuffix} ${month}, ${year}`;
                  handleInputChange({
                    target: { name: 'joining_date', value: formattedDate, type: 'text' },
                  });
                }
              } else {
                handleInputChange({
                  target: { name: 'joining_date', value: '', type: 'text' },
                });
              }
            }}
            required
          />
          <DatePicker
            name="end_date"
            label={findField('end_date').label || 'End Date'}
            value={(() => {
              // Convert formatted date back to YYYY-MM-DD for date input
              if (!formData.end_date) return '';
              // Check if already in YYYY-MM-DD format
              if (/^\d{4}-\d{2}-\d{2}$/.test(formData.end_date)) {
                return formData.end_date;
              }
              // Try to parse formatted date (e.g., "15th Oct, 2025")
              const dateMatch = formData.end_date.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+),\s+(\d+)/);
              if (dateMatch) {
                const day = parseInt(dateMatch[1]);
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthIndex = monthNames.indexOf(dateMatch[2]);
                const year = parseInt(dateMatch[3]);
                if (monthIndex !== -1) {
                  const date = new Date(year, monthIndex, day);
                  if (!isNaN(date.getTime())) {
                    const yearStr = date.getFullYear();
                    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
                    const dayStr = String(date.getDate()).padStart(2, '0');
                    return `${yearStr}-${monthStr}-${dayStr}`;
                  }
                }
              }
              return '';
            })()}
            onChange={(e) => {
              // Convert date to readable format (e.g., "15th Oct, 2025")
              if (e.target.value) {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  const day = date.getDate();
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const month = monthNames[date.getMonth()];
                  const year = date.getFullYear();
                  
                  // Add suffix to day
                  let daySuffix = 'th';
                  if (day === 1 || day === 21 || day === 31) daySuffix = 'st';
                  else if (day === 2 || day === 22) daySuffix = 'nd';
                  else if (day === 3 || day === 23) daySuffix = 'rd';
                  
                  const formattedDate = `${day}${daySuffix} ${month}, ${year}`;
                  handleInputChange({
                    target: { name: 'end_date', value: formattedDate, type: 'text' },
                  });
                }
              } else {
                handleInputChange({
                  target: { name: 'end_date', value: '', type: 'text' },
                });
              }
            }}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            name="duration"
            label={findField('duration').label || 'Duration'}
            value={formData.duration || ''}
            onChange={handleInputChange}
            placeholder="Auto-calculated from dates"
            disabled
            helperText="Auto-calculated from dates"
          />
          <Input
            name="salary"
            label={findField('salary').label || 'Salary'}
            placeholder={findField('salary').placeholder}
            value={formData.salary}
            onChange={handleInputChange}
          />
        </div>
      </div>

    
    </div>
  );
};

export default ExperienceLetterForm;
