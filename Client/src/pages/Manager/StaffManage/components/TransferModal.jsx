import React, { useState } from 'react';
import SelectSpa from '../../../common/Selectspa';
import CommonModal from './CommonModal';

const TransferModal = ({ staff, onClose, onSubmit }) => {
  const [data, setData] = useState({
    to_spa_id: '',
    transfer_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  return (
    <CommonModal title="Transfer Staff" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Transferring <strong>{staff.name}</strong> to a new branch.
        </div>

        <SelectSpa
          value={data.to_spa_id}
          onChange={(e) => setData(prev => ({ ...prev, to_spa_id: e.target.value }))}
          excludeId={staff.spa_id}
          label="Destination Branch"
          placeholder="Search branch..."
          required
        />

        <div>
          <label className="block text-xs text-gray-500 mb-1">Transfer Date</label>
          <input
            type="date"
            className="w-full p-2.5 border rounded-md text-sm"
            value={data.transfer_date}
            onChange={(e) => setData({ ...data, transfer_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
          <textarea
            placeholder="Reason for transfer..."
            className="w-full p-2.5 border rounded-md text-sm h-20 resize-none"
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={!data.to_spa_id}
          className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors ${
            data.to_spa_id
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Confirm Transfer
        </button>
      </form>
    </CommonModal>
  );
};

export default TransferModal;
