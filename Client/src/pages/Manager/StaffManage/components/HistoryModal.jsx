import React from 'react';
import {
  FaCheckCircle, FaExchangeAlt, FaTimesCircle,
  FaChevronRight, FaMapMarkerAlt
} from 'react-icons/fa';
import CommonModal from './CommonModal';

/**
 * History Modal - Displays event logs for a staff member
 */
const HistoryModal = ({ staff, historyData, allSpasMap, onClose }) => {
  return (
    <CommonModal title={`History Logs - ${staff.name}`} onClose={onClose}>
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100">
        {historyData.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold  tracking-widest text-[10px]">
            No historical data found
          </div>
        ) : (
          historyData.map(event => {
            const isJoin = event.type === 'new_join' || event.type === 're_join';
            const isTransfer = event.type === 'transfer_out';
            const isLeave = event.type === 'leave';

            return (
              <div key={event.id} className="relative pl-12 group">
                <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl border-4 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${isJoin ? 'bg-emerald-500 text-white' :
                    isTransfer ? 'bg-orange-500 text-white' :
                      isLeave ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                  {isJoin && <FaCheckCircle size={14} />}
                  {isTransfer && <FaExchangeAlt size={14} />}
                  {isLeave && <FaTimesCircle size={14} />}
                </div>

                <div className="p-5 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-black  tracking-widest px-2 py-0.5 rounded-lg ${isJoin ? 'bg-emerald-50 text-emerald-600' :
                        isTransfer ? 'bg-orange-50 text-orange-600' :
                          isLeave ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
                      }`}>
                      {event.type.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-50/50 px-2.5 py-1 rounded-lg">
                      {new Date(event.event_date).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {isTransfer ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-900 p-2 bg-gray-50 rounded-xl">
                          {allSpasMap[event.spa_id] || `ID: ${event.spa_id}`}
                        </span>
                        <FaChevronRight className="text-gray-200" size={8} />
                        <span className="text-xs font-black text-orange-600 p-2 bg-orange-50 rounded-xl flex items-center gap-2">
                          <FaMapMarkerAlt size={10} /> {allSpasMap[event.to_spa_id] || `ID: ${event.to_spa_id}`}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs font-black text-gray-900 p-2 bg-gray-50 rounded-xl inline-block">
                        {allSpasMap[event.spa_id] || `Assigned Branch: ${event.spa_id}`}
                      </div>
                    )}

                    {event.notes && (
                      <div className="relative pt-3 border-t border-gray-50">
                        <span className="absolute -top-1.5 left-2 px-1 bg-white text-[7px] font-black text-gray-300  tracking-widest">Notes</span>
                        <p className="text-xs text-gray-500 italic leading-relaxed">"{event.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </CommonModal>
  );
};

export default HistoryModal;
