import React, { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import CommonModal from './CommonModal';

/**
 * Leave Modal - Handles staff offboarding/termination
 */
const LeaveModal = ({ staff, onClose, onSubmit }) => {
  const [data, setData] = useState({
    leave_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  return (
    <CommonModal title={`Staff Offboarding`} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-6">
        <div className="p-6 bg-red-50 rounded-[2rem] text-center border border-red-100">
          <FaSignOutAlt className="mx-auto text-red-600 mb-3" size={24} />
          <p className="text-xs font-black text-red-900  tracking-tightest leading-tight">
            Proceeding with offboarding for <br />
            <span className="text-lg tracking-normal">{staff.name}</span>
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400  tracking-widest px-1">Termination Date</label>
            <input
              type="date"
              required
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm"
              value={data.leave_date}
              onChange={(e) => setData({ ...data, leave_date: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400  tracking-widest px-1">Exit Feedback / Reason</label>
            <textarea
              placeholder="Document the reason for leaving..."
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-24 resize-none text-sm font-bold"
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
            ></textarea>
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-4 bg-red-600 text-white rounded-[1.5rem] font-black  tracking-widest text-[10px] shadow-2xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all"
        >
          Execute Offboarding
        </button>
      </form>
    </CommonModal>
  );
};

export default LeaveModal;
