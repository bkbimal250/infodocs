import React, { useState } from 'react';
import SelectSpa from '../../../common/Selectspa';
import CommonModal from './CommonModal';

/**
 * Transfer Modal - Handles moving staff between branches
 * Upgraded to use the common SelectSpa component for better ergonomics.
 */
const TransferModal = ({ staff, onClose, onSubmit }) => {
  const [data, setData] = useState({
    to_spa_id: '',
    transfer_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSpaChange = (e) => {
    setData(prev => ({
      ...prev,
      to_spa_id: e.target.value
    }));
  };

  return (
    <CommonModal title={`Initiate Transfer`} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black ">Source Entity</span>
            <span className="text-xs font-black text-gray-900">{staff.name}</span>
          </div>

          <SelectSpa
            value={data.to_spa_id}
            onChange={handleSpaChange}
            excludeId={staff.spa_id}
            label="Destination Infrastructure"
            placeholder="Search by branch name, code, or city..."
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-50">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400  tracking-widest px-1">Planned Execution Date</label>
            <input
              type="date"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all"
              value={data.transfer_date}
              onChange={(e) => setData({ ...data, transfer_date: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400  tracking-widest px-1">Transfer Justification</label>
            <textarea
              placeholder="Provide reason for branch migration..."
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-24 resize-none text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={!data.to_spa_id}
          className={`w-full py-5 rounded-[1.5rem] font-black  tracking-widest text-[10px] transition-all ${data.to_spa_id ? 'bg-gray-900 text-white shadow-2xl hover:bg-blue-600 active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
        >
          Finalize Migration Protocol
        </button>
      </form>
    </CommonModal>
  );
};

export default TransferModal;
