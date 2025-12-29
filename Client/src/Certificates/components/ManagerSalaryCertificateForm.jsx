import React, { useEffect } from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS } from '../../utils/certificateConstants';
import { numberToWords } from '../../utils/certificateUtils';
import { Input, Select, DatePicker, Button } from '../../ui';

const positionOptions = [
  'Manager',
  'Therapist',
  'Beautician',
  'Housekeeper',
  'Receptionist',
];

const ManagerSalaryCertificateForm = ({ formData, handleInputChange }) => {
  const config = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.MANAGER_SALARY] || {};
  const fieldsArray = Array.isArray(config.fields) ? config.fields : [];

  const getFieldConfig = (name) =>
    fieldsArray.find((field) => field.name === name) || {};

  const label = (name, fallback) => getFieldConfig(name).label || fallback;
  const placeholder = (name, fallback) =>
    getFieldConfig(name).placeholder || fallback;

  const monthYearList = Array.isArray(formData.month_year_list)
    ? formData.month_year_list
    : [];
  const monthSalaryList = Array.isArray(formData.month_salary_list)
    ? formData.month_salary_list
    : [];

  const rowCount = Math.max(monthYearList.length, monthSalaryList.length, 1);
  const rows = Array.from({ length: rowCount });

  // Convert "MON YYYY" -> "YYYY-MM"
  const formatMonthYearToDate = (monthYear) => {
    if (!monthYear || !monthYear.trim()) return '';

    const monthNames = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    const monthNamesShort = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const match = monthYear.match(/([A-Za-z]{3})[\s-]?(\d{4})/);
    if (match) {
      const monthStr = match[1].toUpperCase();
      const year = match[2];
      const monthIndex =
        monthNames.indexOf(monthStr) !== -1
          ? monthNames.indexOf(monthStr)
          : monthNamesShort.indexOf(match[1]);

      if (monthIndex !== -1) {
        const month = String(monthIndex + 1).padStart(2, '0');
        return `${year}-${month}`;
      }
    }

    const dateMatch = monthYear.match(/(\d{1,2})[\s/-](\d{4})/);
    if (dateMatch) {
      const month = String(parseInt(dateMatch[1], 10)).padStart(2, '0');
      const year = dateMatch[2];
      return `${year}-${month}`;
    }

    return '';
  };

  // Convert "YYYY-MM" -> "MON YYYY"
  const formatDateToMonthYear = (dateValue) => {
    if (!dateValue || !dateValue.trim()) return '';

    if (/^[A-Z]{3}\s\d{4}$/.test(dateValue.trim().toUpperCase())) {
      return dateValue.trim().toUpperCase();
    }

    const match = dateValue.match(/(\d{4})-(\d{2})/);
    if (match) {
      const year = match[1];
      const monthIndex = parseInt(match[2], 10) - 1;
      const monthNames = [
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MAY',
        'JUN',
        'JUL',
        'AUG',
        'SEP',
        'OCT',
        'NOV',
        'DEC',
      ];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${year}`;
      }
    }

    return dateValue;
  };

  const updateSalaryRow = (index, field, value) => {
    const years = Array.isArray(formData.month_year_list)
      ? [...formData.month_year_list]
      : Array.from({ length: rowCount }, () => '');
    const salaries = Array.isArray(formData.month_salary_list)
      ? [...formData.month_salary_list]
      : Array.from({ length: rowCount }, () => '');

    while (years.length < rowCount) years.push('');
    while (salaries.length < rowCount) salaries.push('');

    if (field === 'month') {
      years[index] = formatDateToMonthYear(value);
    } else {
      salaries[index] = value;
    }

    handleInputChange({
      target: { name: 'month_year_list', value: years, type: 'text' },
    });
    handleInputChange({
      target: { name: 'month_salary_list', value: salaries, type: 'text' },
    });
  };

  const addRow = () => {
    const years = Array.isArray(formData.month_year_list)
      ? [...formData.month_year_list, '']
      : [''];
    const salaries = Array.isArray(formData.month_salary_list)
      ? [...formData.month_salary_list, '']
      : [''];

    handleInputChange({
      target: { name: 'month_year_list', value: years, type: 'text' },
    });
    handleInputChange({
      target: { name: 'month_salary_list', value: salaries, type: 'text' },
    });
  };

  const removeRow = (index) => {
    const years = Array.isArray(formData.month_year_list)
      ? [...formData.month_year_list]
      : [];
    const salaries = Array.isArray(formData.month_salary_list)
      ? [...formData.month_salary_list]
      : [];

    if (years.length <= 1 && salaries.length <= 1) {
      handleInputChange({
        target: { name: 'month_year_list', value: [''], type: 'text' },
      });
      handleInputChange({
        target: { name: 'month_salary_list', value: [''], type: 'text' },
      });
      return;
    }

    years.splice(index, 1);
    salaries.splice(index, 1);

    handleInputChange({
      target: { name: 'month_year_list', value: years, type: 'text' },
    });
    handleInputChange({
      target: { name: 'month_salary_list', value: salaries, type: 'text' },
    });
  };

  // Auto salary in words (always from monthly_salary)
  useEffect(() => {
    const raw = formData.monthly_salary;
    if (!raw) {
      if (formData.monthly_salary_in_words) {
        handleInputChange({
          target: {
            name: 'monthly_salary_in_words',
            value: '',
            type: 'text',
          },
        });
      }
      return;
    }

    const salaryStr = raw.toString().replace(/[^\d]/g, '');
    const salaryNum = parseInt(salaryStr, 10);

    if (!isNaN(salaryNum) && salaryNum > 0) {
      const words = numberToWords(salaryNum);
      const value = `Rupees ${words}`;
      if (formData.monthly_salary_in_words !== value) {
        handleInputChange({
          target: {
            name: 'monthly_salary_in_words',
            value,
            type: 'text',
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.monthly_salary]);

  // Helper for joining_date <-> formatted string
  const joiningDateValue = (() => {
    if (!formData.joining_date) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(formData.joining_date)) {
      return formData.joining_date;
    }
    const dateMatch = formData.joining_date.match(
      /(\d+)(?:st|nd|rd|th)?\s+(\w+),\s+(\d+)/
    );
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const monthIndex = monthNames.indexOf(dateMatch[2]);
      const year = parseInt(dateMatch[3]);
      if (monthIndex !== -1) {
        const date = new Date(year, monthIndex, day);
        if (!isNaN(date.getTime())) {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      }
    }
    return '';
  })();

  const handleJoiningDateChange = (e) => {
    if (!e.target.value) {
      handleInputChange({
        target: { name: 'joining_date', value: '', type: 'text' },
      });
      return;
    }
    const date = new Date(e.target.value);
    if (isNaN(date.getTime())) return;

    const day = date.getDate();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    let daySuffix = 'th';
    if (day === 1 || day === 21 || day === 31) daySuffix = 'st';
    else if (day === 2 || day === 22) daySuffix = 'nd';
    else if (day === 3 || day === 23) daySuffix = 'rd';

    const formatted = `${day}${daySuffix} ${month}, ${year}`;
    handleInputChange({
      target: { name: 'joining_date', value: formatted, type: 'text' },
    });
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Manager + Joining */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-slate-900">
          {config.title || 'Manager & Employment Details'}
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            name="manager_name"
            label={label('manager_name', 'Employee Full Name')}
            placeholder={placeholder('manager_name', 'Full name')}
            value={formData.manager_name}
            onChange={handleInputChange}
            required
          />
          <Select
            name="position"
            label={label('position', 'Position / Designation')}
            options={positionOptions}
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Select position"
          />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <DatePicker
            name="joining_date"
            label={label('joining_date', 'Joining Date')}
            value={joiningDateValue}
            onChange={handleJoiningDateChange}
          />
        </div>
      </div>

      {/* Salary */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-slate-900">
          Salary Details
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            name="monthly_salary"
            label={label('monthly_salary', 'Monthly Salary')}
            placeholder={placeholder('monthly_salary', '60000')}
            value={formData.monthly_salary}
            onChange={handleInputChange}
            required
          />
          <div className="flex flex-col justify-end text-xs text-slate-500">
            <span className="font-medium text-slate-700 mb-1">
              Salary in words
            </span>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px]">
              {formData.monthly_salary_in_words || 'Will be filled automatically'}
            </span>
          </div>
        </div>
      </div>

      {/* Month-wise salary table */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-slate-900">
          Month-wise Salary
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-slate-200 rounded-lg bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700 border-b">
                  Month / Year
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700 border-b">
                  Salary
                </th>
                <th className="px-2 py-2 text-center font-medium text-slate-700 border-b w-16">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((_, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="px-3 py-1.5">
                    <input
                      type="month"
                      value={formatMonthYearToDate(monthYearList[index] || '')}
                      onChange={(e) =>
                        updateSalaryRow(index, 'month', e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      value={monthSalaryList[index] || ''}
                      onChange={(e) =>
                        updateSalaryRow(index, 'salary', e.target.value)
                      }
                      placeholder="60000"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <Button
                      type="button"
                      onClick={() => removeRow(index)}
                      variant="danger"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button
          type="button"
          onClick={addRow}
          variant="outline"
          size="sm"
          className="mt-3"
        >
          + Add Month
        </Button>
      </div>
    </div>
  );
};

export default ManagerSalaryCertificateForm;
