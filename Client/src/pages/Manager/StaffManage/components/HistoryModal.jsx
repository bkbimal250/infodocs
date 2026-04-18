import React from 'react';
import { FaCheckCircle, FaExchangeAlt, FaTimesCircle, FaChevronRight } from 'react-icons/fa';
import CommonModal from './CommonModal';

const HistoryModal = ({ staff, historyData, allSpasMap, onClose }) => {

  const getSpaName = (id) => {
    const spa = allSpasMap[id];
    if (!spa) return `Branch #${id}`;
    return spa.name || spa;
  };

  return (
    <CommonModal title={`History — ${staff.name}`} onClose={onClose}>
      <div className="max-h-[60vh] overflow-y-auto space-y-3">
        {historyData.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No history found</div>
        ) : (
          historyData.map(event => {
            const isJoin = event.type === 'new_join' || event.type === 're_join';
            const isTransfer = event.type === 'transfer_out';
            const isLeave = event.type === 'leave';

            return (
              <div key={event.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    isJoin ? 'bg-emerald-50 text-emerald-600' :
                    isTransfer ? 'bg-orange-50 text-orange-600' :
                    isLeave ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {event.type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(event.event_date).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: '2-digit'
                    })}
                  </span>
                </div>

                {isTransfer ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded">
                      {getSpaName(event.spa_id)}
                    </span>
                    <FaChevronRight className="text-gray-300" size={8} />
                    <span className="font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      {getSpaName(event.to_spa_id)}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                    {getSpaName(event.spa_id)}
                  </p>
                )}

                {event.notes && (
                  <p className="text-xs text-gray-400 mt-2 italic">"{event.notes}"</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </CommonModal>
  );
};

export default HistoryModal;
