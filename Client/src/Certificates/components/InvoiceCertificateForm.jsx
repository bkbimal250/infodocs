import React from 'react';
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_FIELDS,
  INVOICE_ITEM_TEMPLATE,
} from '../../utils/certificateConstants';
import { Input, DatePicker, Textarea, Button } from '../../ui';

const PaymentMode = [
  { value: 'Card', label: 'Card' },
  { value: 'Cash', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
];

const InvoiceCertificateForm = ({
  formData,
  handleInputChange,
  handleInvoiceItemChange,
  handleAddInvoiceItem,
  handleRemoveInvoiceItem,
}) => {
  const config =
    CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.INVOICE_SPA_BILL] || {};
  const invoiceItems = formData.invoiceItems?.length
    ? formData.invoiceItems
    : [INVOICE_ITEM_TEMPLATE];

  const getField = (name) =>
    (config.fields || []).find((field) => field.name === name) || {};

  return (
    <div className="space-y-4 text-sm">
      {/* Bill Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-slate-900">
          Bill Information
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            name="bill_number"
            label={getField('bill_number').label || 'Bill Number'}
            placeholder={getField('bill_number').placeholder || 'INV-001'}
            value={formData.bill_number}
            onChange={handleInputChange}
            required
          />
          <DatePicker
            name="bill_date"
            label={getField('bill_date').label || 'Bill Date'}
            value={formData.bill_date}
            onChange={handleInputChange}
            required
          />
          {/* Payment mode */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              {getField('payment_mode')?.label || 'Payment Mode'}
            </label>
            <select
              name="payment_mode"
              value={formData.payment_mode || ''}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Select payment mode</option>
              {PaymentMode.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            name="card_number"
            label={getField('card_number').label || 'Card / Ref. Number'}
            placeholder={
              getField('card_number').placeholder || 'Last 4 digits / Ref no.'
            }
            value={formData.card_number}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Customer Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-slate-900">
          Customer Information
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            name="customer_name"
            label={getField('customer_name').label || 'Customer Name'}
            placeholder={getField('customer_name').placeholder || 'Full name'}
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

        <div className="mt-3">
          <Textarea
            name="customer_address"
            label={getField('customer_address').label || 'Address'}
            placeholder={
              getField('customer_address').placeholder ||
              'House / Flat, Street, City, Pincode'
            }
            value={formData.customer_address}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
      </div>

      {/* Services / Items */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-slate-900">
          Services & Items
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-2 text-left font-medium text-slate-700">
                  Description
                </th>
                <th className="w-24 px-2 py-2 text-left font-medium text-slate-700">
                  HSN Code
                </th>
                <th className="w-20 px-2 py-2 text-center font-medium text-slate-700">
                  Qty
                </th>
                <th className="w-24 px-2 py-2 text-center font-medium text-slate-700">
                  Rate
                </th>
                <th className="w-24 px-2 py-2 text-right font-medium text-slate-700">
                  Amount
                </th>
                <th className="w-16 px-2 py-2 text-center font-medium text-slate-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, index) => {
                const quantity = Number(item.quantity || 1);
                const rate = Number(item.rate || 0);
                const lineAmount = (quantity * rate).toFixed(2);

                return (
                  <tr key={index} className="border-t border-slate-200">
                    <td className="px-2 py-2 align-top">
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) =>
                          handleInvoiceItemChange(
                            index,
                            'description',
                            e.target.value
                          )
                        }
                        placeholder="Service / Item description"
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs md:text-sm outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </td>
                    <td className="px-2 py-2 align-top">
                      <input
                        type="text"
                        value={item.hsn_code || ''}
                        onChange={(e) =>
                          handleInvoiceItemChange(
                            index,
                            'hsn_code',
                            e.target.value
                          )
                        }
                        placeholder="HSN"
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs md:text-sm outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </td>
                    <td className="px-2 py-2 align-top">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) =>
                          handleInvoiceItemChange(
                            index,
                            'quantity',
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-center text-xs md:text-sm outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </td>
                    <td className="px-2 py-2 align-top">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate || ''}
                        onChange={(e) =>
                          handleInvoiceItemChange(
                            index,
                            'rate',
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-right text-xs md:text-sm outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </td>
                    <td className="px-2 py-2 align-top text-right text-xs md:text-sm font-semibold text-slate-900">
                      ₹{lineAmount}
                    </td>
                    <td className="px-2 py-2 align-top text-center">
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
          variant="outline"
          size="sm"
          className="mt-3"
        >
          + Add Service / Item
        </Button>
      </div>

      {/* Billing Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-slate-900">
          Billing Summary
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            name="subtotal"
            label={getField('subtotal').label || 'Subtotal'}
            placeholder={getField('subtotal').placeholder || '0.00'}
            value={formData.subtotal}
            onChange={handleInputChange}
            disabled={getField('subtotal').readOnly}
            helperText="Auto-calculated from items"
          />
          <Input
            name="amount_in_words"
            label={getField('amount_in_words').label || 'Amount in Words'}
            placeholder={
              getField('amount_in_words').placeholder
            }
            value={formData.amount_in_words}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceCertificateForm;
