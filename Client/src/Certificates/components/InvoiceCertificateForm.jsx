import React from 'react';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_FIELDS, INVOICE_ITEM_TEMPLATE } from '../../utils/certificateConstants';
import { Input, DatePicker, Textarea, Button } from '../../ui';

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


  return (
    <div className="space-y-6">
      {/* Bill Information Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
          Bill Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="bill_number"
            label={getField('bill_number').label}
            placeholder={getField('bill_number').placeholder}
            value={formData.bill_number}
            onChange={handleInputChange}
            required
          />
          <DatePicker
            name="bill_date"
            label={getField('bill_date').label}
            value={formData.bill_date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            name="payment_mode"
            label={getField('payment_mode').label}
            placeholder={getField('payment_mode').placeholder}
            value={formData.payment_mode}
            onChange={handleInputChange}
          />
          <Input
            name="card_number"
            label={getField('card_number').label}
            placeholder={getField('card_number').placeholder}
            value={formData.card_number}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Customer Information Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
          Customer Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="customer_name"
            label={getField('customer_name').label}
            placeholder={getField('customer_name').placeholder}
            value={formData.customer_name}
            onChange={handleInputChange}
            required
          />
          <Input
            name="customer_phone"
            type="tel"
            label="Customer Phone"
            placeholder="Optional phone number"
            value={formData.customer_phone}
            onChange={handleInputChange}
          />
        </div>

        <div className="mt-4">
          <Textarea
            name="customer_address"
            label={getField('customer_address').label}
            placeholder={getField('customer_address').placeholder}
            value={formData.customer_address}
            onChange={handleInputChange}
            rows={3}
          />
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
                      <Button
                        type="button"
                        onClick={() => handleRemoveInvoiceItem(index)}
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Button
          type="button"
          onClick={handleAddInvoiceItem}
          variant="primary"
          size="md"
          className="mt-4"
        >
          + Add Service/Item
        </Button>
      </div>

      {/* Billing Summary Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
          Billing Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="subtotal"
            label={getField('subtotal').label}
            placeholder={getField('subtotal').placeholder}
            value={formData.subtotal}
            onChange={handleInputChange}
            disabled={getField('subtotal').readOnly}
            helperText="Auto-calculated from items"
          />
          <Input
            name="amount_in_words"
            label={getField('amount_in_words').label}
            placeholder={getField('amount_in_words').placeholder}
            value={formData.amount_in_words}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceCertificateForm;
