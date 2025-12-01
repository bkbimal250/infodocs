import React from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS, INVOICE_ITEM_TEMPLATE } from '../../utils/certificateConstants';

/**
 * Invoice/SPA Bill Form Component
 *
 * Captures only the fields defined on the InvoiceSpaBillCertificate model
 * plus the dynamic line items used for PDF rendering.
 */
const InvoiceCertificateForm = ({
  formData,
  handleInputChange,
  handleInvoiceItemChange,
  handleAddInvoiceItem,
  handleRemoveInvoiceItem,
}) => {
  const config = CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.INVOICE_SPA_BILL] || {};
  const invoiceItems = formData.invoiceItems?.length
    ? formData.invoiceItems
    : [INVOICE_ITEM_TEMPLATE];

  const getField = (name) => (config.fields || []).find((field) => field.name === name) || {};

  const renderInput = (name, type = 'text') => {
    const field = getField(name);
    const commonProps = {
      name,
      value: formData[name] || '',
      onChange: handleInputChange,
      placeholder: field.placeholder,
      className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent',
    };

    if (field.type === 'select') {
      return (
        <select {...commonProps}>
          <option value="">Select</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return <textarea {...commonProps} rows="3" />;
    }

    return <input {...commonProps} type={type || field.type || 'text'} />;
  };

  return (
    <div className="space-y-6">
      {/* Bill Information Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
          Bill Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getField('bill_number').label} <span className="text-red-500">*</span>
            </label>
            {renderInput('bill_number')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getField('bill_date').label} <span className="text-red-500">*</span>
            </label>
            {renderInput('bill_date', 'date')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getField('payment_mode').label}
            </label>
            {renderInput('payment_mode')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getField('card_number').label}
            </label>
            {renderInput('card_number')}
          </div>
        </div>
      </div>

      {/* Customer Information Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
          Customer Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getField('customer_name').label} <span className="text-red-500">*</span>
            </label>
            {renderInput('customer_name')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Phone
            </label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone || ''}
              onChange={handleInputChange}
              placeholder="Optional phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {getField('customer_address').label}
          </label>
          {renderInput('customer_address')}
        </div>
      </div>

      {/* Services/Items Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
          Services & Items
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left px-2 py-2 text-gray-700 font-semibold">Description</th>
                <th className="text-left px-2 py-2 text-gray-700 font-semibold w-28">HSN Code</th>
                <th className="text-center px-2 py-2 text-gray-700 font-semibold w-24">Quantity</th>
                <th className="text-center px-2 py-2 text-gray-700 font-semibold w-24">Rate</th>
                <th className="text-right px-2 py-2 text-gray-700 font-semibold w-24">Amount</th>
                <th className="text-center px-2 py-2 text-gray-700 font-semibold w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, index) => {
                const quantity = Number(item.quantity || 1);
                const rate = Number(item.rate || 0);
                const lineAmount = (quantity * rate).toFixed(2);
                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-2 py-3">
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleInvoiceItemChange(index, 'description', e.target.value)}
                        placeholder="Service/Item description"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input
                        type="text"
                        value={item.hsn_code || ''}
                        onChange={(e) => handleInvoiceItemChange(index, 'hsn_code', e.target.value)}
                        placeholder="HSN"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) => handleInvoiceItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600 text-center"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate || ''}
                        onChange={(e) => handleInvoiceItemChange(index, 'rate', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600 text-right"
                      />
                    </td>
                    <td className="px-2 py-3 text-right font-semibold text-gray-800">
                      ₹{lineAmount}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveInvoiceItem(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handleAddInvoiceItem}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
        >
          + Add Service/Item
        </button>
      </div>

      {/* Billing Summary Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
          Billing Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getField('subtotal').label}
            </label>
            <input
              type="text"
              name="subtotal"
              value={formData.subtotal || ''}
              onChange={handleInputChange}
              readOnly={getField('subtotal').readOnly}
              placeholder={getField('subtotal').placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getField('amount_in_words').label}
            </label>
            {renderInput('amount_in_words')}
          </div>
        </div>
      </div>

      {/* Optional Notes Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
          Additional Notes
        </h3>

        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
          placeholder="Payment terms, additional remarks, etc."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>
    </div>
  );
};

export default InvoiceCertificateForm;
