import React from 'react';
import { HiPlus, HiTrash } from 'react-icons/hi';

/**
 * InvoiceItemsTable Component
 * Manages the list of invoice particulars with a responsive cards/table hybrid layout
 */
const InvoiceItemsTable = ({
  invoiceItems,
  addInvoiceItem,
  updateInvoiceItem,
  removeInvoiceItem,
  totals
}) => {
  return (
    <div className="card shadow-soft p-0 overflow-hidden bg-white border-primary/5">
      <div className="bg-primary/5 px-4 md:px-6 py-4 border-b border-primary/10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-gray-900 tracking-tight">List of Particulars</h2>
          <p className="text-[9px] font-bold text-gray-400  tracking-widest mt-0.5">Invoice Itemized Statement</p>
        </div>
        <button
          onClick={addInvoiceItem}
          className="btn btn-secondary py-1.5 px-3 text-[10px] font-black  tracking-widest flex items-center gap-1"
        >
          <HiPlus size={14} />
          <span>Add Item</span>
        </button>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {invoiceItems.map((item, idx) => (
          <div
            key={idx}
            className="relative grid grid-cols-1 md:grid-cols-12 gap-3 p-4 md:p-0 border md:border-0 border-gray-500 rounded-xl bg-gray-50/30 md:bg-transparent animate-in slide-in-from-left-2 duration-300"
          >
            {/* Description - Spans more area */}
            <div className="md:col-span-4 space-y-1">
              <p className="text-[8px] font-black text-gray-400  tracking-widest ml-1 md:hidden">Description</p>
              <input
                type="text"
                placeholder="Service or Product Name"
                value={item.description}
                onChange={(e) => updateInvoiceItem(idx, 'description', e.target.value)}
                className="input py-2 text-xs font-bold"
              />
            </div>

            {/* HSN/SAC */}
            <div className="md:col-span-2 space-y-1">
              <p className="text-[8px] font-black text-gray-400  tracking-widest ml-1 md:hidden">HSN/SAC</p>
              <input
                type="text"
                placeholder="Code"
                value={item.hsn_code}
                onChange={(e) => updateInvoiceItem(idx, 'hsn_code', e.target.value)}
                className="input py-2 text-xs"
              />
            </div>

            {/* Qty & Rate Row for mobile */}
            <div className="grid grid-cols-2 md:grid-cols-2 md:col-span-3 gap-3">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-gray-400  tracking-widest ml-1 md:hidden">Qty</p>
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateInvoiceItem(idx, 'quantity', e.target.value)}
                  className="input py-2 text-xs text-center"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-gray-400  tracking-widest ml-1 md:hidden">Rate</p>
                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => updateInvoiceItem(idx, 'rate', e.target.value)}
                  className="input py-2 text-xs text-right"
                />
              </div>
            </div>

            {/* Total Display */}
            <div className="md:col-span-2 flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <p className="text-[8px] font-black text-gray-400  tracking-widest ml-1 md:hidden">Row Total</p>
                <div className="bg-white border border-gray-500 rounded-lg px-3 py-2 text-xs font-black text-gray-900 leading-none flex items-center justify-between">
                  <span className="text-gray-400 font-normal">₹</span>
                  <span>{item.amount || '0.00'}</span>
                </div>
              </div>
              <button
                onClick={() => removeInvoiceItem(idx)}
                className="p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Remove Item"
              >
                <HiTrash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Totals section */}
      <div className="bg-gray-50/80 backdrop-blur-sm p-4 md:p-6 border-t border-gray-500 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="w-full md:max-w-md">
          <p className="text-[9px] font-black text-gray-400  tracking-widest mb-1.5 ml-1">Total Amount In Words</p>
          <div className="text-[10px] md:text-xs font-bold text-gray-500 italic bg-white border border-gray-500 rounded-xl px-4 py-3 shadow-sm min-h-[3rem] flex items-center">
            {totals.totalInWords || 'Zero Rupees Only'}
          </div>
        </div>

        <div className="flex items-center gap-6 self-end md:self-center pr-2">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400  tracking-widest mb-1">Grand Total</p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-primary/50">₹</span>
              <span className="text-3xl font-black text-primary tracking-tighter tabular-nums drop-shadow-sm">
                {totals.subtotal || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItemsTable;
