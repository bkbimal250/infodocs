import React, { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import CommonModal from './CommonModal';

const LeaveModal = ({ staff, onClose, onSubmit }) => {
  const [data, setData] = useState({
    leave_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  return (
    <CommonModal title="Mark Staff as Left" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-100 rounded-md text-center">
          <FaSignOutAlt className="mx-auto text-red-500 mb-2" size={20} />
          <p className="text-sm text-red-700">
            Mark <strong>{staff.name}</strong> as left?
          </p>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Leave Date</label>
          <input
            type="date"
            required
            className="w-full p-2.5 border rounded-md text-sm"
            value={data.leave_date}
            onChange={(e) => setData({ ...data, leave_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Reason (optional)</label>
          <textarea
            placeholder="Reason for leaving..."
            className="w-full p-2.5 border rounded-md text-sm h-20 resize-none"
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Confirm
        </button>
      </form>
    </CommonModal>
  );
};

export default LeaveModal;
